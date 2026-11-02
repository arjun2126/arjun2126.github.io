# Gotcare Care Ledger (Salesforce)

A Salesforce prototype for **person-directed care funding**. It manages the full flow
from care planning through claim approvals and keeps a complete audit trail of every
dollar moved, from the **Care Ledger LWC** on a Care Plan record to the
**Gotcare Overview** dashboard.

> **Repository:** https://github.com/arjun2126/Gotcare-Ledger

---

## Project purpose

Gotcare administers funding for people receiving care. Money is allocated per care
plan, spent against funding allocations, and attested through care claims. This
prototype provides:

- A Lean-data custom object model (no Opportunity/Quote/etc. dependency).
- Apex business logic for budgeting and claim approval.
- Lightning Web Components on the Care Plan record page for at-a-glance budget and
  claim review.
- Reports and a dashboard for management oversight.
- A record-triggered Flow that emails when a funding allocation falls below 50% of
  its allocated amount.

## Gotcare app and navigation

The **Gotcare** Lightning app is the only app surfaced to the project user. Its
navigation includes:

| Tab | Contents |
| --- | --- |
| Home | Standard home tab |
| Care Plans | Care_Plan__c (list view + record page) |
| Funding Allocations | Funding_Allocation__c |
| Care Claims | Care_Claim__c |
| Ledger Entries | Ledger_Entry__c |
| Reports | Gotcare report folder |
| Dashboards | Gotcare Overview |

The **Standard User** profile override is pinned to the Gotcare app only — every
standard app (Sales, Service, AppLauncher, AllTabSet, etc.) is hidden, and Gotcare is
the visible + default app.

## Data model

```
Care Plan (Care_Plan__c)
    └── Funding Allocation (Funding_Allocation__c)
            ├── Care Claim (Care_Claim__c)
            └── Ledger Entry (Ledger_Entry__c)
```

- **Care_Plan__c** — Client__c, Client_Name__c, Start/End_Date__c, Status__c,
  Total_Allocation__c, Total_Spent__c.
- **Funding_Allocation__c** — Care_Plan__c (lookup), Category__c picklist, and
  amount meters Allocated/Spent/Committed/Remaining.
- **Care_Claim__c** — Funding_Allocation__c (lookup), Care_Worker_Name__c,
  Service_Date__c, Hours_Delivered__c, Hourly_Rate__c, Total_Claim_Amount__c
  (formula), and approval/payment/reconciliation statuses.
- **Ledger_Entry__c** — Funding_Allocation__c, optional Reference_Claim__c,
  Amount__c, Entry_Type__c, Effective_Date__c, Transaction_Timestamp__c,
  Source_System__c, Reason__c, Reversal_Of__c, External_Transaction_ID__c.

### Approval workflow

Implemented in `CareLedgerService`:

- `getCarePlanSummary(carePlanId)` — plan-level budget totals for the dashboard LWC.
- `getPendingClaims(carePlanId)` — Submitted claims under the plan, oldest service
  date first.
- `approveClaim(claimId)` — atomic approval that:
  1. validates the claim is `Submitted` and the amount is > 0;
  2. checks available funding = Allocated − Committed − Spent (rejects if exceeded);
  3. marks the claim `Approved`;
  4. increments the allocation's `Spent_Amount__c`;
  5. inserts a **Ledger Entry** (`Entry_Type = Claim Approval`, `Source_System =
     Salesforce`);
  6. increments the Care Plan's `Total_Spent__c`.

The approval button lives in the `careLedger` LWC on the Care Plan record page.
All DML happens atomically inside the `@AuraEnabled` call, so a partial failure
rolls back the whole approval.

## Reports and Gotcare Overview dashboard

- **Report types** (custom): `Care Claims with Funding Allocation` and `Ledger
  Entries` join the custom objects for reporting.
- **Reports** (in the `Gotcare` folder):
  - `Care Plans` — Summary by Status (Client, Total Allocation, Total Spent).
  - `Funding Allocations` — Summary by Category (Allocated/Committed/Spent/Remaining).
  - `Submitted Claims` — Summary by Status (worker, service date, hours, rate, totals).
  - `Ledger Entries` — Summary by Entry Type (amount, effective date, source, reason).
- **Gotcare Overview dashboard** — grid of table components: Care Plans,
  Funding Allocations, Submitted Claims (large table), Ledger Entries.

Grouping fixes (Summary report types) resolved the original dashboard errors so all
components run without error.

## Lightning components (LWC)

- `careBudgetDashboard` — reads plan summary and shows allocation vs. spend health
  on the Care Plan page.
- `careLedger` — lists pending (Submitted) claims for the plan with an **Approve**
  action wired to `CareLedgerService.approveClaim`, refreshing after success.

Both target `lightning__RecordPage` (Care_Plan__c) and are mobile-supported (no
`supportedFormFactors` restriction → Large + Small).

## Interviewer Gotcare-only access

- **Profile:** Standard User override — Gotcare visible + default; all standard apps
  hidden.
- **Permission set:** `Gotcare_Ledger_Access` — CRUD on Account, Care Plan, Funding
  Allocation, Care Claim, Ledger Entry; field reads/writes; Gotcare app + tab
  visibility; and `CareLedgerService` Apex class access.

Interviewer user name: **`Gotcare Interviewer`**
(value placeholder: `{interviewer-username}`.)

## Mobile setup and the Care Plan mobile record-page fix

The org has a single record **FlexiPage** for Care Plans: `Care_Plan_Record_Page`
(`flexipage:recordHomeTemplateDesktop`). Desktop LEX auto-adds classic Details/Related
from the layout, but **the Salesforce mobile app does not** — it renders only the
components present on the flexipage. The original page had no record-detail component,
so the Care Plan record appeared blank in the phone/Pad form factor.

