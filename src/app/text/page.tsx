"use client";
import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/auth";
import TextChat from "../../components/TextChat";
import HomeButton from "../../components/HomeButton";
import "../home/home.css";

export default function TextPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) router.push("/");
  }, [router]);

  return (
    <div className="page-wrap fade-in min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* White-out Entrance Animation */}
      <div className="heaven-entrance"></div>

      {/* Church Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/olive_garden_bg.png')] bg-cover bg-center bg-no-repeat opacity-100"></div>
        {/* Overlay for readability - Warm/Darker to make text pop */}
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
      </div>

      {/* Angelic Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Divine Light Source - Made stronger and golden */}
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] blur-3xl opacity-80 animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, rgba(255,223,128,0.4) 0%, transparent 70%)' }}
        ></div>

        {/* Stained Glass Light Reflections */}
        <div className="stained-glass left"></div>
        <div className="stained-glass right"></div>

        {/* Floating Particles/Sparkles (CSS only) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.6)_1px,_transparent_1px)] bg-[length:30px_30px] opacity-40 animate-float"></div>
      </div>
      <div className="w-full max-w-3xl mx-auto z-10 relative">
        <Suspense fallback={<div className="text-white text-center">Loading divine connection...</div>}>
          <TextChat />
        </Suspense>
      </div>
      <HomeButton />
    </div>
  );
}
