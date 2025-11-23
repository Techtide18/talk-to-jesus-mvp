export type Role = "user" | "jesus" | "assistant";

export interface Message {
    role: Role;
    text: string;
    timestamp?: number;
}

export interface ChatSession {
    id: string;
    type: "text" | "voice" | "video";
    messages: Message[];
    timestamp: number;
    updatedAt?: number;
    title?: string;
}

const STORAGE_KEY = "talk_to_jesus_history";

export const getChats = (): ChatSession[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored).sort((a: ChatSession, b: ChatSession) => (b.updatedAt || b.timestamp) - (a.updatedAt || a.timestamp));
    } catch (e) {
        console.error("Failed to parse chat history", e);
        return [];
    }
};

export const getChat = (id: string): ChatSession | undefined => {
    const chats = getChats();
    return chats.find((c) => c.id === id);
};

export const saveChat = (session: ChatSession) => {
    const chats = getChats();
    const index = chats.findIndex((c) => c.id === session.id);

    if (index >= 0) {
        chats[index] = { ...session, updatedAt: Date.now() };
    } else {
        chats.push({ ...session, updatedAt: Date.now() });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
};

export const createNewSession = (type: "text" | "voice" | "video", prefill?: string): ChatSession => {
    const id = crypto.randomUUID();
    const newSession: ChatSession = {
        id,
        type,
        title: prefill ? (prefill.slice(0, 30) + (prefill.length > 30 ? "..." : "")) : "New Conversation",
        messages: [],
        timestamp: Date.now(),
    };
    saveChat(newSession);
    return newSession;
};

export const deleteChat = (id: string) => {
    const chats = getChats().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
};
