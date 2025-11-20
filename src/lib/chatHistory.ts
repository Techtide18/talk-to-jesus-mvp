export type Role = "user" | "jesus" | "assistant";

export interface Message {
    role: Role;
    text: string;
    timestamp?: number;
}

export interface ChatSession {
    id: string;
    type: "text" | "voice";
    title: string;
    messages: Message[];
    createdAt: number;
    updatedAt: number;
}

const STORAGE_KEY = "talk_to_jesus_history";

export const getChats = (): ChatSession[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored).sort((a: ChatSession, b: ChatSession) => b.updatedAt - a.updatedAt);
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

export const createNewSession = (type: "text" | "voice", initialMessage?: string): ChatSession => {
    const id = crypto.randomUUID();
    const session: ChatSession = {
        id,
        type,
        title: initialMessage ? (initialMessage.slice(0, 30) + (initialMessage.length > 30 ? "..." : "")) : "New Conversation",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
    saveChat(session);
    return session;
};

export const deleteChat = (id: string) => {
    const chats = getChats().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
};
