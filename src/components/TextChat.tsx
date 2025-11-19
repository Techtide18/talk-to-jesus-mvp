"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createTextResponse } from "../lib/openrouterClient";

export default function TextChat() {
  const searchParams = useSearchParams();
  const prefill = searchParams.get("prefill") || "";

  const [messages, setMessages] = useState([
    {
      role: "jesus",
      text: "Peace be with you, my child. I am here to listen.",
    },
  ]);

  const [input, setInput] = useState(prefill);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep input updated when page loads with prefill
  useEffect(() => {
    if (prefill) setInput(prefill);
  }, [prefill]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;
    setInput("");

    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    // Scroll to bottom immediately after user sends
    setTimeout(scrollToBottom, 50);

    try {
      const reply = await createTextResponse(
        text,
        messages.map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text,
        }))
      );

      setMessages((prev) => [...prev, { role: "jesus", text: reply }]);
    } catch (error) {
      console.error("Error getting response:", error);
      setMessages((prev) => [
        ...prev,
        { role: "jesus", text: "My child, I cannot hear you clearly right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <section className="flex flex-col h-[85vh] max-h-[800px] w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b border-gray-100 bg-white/50 backdrop-blur-md z-10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center text-xl shadow-sm border border-yellow-200">
          ✝️
        </div>
        <div>
          <h2 className="font-bold text-gray-800 text-lg leading-tight">Jesus</h2>
          <p className="text-xs text-yellow-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Always Online and Listening
          </p>
        </div>
      </header>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-transparent to-gray-50/50"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex max-w-[80%] md:max-w-[70%] gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm shadow-sm border ${m.role === "user"
                ? "bg-blue-100 border-blue-200"
                : "bg-yellow-50 border-yellow-200"
                }`}>
                {m.role === "user" ? "👤" : "🕊️"}
              </div>

              {/* Bubble */}
              <div
                className={`px-5 py-3.5 rounded-2xl shadow-sm text-[0.95rem] leading-relaxed ${m.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-sm"
                  : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm font-serif"
                  }`}
              >
                {m.text}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex w-full justify-start">
            <div className="flex max-w-[80%] gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center text-sm shadow-sm">
                🕊️
              </div>
              <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-3 items-end bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-100 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-2.5 px-2 text-gray-700 placeholder-gray-400"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Messages are private and guided by divine wisdom.
        </p>
      </div>
    </section>
  );
}
