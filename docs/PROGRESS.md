# Persistent progress

## Active launch milestone — 3 November 2026

The owner's new launch authorization supersedes historical no-push/no-deployment gates below.
Verified clean preparation branch at f80483b; origin/main remained 84ef0fa after fetch.
Repository is public; authenticated GitHub account matches the owner. Pages was already legacy
branch publishing. All work is confined to the separate preparation clone.

Launch implementation: local portrait/gallery/PDF persistence; project titles/links; hosted-video
integration; reviewed-hash publication gate; Node 22 Actions PR checks and main-only deployment.
Existing public assets and curated professional facts remain unchanged; generated seed is empty.
TypeScript, 78 baseline unit/API tests and 30 browser journeys passed. Isolated real-browser
image upload/save/refresh/restart/build/static-assets roundtrip passed without changing originals.
Independent review identified quota handling, partial media overwrites and cross-view content
consistency issues; these were corrected. Re-review approved initial publication with no blocker:
all 46 public files byte-identical, empty seed, TypeScript/static/privacy checks passing.
Latest unit/API suite: 87 passing tests across 8 files. Latest browser suite: 30/30, no retries.
The isolated workflow also passed a 5.9 MB synthetic PDF upload/save/restart/build/download test.
All fixture data was removed, and the approved seed/manifest remained unchanged.
Publication/live verification are not yet complete. Current owner workflow: CONTENT_UPDATES.md.

## Current state

ArjunOS is a reference-driven macOS-style portfolio with approved professional content, a working local Content Studio, a licensed photographic wallpaper, a verified Northgate live-site fallback, and 20 static route documents. The desktop composes three windows, a Dock and a translucent menu bar; Recruiter Mode also has a standalone URL. The final 2 November polish pass is complete and validated; the genuine portrait remains the only missing input in the homepage hero.

## Completed

- **Approved content import (2 Nov 2026)** — two professional roles, Durham College and MS Ramaiah education, four Salesforce certification names, Whitby location, availability, LinkedIn and AI non-claims. Phone, address, work authorization, compensation, credential IDs, application records and the unconfirmed Matchpoint role remain excluded.
- **Recruiter Mode** — five sections: Overview, Experience, Skills, Projects and Credentials; current/prior roles, location, certifications, education and verified links.
- **Experience and résumé** — professional employment plus independent work kept separate; roles, responsibilities, education, certifications and no total-years figure. Contact remains LinkedIn/GitHub only.
- **AI Engineering** — approved positioning, Agentforce prototype labelled experimental, and explicit “what I have not done” non-claims.
- **About, contact, mobile and sidebar** — aligned with the approved profile; LinkedIn replaces the placeholder quick link.
- **Visual foundation** — photographic public-domain alpine wallpaper, violet grading, dark glass, traffic lights, menu bar, Dock and system-like typography.
- **Content Studio** — profile/photo, career, skills, projects and media editing; DOCX/Markdown/TXT/JSON import; client-side image resizing; validation; preview; save-to-project; JSON export.
- **Local save pipeline** — a dev-only Vite endpoint writes generated content, optimized WebP assets, current draft and up to 20 reversible history files. Invalid drafts return 422.
- **Northgate Live (2 Nov 2026)** — verified the published buyer URL at `/owners/s/buyer`; a direct Chromium probe confirmed `X-Frame-Options: SAMEORIGIN` and `frame-ancestors 'self'` block embedding. Added `/northgate-live/` with genuine captures, loading state, framing disclosure, full-screen preview, live external links, inventory and 3D Studio access. Owner Portal is excluded. No Salesforce setting was changed; the existing case study gains a callout and remains intact.
- **Quality** — 38 unit tests, 29 Chromium journeys, axe scans, reduced-motion and no-JavaScript checks, mobile overflow checks, and desktop/mobile captures.
- **Final UI/UX polish (2 Nov 2026)** — replaced “Welcome to ArjunOS” with “Hi, I’m Arjun Subramanya.”; added the verified professional subtitle; strengthened hierarchy, contrast and links in the four skill cards; moved featured work to a larger two-column grid; increased desktop margins, window separation and content spacing; surfaced standalone recruiter actions and selected work above the tabs; wrapped and tightened the mobile recruiter layout. No professional claims or privacy controls were changed.
- **Final visual evidence** — `polish-desktop-1600.png`, `polish-desktop-1440.png`, `polish-tablet-768.png`, `polish-mobile-390.png`, `polish-recruiter-1600.png`, `polish-recruiter-390.png`, `polish-salesforce-1600.png`, `polish-northgate-live-1600.png`, `polish-northgate-live-390.png`, and `polish-before-after-1600.png`.

## Validation log

