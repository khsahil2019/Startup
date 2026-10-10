# Startup Impact UI Remediation — October 2026

## Master reference
`docs/assets/Startup-Impact-UI-Master-Reference.png` is the master visual and information-architecture reference. The target is the wide, premium Startup Impact dashboard/profile experience, not a generic stacked-card site.

## Changes in this build
- Expanded the content container for desktop use and adjusted responsive breakpoints so tablet layouts do not activate too early.
- Refined header, founder facts, KPI cards, profile cards and sticky analytical tab navigation.
- Preserved the intended profile tabs: Overview, Valuation, Road Ahead, Uniqueness, Investability, AI Resilience, SDG Impact, Clients & Revenue, Team and Gallery.
- Removed several misleading hard-coded AgriSense facts, customer testimonial, score dimensions, projections and client metrics from generic fallback paths. Where verified submission data is missing, the UI now uses a neutral “not provided/not disclosed” state rather than inventing a claim.
- Seeded demo data now retains its supplied founder facts and quote inside the demo metrics payload so the demonstration profile can show those fields from data rather than HTML literals.
- Included the visual reference and this remediation note in the project.

## Release caution
This is a code/UI remediation build, not proof of deployment acceptance. Run the project in the target hosting environment and test the full-width desktop layout, tablet/mobile breakpoints, every profile tab, founder submission, admin verification, versioned resubmission, and publication flow before production release. Verify that real submissions populate all required profile fields; do not substitute invented fallback content for missing data.
