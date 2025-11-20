"use client";

import { useRouter } from "next/navigation";

export default function HomeButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push("/home")}
            className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-gray-200 shadow-md flex items-center justify-center text-lg hover:bg-white hover:scale-110 transition-all duration-300 group"
            title="Back to Home"
        >
            <span className="group-hover:-translate-x-0.5 transition-transform">🏠</span>
        </button>
    );
}
