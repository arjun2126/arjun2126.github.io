# agentic-job-search-workflow

A privacy-first, local-only Python CLI for disciplined job-search operations — no auto-apply, no surprises.

Job hunting spreads across boards, versions of resumes, and scattered notes. This project keeps that workflow explicit: lane-based discovery coverage, local posting verification, document-quality audits with version-safe remediation, and CSV application tracking — all dry-run by default with human approval before any write.

It is a Python CLI for **lane-based job-search operations, posting verification, document audit/remediation, and tracker management**. Writes require explicit confirmation and create dated backups; nothing is ever submitted or sent automatically.

## Quick Start (macOS / local)

Copy-paste:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
pytest
python scripts/privacy_scan.py
bash scripts/pre_commit_check.sh
job-search-ops lanes list --config config/config.example.yaml
job-search-ops verify check --input examples/sample_postings.json
job-search-ops docs audit examples/sample_doc_with_issues.md || true
job-search-ops tracker list --tracker examples/sample_tracker.csv
```

## How to Run

For your own local testing, from the project root:

```bash
# 1. Create and activate an isolated environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install the CLI in editable mode with dev tools
pip install -e ".[dev]"

# 3. Run the test suite
pytest

# 4. Run the safety gates before sharing or publishing
python scripts/privacy_scan.py
bash scripts/pre_commit_check.sh

# 5. Use the CLI (all examples use fictional sample data)
job-search-ops --help
job-search-ops safety
```

Troubleshooting:

- `job-search-ops: command not found` → the virtual environment is not active or the install did not finish. Reactivate with `source .venv/bin/activate`, reinstall with `pip install -e ".[dev]"`, then retry.
- As a fallback without the installed entry point: `python -m job_search_ops.cli --help` (run with the venv active).
- If `pytest` is missing: `pip install -e ".[dev]"` again with the venv active.

## Demo Commands (fictional sample data only)

```bash
job-search-ops lanes list --config config/config.example.yaml
job-search-ops verify check --input examples/sample_postings.json
job-search-ops docs audit examples/sample_doc_with_issues.md || true
job-search-ops tracker list --tracker examples/sample_tracker.csv
```

Writes are dry-run by default. To persist anything you must pass `--no-dry-run --confirm`, and outputs never overwrite existing files. See `docs/USAGE.md` for write examples.

## Safety and Privacy

- **Local-first:** no network calls, no scraping, no browser automation, no email sending.
- **Dry-run by default:** every write path previews first; `--no-dry-run --confirm` is required to persist.
- **Version-safe:** dated backups before tracker updates and remediations; originals are never overwritten.
- **Fictional sample data only:** examples use fake people, companies, and `example.com` URLs. Never put real resumes, trackers, credentials, or application history in this repo — keep private files in git-ignored local paths (see `PRIVACY.md`).

## Project Structure

- `README.md` — this overview and quick start.
- `ARCHITECTURE.md` — module design and safety invariants.
- `PRIVACY.md` — what must never be committed.
- `pyproject.toml` — packaging, CLI entry point, dev dependencies.
- `.env.example` — placeholder env vars (copy to git-ignored `.env` locally).
- `config/config.example.yaml` — fictional paid + volunteer lanes (copy to git-ignored local config to customize).
- `src/job_search_ops/cli.py` — Typer CLI (`lanes`, `verify`, `docs`, `tracker`, `reports`, `safety`).
- `src/job_search_ops/lanes.py` — active-lane coverage validation and reports.
- `src/job_search_ops/verification.py` — local-only posting checks (`active`, `dead_link`, `needs_browser_check`, `unknown`).
- `src/job_search_ops/documents.py` — audit for visible artifacts + confirmation-gated remediation.
- `src/job_search_ops/tracker.py` — generic CSV tracker with revision history and backups.
- `src/job_search_ops/reports.py` — coverage and summary report builders.
- `src/job_search_ops/config.py` / `models.py` / `safety.py` — YAML loading, dataclasses, dry-run/confirm/logging helpers.
- `examples/` — fictional postings, tracker, and documents for demos and tests.
- `tests/` — unit tests for config, coverage, dry-run, and no-overwrite behavior.
- `docs/` — usage (`USAGE.md`) and safety model (`SAFETY.md`).
- `scripts/` — `privacy_scan.py` and `pre_commit_check.sh` safety gates.
- `output/.gitkeep` — placeholder; generated reports stay git-ignored.

## Roadmap

- Lane-yield summaries with zero-result lane highlighting.
- Read-only manual browser checklist export (no automation).
- Local DOCX text extraction for audit previews (report-first, no silent edits).
- Shell completion and richer report themes.

Further detail: [ARCHITECTURE.md](ARCHITECTURE.md), [docs/USAGE.md](docs/USAGE.md), [docs/SAFETY.md](docs/SAFETY.md), [PRIVACY.md](PRIVACY.md).
