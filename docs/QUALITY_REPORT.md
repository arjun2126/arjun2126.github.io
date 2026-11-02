# Quality report

**Date:** 2 November 2026

**Environment:** macOS, Node.js 22.12.0, npm 10.9.0, Chromium via Playwright 1.64
**Status:** professional content, local authoring workflow, the verified Northgate live-site fallback, and the final recruiter-readiness polish are implemented and validated; owner assets, owner review and deployment remain external gates.

## Results

| Check | Command | Result |
| --- | --- | --- |
| TypeScript | `npm run check` | Pass |
| Unit tests | `npm test` | 38 / 38 pass |
| Production build | `npm run build` | Pass; 20 HTML routes and 8 project pages prerendered; JS 426.51 kB (123.63 kB gzip), CSS 146.07 kB (27.85 kB gzip) |
| Browser regression | `npx playwright test` | 29 / 29 pass |
| Desktop visual review | Production preview at 1600 × 1000 and 1440 × 900 | Pass; no horizontal overflow or console errors |
| Tablet visual review | Production preview at 768 × 1024 | Pass; no horizontal overflow |
| Mobile visual review | Production preview at 390 × 844 | Pass; no horizontal overflow, including recruiter and Northgate Live |
| Final hero copy | Production preview and prerendered HTML | “Hi, I’m Arjun Subramanya.” with the verified Salesforce / software engineering / AI automation subtitle |
| Accessibility | axe WCAG 2 A/AA and 2.1 A/AA | No critical or serious findings on desktop home, project, résumé, recruiter, mobile home and mobile project |
| Reduced motion | Emulated `prefers-reduced-motion: reduce` | Window durations reduced to 0 |
| No JavaScript | Static project route | Full case-study HTML renders |
| External links | Browser checks and static inspection | Public destinations only: GitHub, X, the approved LinkedIn profile and the Northgate buyer origin; Owner Portal/login excluded; `noopener noreferrer` present |
| Northgate framing | HTTP headers plus Chromium iframe probe | `/owners/s/buyer` 200; `X-Frame-Options: SAMEORIGIN`; `frame-ancestors 'self'`; iframe blocked by response; no Salesforce setting changed |
| Northgate Live UI | Playwright at 1600 × 1000 and 390 × 844 | Genuine captures render, loading layer clears, full-screen control present, live routes correct, no Owner Portal, zero mobile overflow |
| DOCX import | Browser test with generated DOCX | Text extracted locally, reviewed and applied |
| Photo workflow | Browser test with generated PNG | Added to draft, persisted through reload |
| Local save | Dev-only endpoint with a real draft | 200; generated content, optimized portrait and screenshot written; history and state reported |
| Invalid save | Empty professional name | 422; no write |

## Imported professional content

The owner-approved handoff supplied:

- **Employment:** Business Systems Developer & Administrator at SWR, Waterloo Region (April 2025 – present); Junior Software Engineer & CRM Analyst at Uttara Infotech Solutions, Bengaluru (September 2020 – September 2023).
- **Education:** Post-Graduate Diploma, Sport Business Management, Durham College; B.E. Computer Science, MS Ramaiah Institute of Technology. Graduation years remain unpublished.
- **Certifications:** Salesforce Certified Administrator, Platform App Builder, Platform Developer I and Agentforce Specialist. Credential IDs are withheld.
- **Contact:** Whitby, Ontario; LinkedIn (`/in/arjunsubra`); GitHub. No email or phone is rendered.
- **AI:** approved positioning, Agentforce prototype classified as experimental, and five explicit non-claims.

Unverified developer claims from one résumé master (CI with Apex PMD, batch/queueable frameworks, architected LWC), total-years figures, the employer legal name, and the Matchpoint title/dates were not published. Project facts remain repository-sourced and labelled fictional.

## Studio verification

The local-only Vite endpoint was exercised with a real draft containing a generated portrait and project screenshot:

- `SAVE_STATUS 200`; response included `historyCount: 1`, `/content-studio/portrait.webp` and `/content-studio/media-vantage-verify.webp`.
- Generated JSON contained the draft name and resolved asset paths.
- Both WebP files existed.
- `GET /__arjunos/content/state` returned the same timestamp and backup count.
- A draft with an empty name returned `422`.
- Test files and generated content were removed afterward; the default generated file was restored.

This proves file persistence and validation. It does not claim that the owner's real photograph was imported: the image attached to the chat was not available to the workspace as a file.

## Final UI/UX polish

