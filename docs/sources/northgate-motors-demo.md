# Northgate Motors — Salesforce Experience Cloud dealership demo

A fictional premium dealership built end-to-end on Salesforce: a six-page public buyer site with a
live 3D concept-car studio, a customer Owner Portal, and the internal sales, finance and service
operations behind them.

Everything here is synthetic. Nothing is a real vehicle, price, offer or customer.

![Northgate buyer home](docs/screenshots/home-1440.jpg)

## What this demonstrates

| Surface | Highlights |
|---|---|
| **Buyer site** (Experience Cloud, public) | Cinematic home, 87-listing catalogue (demo org data; sample data not included) with six dependent filters and pagination, deep-linkable vehicle details, Apex Concept 3D studio, editorial about page, inquiry form with draft-preserving guards |
| **3D Studio** | Three.js viewer, licensed glTF concept car, three paint finishes, orbit/zoom/view controls, poster fallback on touch and low-capability devices |
| **Owner Portal** (authenticated) | Dashboard, My Garage, service appointments and booking, support cases, rewards — accepted at Core 1.0, **not retested in the latest cycle** |
| **Sales operations** | Lead intake and queue routing, opportunities, standard Quotes with custom CP2 pricing, approvals, financing and delivery |
| **Service operations** | Cases, SLA, visits, loyalty and consent models |
| **Engineering** | 80 offline static LWC contracts, local harness, scoped deployment manifests, UAT evidence register |

## Screenshots

| Buyer home | Inventory |
|---|---|
| ![Home](docs/screenshots/home-1440.jpg) | ![Inventory](docs/screenshots/inventory-1440.jpg) |

| Vehicle details | Apex Concept 3D Studio |
|---|---|
| ![Vehicle](docs/screenshots/vehicle-detail-1440.jpg) | ![Studio](docs/screenshots/studio-3d-1440.jpg) |

| About | Contact |
|---|---|
| ![About](docs/screenshots/about-1440.jpg) | ![Contact](docs/screenshots/contact-1440.jpg) |

Mobile captures of every page are in [`docs/screenshots/`](docs/screenshots/) at 390 px.

## Architecture

```text
Experience Cloud site  /owners/s/*
        │
        ├── ngBuyerSite (LWC)          one component, six explicit `page` modes
        │     ├── BuyerShowcaseController   public catalogue DTO (no record access for guests)
        │     ├── BuyerInquiryController    validated Lead insert, queue routing, NG-XXXXXX reference
        │     └── ngApexConcept3d           Three.js viewer + finishes + Priority List handoff
        │
        └── Owner Portal (authenticated)
              └── ownerPortal* LWC + OwnerPortalBatchBController   dashboard, garage, service, cases, rewards
```

- **Six pages from one component.** `page` is set per Experience page (`home`, `inventory`,
  `vehicle`, `studio`, `about`, `contact`); `all` remains a compatibility fallback. URL parsing never
  overrides an explicit Builder assignment.
- **Guest-safe data.** The buyer site reads a purpose-built DTO through one `@AuraEnabled` method.
  Guests get no native object permissions, no `WITH SECURITY_ENFORCED` catalogue queries and no
  record ids beyond the public DTO.
- **Inquiry intake.** `BuyerInquiryController` validates a fixed field set, enforces the demo
  `.test`/`.example` email rule, inserts a Lead in system mode to the queue named by custom label
  `Buyer_Lead_Queue_Id`, and returns a reference derived from the Lead Id.
- **Dependent filters.** Model options are scoped to the selected family and a family change clears an
  incompatible trim, so the two filters cannot combine into a guaranteed-empty result.
- **3D without a rebuild.** A pinned Three.js build and licensed glTF assets ship as static
  resources; the component degrades to a poster rather than a blank stage.

More detail: [buyer experience architecture](docs/architecture/BUYER_EXPERIENCE.md),
[org strategy](docs/architecture/ORG_STRATEGY.md), [acceptance status](docs/ACCEPTANCE_STATUS.md).
`docs/architecture/EXPERIENCE_PORTAL.md` is kept as the Phase 8 planning record and describes an
earlier pre-publication state.

## Technology

Salesforce Platform (API 68.0) · Experience Cloud (Aura site) · Lightning Web Components ·
Apex (system-mode DTO and intake) · Custom objects (`Vehicle__c`, `Vehicle_Model__c`, …) ·
Three.js r187 + glTF/WebGL · Node 22 test runner · Python + Bash engineering harness.

