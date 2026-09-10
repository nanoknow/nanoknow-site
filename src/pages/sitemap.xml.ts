import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getAllTopics, getPublishedPosts, topicHref } from "@/lib/blog";

const SITE = "https://nanoknow.org";

function toLoc(path: string): string {
  const trimmed = path.replace(/^\/+|\/+$/g, "");
  return trimmed ? `${SITE}/${trimmed}/` : `${SITE}/`;
}

function docPath(id: string): string | null {
  const slug = id.replace(/\/index$/, "").replace(/^index$/, "");
  if (!slug || slug === "404") return slug === "404" ? null : "/";
  return `/${slug}/`;
}

export const GET: APIRoute = async () => {
  const urls = new Set<string>();

  for (const doc of await getCollection("docs")) {
    const path = docPath(doc.id);
    if (path) urls.add(toLoc(path));
  }

  urls.add(toLoc("/blog/"));
  for (const post of await getPublishedPosts()) {
    urls.add(toLoc(`/blog/${post.id}/`));
  }
  for (const topic of await getAllTopics()) {
    urls.add(toLoc(topicHref(topic.slug)));
  }

  const body = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...[...urls].sort().map((loc) => `  <url><loc>${loc}</loc></url>`),
    `</urlset>`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
