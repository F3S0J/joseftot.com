"""One-off: writes the starter posts and project entries. Safe to delete once the content is real."""
import pathlib
import textwrap

ROOT = pathlib.Path(__file__).resolve().parent.parent / "src" / "content"


def w(rel, s):
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(textwrap.dedent(s).lstrip(), encoding="utf-8")


w("blog/hello-world.md", '''
    ---
    title: "Hello, world"
    description: "Boot message. What this site is, and what will end up here."
    date: 2026-09-21
    tags: [meta]
    ---

    Every system prints something on first boot. This is mine.

    I have been working in IT and writing software for a while now, and most of what I
    learned is scattered over notebooks, chat logs and half-finished README files. This
    site is the attempt to put it in one place, in the open.

    ## What to expect

    - **Methods.** How I approach a problem before I touch a keyboard, and what I check
      before I call something done.
    - **Field notes.** Short write-ups of things that broke, why they broke, and what
      fixed them.
    - **Projects.** The things I build on the side, with an honest status next to each.

    ## What not to expect

    No tracking, no cookie banner, no newsletter pop-up. There is an
    [RSS feed](/rss.xml) if you want to follow along, and a command line at the bottom of
    every page if you would rather not use the mouse.

    ```bash
    guest@joseftot:~$ help
    ```

    End of transmission.
''')

w("blog/how-this-site-works.md", '''
    ---
    title: "How this site works"
    description: "A terminal that is really a static website: the stack, the themes, the command line and the game."
    date: 2026-09-21
    tags: [meta, web, astro]
    ---

    This site looks like a terminal, but underneath it is about as boring as a website
    can be, on purpose: static HTML, one stylesheet, three small scripts.

    ## The stack

    - **Astro** builds everything to plain HTML at deploy time. Posts and projects are
      Markdown files in a folder.
    - **No framework in the browser.** The command line, the theme switch and the boot
      sequence are one vanilla JavaScript file. The game is another, and it only loads on
      its own page.
    - **Fonts are self-hosted.** Nothing is requested from a third party, so there is
      nothing to consent to.

    ## Themes are just variables

    Every colour on the page comes from a handful of CSS custom properties. A theme is
    nothing more than a different set of values on the `<html>` element:

    ```css
    :root[data-theme='green'] {
      --bg: #020a04;
      --fg: #3dff7a;
      --glow: rgba(61, 255, 122, 0.55);
      --crt: 1; /* scanlines and glow on */
    }
    ```

    The green theme adds a soft `text-shadow` for the phosphor glow and a fixed overlay
    with scanlines and a vignette. The other themes switch that layer off. If your system
    asks for reduced motion, the flicker, the typing and the boot sequence stay off too.

    ## The command line is real

    The prompt at the bottom of the page parses what you type. `ls` lists the current
    section, `cd` and `cat` navigate, <kbd>Tab</kbd> completes names, and the arrow keys
    walk through your history. The list of posts comes from a small JSON file generated at
    build time.

    Not every command is in `help`. That is what terminals are for.

    ## The game

    Space Invaders is a few hundred lines on a `<canvas>`: sprites stored as strings,
    destructible bunkers, a mystery ship, and invaders that speed up as their numbers drop.
    It takes its colours from the active theme, so it glows green in the green theme and
    goes strictly black and white in mono.

    A strange game. The only winning move is [to play](/play/).
''')

PROJECTS = {
    "shipwreck-scan": ("shipwreck-scan", "Open-source screening tool that turns sonar surveys and aerial imagery into a ranked list of possible shipwrecks for an archaeologist to triage.", "active", 2026, ["Python", "NOAA BAG bathymetry", "NAIP imagery"], 1, '''
        Give it a bounding box or a NOAA survey id, and it returns ranked candidate wreck
        polygons with measured error rates attached.

        Two detection paths: survey-grade multibeam sonar for turbid water, and
        high-resolution optical imagery for clear, shallow water where a hull reads directly
        as a shape. Recall is scored against charted wrecks, with a chance-corrected lift
        figure, so the numbers mean something.
    '''),
    "companion": ("Companion", "A phone app that listens to a conversation and whispers short cues into one earbud.", "experiment", 2026, ["Android", "Claude Haiku", "speech-to-text"], 2, '''
        The phone listens, a small language model decides whether there is anything worth
        saying, and if so it whispers a three-to-six word cue into a single earbud.

        Early version, running on my own phone. The interesting problems are latency and
        knowing when to stay quiet.
    '''),
    "raplab": ("RapLab", "A lyric-writing workbench: a language model over-produces lines, a deterministic judge counts syllables and rhymes and keeps the ones that fit.", "experiment", 2026, ["Python", "LLM", "local web app"], 3, '''
        Language models are bad at counting syllables and worse at judging their own rhymes.
        RapLab does not ask them to. The model writes far too many candidate lines, and a
        plain, deterministic checker measures syllables and rhyme and throws most of them away.
    '''),
    "meta-loop": ("meta-loop", "An experiment in letting an AI agent improve its own setup, and measuring honestly whether it did.", "experiment", 2026, ["Python", "Claude", "benchmarks"], 4, '''
        The build was the easy part. The lessons were about measurement: a benchmark that is
        too easy shows nothing, every score has a noise floor, and a plausible hypothesis is
        not a result until it has been measured.
    '''),
    "grocery-radar": ("Grocery Radar", "A weekly price radar for household staples across the Austrian supermarket chains.", "active", 2026, ["Python", "PDF parsing", "OCR"], 5, '''
        Every week it pulls the flyers and shop prices of the big chains, merges promotions
        with shelf prices, and tells me where the things we actually buy are cheapest.
    '''),
    "joseftot-com": ("joseftot.com", "This site: a static website dressed as a terminal, with four themes, a working command line and Space Invaders.", "shipped", 2026, ["Astro", "CSS", "vanilla JS", "canvas"], 6, '''
        Static HTML, one stylesheet, no framework in the browser. The write-up is in the blog:
        [How this site works](/blog/how-this-site-works/).
    '''),
}

for slug, (title, desc, status, year, stack, order, body) in PROJECTS.items():
    stack_s = ", ".join('"%s"' % s for s in stack)
    fm = '---\ntitle: "%s"\ndescription: "%s"\nstatus: %s\nyear: %d\nstack: [%s]\norder: %d\n---\n\n' % (title, desc, status, year, stack_s, order)
    p = ROOT / "projects" / (slug + ".md")
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(fm + textwrap.dedent(body).strip() + "\n", encoding="utf-8")

print("seeded", len(PROJECTS), "projects and 2 posts")
