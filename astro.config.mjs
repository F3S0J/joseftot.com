import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://joseftot.com',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'never' },
  integrations: [sitemap()],
  markdown: {
    // token colours come from CSS variables, so code blocks follow the theme
    shikiConfig: { theme: 'css-variables', wrap: false },
  },
});
