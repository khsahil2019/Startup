import express from "express";
import crypto from "crypto";
import {db, audit} from "../db.js";
import {requireAuth, allow, hash} from "../auth.js";
import {deriveAll} from "../engines/index.js";

export const router = express.Router();
router.use(requireAuth);

const scoped = (req, id) => {
  if (req.user.role === "super_admin") return true;
  const s = db.prepare("SELECT university_id FROM startups WHERE id=?").get(id);
  return s && s.university_id === req.user.university_id;
};

// 1. Dashboard Stats Endpoint
router.get("/dashboard", (req, res) => {
  const isSuper = req.user.role === "super_admin";
  const uniFilter = isSuper ? "" : "WHERE university_id = " + req.user.university_id;
  const uniSubFilter = isSuper ? "" : "WHERE s.university_id = " + req.user.university_id;

  const totalStartups = db.prepare(`SELECT COUNT(*) as c FROM startups ${uniFilter}`).get().c;
  const publishedStartups = db.prepare(`SELECT COUNT(*) as c FROM startups ${uniFilter ? uniFilter + " AND" : "WHERE"} public_visibility = 1`).get().c;
  const pendingReviews = db.prepare(`
    SELECT COUNT(*) as c FROM submissions sub
    JOIN startups s ON sub.startup_id = s.id
    ${uniSubFilter ? uniSubFilter + " AND" : "WHERE"} sub.status = 'submitted'
  `).get().c;
  const totalUnis = db.prepare("SELECT COUNT(*) as c FROM universities").get().c;
  const totalIncubators = db.prepare("SELECT COUNT(*) as c FROM incubation_centres").get().c;
  const totalEvidence = db.prepare(`
    SELECT COUNT(*) as c FROM evidence e
    JOIN startups s ON e.startup_id = s.id
    ${uniSubFilter}
  `).get().c;

  // Recent startups
  const recentStartups = db.prepare(`
    SELECT s.id, s.name, s.slug, s.stage, s.sector, s.venture_type, s.public_visibility, s.created_at,
           u.name as university_name
    FROM startups s
    LEFT JOIN universities u ON s.university_id = u.id
    ${uniSubFilter}
    ORDER BY s.id DESC LIMIT 5
  `).all();

  // Recent audit log
  const recentLogs = db.prepare(`
    SELECT a.*, u.name as user_name, s.name as startup_name
    FROM audit_log a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN startups s ON a.startup_id = s.id
    ORDER BY a.id DESC LIMIT 8
  `).all();

  res.json({
    stats: {
      totalStartups,
      publishedStartups,
      pendingReviews,
      totalUnis,
      totalIncubators,
      totalEvidence
    },
    recentStartups,
    recentLogs
  });
});

// 2. Startups Endpoints
router.get("/startups", (req, res) => {
  const isSuper = req.user.role === "super_admin";
  const where = isSuper ? "" : "WHERE s.university_id = " + req.user.university_id;

  const rows = db.prepare(`
    SELECT s.id, s.university_id, s.incubation_id, s.name, s.slug, s.venture_type, s.stage,
           s.portfolio_status, s.logo_url, s.founder_image_url, s.summary, s.sector,
           s.public_visibility, s.current_submission_id, s.published_submission_id, s.created_at,
           u.name as university_name,
           sub.status as submission_status,
           sub.derived_json
    FROM startups s
    LEFT JOIN universities u ON s.university_id = u.id
    LEFT JOIN submissions sub ON s.current_submission_id = sub.id
    ${where}
    ORDER BY s.id DESC
  `).all();

  const enriched = rows.map(r => {
    let metrics = {};
    try {
      metrics = JSON.parse(r.derived_json || "{}");
    } catch {}
    return {
      ...r,
      metrics
    };
  });

  res.json(enriched);
});

