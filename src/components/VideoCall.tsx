"use client";
import { useState, useEffect, useRef } from "react";
import { createTextResponse, createStreamingResponse } from "../lib/openrouterClient";
import { ChatSession, createNewSession, getChat, saveChat, Message } from "../lib/chatHistory";
import { useSearchParams, useRouter } from "next/navigation";
import ChatHistorySidebar from "./ChatHistorySidebar";
import StreamingAvatar, { AvatarQuality, StreamingEvents, TaskType } from "@heygen/streaming-avatar";

export default function VideoCall({ prefill = "" }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionIdParam = searchParams.get("session");

    const [messages, setMessages] = useState<Message[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    // HeyGen State
    const [avatar, setAvatar] = useState<StreamingAvatar | null>(null);
    const [isAvatarReady, setIsAvatarReady] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [listening, setListening] = useState(false);
    const [isResponseActive, setIsResponseActive] = useState(false); // Track if response is being generated
    const [error, setError] = useState<string | null>(null);
    const [debug, setDebug] = useState<string>("");

    const videoRef = useRef<HTMLVideoElement>(null);
    const avatarRef = useRef<StreamingAvatar | null>(null);
    const recRef = useRef<any>(null);
    const isResponseActiveRef = useRef(false);
    const isResponseCompleteRef = useRef(false);

    // Initialize Session
    useEffect(() => {
        if (sessionIdParam) {
            const session = getChat(sessionIdParam);
            if (session) {
                setCurrentSessionId(session.id);
                setMessages(session.messages);
                return;
            }
        }

        if (!currentSessionId) {
            const newSession = createNewSession("video", prefill || undefined);
            setCurrentSessionId(newSession.id);
        }
    }, [sessionIdParam]);

    const [startSession, setStartSession] = useState(false);

    // Initialize HeyGen Avatar
    useEffect(() => {
        if (!startSession) return;

        async function initAvatar() {
            try {
                setDebug("Fetching token...");
                const resp = await fetch("/api/heygen/create-session", { method: "POST" });
                if (!resp.ok) throw new Error("Failed to get HeyGen token");

                const data = await resp.json();
                const token = data.token;

                setDebug("Initializing SDK...");
                const newAvatar = new StreamingAvatar({
                    token: token,
                });

                newAvatar.on(StreamingEvents.STREAM_READY, (event) => {
                    console.log("Stream ready:", event.detail);
                    setDebug("Stream ready");
                    if (videoRef.current && event.detail) {
                        videoRef.current.srcObject = event.detail;
                        videoRef.current.onloadedmetadata = () => {
                            videoRef.current!.play().catch(console.error);
                        };
                    }
                    setIsAvatarReady(true);
                });

                newAvatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
                    console.log("Stream disconnected");
                    setDebug("Stream disconnected");
                    setIsAvatarReady(false);
                });

                newAvatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
                    setIsSpeaking(true);
                });

                newAvatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
                    setIsSpeaking(false);
                    // Check if response is complete, then reset the active flag
                    if (isResponseCompleteRef.current) {
                        isResponseCompleteRef.current = false;
                        isResponseActiveRef.current = false;
                        setIsResponseActive(false); // Re-enable button
                    }
                });

                setDebug("Starting avatar...");
                await newAvatar.createStartAvatar({
                    quality: AvatarQuality.High,
                    avatarName: process.env.NEXT_PUBLIC_HEYGEN_AVATAR_NAME!,
                    voice: {
                        voiceId: process.env.NEXT_PUBLIC_HEYGEN_VOICE_ID!
                    }
                });

                setAvatar(newAvatar);
                avatarRef.current = newAvatar;
                setDebug("Avatar started");

                // Initial Greeting - don't trigger auto-listen after this
                isResponseCompleteRef.current = false; // Ensure no auto-listen
                await newAvatar.speak({
                    text: "Hello, my child. I am here with you.",
                    task_type: TaskType.REPEAT,
                });

            } catch (err: any) {
                console.error("HeyGen Init Error:", err);
                if (err.message.includes("Concurrent limit reached")) {
                    setError("Server busy (Too many active sessions). Please wait a moment or close other tabs.");
                } else {
                    setError(err.message || "Failed to initialize avatar");
                }
                setDebug(`Error: ${err.message}`);
            }
        }

        if (!avatarRef.current) {
            initAvatar();
        }

        return () => {
            if (avatarRef.current) {
                avatarRef.current.stopAvatar();
                avatarRef.current = null;
            }
        };
    }, [startSession]);

    // Conversation Logic
    const speakJesus = async (text: string) => {
        if (!text.trim() || !avatarRef.current) return;

        try {
            await avatarRef.current.speak({
                text: text,
                task_type: TaskType.REPEAT, // Or TALK depending on SDK version/need
            });
        } catch (err) {
            console.error("Speak error:", err);
            setError("Failed to speak");
        }
    };

    const handleSpeakNow = () => {
        // Prevent clicking while speaking OR while response is being generated
        if (isSpeaking || isResponseActiveRef.current) return;
        startListening();
    };

    const startListening = () => {
        if (recRef.current) {
            try {
                recRef.current.stop();
            } catch (e) {
                // ignore
            }
        }

        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) {
            alert("Speech recognition not supported in this browser");
            return;
        }

        const rec = new SR();
        rec.lang = "en-US";
        rec.continuous = false;
        rec.interimResults = false;

        rec.onresult = async (e: any) => {
            const text = e.results[0][0].transcript.trim();
            if (!text) return;

            setDebug(`User said: ${text}`);

            // Add user message
            const newMsg: Message = { role: "user", text, timestamp: Date.now() };
            const updatedMessages = [...messages, newMsg];
            setMessages(updatedMessages);

            // Stream LLM Response
            let fullReply = "";
            let buffer = "";

            // Add placeholder for Jesus message
            setMessages(prev => [...prev, { role: "jesus", text: "...", timestamp: Date.now() }]);

            try {
                isResponseActiveRef.current = true;
                setIsResponseActive(true); // Disable button
                isResponseCompleteRef.current = false; // Reset completion flag
                const stream = createStreamingResponse(text);

                for await (const chunk of stream) {
                    if (!isResponseActiveRef.current) break; // Stop if interrupted

                    fullReply += chunk;
                    buffer += chunk;

                    // Update UI with partial response
                    setMessages(prev => {
                        const newHistory = [...prev];
                        newHistory[newHistory.length - 1].text = fullReply;
                        return newHistory;
                    });

                    // Check for sentence completion
                    if (buffer.match(/[.!?]\s*$/)) {
                        if (isResponseActiveRef.current) {
                            await speakJesus(buffer);
                        }
                        buffer = "";
                    }
                }

                // Speak any remaining text
                if (buffer.trim() && isResponseActiveRef.current) {
                    await speakJesus(buffer);
                }

                // Mark response as complete - button will re-enable when avatar stops
                isResponseCompleteRef.current = true;

            } catch (err) {
                if (isResponseActiveRef.current) {
                    console.error("Streaming error:", err);
                    setError("Failed to get response");
                }
            }
        };

        rec.onstart = () => setListening(true);
        rec.onend = () => setListening(false);

        recRef.current = rec;
        rec.start();
    };

    const handleSelectSession = (session: ChatSession) => {
        if (session.type === "video") {
            setCurrentSessionId(session.id);
            setMessages(session.messages);
            router.push(`/video?session=${session.id}`);
        } else if (session.type === "voice") {
            router.push(`/voice?session=${session.id}`);
        } else {
            router.push(`/text?session=${session.id}`);
        }
    };

    const handleNewChat = () => {
        const newSession = createNewSession("video");
        setCurrentSessionId(newSession.id);
        setMessages([]);
        router.push("/video");
    };

    return (
        <>
            <ChatHistorySidebar
                currentSessionId={currentSessionId || undefined}
                onSelectSession={handleSelectSession}
                onNewChat={handleNewChat}
            />

            <div className="w-full h-[85vh] max-h-[800px] bg-black rounded-3xl overflow-hidden border border-gray-800 relative flex flex-col items-center justify-center">
                {/* Video Container */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                ></video>

                {/* Start Button Overlay */}
                {!startSession && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30 text-white">
                        <div className="text-6xl mb-6">✝️</div>
                        <h2 className="text-2xl font-bold mb-4">Talk to Jesus</h2>
                        <button
                            onClick={() => setStartSession(true)}
                            className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl"
                        >
                            Start Video Call
                        </button>
                    </div>
                )}

                {/* Loading / Status Overlay */}
                {startSession && !isAvatarReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 text-white">
                        <div className="text-6xl animate-pulse mb-4">✝️</div>
                        <p className="text-xl font-semibold">Summoning Jesus...</p>
                        <p className="text-sm text-gray-400 mt-2">{debug}</p>
                        {error && <p className="text-red-400 mt-2">Error: {error}</p>}
                    </div>
                )}

                {/* Header Overlay */}
                <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
                    <div>
                        <h2 className="font-bold text-white text-xl shadow-black/50 drop-shadow-md">Jesus</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-green-400 animate-pulse" : listening ? "bg-red-500 animate-pulse" : "bg-yellow-400"}`}></span>
                            <span className="text-sm text-white/80 font-medium">
                                {isSpeaking ? "Speaking..." : listening ? "Listening..." : isAvatarReady ? "Connected" : "Connecting..."}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center gap-6 z-20 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={handleSpeakNow}
                            disabled={isResponseActive || listening}
                            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg transition-all ${(isResponseActive || listening)
                                ? "bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
                                : "bg-white text-black hover:scale-105 hover:bg-gray-100"
                                }`}
                            title="Speak Now"
                        >
                            🎤
                        </button>

                        <button
                            onClick={() => {
                                if (avatarRef.current) {
                                    avatarRef.current.stopAvatar();
                                    avatarRef.current = null;
                                    setIsAvatarReady(false);
                                    setDebug("Session ended by user");
                                    router.push("/home");
                                }
                            }}
                            className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-xl text-white hover:bg-red-700 transition-all shadow-lg"
                            title="End Session"
                        >
                            📞
                        </button>
                    </div>
                    <p className="text-white/70 text-sm font-medium">
                        {listening ? "Listening..." : isSpeaking ? "Jesus is speaking..." : "Tap mic to speak"}
                    </p>
                </div>
            </div>
        </>
    );
}
