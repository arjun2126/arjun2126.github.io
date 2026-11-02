# ArjunOS delivery plan

## Requirements and acceptance
- Reference-driven macOS desktop: mountain wallpaper, translucent menu bar, dark glass windows, floating Dock, blue accent.
- Three-window composition: main ArjunOS window with sidebar, Recruiter Mode, Salesforce Workspace.
- Functional window lifecycle, deep links, Dock actions, menus, search and filters, keyboard access, reduced motion.
- Recruiter Mode standalone URL; Salesforce, AI Engineering and Experience experiences; local-only Content Studio.
- Responsive document mode for mobile; accessible contrast, focus and semantics; no horizontal overflow.
- Direct, SEO-friendly static routes; no backend, paid services, deployment or invented credentials.
- Production build, automated regression, visual comparison, accessibility scans, documented limitations.

## Milestones
1. ✅ Inspect workspace, establish harness, research public sources.
2. ✅ Implement content registry, initial visual shell, app/window interactions, responsive routes.
3. ✅ Add static prerender, unit and browser tests; validate accessibility.
4. ✅ Local preview and documentation.
5. ✅ Reference-driven visual redesign: original wallpaper, dark glass system, three-window desktop, Dock and menu bar, Recruiter Mode, Salesforce Workspace, AI Engineering, Content Studio, 20 prerendered routes, 38 unit tests and 28 browser journeys, plus the verified Northgate Live fallback.

## Decisions
- Do not infer professional facts. The later owner-approved handoff supplies employment, education, certification names, city-level location and availability; keep independent project work distinct. Email publication and private details remain excluded.
- No generated portrait: an explicit placeholder is shown until the owner supplies an approved photograph, with `profile.photo` as the switch.
- Genuine screenshots only. Vantage uses a typographic cover until real captures are supplied.
- Use the licensed public-domain alpine photograph rather than copying Apple artwork; the reference specifies the aesthetic, not the asset.
- Keep the content registry and evidence model; redesign the shell and navigation rather than fabricating new claims.
- Content Studio is loopback-only, stores drafts in browser storage, and exports JSON. It never publishes.
- Keep dark glass chrome for every window, with light document surfaces inside the recruiting and reading apps.
- Preserve a stable window DOM order and use z-index for stacking, so focusing a window cannot cancel a click on a link or traffic light.
- Mobile becomes a document experience with the same content, not scaled-down windows.

## Remaining external gates
- Owner review of the redesigned desktop and local production preview.
- Owner-supplied portrait, genuine Vantage screenshots, an approved web-safe résumé PDF, and any verified missing employment details.
- GitHub user-site origin is approved for build metadata and local preparation. Pushing, merging, Pages activation and deployment remain unauthorized.

## Milestone 6 — Professional content and local authoring
- ✅ Imported approved employment, education, certification names, location, availability and LinkedIn.
- ✅ Kept email, phone, address, work authorization, credential IDs, unconfirmed Matchpoint details and total-years figures out of the build.
- ✅ Rebuilt Recruiter Mode, Experience, résumé, About, Contact, AI and mobile copy around the approved record.
- ✅ Added DOCX extraction, image resizing, validation, save-to-project, generated content and 20-file backup history.
- ✅ Replaced the vector wallpaper with a public-domain alpine photograph and documented its licence.
- ⏳ Owner inputs: original portrait file, genuine Vantage screenshots, optional email approval, web-safe résumé PDF, education dates and Matchpoint title/dates.

## Milestone 7 — Final UI/UX polish and recruiter readiness
- ✅ Replaced the homepage greeting with “Hi, I’m Arjun Subramanya.” and added the approved Salesforce / software engineering / AI automation subtitle.
- ✅ Strengthened the four linked skill cards and moved featured projects into a larger two-column layout with category labels, clearer descriptions and consistent focus/hover affordances.
- ✅ Increased desktop margins and separation while preserving drag, minimize, maximize, restore and close behavior.
- ✅ Moved **View Résumé** and **Contact Me** above the standalone recruiter tabs, added selected work to the Overview and fixed mobile tab/detail wrapping.
- ✅ Re-ran TypeScript, 38 unit tests, the 20-route production build and 29 Chromium journeys; captured and reviewed 1600 × 1000, 1440 × 900, 768 × 1024 and 390 × 844 desktop, recruiter, Salesforce and Northgate views.
- ✅ Produced `docs/screenshots/polish-before-after-1600.png`.
- ⏳ Owner inputs and review: genuine portrait, Vantage captures and any approved web-safe résumé PDF. Deployment remains unauthorized.
- ⚠️ The portrait placeholder remains because no portrait file is present in the workspace; no substitute image or generated face was introduced.

## GitHub repository preparation — local only

- Preserve the remote README commit on a short-lived branch in a separate clone.
- Copy only approved application files, public assets and reviewed documentation.
- Exclude conversations, local authoring state, unreviewed uploads and artifacts.
- Enforce loopback peer/Host/Origin checks on the dev-only authoring API.
- Default static metadata to `https://arjun2126.github.io`, retain root base and
  directory-index routes, and verify sitemap, local links/assets and custom 404.
- Validate, independently review, inspect staging, then create one local commit.
- Stop before any push, main merge, Pages activation or deployment.
