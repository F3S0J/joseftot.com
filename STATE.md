# STATE — joseftot.com

Last session: 21–22 Sep 2026. Live preview: https://web-production-4ef5e.up.railway.app

## Done
- Site: home, blog (7 posts), projects (10), music (59 SoundCloud tracks, click-to-load player), about, imprint, Space Invaders
- Hardened: strict CSP, HSTS, GET/HEAD only, dotfiles 404, container runs as `nobody`, security.txt, dependabot
- Public repos (F3S0J): joseftot.com, wreckscan, raplab, claude-usage-widget

## Open — start here next time
1. **siteplan repo not pushed** (permission block). Clean copy in `A:/siteplan-public`; run the push yourself, then check the site's link works.
2. **Imprint town** is still `[PLACEHOLDER: town]` (§ 25 MedienG).
3. **RapLab** sends a spoofed `Origin` header to double-rhyme.com (public code) — remove or make optional?
4. **Read the law post** (`src/content/blog/law-research-agents.md`) — "It helped" is the only outcome claim.
5. **Move to Cloudflare Pages + attach joseftot.com** once content is approved (build `npm run build`, output `dist`, `public/_headers` ready).
6. 2FA on Railway, GitHub, domain registrar, Cloudflare.

## Rules for content
- Platform-agnostic: "agentic systems", never "Claude Code". Exception (Josef, 27.09.2026): a post about a tool that only works with Claude (e.g. claude-usage-widget) names it openly.
- No active legal cases; CAD post never names real plots or owners.
- Unverified wreck candidate positions never go public; update `A:/shipwreck-public` by hand, never push `A:/shipwreck`.

## How to
- Deploy: `railway up --service web --ci` from this folder
- Screenshots: `python scripts/shots.py <bare-path> <themes>`
