import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";

type Message = {
    role: "user" | "model";
    text: string;
};

export default function LandingChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "model",
            text: "Halo! Saya adalah Asisten AI Sistem Informasi Kerja Praktik. Ada yang bisa saya bantu terkait Kerja Praktik?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        setInput("");
        
        const newMessages: Message[] = [...messages, { role: "user", text: userText }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Format for Gemini API 
            // The API expects: { role: "user" | "model", parts: [{text: "..."}] }
            const apiMessages = newMessages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));

            const response = await fetch("/api/chat-ai", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages: apiMessages }),
            });

            const data = await response.json();

            if (response.ok && data.candidates && data.candidates.length > 0) {
                const aiText = data.candidates[0].content.parts[0].text;
                setMessages((prev) => [...prev, { role: "model", text: aiText }]);
            } else {
                console.error("AI Error:", data);
                setMessages((prev) => [
                    ...prev,
                    { role: "model", text: "Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi nanti." },
                ]);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "model", text: "Maaf, terjadi kesalahan jaringan." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] max-w-[calc(100vw-3rem)] bg-background border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px] max-h-[calc(100vh-8rem)] animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary-foreground/20 p-2 rounded-full">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Asisten Kerja Praktik</h3>
                                <p className="text-xs text-primary-foreground/80">AI Support</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-primary-foreground/20 rounded-md transition-colors"
                            aria-label="Tutup obrolan"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex items-start gap-2 ${
                                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary text-secondary-foreground"
                                    }`}
                                >
                                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div
                                    className={`max-w-[75%] px-3 py-2 text-sm shadow-sm rounded-2xl ${
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-background border border-border/50 rounded-tl-none text-foreground"
                                    }`}
                                    style={{ whiteSpace: "pre-wrap" }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-2 flex-row">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-secondary text-secondary-foreground">
                                    <Bot size={16} />
                                </div>
                                <div className="px-3 py-2 text-sm shadow-sm rounded-2xl bg-background border border-border/50 rounded-tl-none text-foreground flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin" /> 
                                    <span className="text-muted-foreground">Mengetik...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-border/50 bg-background">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Tanya seputar kerja praktik..."
                                className="w-full bg-muted/50 border border-border/50 rounded-full pl-4 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="absolute right-1 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Kirim"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 hover:scale-105 transition-all animate-in zoom-in duration-300"
                    aria-label="Buka bantuan AI"
                >
                    <MessageCircle size={28} />
                </button>
            )}
        </div>
    );
}