- The homepage H1 is now “Hi, I’m Arjun Subramanya.” The ArjunOS product name remains in the menu bar, Dock, sidebar, page metadata and application branding.
- The hero subtitle is “Salesforce Developer · Software Engineering · AI Automation”, drawn from the approved professional record.
- Four skill categories remain, each with a clearer icon, description, stack line, hover/focus treatment and link to its detail view.
- Featured work uses a two-column grid with 16:9 media, category overlays, larger titles and a 389 × 323 px card at 1600 × 1000. The second row requires an internal pane scroll at that viewport.
- Desktop stage margins, column gap, window gap and content padding were increased without changing window drag, minimize, maximize, restore or close behavior.
- Standalone Recruiter Mode places **View Résumé** and **Contact Me** above the tabs and lists all four featured projects in the Overview. The résumé action now uses a document icon because it opens the web résumé rather than a file download.
- On mobile, all five recruiter tabs wrap and detail grids collapse cleanly. The 390 × 844 capture has no clipped tab label or horizontal overflow.
- Northgate Live preserves its framing disclosure, genuine captures, external links and owner-portal exclusion at desktop and mobile widths.
- No professional claims, contact details, privacy exclusions or project evidence were changed.

## Visual review

Final captures are in [`docs/screenshots/`](screenshots/):

- `polish-before-after-1600.png` — labeled baseline/final comparison.
- `polish-desktop-1600.png` — final three-window desktop at 1600 × 1000.
- `polish-desktop-1440.png` — laptop layout at 1440 × 900.
- `polish-tablet-768.png` — tablet layout at 768 × 1024.
- `polish-mobile-390.png` — final mobile homepage.
- `polish-recruiter-1600.png` and `polish-recruiter-390.png` — standalone recruiter sheet with top actions and selected work.
- `polish-salesforce-1600.png` — Salesforce Workspace window.
- `polish-northgate-live-1600.png` and `polish-northgate-live-390.png` — Northgate Live at desktop and mobile widths.

The desktop uses a real public-domain alpine photograph under a violet grade, with translucent menu bar, dark glass windows, native-like traffic lights and an original Dock. It is deliberately not a pixel copy of macOS: Apple artwork and system icons are not embedded. The hero portrait remains the documented placeholder because no portrait file exists in the workspace.

## Asset licensing

- Wallpaper: “Sunset at Tank Lakes, Alpine Lakes Wilderness”, U.S. Forest Service – Pacific Northwest Region, public domain, via Wikimedia Commons. Resized from a 3840 px source to 2400 px and converted to WebP.
- Project imagery: repository-published captures with existing limitations. Shipped Nova Grants WebP derivatives have the unrelated demo-account email bar cropped from the dashboard/app images; uncropped originals are excluded. Care Operations captures use synthetic data. Vantage has no supplied captures.
- Portrait: no image file was available after a final workspace search; the placeholder is intentional and no generated or third-party likeness was substituted.
- Interface: CSS/SVG components authored for ArjunOS. No Apple system assets.

See [`docs/ASSETS.md`](ASSETS.md) for the source URL and licence.

## Remaining limitations

1. **The portrait is still an owner input.** No portrait file exists in the workspace; a final search found only the Open Graph cover. Upload the original through Content Studio, save, and rebuild. Until then the explicit placeholder remains.
2. **Genuine Vantage screenshots are still missing.** The studio applies the first uploaded image for a project as its cover and adds the rest to the gallery.
3. **Email publication is not approved.** No address or phone is rendered. LinkedIn and GitHub are the public routes.
4. **No web-safe résumé PDF is bundled.** The print action renders the HTML résumé; PDF text import is unsupported. DOCX import is supported.
5. **Save requires `npm run dev`.** The endpoint is intentionally absent from preview and production; a static build cannot write project files. The studio is loopback-only and inert elsewhere.
6. **Original UI delivery had no independent reviewer.** An independent repository-preparation review was subsequently requested; owner visual/content approval remains an external gate.
7. **Chromium only.** WebKit, Firefox and physical devices were not run.
8. **No deployment, Lighthouse or field performance measurement.** The approved GitHub origin is now the default for canonical URLs and sitemap generation; `SITE_URL` can explicitly override it for an approved host.
9. **Repository metrics were not re-executed.** They are quoted from public documentation reviewed on 2 November 2026.
10. **Salesforce blocks third-party framing.** The buyer site sends `X-Frame-Options: SAMEORIGIN` and `frame-ancestors 'self'`; Northgate Live therefore uses genuine captures and direct links. A true embed requires an owner-approved Salesforce framing/CSP change and was not attempted.
11. **The larger featured grid does not fit two rows in the initial desktop viewport.** At 1600 × 1000 and 1440 × 900 the main window scrolls to the second row by design. The compact recruiter window likewise scrolls its overview; `/recruiter/` shows the full overview at 1600 × 1000.

## Launch instructions

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. Use Content Studio to upload approved assets and save; then:

```bash
npm run build
npm run preview
```

No deployment was performed.

## Repository preparation

The preparation-specific checks, security tests, drag-test investigation and
privacy review are recorded in [REPOSITORY_PREPARATION.md](REPOSITORY_PREPARATION.md).
The 38-test/29-journey results above describe the earlier UI delivery, not the
expanded preparation suite.