**Fix:** added `force:recordDetailPanelMobile` (Record Detail - Mobile) as the first
item of the Main region, before the two dashboard LWCs. The page now shows the Care
Plan layout fields plus the budget dashboard and ledger components on mobile and
desktop.

- Dynamic Forms on Mobile is **not** enabled in the org, so the supported component
  is the legacy mobile record detail; no `force:recordDetail`/Field-Section conflict
  existed to remove.
- Funding Allocation, Care Claim, and Ledger Entry records use **system default**
  record pages; their layout-restored fields and related lists render there
  (including mobile) with no flexipage change.

## Funding low-balance Flow and crossing-below-50% behavior

`Funding_Allocation_Low_Balance_Alert` (Auto-Launched, record-triggered on
Funding_Allocation__c, Create + Update, After Save, System Mode with Sharing,
**Active**, API 67):

```
Start (Allocated_Amount__c > 0)
  └─ Check_Low_Balance
       ├─ Ratio = Remaining / Allocated
       ├─ Alert when:  ratio < 0.50  AND  prior ratio ≥ 0.50
       │    └─ Send_Low_Balance_Email (emailSimple)
       └─ otherwise: No Alert Needed
```

- **Crossing-only:** the email fires when the ratio **crosses below** 50% — it does
  not re-fire on every subsequent edit while the allocation stays below the
  threshold.
- Subject and body merge Care Plan client, allocation category, and amount fields.
- Trigger entry criteria preserve `Allocated_Amount__c > 0` (no division-by-zero).

### Verified sender and Deliverability prerequisites

The email previously ran without a Flow fault but was **not delivered** because
`emailSimple` defaulted to the **Current User** (an address Salesforce would not
deliver from). The action now configures the sender explicitly:

| Input parameter | Value |
| --- | --- |
| `senderType` | `OrgWideEmailAddress` |
| `senderAddress` | `[private email redacted]` (verified org-wide address) |
| `emailAddresses` | `[private email redacted]` |

Requirements to deliver:

- Deliverability = **All email** (Setup → Email → Deliverability).
- The org-wide sender must be **verified** and active (Setup → Email →
  Organization-Wide Email Addresses).
- The OWA is currently profile-restricted to **System Administrator**; the Flow
  runs in the context of that user. If a non-admin user (e.g., the interviewer)
  ever triggers the Flow, the address must also be allowed for that profile or the
  send will be blocked.
- `logEmailOnSend` is intentionally **off** for this demo so no `EmailMessage`
  records are created on Flow runs.

### Manual test procedure and expected results

1. Open a Funding Allocation with `Allocated_Amount__c > 0`.
2. Make the allocation cross below 50% remaining — for example, lower
   `Remaining_Amount__c` to less than half of `Allocated_Amount__c`, or approve a
   claim whose spending pushes the allocation past half. The record after-save
   trigger fires the Flow.
3. Expected: the Flow runs `Check_Low_Balance`, the `Send_Low_Balance_Email` action
   executes with **no Flow fault**, and a message is delivered to the inbox the
   verified sender sends from (`[private email redacted]`).
4. Edit the same allocation again (still below 50%) — the Flow runs but **does not**
   send again (crossing-only logic).
5. Restore the allocation above 50%, then drop it below again — a new crossing sends
   a second email.

> ⚠️ Every test run sends a real email. Only run this with the owner's permission
> and on clearly labeled demo records — not on production business data.

## Deployment instructions

Requires the Salesforce CLI. Source API version: **67.0** (see
`sfdx-project.json`).

```bash
# 1. Create the demo scratch org (see config/project-scratch-def.json)
sf org create scratch --definition-file config/project-scratch-def.json \
  --alias GotcareLedger --set-default

# 2. Push all metadata
sf project deploy start --source-dir force-app --target-org GotcareLedger

# 3. Confirm the Flow stayed Active
sf project list metadata --metadata-type Flow --target-org GotcareLedger

# 4. Configure email prerequisites in Setup
#    - Deliverability → All email
#    - Organization-Wide Email Addresses → add + verify the sender used in the Flow

# 5. (Optional) run the Apex unit tests
sf apex run test --class-names CareLedgerServiceTest --target-org GotcareLedger
```

Local checks:

```bash
npm install
npm run test:unit        # LWC Jest (careBudgetDashboard, careLedger)
npx eslint "force-app/main/default/lwc/**/*.js"   # lint the LWC JS
```

## Known limitations

- **Amount meters on Funding Allocations** are updated by the approval path
  (`Spent`/`Total Spent`). Direct numeric edits to `Remaining_Amount__c` must be
  done deliberately; balances are not auto-recomputed on every manual change.
- **Profile override `Standard User`** is intentionally aggressive (Gotcare-only).
  Deploying it to a shared org could hide standard apps from that profile — use on
  the demo/sandbox org only.
- **Org-wide sender is profile-restricted** to System Administrator. The interviewer
  editing allocations will not trip the Flow sender unless the OWA is extended to
  their profile.
- **Record page assignment/form factors are not exposed via the Metadata API** in
  this org; the Care Plan fix was validated by behavior (desktop OK + mobile
  Record-Detail component present). FA/CC/LE use system default record pages.
- **`logEmailOnSend` is off** by design (no `EmailMessage` spam in this demo);
  enable it in the Flow if an auditable EmailMessage trail is required.
- **Dashboard runs as the logged-in user** on report scopes of the whole
  organization; records outside the viewer's sharing may not appear.
- `npm run lint` uses a brace glob (`{aura,lwc}`) that does not expand under npm's
  `sh`; lint the LWC sources directly with the `npx eslint` command shown above.

---

**Org (scratch, ephemeral):** `{gotcare-org-url}` (expires per scratch org policy —
recreate via the deployment instructions above.)