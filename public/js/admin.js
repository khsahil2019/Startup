// ==========================================================================
// STARTUP IMPACT ADMIN CONSOLE — FULL ENGINE & UI CONTROLLER
// ==========================================================================

let token = localStorage.getItem("si_token") || "";
let user = JSON.parse(localStorage.getItem("si_user") || "null");
let currentView = "dashboard";
let currentReviewStartupId = null;

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// Helper for authenticated fetch
async function api(path, options = {}) {
  const headers = options.headers || {};
  if (token) headers["Authorization"] = "Bearer " + token;
  if (!headers["Content-Type"] && !(options.body instanceof FormData) && options.body) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch("/api/admin" + path, { ...options, headers });
  if (res.status === 401) {
    logout();
    throw new Error("Session expired");
  }
  return res;
}

// Global modal helpers
window.openModal = function(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("open");
};

window.closeModal = function(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
};

window.fillCreds = function(email, pass) {
  $("#loginEmail").value = email;
  $("#loginPassword").value = pass;
  $("#loginBtn").click();
};

window.copyInviteUrl = function() {
  const f = $("#inviteUrlField");
  f.select();
  navigator.clipboard.writeText(f.value);
  alert("Founder invitation link copied to clipboard!");
};

// Authentication
$("#loginBtn").addEventListener("click", async () => {
  const email = $("#loginEmail").value.trim();
  const password = $("#loginPassword").value;
  const errBox = $("#loginError");
  errBox.textContent = "";

  if (!email || !password) {
    errBox.textContent = "Please enter email and password.";
    return;
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      errBox.textContent = data.error || "Login failed.";
      return;
    }

    token = data.token;
    user = data.user;
    localStorage.setItem("si_token", token);
    localStorage.setItem("si_user", JSON.stringify(user));

    initApp();
  } catch (err) {
    errBox.textContent = "Network error connecting to server.";
  }
});

function logout() {
  token = "";
  user = null;
  localStorage.removeItem("si_token");
  localStorage.removeItem("si_user");
  $("#adminApp").style.display = "none";
  $("#loginScreen").style.display = "flex";
}

$("#logoutBtn").addEventListener("click", logout);

function initApp() {
  $("#loginScreen").style.display = "none";
  $("#adminApp").style.display = "flex";

  $("#userName").textContent = user.name;
  $("#userRole").textContent = user.role === "super_admin" ? "Super Admin" : "University Admin";
  $("#userInitial").textContent = user.name[0].toUpperCase();

  // Restrict Super Admin views if university admin
  if (user.role !== "super_admin") {
    $("#navUsers").style.display = "none";
  }

  navigate(currentView);
}

// Navigation router
function navigate(view) {
  currentView = view;
  $$(".sidebar-nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.view === view);
  });

  const titles = {
    dashboard: "Dashboard Overview",
    startups: "Startup Ventures Portfolio",
    submissions: "Submission & Verification Workspace",
    evidence: "Evidence & Compliance Documents",
    universities: "Institutional Partners & Universities",
    incubators: "Incubation Centres & Facilities",
    audit: "Audit Trail & Compliance Log",
    users: "Administrative Users"
  };

  $("#viewTitle").textContent = titles[view] || "Admin Console";

  switch (view) {
    case "dashboard": renderDashboard(); break;
    case "startups": renderStartups(); break;
    case "submissions": renderSubmissions(); break;
    case "evidence": renderEvidence(); break;
    case "universities": renderUniversities(); break;
    case "incubators": renderIncubators(); break;
    case "audit": renderAudit(); break;
    case "users": renderUsers(); break;
  }
}

$$(".sidebar-nav-item").forEach(item => {
  item.addEventListener("click", () => navigate(item.dataset.view));
});

