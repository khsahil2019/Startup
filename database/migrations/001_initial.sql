PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS universities(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
 logo_url TEXT, favicon_url TEXT, theme_json TEXT NOT NULL DEFAULT '{}',
 about TEXT, vision TEXT, mission TEXT, contact_json TEXT NOT NULL DEFAULT '{}',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS incubation_centres(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
 name TEXT NOT NULL, slug TEXT, logo_url TEXT, section8_date TEXT,
 about TEXT, vision TEXT, mission TEXT, facilities TEXT, contact_json TEXT NOT NULL DEFAULT '{}',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS users(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
 name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('super_admin','university_admin')),
 active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS startups(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
 incubation_id INTEGER REFERENCES incubation_centres(id) ON DELETE SET NULL,
 name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
 venture_type TEXT NOT NULL CHECK(venture_type IN ('student','external')),
 stage TEXT NOT NULL DEFAULT 'ideation',
 portfolio_status TEXT NOT NULL DEFAULT 'draft',
 logo_url TEXT, founder_image_url TEXT,
 summary TEXT, sector TEXT, public_visibility INTEGER NOT NULL DEFAULT 0,
 current_submission_id INTEGER, published_submission_id INTEGER,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS founders(
 id INTEGER PRIMARY KEY AUTOINCREMENT, startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
 name TEXT NOT NULL, role TEXT, image_url TEXT, email TEXT, display_order INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS submissions(
 id INTEGER PRIMARY KEY AUTOINCREMENT, startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
 version_no INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'draft',
 answers_json TEXT NOT NULL DEFAULT '{}', derived_json TEXT NOT NULL DEFAULT '{}',
 submitted_at TEXT, reviewed_at TEXT, reviewed_by INTEGER REFERENCES users(id),
 reviewer_note TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS evidence(
 id INTEGER PRIMARY KEY AUTOINCREMENT, startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
 submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
 evidence_type TEXT NOT NULL, title TEXT, file_url TEXT, verification_status TEXT NOT NULL DEFAULT 'pending',
 reviewer_note TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS team_members(
 id INTEGER PRIMARY KEY AUTOINCREMENT, startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
 name TEXT NOT NULL, role TEXT, image_url TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS media(
 id INTEGER PRIMARY KEY AUTOINCREMENT, startup_id INTEGER REFERENCES startups(id) ON DELETE CASCADE,
 kind TEXT NOT NULL, title TEXT, url TEXT, caption TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS leaders(
 id INTEGER PRIMARY KEY AUTOINCREMENT, university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
 name TEXT NOT NULL, designation TEXT NOT NULL, image_url TEXT, biography TEXT, display_order INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS achievements(
 id INTEGER PRIMARY KEY AUTOINCREMENT, university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
 title TEXT NOT NULL, description TEXT, date TEXT, image_url TEXT
);
CREATE TABLE IF NOT EXISTS events(
 id INTEGER PRIMARY KEY AUTOINCREMENT, university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
 title TEXT NOT NULL, description TEXT, event_date TEXT, image_url TEXT
);
CREATE TABLE IF NOT EXISTS audit_log(
 id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, startup_id INTEGER,
 action TEXT NOT NULL, before_json TEXT, after_json TEXT, ip TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS founder_invites(
 id INTEGER PRIMARY KEY AUTOINCREMENT, startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
 token_hash TEXT NOT NULL UNIQUE, expires_at TEXT, active INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_startups_university ON startups(university_id);
CREATE INDEX IF NOT EXISTS idx_submissions_startup ON submissions(startup_id,version_no);
CREATE INDEX IF NOT EXISTS idx_evidence_submission ON evidence(submission_id);
