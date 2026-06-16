import React from "react";
import { ShieldAlert, Phone, CreditCard, Mail, AlertTriangle } from "lucide-react";

const TYPE_META = {
  phone: { icon: Phone, label: "Phone Number", desc: "Personal phone numbers should not be public" },
  aadhaar: { icon: CreditCard, label: "Aadhaar-like Pattern", desc: "12-digit number resembling Aadhaar ID" },
  pan: { icon: CreditCard, label: "PAN-like Pattern", desc: "Pattern resembling PAN card number" },
  email_in_text: { icon: Mail, label: "Email Address", desc: "Personal email address in content" },
};

/**
 * Shows warnings when sensitive data patterns are detected.
 * Props: findings (array of {type, count})
 */
export default function SensitiveDataWarning({ findings = [], onDismiss }) {
  if (!findings || findings.length === 0) return null;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-purple-600 flex-shrink-0" />
        <span className="text-sm font-semibold text-purple-800">Sensitive Data Warning</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-auto text-xs text-purple-600 hover:text-purple-800 underline"
          >
            Dismiss
          </button>
        )}
      </div>

      <p className="text-xs text-purple-700 leading-relaxed">
        This content may contain personally identifiable information. Review before approving.
      </p>

      <ul className="space-y-2">
        {findings.map((finding) => {
          const meta = TYPE_META[finding.type] || { icon: AlertTriangle, label: finding.type, desc: "" };
          const Icon = meta.icon;
          return (
            <li key={finding.type} className="flex items-start gap-2.5">
              <Icon className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-purple-800">
                  {meta.label}
                  {finding.count > 1 && <span className="ml-1 text-purple-500">×{finding.count}</span>}
                </p>
                <p className="text-xs text-purple-600">{meta.desc}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}