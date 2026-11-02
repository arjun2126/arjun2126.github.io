"""Fetch public repository documentation and genuine screenshots for ArjunOS.

Read-only against public GitHub. Writes README sources to docs/sources/ and
unreviewed project originals to ignored .freebuff/image-sources/<repo>/.
Run once during research; use optimize-images.mjs for reviewed/cropped derivatives.
"""
import json
import pathlib
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCES = ROOT / "docs" / "sources"
PUBLIC = ROOT / ".freebuff" / "image-sources"
SOURCES.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(parents=True, exist_ok=True)

REPOS = {
    "northgate-motors-demo": {"branch": "release/buyer-3-1", "featured": True},
    "TennisScore": {"branch": "main", "featured": True},
    "nova-scotia-grants-salesforce": {"branch": "main", "featured": True},
    "care-operations-analytics": {"branch": "main", "featured": True},
    "Gotcare-Ledger": {"branch": "main"},
    "salesforce-revops-demo": {"branch": "main"},
    "ai-engineering-journey": {"branch": "main"},
    "agentic-job-search-workflow": {"branch": "main"},
}


def get(url, timeout=60):
    req = urllib.request.Request(url, headers={"User-Agent": "ArjunOS-research"})
    return urllib.request.urlopen(req, timeout=timeout).read()


def readme(repo, branch):
    for name in ("README.md", "readme.md", "README.MD"):
        try:
            return get(f"https://raw.githubusercontent.com/arjun2126/{repo}/{branch}/{name}")
        except urllib.error.HTTPError:
            continue
    return None


def tree(repo, branch):
    try:
        quoted = urllib.parse.quote(branch, safe="")
        data = json.loads(get(f"https://api.github.com/repos/arjun2126/{repo}/git/trees/{quoted}?recursive=1"))
        return [i["path"] for i in data.get("tree", [])]
    except Exception as exc:  # noqa: BLE001 - research script logs and continues
        print(f"  tree failed: {exc}")
        return []


def choose_images(paths):
    ranking = [
        "docs/screenshots/",
        "screenshots/",
        "dashboard/screenshots/",
        "docs/images/",
        "public/screenshots/",
        "assets/screenshots/",
    ]
    candidates = [
        p
        for p in paths
        if p.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))
        and not any(part in p.lower() for part in ("icon", "logo", "favicon", "badge", "avatar"))
    ]
    out = []
    for prefix in ranking:
        out.extend(sorted([p for p in candidates if p.startswith(prefix)]))
    remaining = sorted(candidates)
    for p in remaining:
        if p not in out:
            out.append(p)
    return out


summary = {}
for repo, meta in REPOS.items():
    branch = meta["branch"]
    print(f"== {repo} ({branch})")
    doc = readme(repo, branch)
    if not doc:
        print("  README missing")
        continue
    (SOURCES / f"{repo}.md").write_bytes(doc)
    print(f"  README saved ({len(doc)} bytes)")
    paths = tree(repo, branch)
    images = choose_images(paths)
    print(f"  image candidates: {len(images)}")
    saved = []
    for image in images[:10]:
        dest = PUBLIC / repo / pathlib.Path(image).name
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists():
            saved.append(str(dest.relative_to(ROOT)))
            continue
        try:
            data = get(f"https://raw.githubusercontent.com/arjun2126/{repo}/{branch}/{urllib.parse.quote(image)}")
            if len(data) < 5000:
                print(f"  skip tiny {image} ({len(data)}B)")
                continue
            dest.write_bytes(data)
            saved.append(str(dest.relative_to(ROOT)))
            print(f"  saved {dest.relative_to(ROOT)} ({len(data)//1024}KB)")
        except Exception as exc:  # noqa: BLE001
            print(f"  image failed {image}: {exc}")
    summary[repo] = {"branch": branch, "readme": f"docs/sources/{repo}.md", "images": saved}

(SOURCES / "_assets.json").write_text(json.dumps(summary, indent=2))
print("\nDONE", json.dumps({k: len(v["images"]) for k, v in summary.items()}, indent=2))
