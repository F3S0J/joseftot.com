import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.joseftot.com',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'never' },
  integrations: [sitemap()],
  // no data: URIs: every font and asset is a real file, so the CSP can stay at font-src 'self'
  vite: { build: { assetsInlineLimit: 0 } },
  markdown: {
    // token colours come from CSS variables, so code blocks follow the theme
    shikiConfig: { theme: 'css-variables', wrap: false },
  },
});