## Repository layout

```text
force-app/main/default/     authoritative metadata: LWC, Apex, objects, permissions, pages
docs/                       architecture, decisions, acceptance status, screenshots
scripts/tests/              ng_buyer_site.test.mjs — self-contained Buyer contracts
harness/                    local check runner, regression matrix, preservation tooling
manifest/                   scoped deployment packages
sfdx-project.json           Salesforce DX project definition
```

Internal execution evidence, local preview harnesses and generated data exports are deliberately not
published; they contain environment-specific receipts rather than product source.

## Setup

Prerequisites: Salesforce CLI, Node 22, Python 3, a Developer Edition org with Digital Experiences
enabled, and the static resources listed in `force-app/main/default/staticresources`.

```sh
git clone https://github.com/arjun2126/northgate-motors-demo.git
cd northgate-motors-demo
sf org login web --alias ng-demo
sf project deploy start --manifest manifest/buyer-3-0.xml --target-org ng-demo
```

Then create the six Experience pages, place `ngBuyerSite` once per page and set the matching `page`
attribute (`home`, `inventory`, `vehicle`, `studio`, `about`, `contact`). The studio page needs the
Apex viewer, model and poster static resources.

## Testing

```sh
node --test scripts/tests/ng_buyer_site.test.mjs   # 80 LWC contracts (VM + static)
bash harness/check.sh focused buyer                # buyer lane + scoped preservation
bash harness/check.sh                              # fast local checks
```

The harness proves local contracts only. It does not deploy, call Apex, drive a browser or replace
UAT; server-side and browser results are recorded separately in the acceptance register.

## Verified state

Observed 2026-11-01 against the demo org. Validation receipts are kept in the private engineering register and are not published with this repository.

| Check | Result |
|---|---|
| Buyer contracts | 80 / 80 passing |
| Public routes | six live, one component each, correct mode |
| Inventory filters | family/model dependency fixed and re-verified live |
| 3D Studio | hardware WebGL canvas, drag/zoom and paint selection verified |
| Guest inquiry | one synthetic submission, reference `NG-APJEAW`, one Lead in the Inbound Leads queue (an active assignment rule did not apply to the Apex insert) |
| Portal isolation | all portal routes redirect anonymous visitors to login |
| Deployment parity | 8/8 normalised files match reviewed source |

## Limitations

- **Fictional demo.** Vehicles, prices, photographs, people and locations are synthetic or
  illustrative. Nothing is an offer, reservation or availability claim.
- **Not a licensed Automotive Cloud / CPQ / Field Service / Loyalty install.** Those are documented
  seams and simulations, not managed-package features.
- **Apex Concept is a concept.** Not for sale, not in inventory, finishes are visual only; the
  Priority List is interest, not allocation.
- **Demo email rule.** Inquiries must use a `.test` or `.example` address; real contact details are
  rejected by design.
- **Not yet verified:** screen-reader output, Safari/WebKit, real iOS/Android devices, and a fully
  authenticated Owner Portal walk-through in the latest cycle. See
  [acceptance status](docs/ACCEPTANCE_STATUS.md).
- **Single demo org.** Published for demonstration from one Developer Edition org; no scratch-org or
  multi-tenant provisioning is included.

## Asset credits

**3D concept car.** “Car Concept” asset copyright: © 2015, Khronos Group, Khronos logo.
© 2017, Khronos Group, 3D Commerce logo. Asset is CC BY 4.0 International, created by Eric Chadwick
of Darmstadt Graphics Group GmbH, 2024. Adapted for this demo: geometry and textures optimised, paint
finishes re-tinted, third-party number-plate mark removed. No affiliation or endorsement is implied.

**Vehicle photography.** Illustrative CC0 1.0 stock photographs from Wikimedia Commons, resized and
converted to WebP. Per-image photographer, source URL and licence are recorded in
[`force-app/main/default/staticresources/NG_VehicleImages/ATTRIBUTION.md`](force-app/main/default/staticresources/NG_VehicleImages/ATTRIBUTION.md).
Northgate model names are fictional; photographed vehicles are not inventory and do not imply
manufacturer endorsement. CC0 does not grant trademark rights.
