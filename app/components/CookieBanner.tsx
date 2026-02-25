"use client";

import { useEffect, useState } from "react";

export const CONSENT_KEY = "evmf_cookie_consent_v1";
export type ConsentValue = "accepted" | "rejected";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem(CONSENT_KEY);
    if (!existing) setShow(true);
  }, []);

  function setConsent(value: ConsentValue) {
    localStorage.setItem(CONSENT_KEY, value);
    setShow(false);
    window.dispatchEvent(
      new CustomEvent("evmf-cookie-consent", { detail: value })
    );
  }

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 9999,
        maxWidth: 920,
        margin: "0 auto",
        background: "rgba(15, 15, 15, 0.95)",
        color: "white",
        padding: 16,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 360px" }}>
          <div style={{ fontWeight: 700 }}>Cookies</div>
          <div style={{ marginTop: 6, opacity: 0.9, lineHeight: 1.4 }}>
            We use cookies for analytics and advertising. You can accept or
            reject. Read our{" "}
            <a
              href="/privacy"
              style={{ color: "white", textDecoration: "underline" }}
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="/terms"
              style={{ color: "white", textDecoration: "underline" }}
            >
              Terms of Use
            </a>
            .
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => setConsent("rejected")}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            Reject
          </button>
          <button
            onClick={() => setConsent("accepted")}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              background: "white",
              color: "black",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}