"""Review the Git index only; print paths/line numbers, never secret values."""
import pathlib
import re
import subprocess
import sys


def git(*args):
    return subprocess.check_output(["git", *args])


tree_mode = "--tree" in sys.argv
paths = (git("ls-tree", "-r", "--name-only", "-z", "HEAD") if tree_mode else git("diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z")).decode().split("\0")
paths = [p for p in paths if p]
if not paths:
    sys.exit("No staged changes to audit")

forbidden_parts = {
    ".cloud-attachments", ".freebuff", "node_modules", "dist", "test-results",
    "playwright-report", "blob-report", "coverage", "source-images", "backups",
    ".cache", ".vite", ".vite-temp", ".npm",
}
patterns = {
    "private-key": r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
    "github-token": r"\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})",
    "aws-access-key": r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b",
    "api-token": r"\b(?:sk-[A-Za-z0-9_-]{20,}|AIza[A-Za-z0-9_-]{30,}|xox[baprs]-[A-Za-z0-9-]{15,})",
    "email-review": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
    "local-home-path": r"/(?:Users|home)/[A-Za-z0-9_.-]+/",
    "credential-assignment": r'''(?i)(?:password|secret|api[_-]?key|access[_-]?token|client[_-]?secret)\s*["']?\s*[:=]\s*["'][^"'\n]{8,}["']''',
}
findings = []
for name in paths:
    path = pathlib.PurePosixPath(name)
    if (
        forbidden_parts.intersection(path.parts)
        or name.startswith(("content-studio/", "public/content-studio/"))
        or path.name.startswith(".env")
        or path.name == ".npmrc"
        or path.suffix in {".tsbuildinfo", ".pem", ".key", ".log", ".bak", ".backup"}
    ):
        findings.append(f"Forbidden staged artifact: {name}")
    data = git("show", f"HEAD:{name}" if tree_mode else f":{name}")
    if b"\0" in data:
        continue  # Images need a separate visual/OCR pass.
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError:
        continue
    for label, pattern in patterns.items():
        for number, line in enumerate(text.splitlines(), 1):
            if re.search(pattern, line):
                findings.append(f"{label}: {name}:{number}")

import json
import hashlib
revision = "HEAD:" if tree_mode else ":"
generated = git("show", revision + "src/content/studio.generated.json")
approved = json.loads(git("show", revision + "publication-approved.json"))
if hashlib.sha256(generated).hexdigest() != approved["files"].get("src/content/studio.generated.json"):
    findings.append("Generated Content Studio content requires a fresh publication review")

if "--history" in sys.argv:
    # Scan every historical tracked blob, including files deleted from HEAD.
    revisions = git("rev-list", "--all").decode().splitlines()
    seen = set()
    for commit in revisions:
        for entry in git("ls-tree", "-r", "-z", commit).split(b"\0"):
            if not entry:
                continue
            meta, name_bytes = entry.split(b"\t", 1)
            oid = meta.split()[2].decode()
            if oid in seen:
                continue
            seen.add(oid)
            name = name_bytes.decode()
            if forbidden_parts.intersection(pathlib.PurePosixPath(name).parts) or name.startswith(("content-studio/", ".cloud-attachments/")):
                findings.append(f"Forbidden historical path: {name} in {commit[:12]}")
            data = git("cat-file", "blob", oid)
            if b"\0" in data:
                continue
            try:
                text = data.decode("utf-8")
            except UnicodeDecodeError:
                continue
            for label, pattern in patterns.items():
                for number, line in enumerate(text.splitlines(), 1):
                    if re.search(pattern, line):
                        findings.append(f"historical {label}: {name}:{number} ({commit[:12]})")
    print(f"History reviewed: {len(revisions)} commits, {len(seen)} unique blobs.")

print(f"Reviewed {len(paths)} staged paths; images require separate visual/OCR review.")
if findings:
    print("\n".join(findings))
    sys.exit(1)
print("No forbidden artifacts or recognized secret/private-email patterns in staged text.")
