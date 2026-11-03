# Verified sources

## Launch verification — 3 November 2026

Read-only Git fetch and authenticated GitHub API confirmed repository identity, unchanged remote
main history, existing legacy Pages settings and a github-pages environment restricted to main.
Independent re-review confirmed all 46 existing public files remain byte-identical to the audited
preparation commit; no new owner asset is included, and generated content remains null. The owner's
launch request authorizes publication of the previously approved curated professional content,
not new personal assets or contact details. Historical authorization statements below describe
the earlier preparation milestone, not the current launch authorization.

Project content was reviewed from public material on **1–2 November 2026**. Repository READMEs and documentation are the authority for project claims. Approved employment, education, certification names, city-level location and availability come from the owner-approved 2 November handoff below. Private contact details and credential IDs remain excluded.

## Profile

| Fact | Source |
| --- | --- |
| Name: Arjun Subramanya; handle `arjun2126`; 8 public repositories | <https://github.com/arjun2126> |
| X account: `@arjunsubramanya` | Linked from the public GitHub profile above |
| Project list and repository URLs | The eight public repositories below |

## Projects

| Project | Source reviewed | Revision | Local source capture |
| --- | --- | --- | --- |
| Northgate Motors | <https://github.com/arjun2126/northgate-motors-demo> | `release/buyer-3-1` | [northgate-motors-demo.md](sources/northgate-motors-demo.md) |
| Vantage (repository: TennisScore) | <https://github.com/arjun2126/TennisScore> | `main` | [TennisScore.md](sources/TennisScore.md) |
| Nova Grants | <https://github.com/arjun2126/nova-scotia-grants-salesforce> | `main` | [nova-scotia-grants-salesforce.md](sources/nova-scotia-grants-salesforce.md) |
| Care Operations Analytics | <https://github.com/arjun2126/care-operations-analytics> | `main` | [care-operations-analytics.md](sources/care-operations-analytics.md) |
| Gotcare Care Ledger | <https://github.com/arjun2126/Gotcare-Ledger> | `main` | [Gotcare-Ledger.md](sources/Gotcare-Ledger.md) |
| Configurable RevOps Platform | <https://github.com/arjun2126/salesforce-revops-demo> | `main` | [salesforce-revops-demo.md](sources/salesforce-revops-demo.md) |
| Tennis Lesson Planner API | <https://github.com/arjun2126/ai-engineering-journey> | `main` | [ai-engineering-journey.md](sources/ai-engineering-journey.md) |
| Agentic Job Search Workflow | <https://github.com/arjun2126/agentic-job-search-workflow> | `main` | [agentic-job-search-workflow.md](sources/agentic-job-search-workflow.md) |

## Northgate live buyer experience

| Fact | Source |
| --- | --- |
| Public buyer origin | `https://orgfarm-25065ad46a-dev-ed.develop.my.site.com` |
| Public buyer routes | `/owners/s/buyer`, `/owners/s/buyer-inventory`, `/owners/s/buyer-studio`, `/owners/s/buyer-about`, `/owners/s/buyer-contact` |
| Route evidence | `docs/ACCEPTANCE_STATUS.md` and `docs/architecture/BUYER_EXPERIENCE.md` in <https://github.com/arjun2126/northgate-motors-demo/tree/release/buyer-3-1> |
| Framing policy observed | Direct anonymous request, 2 Nov 2026: `X-Frame-Options: SAMEORIGIN`; `Content-Security-Policy: frame-ancestors 'self'` |
| Embedding result | Chromium iframe probe: `net::ERR_BLOCKED_BY_RESPONSE`; console reported a `frame-ancestors 'self'` violation |
| Owner boundary | The authenticated Owner Portal at `/owners/s/` is excluded; no credentials or session data were used |

The live-site evidence was checked on **2 November 2026** and recorded in
[`NORTHGATE_LIVE.md`](NORTHGATE_LIVE.md). No Salesforce configuration or trust setting was changed.

## Image provenance

Screenshots are genuine captures committed to the source repositories. The portfolio ships resized WebP derivatives, not fabricated UI.

