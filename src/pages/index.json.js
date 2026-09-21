// Feeds `ls`, `cat` and tab-completion of the on-page command line.
import { getCollection } from 'astro:content';

export async function GET() {
  const blog = (await getCollection('blog', (p) => !p.data.draft))
    .sort((a, b) => +b.data.date - +a.data.date)
    .map((p) => ({ slug: p.id, url: `/blog/${p.id}/`, title: p.data.title, meta: p.data.date.toISOString().slice(0, 10) }));
  const projects = (await getCollection('projects', (p) => !p.data.draft))
    .sort((a, b) => a.data.order - b.data.order)
    .map((p) => ({ slug: p.id, url: `/projects/${p.id}/`, title: p.data.title, meta: p.data.status }));
  return new Response(JSON.stringify({ blog, projects }), { headers: { 'Content-Type': 'application/json' } });
}
