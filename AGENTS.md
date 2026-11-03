# ArjunOS engineering guide

## Scope and safety
Build a static, accessible React/TypeScript portfolio. Do not deploy, modify source repositories, invent credentials/results, or expose private information. Public repository documentation is the content authority.

## Architecture
Vite + React + TypeScript. Content-driven project registry; reusable desktop window manager and app panels; CSS responsive mobile document mode. Pre-render project HTML for direct static URLs and SEO. No backend or authentication.

## Quality gates
Run `npm run check`, `npm test`, `npm run build`, and `npm run test:e2e`. Test window lifecycle, search/filter, routes, keyboard navigation, mobile overflow, and automated accessibility. Visually inspect desktop and mobile. Request independent review before final handoff. Do not weaken checks to get green results.

## Resumability
Read PLANS.md and docs/PROGRESS.md first. Record verified sources in docs/SOURCES.md, decisions and completed checks in docs/PROGRESS.md. Document limitations rather than fabricate content.