router.post("/startups", allow("super_admin", "university_admin"), (req, res) => {
  const uniId = req.user.role === "super_admin" ? (req.body.university_id || 1) : req.user.university_id;
  const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + crypto.randomBytes(3).toString("hex");

  const x = db.prepare(`
    INSERT INTO startups(
      university_id, incubation_id, name, slug, venture_type, stage, sector, summary,
      logo_url, founder_image_url, public_visibility, portfolio_status
    )
    VALUES(?,?,?,?,?,?,?,?,?,?,0,'draft')
  `).run(
    uniId,
    req.body.incubation_id || null,
    req.body.name,
    slug,
    req.body.venture_type || "student",
    req.body.stage || "ideation",
    req.body.sector || "",
    req.body.summary || "",
    req.body.logo_url || "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600",
    req.body.founder_image_url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300"
  );
  const sid = x.lastInsertRowid;

  // Insert founder
  if (req.body.founder_name) {
    db.prepare(`
      INSERT INTO founders(startup_id, name, role, email, display_order)
      VALUES(?,?,?,?,1)
    `).run(sid, req.body.founder_name, req.body.founder_role || "Founder & CEO", req.body.founder_email || "");
  }

  // Create initial draft submission
  const subRes = db.prepare(`
    INSERT INTO submissions(startup_id, version_no, status, answers_json, derived_json)
    VALUES(?,1,'draft','{}','{}')
  `).run(sid);
  const subId = subRes.lastInsertRowid;

  db.prepare("UPDATE startups SET current_submission_id=? WHERE id=?").run(subId, sid);

  // Generate founder invite token
  const raw = crypto.randomBytes(32).toString("hex");
  const hashv = crypto.createHash("sha256").update(raw).digest("hex");
  db.prepare("INSERT INTO founder_invites(startup_id, token_hash, expires_at) VALUES(?,?,datetime('now','+30 day'))").run(sid, hashv);
  const inviteUrl = `${process.env.PUBLIC_BASE_URL || "http://localhost:8081"}/founder/${sid}/${raw}`;

  audit(req.user.id, sid, "startup_created", {}, req.body);

  res.json({ id: sid, slug, invite_url: inviteUrl });
});

router.get("/startups/:id", (req, res) => {
  if (!scoped(req, req.params.id)) return res.status(403).json({ error: "Tenant boundary" });
  const s = db.prepare(`
    SELECT s.*, u.name as university_name, inc.name as incubator_name
    FROM startups s
    LEFT JOIN universities u ON s.university_id = u.id
    LEFT JOIN incubation_centres inc ON s.incubation_id = inc.id
    WHERE s.id = ?
  `).get(req.params.id);
  if (!s) return res.status(404).json({ error: "Startup not found" });

  const founders = db.prepare("SELECT * FROM founders WHERE startup_id=?").all(s.id);
  const team = db.prepare("SELECT * FROM team_members WHERE startup_id=?").all(s.id);
  const submissions = db.prepare("SELECT * FROM submissions WHERE startup_id=? ORDER BY version_no DESC").all(s.id);
  const evidence = db.prepare("SELECT * FROM evidence WHERE startup_id=?").all(s.id);

  res.json({
    startup: s,
    founders,
    team,
    submissions: submissions.map(sub => {
      let answers = {}, derived = {};
      try { answers = JSON.parse(sub.answers_json || "{}"); } catch {}
      try { derived = JSON.parse(sub.derived_json || "{}"); } catch {}
      return { ...sub, answers, derived };
    }),
    evidence
  });
});

router.post("/startups/:id/visibility", allow("super_admin", "university_admin"), (req, res) => {
  if (!scoped(req, req.params.id)) return res.status(403).json({ error: "Tenant boundary" });
  const s = db.prepare("SELECT public_visibility, portfolio_status FROM startups WHERE id=?").get(req.params.id);
  if (!s) return res.status(404).json({ error: "Startup not found" });

  const newVis = s.public_visibility === 1 ? 0 : 1;
  const newStatus = newVis === 1 ? "published" : "unlisted";

  db.prepare("UPDATE startups SET public_visibility=?, portfolio_status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?").run(newVis, newStatus, req.params.id);
  audit(req.user.id, req.params.id, "visibility_toggled", { public_visibility: s.public_visibility }, { public_visibility: newVis });

  res.json({ public_visibility: newVis, portfolio_status: newStatus });
});

router.delete("/startups/:id", allow("super_admin", "university_admin"), (req, res) => {
  if (!scoped(req, req.params.id)) return res.status(403).json({ error: "Tenant boundary" });
  audit(req.user.id, req.params.id, "startup_deleted", {}, {});
  db.prepare("DELETE FROM startups WHERE id=?").run(req.params.id);
  res.json({ deleted: true });
});