- **Northgate Motors** — `docs/screenshots/` in the repository at `release/buyer-3-1`: home, inventory, vehicle detail, 3D studio, about, contact (desktop 1440 and mobile 390 variants where available). Northgate Live reuses these repository-published captures and adds an explicit verification date; it does not fabricate an interactive copy.
- **Nova Grants** — `docs/screenshots/` on `main`: executive dashboard, application flow, Nova Grants app, claim processing, financial reports. The top 235 px is cropped from the dashboard and app captures to remove an unrelated demo-account email bar.
- **Care Operations Analytics** — `dashboard/screenshots/` on `main`: corrected Streamlit views, Power BI overview, and Tableau executive pulse.
- **Vantage, Gotcare Care Ledger, RevOps Platform, Tennis Lesson Planner API, Agentic Job Search Workflow** — no product screenshots are published in the repositories. These use typographic covers and explicitly say no capture exists. No reconstruction is presented as authentic.
- **ArjunOS frames** — `docs/screenshots/` are generated from the built application locally with Playwright; they are not product screenshots from other repositories. `public/og/arjunos-cover.png` is a branded typographic social card, not a product capture.

Source downloads are handled by `npm run images` into the ignored `.freebuff/image-sources/` directory and are never committed. The optimization script downloads only from the public repositories above.

## Claims and caveats represented in the UI

- Northgate Motors is a fictional dealership demo; its 80/80 buyer-contract and 6/6 route results are quoted from the repository verification table, not re-run for this portfolio.
- Nova Grants is an independent, fictional Salesforce demo built with synthetic data.
- Care Operations Analytics uses synthetic data; its model metrics and data-quality counts are quoted from the repository documentation, not re-executed here.
- Gotcare Care Ledger describes itself as a scratch-org prototype with setup prerequisites that require a Salesforce org.
- RevOps Platform is in progress: five browser Flow interviews remain pending, and several Setup UI tasks cannot be deployed through metadata.
- Vantage's public repository provides no product imagery; its documented features and limitations are summarized only where the README supports them.
- Tenant/lesson-planner and job-search projects are personal tools; the latter is explicitly not an auto-apply agent.

## Privacy

Private email addresses, credentials, tokens, private org identifiers, customer data and non-public screenshots are excluded. The public Salesforce buyer hostname is intentionally disclosed as an approved demo destination, not a credential. Project imagery is public demo/synthetic material; the unrelated demo-account email bar is removed from the shipped Nova Grants derivatives. Northgate contact imagery contains an explicitly fictional `.test` address.

## Professional-content handoff (2 November 2026)
- `ArjunOS_Profile_Handoff/ARJUNOS_HANDOFF.md` and `portfolio-content.json` — approved professional facts, publication status, exclusions and project metadata. Imported only into the curated `src/content/professional.ts`; private contact fields, credential IDs and application records were not copied.
- `PRIVACY_AND_VERIFICATION.md` — privacy exclusions and evidence register used to suppress unverified developer claims.
- `PORTFOLIO_ASSET_INVENTORY.md` — confirmed no portrait, no Vantage screenshots and no hosted demo URLs.

## Wallpaper
- Wikimedia Commons, “Sunset at Tank Lakes, Alpine Lakes Wilderness”, U.S. Forest Service – Pacific Northwest Region, public domain: https://commons.wikimedia.org/wiki/File:Sunset_at_Tank_Lakes,_Alpine_Lakes_Wilderness.jpg. Local derivative and licence recorded in `docs/ASSETS.md`.

## GitHub preparation sources (2 November 2026)

- Read-only `git ls-remote` and the public repository contents confirmed the target
  repository and existing `main` README commit. The clone retains that history.
- Production origin `https://arjun2126.github.io` and local preparation/commit were
  explicitly approved by the owner. Pushing, merging and Pages activation were not.
- Image treatment is verified against `scripts/optimize-images.mjs` and shipped
  derivatives, not the superseded asset-table claims. Original downloads remain
  ignored and are not copied into the preparation repository.
