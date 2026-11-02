# Configurable Enterprise Revenue Operations Platform — Salesforce Demo

Fictional end-to-end RevOps demo on Salesforce: Opportunity discount intake through a
`Request_Deal_Review` Screen Flow that computes requested discounts from product lines,
matches Custom Metadata pricing and approval rules, and creates or refreshes a
`Deal_Review__c` record owned by the Deal_Desk queue. All names, companies, amounts,
and data in this project are fictional and for demonstration only.

## Repository contents

- `force-app/main/default/` — complete deployable metadata:
  - `Deal_Review__c` custom object (9 custom fields, 5 validation rules, 6 list views)
  - 3 Custom Metadata types (`RevOps_Industry__mdt`, `Pricing_Rule__mdt`,
    `Approval_Rule__mdt`) plus 14 fictional records
  - 3 Flow definitions (`Request_Deal_Review`, `Request_Deal_Review_Backup`,
    `Request_Deal_Review_Rebuild`) — all Draft/inactive by design
  - Deal_Desk queue and tab, 3 RevOps permission sets
  - Deal_Desk Lightning app, 4 new list views, staged FlexiPage / reports / dashboard
- `probe/` — 17 inactive reference/diagnostic flows. Never deployed, never activated.
- `sfdx-project.json`, `.forceignore`, `.gitignore`.

Excluded: `.sf/`, `.vscode/`, CLI auth, tokens, credentials, logs, scratch-org files.

## Prerequisites

- Salesforce CLI (`sf`) 2.x.
- A Developer Edition (or sandbox) org with My Domain enabled.
- System Administrator access in the target org.
- No managed packages required. API version 62.0.

## Setup

1. Clone the repository and enter the project directory.
2. Authorize the org (browser login):
   `sf org login web --alias <your-alias> --instance-url <your-my-domain-url>`
3. Confirm connection (read-only):
   `sf org display --target-org <your-alias>`
4. Set the project-local target org:
   `sf config set target-org=<your-alias>`

## Deployment instructions

1. Dry-run first (saves nothing):
   `sf project deploy start --source-dir force-app/main/default --target-org <your-alias> --dry-run`
2. Deploy for real only after the dry-run is clean:
   `sf project deploy start --source-dir force-app/main/default --target-org <your-alias>`
3. Expect 56 components, 0 errors. Flows deploy as Draft and stay inactive.

## Testing instructions

### Automated checks (no UI)
- XML well-formedness of all flow files.
- Reference check: every `elementReference` and `{!merge}` base must resolve to a
  defined flow resource (the fixed `reviewName` variable pattern is the reference example).
- Secret scan: `grep -rniE "password|secret|api[_-]?key|private[_-]?key" force-app probe`.

### Five pending UI Flow interviews (manual, screen flow requires a browser)
Stage the BLK12 data first (see below), then run Draft `Request_Deal_Review` from
Setup → Flows for each Opportunity and record version/status, screen path,
completed/faulted, review IDs and counts before/after, and all review fields:
1. `BLK12-OPP-TECH-01` — TECH within-cap path, 10.00%, expect one Submitted review.
2. `BLK12-OPP-OTHER-01` — exact OTHER cap 15.00%, within-limit branch, one Submitted review.
3. `BLK12-OPP-FALLBACK-01` — 30.00% above cap; route-info/fault path expected because no
   OTHER approval rule exists (known metadata gap, not a failure).
4. `BLK12-OPP-NOPROD-01` — No-Products path, zero reviews created.
5. `BLK12-OPP-DUP-01` — existing-review/update path; seed review refreshed, count stays 1.

## Demo-data generation (BLK12 fictional set, 21 records)

