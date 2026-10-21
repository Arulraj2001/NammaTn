/**
 * Universal Post URL resolver.
 * Generates SEO-friendly URLs using post.slug when available,
 * falling back to post.id for legacy posts.
 */
export function getPostUrl(post) {
  if (!post) return "/explore";
  const slug = post.slug?.trim();
  const idOrSlug = slug || post.id;
  return `/post/${idOrSlug}`;
}

export function getPostCanonicalUrl(post, siteUrl = "https://www.vizhitn.in") {
  return `${siteUrl}${getPostUrl(post)}`;
}
