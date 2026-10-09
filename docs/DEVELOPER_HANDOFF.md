# Startup Impact — Developer Handoff

## Product rule
Founder provides -> system derives -> evidence supports -> university verifies -> approved version publishes -> live university integration updates.

## Roles
SUPER ADMIN: creates universities, creates university admins, controls platform-level settings.
UNIVERSITY ADMIN: manages its university, incubation centre, leaders, events, achievements, startups and verification.

## Startup classifications
VENTURE TYPE: student OR external.
STAGE: ideation, prototype, MVP, pilot, early revenue, growth.
These are independent dimensions. A startup can be external + growth, or student + early revenue.

## Founder form
Exactly 75 core questions in `server/questionnaire.js`.
All are structured select questions except the deliberately short startup description.
The form autosaves to a draft submission. It never publishes founder changes directly.
A submitted version is reviewed. Only `verified` versions become `published_submission_id`.

## Derived outputs
1. Indicative pre-money valuation and range.
2. Investment-readiness profile.
3. AI resilience.
4. SDG impact.
5. Uniqueness/differentiation.
6. Business potential and scenario projections.
7. Road Ahead.
8. 20-section business-plan framework.

## Public integration
University developer can:
- add menu link to `https://HOST/u/demo`
- embed `<script src="https://HOST/embed.js" data-university="demo"></script>`
- or iframe `/u/demo`.

Because the page consumes live API data, verified changes appear without re-uploading a new HTML package.

## Production requirements
Use PostgreSQL, object storage, HTTPS, strong secrets, secure authentication, rate limiting, upload scanning, tenant authorization, backups, audit monitoring, privacy/retention policies, and methodology review before public investor use.
