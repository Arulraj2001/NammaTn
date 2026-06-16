import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, EyeOff, RotateCcw, Trash2, Flag, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { updateReportStatus } from "@/services/admin/reports";

export default function ChatModerationPanel() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [channel, setChannel] = useState("all");

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-chat", channel],
    queryFn: async () => {
      if (channel === "all") return await base44.entities.LiveChatMessage.list("-created_date", 100);
      return await base44.entities.LiveChatMessage.filter({ channel }, "-created_date", 100);
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["admin-chat-reports"],
    queryFn: () => base44.entities.Report.filter({ target_type: "chat_message", status: "pending" }, "-created_date", 200),
    staleTime: 15_000,
  });

  const reportsByTarget = reports.reduce((acc, r) => {
    acc[r.target_id] = (acc[r.target_id] || 0) + 1;
    return acc;
  }, {});

  const hideMsg = async (id) => {
    await base44.entities.LiveChatMessage.update(id, { status: "hidden", hidden_by: "admin" });
    const related = reports.filter((r) => r.target_id === id);
    await Promise.all(related.map((r) => updateReportStatus(r.id, "reviewed", "hidden")));
    qc.invalidateQueries({ queryKey: ["admin-chat"] });
    qc.invalidateQueries({ queryKey: ["admin-chat-reports"] });
    toast({ description: "Message hidden." });
  };

  const restoreMsg = async (id) => {
    await base44.entities.LiveChatMessage.update(id, { status: "active", hidden_by: null });
    qc.invalidateQueries({ queryKey: ["admin-chat"] });
    toast({ description: "Message restored." });
  };

  const deleteMsg = async (id) => {
    await base44.entities.LiveChatMessage.update(id, { status: "removed" });
    qc.invalidateQueries({ queryKey: ["admin-chat"] });
    toast({ description: "Message deleted." });
  };

  const CHANNELS = ["all", "general", "nearby", "emergency"];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <MessageCircle className="w-4 h-4 text-blue-600" />
        <h3 className="font-semibold text-slate-900 text-sm">Live Chat Moderation</h3>
        {reports.length > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold ml-auto">
            {reports.length} reports
          </span>
        )}
      </div>

      {/* Channel filter */}
      <div className="flex gap-1 px-4 pt-3 pb-2 overflow-x-auto">
        {CHANNELS.map((ch) => (
          <button
            key={ch}
            onClick={() => setChannel(ch)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all capitalize",
              channel === ch ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {ch}
          </button>
        ))}
      </div>

      <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading messages…</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No messages found</p>
          </div>
        ) : (
          messages.map((m) => {
            const reportCount = reportsByTarget[m.id] || 0;
            const isHidden = m.status === "hidden" || m.status === "removed";
            return (
              <div key={m.id} className={`px-4 py-3 ${isHidden ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 break-words">{m.content}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded font-medium",
                        m.status === "active" ? "bg-green-50 text-green-700" :
                        m.status === "hidden" ? "bg-red-50 text-red-600" :
                        "bg-slate-100 text-slate-400"
                      )}>
                        {m.status}
                      </span>
                      <span className="text-xs text-slate-400">{m.channel} · {m.author_label}</span>
                      {reportCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <Flag className="w-3 h-3" /> {reportCount}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 ml-auto">
                        {m.created_date ? formatDistanceToNow(new Date(m.created_date), { addSuffix: true }) : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {m.status === "active" && (
                      <button onClick={() => hideMsg(m.id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg" title="Hide">
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {m.status === "hidden" && (
                      <button onClick={() => restoreMsg(m.id)} className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg" title="Restore">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {m.status !== "removed" && (
                      <button onClick={() => { if (window.confirm("Delete permanently?")) deleteMsg(m.id); }} className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}