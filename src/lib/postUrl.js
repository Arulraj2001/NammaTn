/**
 * Universal Post URL resolver.
 * Generates SEO-friendly URLs using post.slug when available,
 * falling back to post.id for legacy posts.
 */
export function getPostUrl(post) {
  if (!post) return "/explore";
  const slug = post.slug?.trim();
  if (slug) return `/post/${slug}`;
  return `/post/${post.id}`;
}

export function getPostCanonicalUrl(post, siteUrl = "https://www.vizhitn.in") {
  return `${siteUrl}${getPostUrl(post)}`;
}
