# joseftot.com — TOT//OS

Personal site of Josef Tot: blog, projects, about — dressed as a terminal.
Static Astro build, no framework in the browser.

## Write

| What | Where |
|---|---|
| New blog post | `src/content/blog/<slug>.md` (frontmatter: title, description, date, tags, draft) |
| New project | `src/content/projects/<slug>.md` (title, description, status, year, stack, repo?, url?, order) |
| About / imprint text | `src/pages/about.astro`, `src/pages/imprint.astro` — fill the `[PLACEHOLDER]` spans |

`draft: true` keeps an entry out of the build.

## Run

```bash
npm run dev       # http://localhost:4321
npm run build     # -> dist/
python scripts/shots.py blog green,light   # theme-aware screenshots into _shots/
```

## Where things are

- `src/styles/site.css` — the whole design. A theme is a block of CSS variables on `<html data-theme>`
  (green, dark, light, mono, plus the hidden `amber`). `--crt: 1` switches scanlines + glow on.
- `public/js/theme.js` — tiny blocking head script: theme before first paint, boot decision.
- `public/js/terminal.js` — theme switch, boot sequence, typed lines, the command line
  (`help`, `ls`, `cd`, `cat`, `theme`, `play`, `matrix`, `neofetch`, `joshua`, ...).
- `public/js/invaders.js` — Space Invaders; loads only on `/play/`, colours follow the theme.
- `src/components/Logo.astro` — figlet wordmark rendered to SVG at build time.
- `src/pages/index.json.js` — post/project index that feeds `ls`, `cat` and tab-completion.

## Deploy

- **Railway (now):** `Dockerfile` builds the site and serves `dist/` with Caddy (`Caddyfile`, security headers + CSP).
  `railway up` from this folder.
- **Cloudflare Pages (later):** build command `npm run build`, output `dist`. `public/_headers` already carries
  the same headers. Then point joseftot.com at the Pages project.
