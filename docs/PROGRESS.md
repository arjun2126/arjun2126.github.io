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
Initial publication is complete: PR #1 merged after CI passed; main deployment run 41675516523
succeeded at commit `12524d6fb8ca463e3e10e9d78839450ff4fc5d8d`. Direct HTTPS verification passed
20 desktop/mobile routes, 46 asset hashes, canonicals/sitemap, custom 404, absent private APIs,
and settled-state accessibility checks. Eight public repository links and five Northgate routes
returned 200. No Salesforce framing settings changed. Evidence: LAUNCH_REPORT.md.
Reviewed follow-up synchronizes résumé capabilities/current title and fixes Reset draft's stale
module-level preview. Local full harness passed again; this follow-up must pass its own PR gate.
Current owner workflow: CONTENT_UPDATES.md. Historical limitations/gates below describe prior work.

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

## Reconciliation and 4 November release preparation

- **Workspaces.** `ArjunOS-github-preparation` is the release source on branch
  `release/arjunos-2026-11` (from `323e6a2`). `Resume Website` is preserved as the donor and
  backup; it was not overwritten, and no new repository was initialised.
- **Backups.** `../ArjunOS-backups/2026-11-04/` holds `gitws-public-media/`,
  `gitws-content-studio/`, `gitws-studio.generated.json`, `src-workspace/`, checksum manifests
  and `finder-duplicates/` (171 quarantined Finder copies). Nothing was deleted or reset.
- **Media.** One owner portrait (`portrait-b51b352b14a4ac708461518a.webp`, 1127x1311) and 16
  Vantage captures (WebP derivatives of `1Vantage.jpeg`-`16Vantage.jpeg`) are referenced by the
  saved Studio draft: 17 references, 17 files, no orphans. All 16 gallery URLs returned HTTP 200.
- **Résumé PDF withheld.** The supplied PDF contains a personal phone number, a personal email
  address, Salesforce credential IDs and claims that conflict with the approved professional
  record. It is retained privately in `content-studio/private/` (gitignored); `resume.pdf` is
  empty, so no résumé download is published.
- **Copy rewrite.** Profile, professional record, expertise, project registry, About, Résumé,
  Experience, AI, Salesforce, Sidebar, mobile and metadata copy were rewritten in a
  first-person, evidence-first voice. Internal approval/handoff wording, the "Three years"
  figure and marketing phrasing were removed. Employers, titles, dates, education and
  certification names are unchanged.
- **Layout fixes.** Maximised windows now stop above the Dock
  (`height: calc(100% - 104px)`); AI and Experience window bodies scroll (`overflow-y: auto`);
  Salesforce uses container queries to move from compact to expanded typography and two-column
  content without changing the compact window.
- **Studio sync.** The generated draft and the static content files carry the same wording, so
  saved Studio overrides no longer restore the old copy.
- **Test adaptation.** `tests/unit/content.test.ts` covers the Vantage gallery, cover and
  portrait; `tests/e2e/desktop.spec.ts` gains layout regression cases;
  `scripts/test-studio-workflow.ts` now asserts baseline-relative media (existing owner media
  preserved, exactly one synthetic upload appended) instead of assuming an empty folder.

### Validation - 4 November 2026

| Check | Result |
| --- | --- |
| `npm run check` | Pass |
| `npm test` | 87 passed / 8 files |
| `npm run test:studio` | Pass - browser upload, save, restart, build and static assets |
| `npm run build` | Pass - 21 HTML routes, 8 project pages, 20 static routes verified |
| `npm run test:e2e` | 34 passed / 2 projects (desktop 1440x900, mobile 390x844) |
| Publication gate | 64 reviewed source/assets approved, including the Studio draft and all 17 owner media files |
| Accessibility | axe checks on home, project pages, résumé and recruiter: no serious or critical violations |
| Chromium geometry, 1600x1000 | Maximised window bottom 904 vs Dock top 913; 3 windows; no horizontal overflow; no console errors |
| AI route scroll | Both scrollers reached maximum (467 px); footer visible at a 1000 px viewport |
| Experience route scroll | Reached bottom; last entry fully visible |
| Salesforce workspace | 7 tabs switch without clipping; no horizontal overflow at 1600 or 900 |
| Vantage gallery | Cover alt text present; 16 gallery buttons; 16 of 16 media URLs 200 |
| Mobile 390x844 | 8 routes, zero horizontal overflow |
| WebKit | Not run - Chromium only |

### Approval recorded (4 November 2026)

The owner approved publication of the genuine portrait, all 16 Vantage captures, the public
LinkedIn and GitHub links and the rewritten copy, and explicitly withheld the résumé PDF. The
approved hashes are recorded in `publication-approved.json`. A redacted résumé PDF and a genuine
hosted walkthrough recording remain open items.
