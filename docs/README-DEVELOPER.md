# Startup Impact — Full Developer Package

This is the consolidated application baseline, not a requirements-only ZIP.

Run:
1. npm install
2. copy .env.example to .env and set JWT_SECRET
3. npm run seed
4. npm start
5. open /u/demo, /founder/:startup/:token, or /admin

Production hardening required: PostgreSQL, object storage, secure sessions, upload scanning, rate limits, tenant isolation, backups, HTTPS, privacy controls and methodology review.

The 75-question questionnaire is executable in server/questionnaire.js and is exposed at GET /api/questionnaire.
