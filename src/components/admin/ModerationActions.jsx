import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Trash2, Flag } from "lucide-react";

export default function ModerationActions({ onApprove, onReject, onDelete, onFlag, onRemove, showFlag = false }) {
  const [dialog, setDialog] = useState(null); // {type, note}

  const actions = [
    { type: "approve", label: "Approve", icon: CheckCircle, variant: "default", color: "bg-green-600 hover:bg-green-700 text-white" },
    { type: "reject", label: "Reject", icon: XCircle, variant: "outline", color: "border-orange-300 text-orange-600 hover:bg-orange-50" },
    ...(showFlag ? [{ type: "flag", label: "Flag", icon: Flag, color: "border-yellow-300 text-yellow-600 hover:bg-yellow-50" }] : []),
    { type: "delete", label: "Delete", icon: Trash2, color: "border-red-300 text-red-600 hover:bg-red-50" },
    ...(onRemove ? [{ type: "remove", label: "Remove", icon: Trash2, color: "bg-red-600 hover:bg-red-700 text-white border-transparent" }] : []),
  ];

  const handleConfirm = () => {
    if (!dialog) return;
    const note = dialog.note;
    if (dialog.type === "approve") onApprove?.(note);
    if (dialog.type === "reject") onReject?.(note);
    if (dialog.type === "delete") onDelete?.(note);
    if (dialog.type === "flag") onFlag?.(note);
    if (dialog.type === "remove") onRemove?.(note);
    setDialog(null);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.type}
              onClick={() => setDialog({ type: a.type, note: "" })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${a.color}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {a.label}
            </button>
          );
        })}
      </div>

      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">
              {dialog?.type === "remove" ? "Remove from List & DB (Permanent)" : `${dialog?.type} — Add a note (optional)`}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Moderation note..."
            value={dialog?.note || ""}
            onChange={(e) => setDialog((d) => ({ ...d, note: e.target.value }))}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={handleConfirm} className={dialog?.type === "delete" || dialog?.type === "remove" ? "bg-red-600 hover:bg-red-700" : ""}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}