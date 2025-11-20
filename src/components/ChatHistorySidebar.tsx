"use client";

import { useEffect, useState } from "react";
import { ChatSession, getChats, deleteChat } from "../lib/chatHistory";
import { useRouter } from "next/navigation";

interface ChatHistorySidebarProps {
    currentSessionId?: string;
    onSelectSession: (session: ChatSession) => void;
    onNewChat: () => void;
}

export default function ChatHistorySidebar({ currentSessionId, onSelectSession, onNewChat }: ChatHistorySidebarProps) {
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const loadChats = () => {
        setChats(getChats());
    };

    useEffect(() => {
        loadChats();
        // Listen for storage events to update across tabs/components
        window.addEventListener("storage", loadChats);
        // Custom event for local updates
        window.addEventListener("chat-history-updated", loadChats);

        return () => {
            window.removeEventListener("storage", loadChats);
            window.removeEventListener("chat-history-updated", loadChats);
        };
    }, []);

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Delete this conversation?")) {
            deleteChat(id);
            loadChats();
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed right-0 top-1/2 transform -translate-y-1/2 z-50 bg-white/80 backdrop-blur-md p-3 rounded-l-xl shadow-lg border border-gray-200 transition-all duration-300 ${isOpen ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}`}
            >
                <span className="text-xl">📜 Past Conversations</span>
            </button>

            {/* Sidebar */}
            <div className={`fixed right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out z-50 border-l border-amber-100 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="p-4 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif text-xl text-gray-800 font-bold flex items-center gap-2">
                            <span>📜</span> Past Conversations
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                            ✕
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            onNewChat();
                            setIsOpen(false);
                        }}
                        className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all mb-4 flex items-center justify-center gap-2"
                    >
                        <span>✨</span> New Conversation
                    </button>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {chats.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm mt-10 italic">No past conversations yet.</p>
                        ) : (
                            chats.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => {
                                        onSelectSession(chat);
                                        setIsOpen(false);
                                    }}
                                    className={`p-3 rounded-xl cursor-pointer border transition-all group relative ${currentSessionId === chat.id
                                        ? "bg-amber-50 border-amber-200 shadow-sm"
                                        : "bg-white border-gray-100 hover:border-amber-200 hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase font-bold tracking-wider">
                                                {chat.type === "text" ? "💬" : "🎙️"}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(chat.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(e, chat.id)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity p-1"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    <h4 className="text-sm font-medium text-gray-700 line-clamp-2 leading-snug">
                                        {chat.title || "New Conversation"}
                                    </h4>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
