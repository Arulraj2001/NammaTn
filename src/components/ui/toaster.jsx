import React, { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <ToastWithTimeout key={id} id={id} dismiss={dismiss} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose onClick={() => dismiss(id)} />
          </ToastWithTimeout>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

function ToastWithTimeout({ id, dismiss, children, ...props }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      dismiss(id);
    }, 5000); // Auto-dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [id, dismiss]);

  return <Toast {...props}>{children}</Toast>;
} 