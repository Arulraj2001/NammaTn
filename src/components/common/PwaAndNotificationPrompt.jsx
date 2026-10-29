'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Download, X, Check, ShieldAlert } from 'lucide-react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BOWJBajbZAmrHn-BWGcMUfj_BanHnC34wRU9k8IRfkITg-E399GVaQNqjuLqnZ1zqtqnhCXQRqahgM44MfXdQAU';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PwaAndNotificationPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPill, setShowInstallPill] = useState(false);
  const [showPushPill, setShowPushPill] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribedSuccess, setSubscribedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Register Service Worker cleanly
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[VizhiTN PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[VizhiTN PWA] Service Worker registration failed:', err);
        });
    }

    // 2. Check PWA Installability
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user dismissed install pill in the last 7 days
      const lastDismissed = localStorage.getItem('vizhi_install_dismissed');
      const isRecentlyDismissed = lastDismissed && Date.now() - Number(lastDismissed) < 7 * 86400 * 1000;
      if (!isRecentlyDismissed) {
        setShowInstallPill(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 3. Check Notification Permission
    if ('Notification' in window && 'PushManager' in window) {
      if (Notification.permission === 'default') {
        const lastPushDismissed = localStorage.getItem('vizhi_push_dismissed');
        const isRecentlyDismissed = lastPushDismissed && Date.now() - Number(lastPushDismissed) < 5 * 86400 * 1000;
        if (!isRecentlyDismissed && !showInstallPill) {
          // Delay showing notification prompt by 5 seconds to ensure clean first-contentful paint
          const timer = setTimeout(() => {
            setShowPushPill(true);
          }, 5000);
          return () => {
            clearTimeout(timer);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
          };
        }
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [showInstallPill]);

  // Handle Install App action
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallPill(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismissInstall = () => {
    setShowInstallPill(false);
    try {
      localStorage.setItem('vizhi_install_dismissed', String(Date.now()));
    } catch (_) {}
  };

  // Handle Web Push Enable action
  const handleEnablePush = async () => {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return;
    setIsSubscribing(true);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setShowPushPill(false);
        setIsSubscribing(false);
        try {
          localStorage.setItem('vizhi_push_dismissed', String(Date.now()));
        } catch (_) {}
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      // Send subscription to server
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, district: 'all' }),
      });

      if (res.ok) {
        setSubscribedSuccess(true);
        setTimeout(() => {
          setShowPushPill(false);
        }, 3000);
      }
    } catch (err) {
      console.warn('[WebPush] Subscription error:', err);
      setShowPushPill(false);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismissPush = () => {
    setShowPushPill(false);
    try {
      localStorage.setItem('vizhi_push_dismissed', String(Date.now()));
    } catch (_) {}
  };

  // Render PWA Install Prompt if available
  if (showInstallPill && deferredPrompt) {
    return (
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 max-w-[340px] bg-slate-900/95 dark:bg-slate-800/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/90 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Download className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-xs font-bold leading-tight">Install VizhiTN App</p>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Fast 1-tap access to Tamil Nadu power cuts & civic dispatches.
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-[11px] font-bold rounded-lg transition-all"
              >
                Install App
              </button>
              <button
                type="button"
                onClick={handleDismissInstall}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-1"
              >
                Not Now
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismissInstall}
            className="text-slate-400 hover:text-white p-1 rounded-md"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Render Web Push Alert Prompt if available
  if (showPushPill) {
    return (
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 max-w-[340px] bg-slate-900/95 dark:bg-slate-800/95 text-white p-3.5 rounded-2xl shadow-2xl border border-blue-500/30 backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/90 flex items-center justify-center flex-shrink-0 mt-0.5">
            {subscribedSuccess ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Bell className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0 pr-2">
            {subscribedSuccess ? (
              <>
                <p className="text-xs font-bold text-green-400">✓ Alerts Activated!</p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  You will receive urgent power cut and weather alerts.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-bold leading-tight">Live Civic & Rain Alerts</p>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  Get notified on power cut timings and collector announcements.
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleEnablePush}
                    disabled={isSubscribing}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-[11px] font-bold rounded-lg transition-all disabled:opacity-50"
                  >
                    {isSubscribing ? 'Enabling...' : 'Enable Alerts'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDismissPush}
                    className="text-[11px] text-slate-400 hover:text-white px-2 py-1"
                  >
                    Later
                  </button>
                </div>
              </>
            )}
          </div>
          {!subscribedSuccess && (
            <button
              type="button"
              onClick={handleDismissPush}
              className="text-slate-400 hover:text-white p-1 rounded-md"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}

