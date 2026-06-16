import React from "react";
import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export default function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  if (isOnline) return null;
  return (
    <div className="fixed top-16 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-amber-500 text-white text-sm font-medium py-2 px-4 shadow-md">
      <WifiOff className="w-4 h-4 flex-shrink-0" />
      <span>You're offline. Some features may not work.</span>
    </div>
  );
}