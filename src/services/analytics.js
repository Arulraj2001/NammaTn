import { supabase } from "@/api/supabaseClient";

export const getPublicDashboard = async () => {
  const [postsRes, commentsRes, reportsRes] = await Promise.all([
    supabase.from("post").select("*").eq("status", "active").order("created_date", { ascending: false }).limit(300),
    supabase.from("comment").select("*").eq("status", "active").order("created_date", { ascending: false }).limit(100),
    supabase.from("report").select("*").eq("status", "pending").order("created_date", { ascending: false }).limit(50),
  ]);

  const allPosts = postsRes.data || [];
  const comments = commentsRes.data || [];
  const reports = reportsRes.data || [];

  const totalPosts = allPosts.length;
  const complaints = allPosts.filter((p) => p.post_type === "complaint").length;
  const appreciations = allPosts.filter((p) => p.post_type === "appreciation").length;
  const alerts = allPosts.filter((p) => p.post_type === "alert").length;
  const totalComments = comments.length;
  const totalUpvotes = allPosts.reduce((s, p) => s + (p.upvotes || 0), 0);

  const activeDistricts = new Set(allPosts.map((p) => p.district_slug).filter(Boolean));

  // Posts by type
  const byType = {};
  allPosts.forEach((p) => {
    byType[p.post_type] = (byType[p.post_type] || 0) + 1;
  });

  // Posts last 7 days per day
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = allPosts.filter((p) => p.created_date && p.created_date.startsWith(dateStr)).length;
    last7.push({ date: dateStr, count });
  }

  return {
    totalPosts,
    complaints,
    appreciations,
    alerts,
    totalComments,
    totalUpvotes,
    activeDistricts: activeDistricts.size,
    pendingReports: reports.length,
    byType,
    activityLast7Days: last7,
    positiveRatio: totalPosts > 0 ? Math.round((appreciations / totalPosts) * 100) : 0,
  };
};

export const getDistrictStats = async (slug) => {
  const { data: posts, error } = await supabase
    .from("post")
    .select("*")
    .eq("district_slug", slug)
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(200);
  if (error) throw error;

  const totalPosts = posts.length;
  const complaints = posts.filter((p) => p.post_type === "complaint").length;
  const appreciations = posts.filter((p) => p.post_type === "appreciation").length;
  const alerts = posts.filter((p) => p.post_type === "alert").length;
  const totalUpvotes = posts.reduce((s, p) => s + (p.upvotes || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comment_count || 0), 0);

  const catMap = {};
  posts.forEach((p) => {
    if (!p.category_slug) return;
    catMap[p.category_slug] = (catMap[p.category_slug] || 0) + 1;
  });
  const topCategories = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, count]) => ({ slug, count }));

  const recentAlerts = posts.filter((p) => p.post_type === "alert").slice(0, 3);
  const topDiscussions = [...posts].sort((a, b) => (b.comment_count || 0) - (a.comment_count || 0)).slice(0, 3);

  return {
    totalPosts, complaints, appreciations, alerts,
    totalUpvotes, totalComments, topCategories, recentAlerts, topDiscussions,
    positiveRatio: totalPosts > 0 ? Math.round((appreciations / totalPosts) * 100) : 0,
    complaintRatio: totalPosts > 0 ? Math.round((complaints / totalPosts) * 100) : 0,
  };
};

export const getCategoryStats = async (slug) => {
  const { data: posts, error } = await supabase
    .from("post")
    .select("*")
    .eq("category_slug", slug)
    .eq("status", "active")
    .order("created_date", { ascending: false })
    .limit(200);
  if (error) throw error;

  const totalPosts = posts.length;
  const totalUpvotes = posts.reduce((s, p) => s + (p.upvotes || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comment_count || 0), 0);

  const districtMap = {};
  posts.forEach((p) => {
    if (!p.district_slug) return;
    districtMap[p.district_slug] = {
      slug: p.district_slug,
      name: p.district_name || p.district_slug,
      count: (districtMap[p.district_slug]?.count || 0) + 1,
    };
  });
  const topDistricts = Object.values(districtMap).sort((a, b) => b.count - a.count).slice(0, 5);

  const byType = {};
  posts.forEach((p) => {
    byType[p.post_type] = (byType[p.post_type] || 0) + 1;
  });

  return { totalPosts, totalUpvotes, totalComments, topDistricts, byType };
};