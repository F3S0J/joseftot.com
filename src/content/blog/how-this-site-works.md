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
