# Startup Impact — Final Release Notes

This release is based on the developer-supplied TAR and preserves its working application rather than replacing it with a blank scaffold.

## Finalization work
- Master UI reference added and documented.
- University public page made data-driven for startup counts and institutional content.
- Public startup profile now receives its University context from the backend.
- Back to University navigation uses the configured University website URL.
- Public navigation no longer exposes the admin route.
- Founder submission workflow strengthened with required-question validation.
- Changes-requested workflow creates a new draft version before resubmission.
- Founder evidence upload implemented with controlled file types and size limits.
- Evidence remains pending until University Admin verification.
- Public data remains restricted to verified/published submissions.
- Migration handling made safe for existing databases.
- Health endpoint and upload serving added for deployment checks.
- Final acceptance checklist and webmaster integration note included.

## Important deployment note
Run the project in a clean environment, configure `.env`, install dependencies with `npm ci`, seed only a demonstration/new installation, and perform end-to-end browser acceptance testing on the target server before public launch.