router.post("/startups/:id/invite", allow("super_admin", "university_admin"), (req, res) => {
  if (!scoped(req, req.params.id)) return res.status(403).json({ error: "Tenant boundary" });
  const raw = crypto.randomBytes(32).toString("hex");
  const hashv = crypto.createHash("sha256").update(raw).digest("hex");
  db.prepare("INSERT INTO founder_invites(startup_id,token_hash,expires_at) VALUES(?,?,datetime('now','+30 day'))").run(req.params.id, hashv);
  res.json({ invite_url: `${process.env.PUBLIC_BASE_URL || "http://localhost:8081"}/founder/${req.params.id}/${raw}` });
});

// 3. Submissions & Verification Endpoints
router.get("/submissions", (req, res) => {
  const isSuper = req.user.role === "super_admin";
  const where = isSuper ? "" : "WHERE s.university_id = " + req.user.university_id;

  const rows = db.prepare(`
    SELECT sub.id, sub.startup_id, sub.version_no, sub.status, sub.submitted_at,
           sub.reviewed_at, sub.reviewer_note, sub.created_at,
           s.name as startup_name, s.slug as startup_slug, s.stage as startup_stage,
           s.sector as startup_sector, u.name as university_name
    FROM submissions sub
    JOIN startups s ON sub.startup_id = s.id
    LEFT JOIN universities u ON s.university_id = u.id
    ${where}
    ORDER BY sub.id DESC
  `).all();

  res.json(rows);
});

router.get("/submissions/:id", (req, res) => {
  const sub = db.prepare(`
    SELECT sub.*, s.name as startup_name, s.slug as startup_slug, s.stage, s.sector, s.university_id
    FROM submissions sub
    JOIN startups s ON sub.startup_id = s.id
    WHERE sub.id = ?
  `).get(req.params.id);
  if (!sub) return res.status(404).json({ error: "Submission not found" });
  if (!scoped(req, sub.startup_id)) return res.status(403).json({ error: "Tenant boundary" });

  let answers = {}, derived = {};
  try { answers = JSON.parse(sub.answers_json || "{}"); } catch {}
  try { derived = JSON.parse(sub.derived_json || "{}"); } catch {}

  const evidence = db.prepare("SELECT * FROM evidence WHERE submission_id=?").all(sub.id);

  res.json({ ...sub, answers, derived, evidence });
});

