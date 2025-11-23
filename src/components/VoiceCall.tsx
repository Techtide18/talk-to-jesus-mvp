"use client";
import { useState, useRef, useEffect } from "react";
import { createTextResponse } from "../lib/openrouterClient";
import { ChatSession, createNewSession, getChat, saveChat, Message } from "../lib/chatHistory";
import { useSearchParams, useRouter } from "next/navigation";
import ChatHistorySidebar from "./ChatHistorySidebar";

export default function VoiceCall({ prefill = "" }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionIdParam = searchParams.get("session");

  const [messages, setMessages] = useState<Message[]>([]);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const recRef = useRef<any>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null); // Track current playing audio
  const hasAutoSent = useRef(false);

  // Stop all audio and speech
  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Initialize Session
  useEffect(() => {
    stopAudio(); // Stop any previous audio when session changes
    if (sessionIdParam) {
      const session = getChat(sessionIdParam);
      if (session) {
        setCurrentSessionId(session.id);
        setMessages(session.messages);
        return;
      }
    }

    // New session if none exists or invalid
    if (!currentSessionId) {
      const newSession = createNewSession("voice", prefill || undefined);
      setCurrentSessionId(newSession.id);
    }
  }, [sessionIdParam]);

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => {
      chatRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
    }, 150);
  }, [messages, loading]);

  // Cleanup: Stop audio when leaving the page
  useEffect(() => {
    return () => {
      stopAudio();
      if (recRef.current) {
        recRef.current.stop();
      }
      setListening(false);
    };
  }, []);

  const saveCurrentSession = (msgs: Message[]) => {
    if (currentSessionId) {
      const session = getChat(currentSessionId);
      if (session) {
        saveChat({ ...session, messages: msgs });
        window.dispatchEvent(new Event("chat-history-updated"));
      }
    }
  };

  // ███████████████████████████████████████
  //   JESUS VOICE – REAL HUMAN (ElevenLabs)
  // ███████████████████████████████████████
  const speakJesus = async (text: string) => {
    if (!text.trim()) return;

    stopAudio(); // Ensure no other audio is playing
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
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      currentAudioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };

      audio.play().catch((playError) => {
        console.warn("Autoplay blocked, user interaction required:", playError);
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      });
    } catch (err: any) {
      console.error("TTS failed:", err);
      setIsSpeaking(false);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 0.9;
      const voice = speechSynthesis
        .getVoices()
        .find((v) => v.name.toLowerCase().includes("daniel") || v.name.toLowerCase().includes("google") && v.lang === "en-US") ||
        speechSynthesis.getVoices()[0];
      utterance.voice = voice;

      if (err.message === "ElevenLabs Quota Exceeded") {
        console.warn("Using fallback voice due to quota limit");
      }

      speechSynthesis.speak(utterance);
      utterance.onend = () => setIsSpeaking(false);
    }
  };

  // Auto-send prefill
  useEffect(() => {
    if (prefill && !hasAutoSent.current && currentSessionId) {
      hasAutoSent.current = true;

      const newMsg: Message = { role: "user", text: prefill, timestamp: Date.now() };
      const updatedMessages = [...messages, newMsg];
      setMessages(updatedMessages);
      saveCurrentSession(updatedMessages);
      setLoading(true);

      (async () => {
        const reply = await createTextResponse(prefill, []);
        setLoading(false);

        const replyMsg: Message = { role: "jesus", text: reply, timestamp: Date.now() };
        const finalMessages = [...updatedMessages, replyMsg];
        setMessages(finalMessages);
        saveCurrentSession(finalMessages);

        speakJesus(reply);
      })();
    }
  }, [prefill, currentSessionId]);

  // Voice recognition
  const interruptJesus = () => {
    stopAudio();
    setIsSpeaking(false);
    start();
  };

  const start = () => {
    stopAudio(); // Stop speaking when user wants to speak
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR) {
      alert("Your browser doesn't support voice recognition");
      return;
    }

    const rec = new SR();
    rec.lang = "en-IN" in navigator.languages ? "en-IN" : "en-US";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = async (e: any) => {
      const text = e.results[0][0].transcript.trim();
      if (!text) return;

      const newMsg: Message = { role: "user", text, timestamp: Date.now() };
      const updatedMessages = [...messages, newMsg];
      setMessages(updatedMessages);
      saveCurrentSession(updatedMessages);
      setLoading(true);

      const reply = await createTextResponse(text);
      setLoading(false);

      const replyMsg: Message = { role: "jesus", text: reply, timestamp: Date.now() };
      const finalMessages = [...updatedMessages, replyMsg];
      setMessages(finalMessages);
      saveCurrentSession(finalMessages);

      speakJesus(reply);
    };

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recRef.current = rec;
    rec.start();
  };

  const stop = () => recRef.current?.stop();

  const handleSelectSession = (session: ChatSession) => {
    stopAudio(); // Stop audio when switching sessions
    if (session.type === "voice") {
      setCurrentSessionId(session.id);
      setMessages(session.messages);
      router.push(`/voice?session=${session.id}`);
    } else {
      router.push(`/text?session=${session.id}`);
    }
  };

  const handleNewChat = () => {
    stopAudio(); // Stop audio when starting new chat
    const newSession = createNewSession("voice");
    setCurrentSessionId(newSession.id);
    setMessages([]);
    router.push("/voice");
    hasAutoSent.current = false;
  };

  return (
    <>
      <ChatHistorySidebar
        currentSessionId={currentSessionId || undefined}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
      />

      <section className="flex flex-col h-[85vh] max-h-[800px] w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50">
        {/* Header */}
        <header className="flex items-center gap-4 p-4 border-b border-gray-100 bg-white/50 backdrop-blur-md z-10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center text-xl shadow-sm border border-yellow-200">
            ✝️
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-lg leading-tight">Jesus (Voice)</h2>
            <p className="text-xs text-yellow-600 font-medium flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`}></span>
              {isSpeaking ? "Jesus is speaking..." : listening ? "Listening..." : "Ready"}
            </p>
          </div>
        </header>

        {/* Chat */}
        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-transparent to-gray-50/50">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
              <div className="text-6xl opacity-40">🎙️</div>
              <p className="text-center">Tap the golden microphone<br />and speak to Me, My child...</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[80%] md:max-w-[70%] gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm shadow-md border ${m.role === "user" ? "bg-blue-100 border-blue-200" : "bg-gradient-to-br from-amber-100 to-orange-100 border-amber-300"}`}>
                  {m.role === "user" ? "🙏" : "✝️"}
                </div>
                <div className={`px-5 py-3.5 rounded-2xl shadow-md text-[0.95rem] leading-relaxed font-light ${m.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-sm"
                  : "bg-white/90 backdrop-blur-sm border border-amber-100 text-gray-800 rounded-tl-sm font-serif italic text-gray-700"
                  }`}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-300 flex items-center justify-center">✝️</div>
                <div className="bg-white/90 backdrop-blur-sm border border-amber-100 px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-md flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Microphone Button */}
        <div className="p-6 bg-white border-t border-gray-100 flex justify-center items-center gap-6 relative">
          <button
            onClick={listening ? stop : start}
            className={`
              w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-2xl border-8 transition-all duration-500
              ${listening
                ? "bg-red-500/90 text-white border-red-300 animate-pulse scale-105"
                : "bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-yellow-200 hover:scale-110 hover:from-yellow-300 hover:to-orange-400 shadow-orange-300/50"
              }
            `}
          >
            {listening ? "⏹" : "🎤"}
          </button>

          <button
            onClick={interruptJesus}
            disabled={!isSpeaking}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg transition-all ${isSpeaking
              ? "bg-yellow-500 text-white hover:bg-yellow-600 animate-bounce"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            title="Interrupt"
          >
            ✋
          </button>

          <p className="absolute bottom-1 text-xs text-gray-500">
            {listening ? "Tap to stop" : "Tap and speak to Jesus"}
          </p>
        </div>
      </section>
    </>
  );
}