| Date | Check | Result |
| --- | --- | --- |
| 2 Nov 2026 | `npm run check` | Pass |
| 2 Nov 2026 | `npm test` | 38 passed |
| 2 Nov 2026 | `npm run build` | Pass; 20 HTML routes, 8 project pages |
| 2 Nov 2026 | `npx playwright test` (baseline) | 28 passed (desktop + mobile) |
| 2 Nov 2026 | Final `npm run check` | Pass |
| 2 Nov 2026 | Final `npm test` | 38 passed |
| 2 Nov 2026 | Final `npm run build` | Pass; 20 HTML routes, 8 project pages; JS 426.51 kB (123.63 kB gzip), CSS 146.07 kB (27.85 kB gzip) |
| 2 Nov 2026 | Final `npx playwright test` | 29 passed (desktop + mobile) |
| 2 Nov 2026 | Final production captures | 1600 × 1000, 1440 × 900, 768 × 1024, 390 × 844; recruiter, Salesforce and Northgate Live; no horizontal overflow or console errors |
| 2 Nov 2026 | Final visual review | New H1 and subtitle, four linked skill cards, two-column featured grid, separated desktop windows, recruiter CTAs above tabs, wrapped mobile tabs; Northgate Live unchanged |
| 2 Nov 2026 | Northgate buyer URL + framing | `/owners/s/buyer` 200; `X-Frame-Options: SAMEORIGIN`; `frame-ancestors 'self'`; real iframe blocked by response |
| 2 Nov 2026 | Northgate Live visual + isolation | Genuine captures, loading overlay cleared, full-screen action, external links, no Owner Portal route; 1600 × 1000 and 390 × 844 captured |
| 2 Nov 2026 | axe WCAG 2 A/AA and 2.1 A/AA | No serious/critical findings: desktop home, project, résumé, recruiter; mobile home, project |
| 2 Nov 2026 | DOCX import + photo persistence | Browser test: import, review, apply, reload; passed |
| 2 Nov 2026 | Local save endpoint | 200 with portrait + media written; state/history returned; empty name returned 422 |
| 2 Nov 2026 | Mobile 390 × 844 across eleven routes | No horizontal overflow, including Northgate Live |
| 2 Nov 2026 | Visual review at 1600 × 1000 | Three-window desktop, recruiter sheet, studio, Northgate Live and case-study callout captured |

## Known constraints

- No deployment or domain purchase.
- The chat photograph was not present in the workspace or attachment store as a file. A final search on 2 November found no portrait asset; only `public/og/arjunos-cover.png` matches a profile filename. The portrait placeholder remains the upload step and no substitute was used.
- The larger two-column featured grid intentionally leaves its second row below the fold at 1600 × 1000; the main pane scrolls. The compact Recruiter window also scrolls its overview, while `/recruiter/` shows the full summary at 1600 × 1000.
- Genuine Vantage screenshots still need owner supply; the studio accepts them and applies the first as the project cover.
- Email publication is not approved; phone and address are excluded.
- A redacted, web-safe résumé PDF is pending. The current print action renders the page; PDF text import is unsupported.
- The save endpoint exists only under `npm run dev`; `vite preview` serves the built content and cannot write files.
- Content Studio is Chromium-tested; Safari and Firefox were not run.
- The initial UI delivery had no independent reviewer; repository preparation subsequently received an independent security/correctness review. Owner visual/content review remains an external gate.
- `vite preview` returns HTTP 200 for unknown paths; `404.html` needs host configuration.
- Lighthouse/Core Web Vitals were not measured.
- Repository test and metric counts are quoted from documentation, not re-executed.
- Salesforce blocks third-party framing of the buyer experience. ArjunOS shows owner-published captures and links out; it does not proxy or weaken Salesforce security. True embedding needs explicit owner approval for a Salesforce CSP/framing change and was not attempted.

## Next

Await owner authorization after the local preparation commit. Do not push, merge,
activate Pages or deploy. Owner assets and optional Salesforce framing changes
remain separately approval-gated. The approved GitHub production origin is now
configured for local build metadata, not activated hosting.

## GitHub preparation — 2 November 2026

- Cloned the existing repository and preserved the `main` README commit on
  `chore/github-preparation`; copied only the application/configuration allowlist,
  public assets, source documentation and 11 reviewed evidence captures.
- Original workspace and approved career/profile/project content remain unchanged;
  all 42 public raster assets are byte-identical to the audited source workspace.
- Ignored conversation attachments, local drafts/history, unreviewed uploads,
  environment/credential files, builds, dependencies, reports, caches and backups.
  Verified 27 representative exclusions with `git check-ignore -v`.
- Bound development/preview to loopback and gated authoring requests by actual
  socket peer, exact loopback Host/listening port and same-origin HTTP Origin.
  Added nested draft shape validation; malformed drafts cannot write files.
- Reconciled screenshot provenance/privacy documentation and static résumé,
  experience/contact copy without introducing professional claims or new imagery.
- Configured root-base GitHub metadata, `.nojekyll`, sitemap/canonical generation
  and a static-output verifier. No deployment workflow or Pages activation.
- Drag investigation: the original test sampled the transformed entrance-animation
  bounding box without synchronization. Waited for animation completion, retained
  the same 70/40 movement and 8-pixel assertions, and polled the final geometry.
  Baseline repetition passed 10/10 (the audit flake was not reproduced in that
  batch); synchronized test passed 30/30 with retries disabled.
- Latest gates: TypeScript pass; 78 unit/API tests pass; build plus 19-public-route
  static verification pass; 30 Chromium journeys pass with retries disabled;
  `npm audit` reports zero known vulnerabilities.
- Local static hosting probe: 19 direct routes return 200, unknown route returns
  custom HTML with 404 status, no-JavaScript résumé retains approved career and
  credentials. Fresh 1600 × 1000 and 390 × 844 views inspected; no overflow or
  page errors. Fresh captures stay in ignored `test-results/preparation-visual/`.
- OCR scanned 53 candidate images; only the Northgate demo `.test` address matched.
  Recognized-secret/private-email staged text scan passes. OCR/pattern scanning
  is not proof against every possible secret or private pixel.
- Independent review found no blocker in the local access boundary. Its nested
  validation and static résumé observations were addressed and tests rerun.
- Full candidate manifest and preparation record are in `FIRST_COMMIT_FILES.txt`
  and `REPOSITORY_PREPARATION.md` (relative to this document).
