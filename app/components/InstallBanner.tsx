"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or installed
    const wasDismissed = localStorage.getItem("pwa-banner-dismissed");
    if (wasDismissed) return;

    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Detect iOS
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);
    if (isIOS && isSafari) {
      setShowIOS(true);
      return;
    }

    // Detect Android / Chrome — listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroid(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowAndroid(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-banner-dismissed", "true");
    setShowAndroid(false);
    setShowIOS(false);
    setDismissed(true);
  };

  if (dismissed) return null;

  // Android banner
  if (showAndroid) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-900 border-t border-slate-700 shadow-2xl">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">EV</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Install EVMapFinder</p>
            <p className="text-slate-400 text-xs">Add to home screen for instant access</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-slate-400 text-sm hover:text-white transition-colors"
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Install
            </button>
          </div>
        </div>
      </div>
    );
  }

  // iOS banner
  if (showIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-900 border-t border-slate-700 shadow-2xl">
        <div className="max-w-lg mx-auto">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">EV</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Install EVMapFinder</p>
              <p className="text-slate-400 text-xs mt-1">
                Tap{" "}
                <span className="inline-block text-white font-bold">⬆️</span>
                {" "}Share, then{" "}
                <span className="text-emerald-400 font-semibold">"Add to Home Screen"</span>
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white text-xl leading-none flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
