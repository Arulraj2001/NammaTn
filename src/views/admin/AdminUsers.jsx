import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNow, format } from "date-fns";
import { Search, Shield, ShieldOff, Trash2, Eye, RefreshCw, Users, Mail, UserCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

function StatusBadge({ role }) {
  if (role === "admin") return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Admin</span>;
  return <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">User</span>;
}

function Skeleton() {
  return <div className="space-y-3">{Array(8).fill(0).map((_, i) => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}</div>;
}

export default function AdminUsers() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [viewUser, setViewUser] = useState(null);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => base44.entities.User.list("-created_date", 200),
    staleTime: 30000,
  });

  const filtered = users.filter(u => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const updateUser = async (userId, data) => {
    await base44.entities.User.update(userId, data);
    qc.invalidateQueries({ queryKey: ["admin-users"] });
    toast({ description: "User updated." });
  };

  const promoteAdmin = (u) => updateUser(u.id, { role: "admin" });
  const demoteUser = (u) => updateUser(u.id, { role: "user" });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    thisWeek: users.filter(u => u.created_date && new Date(u.created_date) > new Date(Date.now() - 7 * 86400000)).length,
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Registered users and their activity</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Users", value: stats.total, icon: Users, color: "text-blue-600" },
          { label: "Admins", value: stats.admins, icon: Shield, color: "text-purple-600" },
          { label: "This Week", value: stats.thisWeek, icon: UserCheck, color: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <s.icon className={`w-5 h-5 mb-2 ${s.color}`} />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <div className="flex gap-1">
          {["all", "admin", "user"].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize border transition-all ${roleFilter === r ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}
            >
              {r === "all" ? `All (${users.length})` : r === "admin" ? `Admins (${stats.admins})` : `Users (${users.length - stats.admins})`}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <Skeleton /> : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                {["User", "Email", "Role", "Joined", "Actions"].map(h => (
                  <th key={h} className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-slate-400">No users found.</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs flex-shrink-0">
                        {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || "?"}
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[140px]">{u.full_name || "—"}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-500 max-w-[180px] truncate">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3 flex-shrink-0" />{u.email || "—"}</span>
                  </td>
                  <td className="py-3 px-4"><StatusBadge role={u.role} /></td>
                  <td className="py-3 px-4 text-xs text-slate-400">
                    {u.created_date ? formatDistanceToNow(new Date(u.created_date), { addSuffix: true }) : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setViewUser(u)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {u.role !== "admin" ? (
                        <button
                          onClick={() => promoteAdmin(u)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                          title="Make Admin"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => demoteUser(u)}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                          title="Remove Admin"
                        >
                          <ShieldOff className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Detail Dialog */}
      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>User Details</DialogTitle></DialogHeader>
          {viewUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 font-bold text-xl">
                  {viewUser.full_name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{viewUser.full_name || "No name"}</p>
                  <p className="text-sm text-slate-500">{viewUser.email}</p>
                  <StatusBadge role={viewUser.role} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1">User ID</p>
                  <p className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">{viewUser.id}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1">Joined</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {viewUser.created_date ? format(new Date(viewUser.created_date), "dd MMM yyyy") : "—"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                {viewUser.role !== "admin" ? (
                  <Button size="sm" variant="outline" onClick={() => { promoteAdmin(viewUser); setViewUser(v => ({ ...v, role: "admin" })); }}>
                    <Shield className="w-3.5 h-3.5 mr-1" /> Make Admin
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => { demoteUser(viewUser); setViewUser(v => ({ ...v, role: "user" })); }}>
                    <ShieldOff className="w-3.5 h-3.5 mr-1" /> Remove Admin
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setViewUser(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}