router.post("/startups/:id/review", allow("super_admin", "university_admin"), (req, res) => {
  if (!scoped(req, req.params.id)) return res.status(403).json({ error: "Tenant boundary" });
  const sub = db.prepare("SELECT * FROM submissions WHERE startup_id=? AND status=? ORDER BY version_no DESC LIMIT 1").get(req.params.id,"submitted");
  if (!sub) return res.status(404).json({ error: "No submission" });

  const status = req.body.action === "changes_requested" ? "changes_requested" : "verified";
  db.prepare(`
    UPDATE submissions
    SET status=?, reviewed_at=CURRENT_TIMESTAMP, reviewed_by=?, reviewer_note=?
    WHERE id=?
  `).run(status, req.user.id, req.body.note || "", sub.id);

  if (status === "verified") {
    db.prepare(`
      UPDATE startups
      SET portfolio_status='published', public_visibility=1, published_submission_id=?, current_submission_id=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).run(sub.id, sub.id, req.params.id);
  } else {
    db.prepare(`UPDATE startups SET portfolio_status='changes_requested', current_submission_id=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(sub.id, req.params.id);
  }

  audit(req.user.id, req.params.id, "submission_review", { status: sub.status }, { status, note: req.body.note || "" });
  res.json({ status, submission_id: sub.id });
});

// 4. Universities Endpoints
router.get("/universities", (req, res) => {
  const rows = db.prepare(`
    SELECT u.*,
           COUNT(DISTINCT s.id) as startups_count,
           COUNT(DISTINCT inc.id) as incubators_count
    FROM universities u
    LEFT JOIN startups s ON u.id = s.university_id
    LEFT JOIN incubation_centres inc ON u.id = inc.university_id
    GROUP BY u.id
    ORDER BY u.name
  `).all();
  res.json(rows);
});

router.post("/universities", allow("super_admin"), (req, res) => {
  const slug = req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const x = db.prepare(`
    INSERT INTO universities(name, slug, about, vision, mission, logo_url, theme_json, website_url, hero_image_url)
    VALUES(?,?,?,?,?,?,?,?,?)
  `).run(
    req.body.name,
    slug,
    req.body.about || "",
    req.body.vision || "",
    req.body.mission || "",
    req.body.logo_url || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160",
    JSON.stringify(req.body.theme || {}),
    req.body.website_url || "",
    req.body.hero_image_url || ""
  );
  audit(req.user.id, null, "university_created", {}, req.body);
  res.json({ id: x.lastInsertRowid, slug });
});

// 5. Incubators Endpoints
router.get("/incubators", (req, res) => {
  const isSuper = req.user.role === "super_admin";
  const where = isSuper ? "" : "WHERE inc.university_id = " + req.user.university_id;

  const rows = db.prepare(`
    SELECT inc.*, u.name as university_name, COUNT(s.id) as startups_count
    FROM incubation_centres inc
    LEFT JOIN universities u ON inc.university_id = u.id
    LEFT JOIN startups s ON inc.id = s.incubation_id
    ${where}
    GROUP BY inc.id
    ORDER BY inc.name
  `).all();
  res.json(rows);
});

router.post("/incubators", allow("super_admin", "university_admin"), (req, res) => {
  const uniId = req.user.role === "super_admin" ? req.body.university_id : req.user.university_id;
  const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const x = db.prepare(`
    INSERT INTO incubation_centres(university_id, name, slug, section8_date, about, vision, mission, facilities)
    VALUES(?,?,?,?,?,?,?,?)
  `).run(
    uniId,
    req.body.name,
    slug,
    req.body.section8_date || "",
    req.body.about || "",
    req.body.vision || "",
    req.body.mission || "",
    req.body.facilities || ""
  );
  audit(req.user.id, null, "incubator_created", {}, req.body);
  res.json({ id: x.lastInsertRowid });
});

// 6. Evidence Verification Endpoints
router.get("/evidence", (req, res) => {
  const isSuper = req.user.role === "super_admin";
  const where = isSuper ? "" : "WHERE s.university_id = " + req.user.university_id;

  const rows = db.prepare(`
    SELECT e.*, s.name as startup_name, s.slug as startup_slug, sub.version_no
    FROM evidence e
    JOIN startups s ON e.startup_id = s.id
    LEFT JOIN submissions sub ON e.submission_id = sub.id
    ${where}
    ORDER BY e.id DESC
  `).all();
  res.json(rows);
});

router.post("/evidence/:id/verify", allow("super_admin", "university_admin"), (req, res) => {
  const e = db.prepare("SELECT * FROM evidence WHERE id=?").get(req.params.id);
  if (!e) return res.status(404).json({ error: "Evidence not found" });
  if (!scoped(req, e.startup_id)) return res.status(403).json({ error: "Tenant boundary" });

  const status = req.body.status === "rejected" ? "rejected" : "verified";
  db.prepare("UPDATE evidence SET verification_status=?, reviewer_note=? WHERE id=?").run(status, req.body.note || "", req.params.id);
  audit(req.user.id, e.startup_id, "evidence_reviewed", { status: e.verification_status }, { status, note: req.body.note || "" });

  res.json({ id: e.id, status });
});

// 7. Audit Trail
router.get("/audit", (req, res) => {
  const isSuper = req.user.role === "super_admin";
  const where = isSuper ? "" : "WHERE s.university_id = " + req.user.university_id;

  const rows = db.prepare(`
    SELECT a.*, u.name as user_name, u.role as user_role, s.name as startup_name
    FROM audit_log a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN startups s ON a.startup_id = s.id
    ${where}
    ORDER BY a.id DESC LIMIT 50
  `).all();
  res.json(rows);
});

// 8. Users Management (Super Admin)
router.get("/users", allow("super_admin"), (req, res) => {
  const rows = db.prepare(`
    SELECT u.id, u.university_id, u.name, u.email, u.role, u.active, u.created_at,
           uni.name as university_name
    FROM users u
    LEFT JOIN universities uni ON u.university_id = uni.id
    ORDER BY u.id DESC
  `).all();
  res.json(rows);
});

router.post("/users", allow("super_admin"), (req, res) => {
  const x = db.prepare(`
    INSERT INTO users(university_id, name, email, password_hash, role)
    VALUES(?,?,?,?,?)
  `).run(req.body.university_id || null, req.body.name, req.body.email, hash(req.body.password || "ChangeMe123!"), req.body.role || "university_admin");
  res.json({ id: x.lastInsertRowid });
});