Create in dependency order, all names prefixed `BLK12-`, all companies fictional:
1. 3 Accounts (Technology / Other / Electronics industries).
2. 3 Products + 3 standard PricebookEntries (list prices 1000 / 2000 / 2500).
3. 5 Opportunities (Stage Prospecting, CloseDate 2026-12-31, Amount = sales total).
4. 6 OpportunityLineItems per the case matrix (O1 10.00%, O2 15.00%, O3 30.00%, O5 5.00%).
5. 1 seed `Deal_Review__c` for O5 (Submitted, 5.00%, owner = Deal_Desk queue)
   **before** exercising the O5 update path.
- Create no Users. Flow-created and seed reviews are queue-owned.

## Cleanup / reset (child-to-parent order)

1. Delete BLK12 `Deal_Review__c` records (lookup is Restrict).
2. Delete BLK12 OpportunityLineItems.
3. Delete BLK12 Opportunities.
4. Delete BLK12 PricebookEntries, then Products.
5. Delete BLK12 Accounts.
6. Re-run count queries to confirm zero BLK12 records remain.

## Usage and demonstration walkthrough

1. Open the Deal Desk app → Deal Reviews tab → BLK12 Demo Cases list view.
2. Open a BLK12 Opportunity, run `Request_Deal_Review`, walk the screens
   (context → within-limit/route info → notes → confirmation).
3. Show the created Submitted review owned by the Deal Desk queue.
4. Show the BLK12 dashboard (status, risk, discount-by-industry, queue workload).
5. Show the O5 update path reusing the seed review without duplication.

## Architecture and Flow behavior

- Discount math: `listTotal` = Σ(ListPrice × Quantity),
  `salesTotal` = Σ(TotalPrice),
  `Requested_Discount` = (1 − salesTotal/listTotal) × 100, scale 2.
- Industry resolution: `Account.Industry` → `RevOps_Industry__mdt.Label` →
  `DeveloperName` as `industryKey`, `OTHER` fallback.
- Pricing: `Pricing_Rule__mdt` filtered by `Industry_Key__c` (= key or `All`),
  `Active__c`, `Min_Quantity__c`; best (lowest) cap wins.
- Approval: `Approval_Rule__mdt` filtered by `Industry_Key__c` and
  `Min_Discount_Pct__c`; `Approver_Role__c` drives routing text.
- Open-review check (`Opportunity__c` + Status NOT IN Approved/Rejected/Withdrawn)
  routes found → update path, not-found → create path (duplicate prevention).
- The created review Name is AutoNumber; the confirmation screen reads it via a
  `reviewName` Text variable populated from a post-insert re-query
  (`Get_Created_Review` by Opportunity + Submitted), because field-values-mode
  record creates expose no output record.
- Security: `SystemModeWithSharing`; validation rules guard ranges, early-status
  approvals, required approval fields, and reviewer≠owner.

## Troubleshooting

- `No such column X__c`: field metadata deployed but schema not queryable — confirm
  in Setup → Object Manager, check field-level security and profile permissions.
- Flow shows InvalidDraft: run the reference check above; every merge field must
  resolve to a defined resource.
- `DUPLICATE_DEVELOPER_NAME` on Tooling create: the field already exists in metadata.
- `INVALID_AUTH_HEADER` via REST: use the CLI session (`sf data query`) instead.
- Report/dashboard folder errors on deploy: folders must be created in Setup UI first.

## Known limitations and deferred manual Setup items

- Report/dashboard folders (`BLK12_Demo`) cannot be created via Metadata API;
  create them in Setup UI, then deploy the staged reports/dashboard files.
- The Lightning record page file is staged but not deployed (component
  design-time resolution); create/assign it in App Builder, then set org default.
- `My Assigned Reviews` (Reviewer = current user) is not expressible in ListView
  metadata; create it manually in UI.
- No `OTHER` approval rule exists, so above-cap OTHER cases take the fault path.
- `Account.Industry` standard values only reach TECH/OTHER paths; Sports and
  sample-industry labels fall back to OTHER.
- `Deal_Review__c` list view `Deal_Desk_Deal_Review` is redundant; left unused
  (no non-destructive hide mechanism).
