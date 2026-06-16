const KEY = "tn_bookmarks";

export const getBookmarks = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
};

export const addBookmark = (post) => {
  const existing = getBookmarks().filter((b) => b.id !== post.id);
  const entry = { id: post.id, title_en: post.title_en, title_ta: post.title_ta, district_name: post.district_name, post_type: post.post_type, saved_at: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify([entry, ...existing].slice(0, 50)));
};

export const removeBookmark = (postId) => {
  const updated = getBookmarks().filter((b) => b.id !== postId);
  localStorage.setItem(KEY, JSON.stringify(updated));
};

export const isBookmarked = (postId) => getBookmarks().some((b) => b.id === postId);