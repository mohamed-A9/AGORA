"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BusinessCheckinPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastToken, setLastToken] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState("");

  async function submitToken(token: string) {
    const t = token.trim();
    if (!t) return;

    if (lastToken === t) return;
    setLastToken(t);

    setBusy(true);
    setMsg(null);

    const res = await fetch("/api/business/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: t }),
    });

    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      setMsg(`❌ ${data?.error || "Erreur check-in"}`);
      return;
    }

    setMsg(`✅ CHECKED_IN OK — ${data?.venueName || ""}`);
  }

  useEffect(() => {
    let active = true;

    async function start() {
      try {
        setMsg(null);
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        await reader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          videoRef.current!,
          async (result, _err) => {
            if (!active) return;
            if (result?.getText && !busy) {
              await submitToken(result.getText());
            }
          }
        );
      } catch {
        setMsg("❌ Caméra non disponible. Autorise la permission caméra (et HTTPS sur mobile).");
      }
    }

    const t = setTimeout(() => {
      if (videoRef.current) start();
      else setMsg("Caméra non prête… recharge la page.");
    }, 150);

    return () => {
      active = false;
      clearTimeout(t);
      try {
        readerRef.current?.reset();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-extrabold text-white">Scan Check-in</h1>
      <p className="text-white/60 mt-2">
        Scanne le QR du client. Seul le BUSINESS propriétaire du lieu peut valider.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-white/70 text-sm mb-3">Caméra</div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <video ref={videoRef} className="w-full h-[360px] object-cover" muted playsInline />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-[70%] h-[60%] border-2 border-white/60 rounded-2xl" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-white/70 text-sm">Fallback manuel</div>

          <textarea
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            className="mt-3 w-full min-h-[180px] rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            placeholder="Colle le token..."
          />

          <button
            disabled={busy || !manualToken.trim()}
            onClick={() => submitToken(manualToken)}
            className="mt-3 rounded-2xl bg-white text-black px-5 py-3 font-semibold disabled:opacity-60"
          >
            {busy ? "Vérification..." : "Valider check-in"}
          </button>

          {msg && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white/80">
              {msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
