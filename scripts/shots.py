"""Theme-aware screenshots of dist/ via the web-studio CDP helper.

  python scripts/shots.py                       # home, all themes, desktop + phone
  python scripts/shots.py /blog/ green,light    # one path, chosen themes
  python scripts/shots.py / green --js "..."    # run JS before the shot
"""
import argparse
import sys
from pathlib import Path

SKILL = Path.home() / ".claude/skills/web-studio/scripts"
sys.path.insert(0, str(SKILL))
from cdp import Chrome  # noqa: E402
from shot import OVERFLOW_JS, find_chrome, serve  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("path", nargs="?", default="home")
ap.add_argument("themes", nargs="?", default="green,dark,light,mono")
ap.add_argument("--widths", default="1440,390")
ap.add_argument("--js", default="")
ap.add_argument("--viewport-only", action="store_true")
ap.add_argument("--motion", action="store_true")
ap.add_argument("--tag", default="")
a = ap.parse_args()
# Git Bash rewrites a leading "/" into a Windows path, so paths are given bare: home, blog, blog/hello-world
_p = a.path.strip("/")
a.path = "/" if _p in ("", "home") else "/" + _p + ("" if "." in _p else "/")

out = ROOT / "_shots"
out.mkdir(exist_ok=True)
with serve(ROOT / "dist") as base, Chrome(find_chrome()) as c:
    for w in [int(x) for x in a.widths.split(",")]:
        c.viewport(w, 900 if w > 600 else 844, scale=1 if w > 600 else 2, mobile=w < 600)
        c.media("dark", reduced_motion=not a.motion)
        for theme in a.themes.split(","):
            c.goto(base.rstrip("/") + a.path, settle=0.2)
            c.evaluate("localStorage.setItem('theme','%s');sessionStorage.setItem('booted','1')" % theme)
            c.goto(base.rstrip("/") + a.path, settle=0.9)
            if a.js:
                c.evaluate(a.js)
                import time; time.sleep(1.2)
            slug = a.path.strip("/").replace("/", "-") or "home"
            png = out / f"{slug}_{theme}_{w}{a.tag}.png"
            c.screenshot(png, full_page=not a.viewport_only)
            print(png.name, c.evaluate(OVERFLOW_JS))
