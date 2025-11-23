import { Suspense } from "react";
import VideoCall from "@/components/VideoCall";
import HomeButton from "@/components/HomeButton";

export default function VideoPage() {
    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-black p-4 relative overflow-hidden">
            <HomeButton />

            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 opacity-50">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20"></div>
            </div>

            <div className="w-full max-w-5xl mx-auto z-10 relative">
                <Suspense fallback={<div className="text-white text-center">Connecting to divine presence...</div>}>
                    <VideoCall />
                </Suspense>
            </div>
        </main>
    );
}