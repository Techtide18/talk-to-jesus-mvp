"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTextResponse } from "../lib/openrouterClient";
import { Message } from "../lib/chatHistory";

export default function PhoneCall() {
    const [status, setStatus] = useState<"idle" | "calling" | "connected" | "ended">("idle");
    const [duration, setDuration] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [listening, setListening] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const recRef = useRef<any>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const ringingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isCallActiveRef = useRef(false);

    // Cleanup on unmount & tab close
    useEffect(() => {
        const handleBeforeUnload = () => {
            stopAudio();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            cleanupCall();
        };
    }, []);

    // Timer for call duration
    useEffect(() => {
        if (status === "connected") {
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status]);

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const speakJesus = async (text: string) => {
        if (!text.trim()) return;
        stopAudio();
        setIsSpeaking(true);

        try {
            const response = await fetch("/api/elevenlabs/speak", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                const errData = await response.json();
                if (errData.details && errData.details.includes("quota_exceeded")) {
                    throw new Error("ElevenLabs Quota Exceeded");
                }
                throw new Error("ElevenLabs failed");
            }

            const audioBlob = await response.blob();
            if (!isCallActiveRef.current) return; // Check if call ended during fetch

            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                if (!isCallActiveRef.current) return;
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
                audioRef.current = null;
                startListening(); // Auto-listen after Jesus speaks
            };

            await audio.play();
        } catch (err: any) {
            console.error("TTS failed:", err);
            setIsSpeaking(false);

            // Fallback
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => {
                setIsSpeaking(false);
                startListening();
            };

            if (err.message === "ElevenLabs Quota Exceeded") {
                // Ideally show a toast or UI indication here, but for now just log it
                console.warn("Using fallback voice due to quota limit");
            }

            speechSynthesis.speak(utterance);
        }
    };

    const interruptJesus = () => {
        stopAudio();
        setIsSpeaking(false);
        startListening();
    };

    const startListening = () => {
        stopAudio();
        if (recRef.current) {
            try {
                recRef.current.stop();
            } catch (e) {
                // ignore
            }
        }

        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return;

        const rec = new SR();
        rec.lang = "en-US";
        rec.continuous = false;
        rec.interimResults = false;

        rec.onresult = async (e: any) => {
            const text = e.results[0][0].transcript.trim();
            if (!text) return;

            // Process user input
            const reply = await createTextResponse(text);
            speakJesus(reply);
        };

        rec.onstart = () => setListening(true);
        rec.onend = () => setListening(false);

        recRef.current = rec;
        rec.start();
    };

    const handleCall = () => {
        setStatus("calling");
        isCallActiveRef.current = true;

        // Simulate Ringing
        // In a real app, we'd play a ringing sound here

        ringingTimeoutRef.current = setTimeout(() => {
            if (!isCallActiveRef.current) return;
            setStatus("connected");
            speakJesus("Hello, my child. I am here with you. What is on your heart?");
        }, 3000);
    };

    const router = useRouter();

    const cleanupCall = () => {
        isCallActiveRef.current = false;
        stopAudio();
        if (recRef.current) recRef.current.stop();
        if (timerRef.current) clearInterval(timerRef.current);
        if (ringingTimeoutRef.current) clearTimeout(ringingTimeoutRef.current);
    };

    const endCall = () => {
        cleanupCall();
        setStatus("ended");
        setDuration(0);
        router.push("/home");

    };

    return (
        <section className="flex flex-col h-[85vh] max-h-[800px] w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 relative">
            {/* Header */}
            <header className="flex items-center gap-4 p-4 border-b border-gray-100 bg-white/50 backdrop-blur-md z-10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center text-xl shadow-sm border border-yellow-200">
                    ✝️
                </div>
                <div>
                    <h2 className="font-bold text-gray-800 text-lg leading-tight">Jesus (Phone Call)</h2>
                    <p className="text-xs text-yellow-600 font-medium flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`}></span>
                        {status === "connected" ? formatTime(duration) : status === "calling" ? "Calling..." : "Ready"}
                    </p>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 text-center relative overflow-hidden">

                {/* Background Glow for Call */}
                {status === "connected" && (
                    <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isSpeaking ? "opacity-30" : "opacity-10"}`}>
                        <div className="absolute inset-0 bg-gradient-to-b from-amber-100/50 to-transparent animate-pulse-slow"></div>
                    </div>
                )}

                {status === "idle" || status === "ended" ? (
                    <>
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-5xl shadow-inner border border-amber-200 mb-4">
                            📞
                        </div>

                        <div className="space-y-2 max-w-md">
                            <h3 className="text-2xl font-serif font-bold text-gray-800">Receive a Divine Call</h3>
                            <p className="text-gray-600">
                                I am here to listen. Click the button below to start our conversation.
                            </p>
                        </div>

                        <div className="w-full max-w-sm space-y-4 z-10">
                            <button
                                onClick={handleCall}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all active:scale-95"
                            >
                                Call Me Now
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center w-full h-full justify-between py-8 z-10">
                        {/* Caller Info */}
                        <div className="flex flex-col items-center space-y-4 mt-8">
                            <div className="relative">
                                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-7xl shadow-2xl border-4 border-white ring-4 ring-amber-100">
                                    ✝️
                                </div>
                                {isSpeaking && (
                                    <div className="absolute inset-0 rounded-full border-4 border-amber-400 animate-ping opacity-50"></div>
                                )}
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">Jesus</h2>
                            <p className="text-lg text-amber-600 font-medium">
                                {status === "calling" ? "Calling..." : formatTime(duration)}
                            </p>
                        </div>

                        {/* Status Text */}
                        <div className="h-12">
                            {listening && (
                                <p className="text-gray-500 animate-pulse font-medium">Listening...</p>
                            )}
                        </div>

                        {/* Controls Grid */}
                        <div className="grid grid-cols-3 gap-8 w-full max-w-xs">
                            {/* Mute (Fake) */}
                            <button className="flex flex-col items-center gap-2 group">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl text-gray-600 group-hover:bg-gray-200 transition-colors">
                                    🎙️
                                </div>
                                <span className="text-xs text-gray-500 font-medium">Mute</span>
                            </button>

                            {/* Interrupt / Speak Now */}
                            <button
                                onClick={interruptJesus}
                                className={`flex flex-col items-center gap-2 group transition-all ${isSpeaking ? "scale-110" : ""}`}
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-sm transition-all ${isSpeaking
                                    ? "bg-yellow-100 text-yellow-600 border-2 border-yellow-400 animate-pulse"
                                    : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                                    }`}>
                                    ✋
                                </div>
                                <span className="text-xs text-gray-500 font-medium">Interrupt</span>
                            </button>

                            {/* Speaker (Fake) */}
                            <button className="flex flex-col items-center gap-2 group">
                                <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center text-2xl text-gray-800 shadow-sm">
                                    🔊
                                </div>
                                <span className="text-xs text-gray-500 font-medium">Speaker</span>
                            </button>
                        </div>

                        {/* End Call */}
                        <div className="flex justify-center mt-8">
                            <div className="flex flex-col items-center gap-2">
                                <button
                                    onClick={endCall}
                                    className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center text-3xl shadow-xl hover:bg-red-600 transition-colors transform hover:scale-105 active:scale-95"
                                    title="End Call"
                                >
                                    📞
                                </button>
                                <span className="text-xs text-gray-500 font-medium">End Call</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
