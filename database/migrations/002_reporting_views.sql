CREATE VIEW IF NOT EXISTS published_startup_summary AS
SELECT s.id,s.university_id,s.name,s.slug,s.venture_type,s.stage,s.published_submission_id
FROM startups s WHERE s.public_visibility=1;

CREATE VIEW IF NOT EXISTS verification_queue AS
SELECT s.id startup_id,s.name,s.university_id,sub.id submission_id,sub.version_no,sub.status,sub.submitted_at
FROM startups s JOIN submissions sub ON sub.id=s.current_submission_id
WHERE sub.status IN ('submitted','changes_requested');
