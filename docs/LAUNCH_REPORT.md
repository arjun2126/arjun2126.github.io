# ArjunOS launch evidence — 3 November 2026

## Initial publication

- Repository: https://github.com/arjun2126/arjun2126.github.io
- HTTPS website: https://arjun2126.github.io/
- Initial deployed merge: `12524d6fb8ca463e3e10e9d78839450ff4fc5d8d`
- Launch PR: https://github.com/arjun2126/arjun2126.github.io/pull/1 — merged after passing CI
  and independent review. Original `84ef0fa` main history and preparation `f80483b` are retained.
- PR verification: https://github.com/arjun2126/arjun2126.github.io/actions/runs/41675116878 — pass.
- Main verification/deployment: https://github.com/arjun2126/arjun2126.github.io/actions/runs/41675516523 — both jobs pass.
- Existing Pages legacy source switched to Actions; existing main-only environment policy retained.
- The public `/deployment.json` reports the currently deployed commit. Later reviewed merges may
  supersede the initial launch SHA above; this document records the first successful deployment.

## Verified evidence

| Check | Result |
| --- | --- |
| Node 22 `npm ci` and dependency audit | Pass; zero known vulnerabilities at launch |
| TypeScript | Pass |
| Unit/API suite | 87 tests across 8 files pass |
| Production build | Pass; 20 public routes plus custom 404 and directory copy |
| Chromium regression | 30 journeys pass, retries disabled; window lifecycle, search/filter, keyboard, mobile, axe |
| Historical/tree privacy scans | Pass; no forbidden paths or recognized secret/private-email patterns |
| Asset publication | 46 existing public files byte-identical to audited preparation; empty generated content seed |
| Negative publication test | Harmless unreviewed public file rejected before building |
| Studio isolated browser roundtrip | Image + project screenshot + 5.9 MB synthetic PDF uploaded; sample name edited; saved files exist; refresh and server restart without browser storage retain changes; built site renders sample content; image/PDF URLs load; original seed/approvals unchanged; temporary fixture deleted |
| Live routes over HTTPS | All 20 direct routes return 200, including all 8 project pages, recruiter, résumé, Salesforce, AI and Northgate Live |
| Live static assets | All 46 approved public file hashes match; no missing local assets/page exceptions |
| Live mobile | All 20 routes at 390 × 844 have no horizontal overflow |
| Live accessibility | Home, standalone recruiter and résumé have zero serious/critical axe findings after animations settle |
| Canonicals/sitemap | All 20 routes use the approved HTTPS origin; local authoring/404 excluded from sitemap |
| Unknown/private routes | Real custom 404; private source, environment and authoring-state paths return 404 |
| Authoring POST | GitHub Pages returns 405; no successful write endpoint; production bundle contains no save API reference |
| Public project links | All 8 repository destinations return 200 |
| Northgate public routes | Home, inventory, 3D Studio, about and contact return 200; SAMEORIGIN and frame-ancestors self remain; no Salesforce settings changed |
| Visual review | Desktop 1600 × 1000 and mobile 390 × 844 captures inspected; approved interface and placeholders preserved |
| Live interaction | In-app browser Dock Skills action opens the Skills dialog and updates the public route |

Re-run read-only public verification with:

```bash
DEPLOYED_SHA=EXACT_EXPECTED_MERGE_SHA npx tsx scripts/verify-live.ts
```

Evidence JSON and captures are written under ignored `test-results/launch-verification/`.
The first live scan sampled entrance-animation opacity and reported transient contrast failures;
waiting for actual font/animation completion fixed the measurement. Assertions were not disabled.

## Owner handoff and remaining limits

See [CONTENT_UPDATES.md](CONTENT_UPDATES.md). The workflow is upload → preview → save to project →
exact-file privacy approval → `npm run publish:prepare` → reviewed commit/PR → merge → automatic
deployment → live verification. No automatic push, production database or authentication service.

Still needed: genuine portrait, genuine Vantage captures, an approved redacted résumé PDF and a
genuine hosted walkthrough recording. No email or phone publication is approved. Current placeholders
remain honest; existing gallery evidence is preserved.

Coverage is Chromium only. PDF signature validation and secret-pattern scanning cannot prove privacy,
malware safety or licensing; actual document/image review remains mandatory. Exceptional local
filesystem failures can leave orphaned media; publication validation rejects those until reviewed.
GitHub emitted action-runtime deprecation/runner-migration notices, but both jobs passed; application
build/test uses Node 22 as configured. The original development workspace was not modified.