// ==========================================================================
// 1. DASHBOARD VIEW
// ==========================================================================
async function renderDashboard() {
  const container = $("#adminContentArea");
  container.innerHTML = `<div style="color:#64748b; padding:20px;">Loading ecosystem dashboard...</div>`;

  try {
    const res = await api("/dashboard");
    const data = await res.json();
    const s = data.stats;

    // Update pending badge in sidebar
    const pendingBadge = $("#pendingSubBadge");
    if (s.pendingReviews > 0) {
      pendingBadge.style.display = "inline-block";
      pendingBadge.textContent = s.pendingReviews;
    } else {
      pendingBadge.style.display = "none";
    }

    container.innerHTML = `
      <!-- Top 4 Stats Cards -->
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px; margin-bottom:28px;">
        <div class="panel-card" style="padding: 20px; border-left: 4px solid #2563eb; margin-bottom:0;">
          <div style="font-size: 11px; font-weight:700; color:#64748b; text-transform:uppercase;">Total Startups</div>
          <div style="font-size: 28px; font-weight:800; color:#0f172a; margin-top:4px;">${s.totalStartups}</div>
          <div style="font-size: 12px; color:#10b981; font-weight:600; margin-top:4px;">${s.publishedStartups} Published live</div>
        </div>

        <div class="panel-card" style="padding: 20px; border-left: 4px solid #f59e0b; margin-bottom:0;">
          <div style="font-size: 11px; font-weight:700; color:#64748b; text-transform:uppercase;">Pending Verification</div>
          <div style="font-size: 28px; font-weight:800; color:#b45309; margin-top:4px;">${s.pendingReviews}</div>
          <div style="font-size: 12px; color:#64748b; margin-top:4px;">Ready for review</div>
        </div>

        <div class="panel-card" style="padding: 20px; border-left: 4px solid #10b981; margin-bottom:0;">
          <div style="font-size: 11px; font-weight:700; color:#64748b; text-transform:uppercase;">Institutional Campuses</div>
          <div style="font-size: 28px; font-weight:800; color:#0f172a; margin-top:4px;">${s.totalUnis}</div>
          <div style="font-size: 12px; color:#64748b; margin-top:4px;">${s.totalIncubators} Incubation centres</div>
        </div>

        <div class="panel-card" style="padding: 20px; border-left: 4px solid #7c3aed; margin-bottom:0;">
          <div style="font-size: 11px; font-weight:700; color:#64748b; text-transform:uppercase;">Compliance Evidence</div>
          <div style="font-size: 28px; font-weight:800; color:#0f172a; margin-top:4px;">${s.totalEvidence}</div>
          <div style="font-size: 12px; color:#64748b; margin-top:4px;">Verified documents</div>
        </div>
      </div>

      <!-- Quick Action Banner -->
      <div style="background: #ffffff; border: 1px solid var(--border); border-radius: 12px; padding: 20px 24px; margin-bottom:28px; display:flex; align-items:center; justify-content:space-between;">
        <div>
          <h3 style="font-size:16px; font-weight:800; color:#0f172a;">Founder Questionnaire Pipeline</h3>
          <p style="font-size:13px; color:#64748b; margin-top:2px;">Generate founder invites or verify incoming assessments to publish to the showcase.</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn-secondary" onclick="navigate('submissions')">Review Submissions (${s.pendingReviews})</button>
          <button class="btn-primary" onclick="openModal('createStartupModal')">+ Add New Startup</button>
        </div>
      </div>

      <!-- Two Columns: Recent Startups & Audit Trail -->
      <div style="display:grid; grid-template-columns: 1.2fr 0.8fr; gap:24px;">
        <div class="data-table-container">
          <div class="table-toolbar">
            <h3 style="font-size:15px; font-weight:700;">Recent Startups</h3>
            <button class="btn-secondary" style="font-size:12px; padding:4px 10px;" onclick="navigate('startups')">View All</button>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Startup</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${data.recentStartups.map(r => `
                <tr>
                  <td>
                    <strong>${r.name}</strong>
                    <div style="font-size:11px; color:#64748b;">${r.sector || 'General'}</div>
                  </td>
                  <td><span class="pill-stage ${r.stage}">${r.stage}</span></td>
                  <td><span class="badge-status ${r.public_visibility ? 'published' : 'draft'}">${r.public_visibility ? '● Published' : '○ Draft'}</span></td>
                  <td>
                    <button class="btn-secondary" style="font-size:11.5px; padding:4px 8px;" onclick="viewStartupDetails(${r.id})">Details</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="data-table-container">
          <div class="table-toolbar">
            <h3 style="font-size:15px; font-weight:700;">Recent Activity Log</h3>
            <button class="btn-secondary" style="font-size:12px; padding:4px 10px;" onclick="navigate('audit')">View All</button>
          </div>
          <div style="padding:14px; display:flex; flex-direction:column; gap:10px;">
            ${data.recentLogs.map(l => `
              <div style="font-size:12px; padding-bottom:8px; border-bottom:1px solid #f1f5f9;">
                <div style="display:flex; justify-content:space-between; font-weight:600; color:#0f172a;">
                  <span>${l.action.replace(/_/g, " ").toUpperCase()}</span>
                  <span style="color:#94a3b8; font-weight:normal;">${l.created_at?.split(" ")[1] || ""}</span>
                </div>
                <div style="color:#64748b; margin-top:2px;">
                  By <b>${l.user_name || 'Founder'}</b> on <b>${l.startup_name || 'System'}</b>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color:#ef4444; padding:20px;">Failed to load dashboard: ${err.message}</div>`;
  }
}

// ==========================================================================
// 2. STARTUPS VIEW
// ==========================================================================
async function renderStartups() {
  const container = $("#adminContentArea");
  container.innerHTML = `<div style="color:#64748b; padding:20px;">Loading startups portfolio...</div>`;

  try {
    const res = await api("/startups");
    const startups = await res.json();

    container.innerHTML = `
      <div class="admin-page-header">
        <div>
          <h1>Startup Ventures Portfolio</h1>
          <p style="font-size:13.5px; color:#64748b;">Manage startup records, visibility on the institutional showcase, and founder invitations.</p>
        </div>
        <button class="btn-primary" onclick="openModal('createStartupModal')">+ Register New Startup</button>
      </div>

      <div class="data-table-container">
        <div class="table-toolbar">
          <input type="text" id="startupSearchInput" placeholder="Filter by startup name or sector..." style="border:1px solid var(--border); border-radius:6px; padding:8px 14px; font-size:13px; width:280px;">
          <div style="font-size:13px; color:#64748b;">Total: <b>${startups.length}</b> startups</div>
        </div>

        <table class="data-table" id="startupsTable">
          <thead>
            <tr>
              <th>Startup</th>
              <th>Sector & Stage</th>
              <th>Valuation</th>
              <th>Submission Status</th>
              <th>Visibility</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${startups.map(s => {
              const val = s.metrics?.valuation?.valueCr ? `₹${s.metrics.valuation.valueCr} Cr` : "—";
              const isPub = s.public_visibility === 1;
              return `
                <tr id="row-startup-${s.id}">
                  <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                      <img src="${s.logo_url}" style="width:36px; height:36px; border-radius:6px; object-fit:cover; border:1px solid #e2e8f0;" alt="${s.name}">
                      <div>
                        <strong>${s.name}</strong>
                        <div style="font-size:11.5px; color:#64748b;">${s.university_name || 'Riverside University'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div><span class="pill-sector">${s.sector || 'General'}</span></div>
                    <div style="margin-top:4px;"><span class="pill-stage ${s.stage}">${s.stage}</span></div>
                  </td>
                  <td><strong>${val}</strong></td>
                  <td>
                    <span class="badge-status ${s.submission_status || 'draft'}">
                      ${(s.submission_status || 'draft').replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <button class="badge-status ${isPub ? 'published' : 'draft'}" style="cursor:pointer;" onclick="toggleVisibility(${s.id})">
                      ${isPub ? '● Published' : '○ Hidden'}
                    </button>
                  </td>
                  <td style="text-align:right;">
                    <div style="display:flex; justify-content:flex-end; gap:6px;">
                      <a href="/startup/${s.slug}" target="_blank" class="btn-secondary" style="font-size:11.5px; padding:4px 8px;" title="View public profile">👁️</a>
                      <button class="btn-secondary" style="font-size:11.5px; padding:4px 8px;" onclick="generateInvite(${s.id})" title="Copy founder questionnaire link">🔗 Invite</button>
                      <button class="btn-secondary" style="font-size:11.5px; padding:4px 8px;" onclick="openReviewModalForStartup(${s.id})" title="Review diagnostic submission">📝 Review</button>
                      <button class="btn-secondary" style="font-size:11.5px; padding:4px 8px; color:#ef4444;" onclick="deleteStartup(${s.id}, '${s.name}')" title="Delete startup">🗑️</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;

    // Live search filter
    $("#startupSearchInput").addEventListener("input", e => {
      const q = e.target.value.toLowerCase();
      $$("#startupsTable tbody tr").forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? "" : "none";
      });
    });

  } catch (err) {
    container.innerHTML = `<div style="color:#ef4444; padding:20px;">Failed to load startups: ${err.message}</div>`;
  }
}

// Toggle startup public visibility
window.toggleVisibility = async function(id) {
  try {
    const res = await api(`/startups/${id}/visibility`, { method: "POST" });
    if (res.ok) {
      renderStartups();
    }
  } catch (err) {
    alert("Error updating visibility: " + err.message);
  }
};

// Generate founder invite link
window.generateInvite = async function(id) {
  try {
    const res = await api(`/startups/${id}/invite`, { method: "POST" });
    const data = await res.json();
    $("#inviteUrlField").value = data.invite_url;
    openModal("inviteModal");
  } catch (err) {
    alert("Error generating invite: " + err.message);
  }
};

// Delete startup
window.deleteStartup = async function(id, name) {
  if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
  try {
    const res = await api(`/startups/${id}`, { method: "DELETE" });
    if (res.ok) {
      renderStartups();
    }
  } catch (err) {
    alert("Error deleting startup: " + err.message);
  }
};

// Create new startup form submission
$("#submitCreateStartupBtn").addEventListener("click", async () => {
  const name = $("#newStartupName").value.trim();
  if (!name) return alert("Startup name is required.");

  const payload = {
    name,
    sector: $("#newStartupSector").value,
    stage: $("#newStartupStage").value,
    venture_type: $("#newStartupType").value,
    founder_name: $("#newStartupFounder").value.trim(),
    founder_email: $("#newStartupEmail").value.trim(),
    summary: $("#newStartupSummary").value.trim()
  };

  try {
    const res = await api("/startups", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create startup");

    closeModal("createStartupModal");

    // Clear inputs
    $("#newStartupName").value = "";
    $("#newStartupFounder").value = "";
    $("#newStartupEmail").value = "";
    $("#newStartupSummary").value = "";

    // Show invite modal with generated link
    $("#inviteUrlField").value = data.invite_url;
    openModal("inviteModal");

    renderStartups();
  } catch (err) {
    alert("Error creating startup: " + err.message);
  }
});

$("#openNewStartupModalBtn").addEventListener("click", () => openModal("createStartupModal"));

// ==========================================================================
// 3. SUBMISSIONS & VERIFICATION WORKSPACE
// ==========================================================================
async function renderSubmissions() {
  const container = $("#adminContentArea");
  container.innerHTML = `<div style="color:#64748b; padding:20px;">Loading submissions workspace...</div>`;

  try {
    const res = await api("/submissions");
    const subs = await res.json();

    container.innerHTML = `
      <div class="admin-page-header">
        <div>
          <h1>Submissions & Verification Workspace</h1>
          <p style="font-size:13.5px; color:#64748b;">Review founder diagnostic questionnaire answers, derived valuation metrics, and publish to showcase.</p>
        </div>
      </div>

      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Startup</th>
              <th>Version</th>
              <th>Status</th>
              <th>Submitted Date</th>
              <th>Reviewer Note</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${subs.map(sub => `
              <tr>
                <td>#${sub.id}</td>
                <td>
                  <strong>${sub.startup_name}</strong>
                  <div style="font-size:11.5px; color:#64748b;">${sub.startup_sector || ''}</div>
                </td>
                <td>v${sub.version_no}</td>
                <td>
                  <span class="badge-status ${sub.status}">
                    ${sub.status === 'verified' ? '✓ Verified' : sub.status === 'submitted' ? '● Submitted' : sub.status}
                  </span>
                </td>
                <td>${sub.submitted_at || sub.created_at || '—'}</td>
                <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#64748b; font-size:12px;">
                  ${sub.reviewer_note || '—'}
                </td>
                <td style="text-align:right;">
                  <button class="btn-primary" style="font-size:12px; padding:6px 12px;" onclick="openReviewModalById(${sub.id}, ${sub.startup_id}, '${sub.startup_name}', ${sub.version_no})">
                    Review Submission →
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color:#ef4444; padding:20px;">Failed to load submissions: ${err.message}</div>`;
  }
}

// Open review modal for a startup from Startups list
window.openReviewModalForStartup = async function(startupId) {
  try {
    const res = await api(`/startups/${startupId}`);
    const data = await res.json();
    const sub = data.submissions && data.submissions[0];
    if (!sub) {
      alert("No submission exists yet for this startup. Please invite the founder to fill out the questionnaire.");
      return;
    }
    openReviewModalById(sub.id, startupId, data.startup.name, sub.version_no);
  } catch (err) {
    alert("Error fetching startup: " + err.message);
  }
};

window.openReviewModalById = async function(submissionId, startupId, startupName, versionNo) {
  currentReviewStartupId = startupId;
  $("#reviewStartupTitle").textContent = `${startupName} — Diagnostic Review`;
  $("#reviewVersionSubtitle").textContent = `Submission #${submissionId} · Version ${versionNo}`;
  const modalBody = $("#reviewModalBody");
  modalBody.innerHTML = `<div style="padding:20px; text-align:center; color:#64748b;">Loading full questionnaire data & derived metrics...</div>`;
  openModal("reviewModal");

  try {
    const res = await api(`/submissions/${submissionId}`);
    const sub = await res.json();
    const a = sub.answers || {};
    const d = sub.derived || {};

    const valCr = d.valuation?.valueCr || "—";
    const invScore = d.investability?.score || "—";
    const aiScore = d.ai_resilience?.score || "—";
    const sdgScore = d.sdg_impact?.score || "—";

    modalBody.innerHTML = `
      <!-- Top Score Summary in Modal -->
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; margin-bottom:20px;">
        <div style="background:#faf5ff; border:1px solid #e9d5ff; padding:12px; border-radius:8px; text-align:center;">
          <div style="font-size:11px; color:#7e22ce; font-weight:700;">VALUATION</div>
          <div style="font-size:20px; font-weight:800; color:#6b21a8;">₹${valCr} Cr</div>
        </div>
        <div style="background:#ecfdf5; border:1px solid #a7f3d0; padding:12px; border-radius:8px; text-align:center;">
          <div style="font-size:11px; color:#047857; font-weight:700;">INVESTABILITY</div>
          <div style="font-size:20px; font-weight:800; color:#065f46;">${invScore}/10</div>
        </div>
        <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:12px; border-radius:8px; text-align:center;">
          <div style="font-size:11px; color:#1d4ed8; font-weight:700;">AI RESILIENCE</div>
          <div style="font-size:20px; font-weight:800; color:#1e40af;">${aiScore}/10</div>
        </div>
        <div style="background:#fffbeb; border:1px solid #fde68a; padding:12px; border-radius:8px; text-align:center;">
          <div style="font-size:11px; color:#92400e; font-weight:700;">SDG IMPACT</div>
          <div style="font-size:20px; font-weight:800; color:#92400e;">${sdgScore}/10</div>
        </div>
      </div>

      <!-- Questionnaire Responses Overview -->
      <h4 style="font-size:14.5px; font-weight:700; margin-bottom:10px; color:#0f172a;">Founder Questionnaire Responses</h4>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; display:flex; flex-direction:column; gap:12px; font-size:13px;">
        <div><b>Startup Description / Mission (Q18):</b> <div style="color:#475569; margin-top:2px;">${a.Q18 || '—'}</div></div>
        <div><b>Clients & Traction (Q29):</b> <div style="color:#475569; margin-top:2px;">${a.Q29 || '—'}</div></div>
        <div><b>Annual Revenue (Q31):</b> <div style="color:#475569; margin-top:2px;">${a.Q31 || '—'}</div></div>
        <div><b>Technology & Differentiation (Q45):</b> <div style="color:#475569; margin-top:2px;">${a.Q45 || '—'}</div></div>
        <div><b>Total Questions Answered:</b> <span style="color:#2563eb; font-weight:700;">${Object.keys(a).length} of 75</span></div>
      </div>

      <!-- Evidence Documents -->
      <h4 style="font-size:14.5px; font-weight:700; margin:16px 0 10px 0; color:#0f172a;">Attached Verification Evidence</h4>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${(sub.evidence && sub.evidence.length > 0) ? sub.evidence.map(e => `
          <div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid #e2e8f0; padding:10px 14px; border-radius:6px; font-size:12.5px;">
            <span>📄 <b>${e.title || e.evidence_type}</b></span>
            <span class="badge-status ${e.verification_status}">${e.verification_status}</span>
          </div>
        `).join("") : '<div style="color:#94a3b8; font-size:12.5px;">No compliance documents uploaded yet.</div>'}
      </div>
    `;

    $("#reviewNoteInput").value = sub.reviewer_note || "";

  } catch (err) {
    modalBody.innerHTML = `<div style="color:#ef4444;">Failed to load submission data: ${err.message}</div>`;
  }
};

window.submitReviewAction = async function(action) {
  if (!currentReviewStartupId) return;
  const note = $("#reviewNoteInput").value.trim();

  try {
    const res = await api(`/startups/${currentReviewStartupId}/review`, {
      method: "POST",
      body: JSON.stringify({ action, note })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Review submission failed");

    alert(action === "verified" ? "Submission verified! The startup profile is now published live." : "Feedback recorded! Changes requested from founder.");
    closeModal("reviewModal");
    if (currentView === "submissions") renderSubmissions();
    else renderStartups();
  } catch (err) {
    alert("Error saving review: " + err.message);
  }
};

// ==========================================================================
// 4. EVIDENCE & COMPLIANCE
// ==========================================================================
async function renderEvidence() {
  const container = $("#adminContentArea");
  container.innerHTML = `<div style="color:#64748b; padding:20px;">Loading evidence repository...</div>`;

  try {
    const res = await api("/evidence");
    const evidence = await res.json();

    container.innerHTML = `
      <div class="admin-page-header">
        <div>
          <h1>Evidence & Verification Documents</h1>
          <p style="font-size:13.5px; color:#64748b;">Review certificates of incorporation, revenue proof, and patent grants attached to submissions.</p>
        </div>
      </div>

      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Document Title</th>
              <th>Type</th>
              <th>Startup</th>
              <th>Status</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${evidence.map(e => `
              <tr>
                <td><strong>${e.title || 'Untitled Document'}</strong></td>
                <td><span class="pill-sector">${e.evidence_type}</span></td>
                <td><b>${e.startup_name}</b></td>
                <td><span class="badge-status ${e.verification_status}">${e.verification_status}</span></td>
                <td style="text-align:right;">
                  <button class="btn-primary" style="font-size:11.5px; padding:4px 10px; background:#059669;" onclick="verifyEvidenceItem(${e.id}, 'verified')">Approve</button>
                  <button class="btn-secondary" style="font-size:11.5px; padding:4px 10px; color:#ef4444;" onclick="verifyEvidenceItem(${e.id}, 'rejected')">Reject</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color:#ef4444; padding:20px;">Failed to load evidence: ${err.message}</div>`;
  }
}

window.verifyEvidenceItem = async function(id, status) {
  try {
    const res = await api(`/evidence/${id}/verify`, {
      method: "POST",
      body: JSON.stringify({ status })
    });
    if (res.ok) renderEvidence();
  } catch (err) {
    alert("Error updating evidence: " + err.message);
  }
};

// ==========================================================================
// 5. UNIVERSITIES & INCUBATORS
// ==========================================================================
async function renderUniversities() {
  const container = $("#adminContentArea");
  container.innerHTML = `<div style="color:#64748b; padding:20px;">Loading universities...</div>`;

  try {
    const res = await api("/universities");
    const unis = await res.json();

    container.innerHTML = `
      <div class="admin-page-header">
        <div>
          <h1>Institutional Partners & Universities</h1>
          <p style="font-size:13.5px; color:#64748b;">University ecosystems powered by Startup Impact.</p>
        </div>
      </div>

      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>University</th>
              <th>Slug / URL</th>
              <th>Incubators</th>
              <th>Startups</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${unis.map(u => `
              <tr>
                <td><strong>${u.name}</strong></td>
                <td><code>/u/${u.slug}</code></td>
                <td>${u.incubators_count || 1}</td>
                <td><b>${u.startups_count || 0}</b></td>
                <td style="text-align:right;">
                  <a href="/u/${u.slug}" target="_blank" class="btn-secondary" style="font-size:11.5px; padding:4px 8px;">View Portal ↗</a>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color:#ef4444; padding:20px;">Failed to load universities: ${err.message}</div>`;
  }
}

async function renderIncubators() {
  const container = $("#adminContentArea");
  container.innerHTML = `<div style="color:#64748b; padding:20px;">Loading incubation centres...</div>`;

  try {
    const res = await api("/incubators");
    const incs = await res.json();

    container.innerHTML = `
      <div class="admin-page-header">
        <div>
          <h1>Incubation Centres & Facilities</h1>
          <p style="font-size:13.5px; color:#64748b;">Innovation cells, fablabs, and venture acceleration centres.</p>
        </div>
      </div>

      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Incubation Centre</th>
              <th>University</th>
              <th>Facilities</th>
              <th>Startups Hosted</th>
            </tr>
          </thead>
          <tbody>
            ${incs.map(inc => `
              <tr>
                <td><strong>${inc.name}</strong></td>
                <td>${inc.university_name || 'Riverside University'}</td>
                <td style="font-size:12px; color:#64748b; max-width:320px;">${inc.facilities || 'Prototyping & Labs'}</td>
                <td><b>${inc.startups_count || 0}</b></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color:#ef4444; padding:20px;">Failed to load incubators: ${err.message}</div>`;
  }
}

// ==========================================================================
// 6. AUDIT TRAIL
// ==========================================================================
async function renderAudit() {
  const container = $("#adminContentArea");
  container.innerHTML = `<div style="color:#64748b; padding:20px;">Loading audit trail...</div>`;

  try {
    const res = await api("/audit");
    const logs = await res.json();

    container.innerHTML = `
      <div class="admin-page-header">
        <div>
          <h1>Audit Trail & Compliance Log</h1>
          <p style="font-size:13.5px; color:#64748b;">Immutable record of changes, reviews, publications and user access.</p>
        </div>
      </div>

      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>User</th>
              <th>Startup Target</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(l => `
              <tr>
                <td style="font-size:12px; color:#64748b; font-family:monospace;">${l.created_at}</td>
                <td><span class="pill-sector">${l.action}</span></td>
                <td><strong>${l.user_name || 'System / Founder'}</strong></td>
                <td>${l.startup_name || '—'}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color:#ef4444; padding:20px;">Failed to load audit trail: ${err.message}</div>`;
  }
}

// ==========================================================================
// 7. USER MANAGEMENT (SUPER ADMIN)
// ==========================================================================
async function renderUsers() {
  const container = $("#adminContentArea");
  container.innerHTML = `<div style="color:#64748b; padding:20px;">Loading user accounts...</div>`;

  try {
    const res = await api("/users");
    const users = await res.json();

    container.innerHTML = `
      <div class="admin-page-header">
        <div>
          <h1>Administrative User Management</h1>
          <p style="font-size:13.5px; color:#64748b;">Manage Super Admins and University Incubation Admins.</p>
        </div>
      </div>

      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Affiliated Campus</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td><strong>${u.name}</strong></td>
                <td><code>${u.email}</code></td>
                <td><span class="pill-stage ${u.role === 'super_admin' ? 'ideation' : 'incubated'}">${u.role}</span></td>
                <td>${u.university_name || 'Global System'}</td>
                <td><span class="badge-status ${u.active ? 'verified' : 'rejected'}">${u.active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color:#ef4444; padding:20px;">Failed to load users: ${err.message}</div>`;
  }
}

// Auto-login check on page load
if (token && user) {
  initApp();
}