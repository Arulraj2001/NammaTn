import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllReports, updateReportStatus } from "@/services/admin/reports";
import { logModerationAction } from "@/services/admin/moderation";
import { AdminTable, AdminTh, AdminTd, AdminTr } from "@/components/admin/AdminTable";
import StatusBadge from "@/components/admin/StatusBadge";
import ModerationHistory from "@/components/admin/ModerationHistory";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Flag, Eye } from "lucide-react";

const STATUSES = ["all", "pending", "reviewed", "dismissed", "actioned"];

export default function AdminReports() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [detail, setDetail] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: allReports = [], isLoading } = useQuery({
    queryKey: ["admin-reports-all"],
    queryFn: () => getAllReports(200),
    staleTime: 30_000,
  });

  const reports = statusFilter === "all"
    ? allReports
    : allReports.filter((r) => r.status === statusFilter);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-reports-all"] });

  const handleAction = async (reportId, newStatus) => {
    await updateReportStatus(reportId, newStatus);
    await logModerationAction({
      target_type: "report",
      target_id: reportId,
      action: newStatus === "dismissed" ? "dismissed" : "actioned",
      admin_email: "admin",
    });
    refresh();
    toast({ description: `Report ${newStatus}.` });
    setDetail(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review abuse and content reports
          {allReports.filter((r) => r.status === "pending").length > 0 && (
            <span className="ml-2 bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {allReports.filter((r) => r.status === "pending").length} pending
            </span>
          )}
        </p>
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              statusFilter === s
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s}
            {s !== "all" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({allReports.filter((r) => r.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <AdminTh>Type</AdminTh>
              <AdminTh>Reason</AdminTh>
              <AdminTh>Details</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Date</AdminTh>
              <AdminTh>Actions</AdminTh>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                  No reports found
                </td>
              </tr>
            )}
            {reports.map((r) => (
              <AdminTr key={r.id}>
                <AdminTd>
                  <div className="flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                    <span className="capitalize font-medium text-sm">{r.target_type}</span>
                  </div>
                </AdminTd>
                <AdminTd>
                  <span className="capitalize text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                    {r.reason?.replace(/_/g, " ")}
                  </span>
                </AdminTd>
                <AdminTd>
                  <p className="text-xs text-slate-500 max-w-[180px] line-clamp-2">{r.details || "—"}</p>
                </AdminTd>
                <AdminTd><StatusBadge status={r.status} /></AdminTd>
                <AdminTd className="text-xs text-slate-400">
                  {r.created_date
                    ? formatDistanceToNow(new Date(r.created_date), { addSuffix: true })
                    : ""}
                </AdminTd>
                <AdminTd>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDetail(r)}
                      className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                      aria-label="View detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {r.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 border-green-300 text-green-700 hover:bg-green-50"
                          onClick={() => handleAction(r.id, "actioned")}
                        >
                          Action
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 border-slate-300 text-slate-600 hover:bg-slate-50"
                          onClick={() => handleAction(r.id, "dismissed")}
                        >
                          Dismiss
                        </Button>
                      </>
                    )}
                  </div>
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </AdminTable>
      )}

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Detail</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="flex gap-2 flex-wrap">
                <StatusBadge status={detail.status} />
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs capitalize">
                  {detail.target_type}
                </span>
                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs capitalize">
                  {detail.reason?.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Target ID</span>
                <code className="text-xs bg-slate-100 px-2 py-1 rounded block break-all">{detail.target_id}</code>
              </div>
              {detail.details && (
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Reporter Details</span>
                  <p className="text-slate-600 bg-slate-50 rounded-lg p-3 text-sm">{detail.details}</p>
                </div>
              )}
              <div className="border-t border-slate-100 pt-3">
                <ModerationHistory target_id={detail.target_id} />
              </div>
              {detail.status === "pending" && (
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleAction(detail.id, "actioned")}
                  >
                    Action Report
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleAction(detail.id, "dismissed")}
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}