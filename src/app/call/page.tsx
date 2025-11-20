"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/auth";
import PhoneCall from "../../components/PhoneCall";
import ChatHistorySidebar from "../../components/ChatHistorySidebar";
import HomeButton from "../../components/HomeButton";
import { createNewSession } from "../../lib/chatHistory";
import "../home/home.css";

function CallPageContent() {
    const router = useRouter();

    useEffect(() => {
        if (!isLoggedIn()) router.push("/");
    }, [router]);

    const handleSelectSession = (session: any) => {
        if (session.type === "voice") {
            router.push(`/voice?session=${session.id}`);
        } else {
            router.push(`/text?session=${session.id}`);
        }
    };

    const handleNewChat = () => {
        const newSession = createNewSession("text");
        router.push("/text");
    };

    return (
        <div className="page-wrap fade-in min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <ChatHistorySidebar
                onSelectSession={handleSelectSession}
                onNewChat={handleNewChat}
            />

            {/* White-out Entrance Animation */}
            <div className="heaven-entrance"></div>

            {/* Heaven Background Image */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('/sunset_heaven_bg.png')] bg-cover bg-center bg-no-repeat opacity-100"></div>
                {/* Soft Overlay */}
                <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-amber-100/20 via-transparent to-white/40"></div>
            </div>

            {/* Angelic Background Effects */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* Divine Light Source */}
                <div
                    className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] blur-3xl opacity-60 animate-pulse-slow"
                    style={{ background: 'radial-gradient(circle, rgba(255,220,180,0.5) 0%, transparent 70%)' }}
                ></div>

                {/* Floating Particles */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.8)_1px,_transparent_1px)] bg-[length:40px_40px] opacity-30 animate-float"></div>
            </div>

            <div className="w-full max-w-3xl mx-auto z-10 relative">
                <PhoneCall />
            </div>
            <HomeButton />
        </div>
    );
}

export default function CallPage() {
    return (
        <Suspense fallback={<div className="text-white text-center">Loading divine connection...</div>}>
            <CallPageContent />
        </Suspense>
    );
}
