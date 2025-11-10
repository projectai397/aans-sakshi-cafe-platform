import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Send, MessageCircle, Minimize2, Maximize2 } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  avatar?: string;
}

const QUICK_REPLIES = [
  "How can I help you?",
  "Tell me about AVE",
  "Sakshi membership info",
  "SubCircle products",
  "Technical support",
];

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello! 👋 Welcome to AANS Support. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponses: { [key: string]: string } = {
        ave: "AVE is our B2B SaaS platform for business automation. It includes 9 integrated modules like CRM, accounting, and project management. Would you like to know more?",
        sakshi:
          "Sakshi is our wellness ecosystem with 3 membership tiers: Essential (₹999), Premium (₹2,499), and Elite (₹4,999). Each includes access to our wellness centers and programs.",
        subcircle:
          "SubCircle is our culture and thrift marketplace featuring sustainable fashion, handmade crafts, and eco-friendly products from creators worldwide.",
        pricing: "Our pricing varies by division. AVE starts at ₹5,000/month, Sakshi memberships from ₹999, and SubCircle products range from ₹299-₹9,999.",
        support:
          "Our support team is available 24/7. You can reach us via chat, email, or phone. What specific issue can I help you with?",
        default:
          "That's a great question! Let me connect you with a specialist who can provide more detailed information. Is there anything else I can help with?",
      };

      const lowerText = text.toLowerCase();
      let response = botResponses.default;

      if (lowerText.includes("ave")) response = botResponses.ave;
      else if (lowerText.includes("sakshi")) response = botResponses.sakshi;
      else if (lowerText.includes("subcircle")) response = botResponses.subcircle;
      else if (lowerText.includes("price") || lowerText.includes("cost"))
        response = botResponses.pricing;
      else if (lowerText.includes("support") || lowerText.includes("help"))
        response = botResponses.support;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 800);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-cyan-500 hover:bg-cyan-600 shadow-lg z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 w-96 bg-background border-border shadow-xl z-50 transition-all ${
        isMinimized ? "h-14" : "h-96"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
        <div>
          <h3 className="font-bold text-foreground">AANS Support</h3>
          <p className="text-xs text-muted-foreground">Typically replies instantly</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 p-0"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-64">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-cyan-500 text-white rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Quick replies:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_REPLIES.map((reply) => (
                  <Button
                    key={reply}
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => handleSendMessage(reply)}
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleSendMessage(inputValue);
                }
              }}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-cyan-500"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              className="bg-cyan-500 hover:bg-cyan-600 text-white h-10 w-10 p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
