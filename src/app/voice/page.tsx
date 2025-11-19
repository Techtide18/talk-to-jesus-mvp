"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import VoiceCall from "../../components/VoiceCall";
import { isLoggedIn } from "../../lib/auth";
import "../home/home.css";

export default function VoicePage() {
  const params = useSearchParams();
  const router = useRouter();
  const [prefill, setPrefill] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) router.push("/");

    const p = params.get("prefill");
    if (p) setPrefill(p);
  }, [params, router]);

  return (
    <div className="page-wrap fade-in min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* White-out Entrance Animation */}
      <div className="heaven-entrance"></div>

      {/* Heaven Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/heaven_bg.png')] bg-cover bg-center bg-no-repeat opacity-100"></div>
        {/* Soft Overlay */}
        <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/20 via-transparent to-white/40"></div>
      </div>

      {/* Angelic Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Divine Light Source */}
        <div
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] blur-3xl opacity-60 animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, rgba(255,255,220,0.5) 0%, transparent 70%)' }}
        ></div>

        {/* Bottom Fog */}
        <div className="heaven-fog fog-1"></div>
        <div className="heaven-fog fog-2"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.8)_1px,_transparent_1px)] bg-[length:40px_40px] opacity-30 animate-float"></div>
      </div>

      <div className="w-full max-w-4xl mx-auto z-10 relative">
        <VoiceCall prefill={prefill} />
      </div>
    </div>
  );
}
