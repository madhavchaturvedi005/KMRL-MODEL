import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Send, Brain, ExternalLink, Clock } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  sources?: { title: string; file: string }[];
}

interface AIAssistantProps {
  onClose: () => void;
}

export const AIAssistant = ({ onClose }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your K-IntelliSense AI assistant. I can help you find information, summarize documents, and answer questions about KMRL operations. What would you like to know?",
      sender: "ai",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(input),
        sender: "ai",
        timestamp: new Date(),
        sources: [
          { title: "Safety Circular - Aluva Station", file: "safety-circular-2024-15.pdf" },
          { title: "Monthly Revenue Report", file: "revenue-report-dec-2023.xlsx" }
        ]
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("safety") || lowerQuery.includes("aluva")) {
      return "Based on the latest safety circular for Aluva station, new safety protocols require mandatory hard hats in construction zones and updated emergency evacuation procedures. The platform enhancement work follows strict contractor safety requirements with regular compliance audits.";
    }
    
    if (lowerQuery.includes("revenue") || lowerQuery.includes("finance")) {
      return "According to the December 2023 revenue report, KMRL achieved ₹2.4 crores in total revenue with 1.2M passengers. This represents a 12% increase compared to the previous month, with notable improvements in peak hour efficiency.";
    }
    
    if (lowerQuery.includes("project") || lowerQuery.includes("corridor")) {
      return "The Corridor Expansion Phase 2 project is currently 65% complete. Recent milestones include environmental clearance approval and 90% completion of land acquisition. The project team includes Engineering, Construction, and Safety departments.";
    }
    
    return "I understand your query about KMRL operations. Based on the available documents, I can provide detailed insights. Could you please specify which aspect you'd like me to focus on - safety protocols, financial reports, project updates, or operational procedures?";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Powered by K-IntelliSense</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                
                {/* Sources for AI messages */}
                {message.sender === "ai" && message.sources && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs opacity-75">Sources:</p>
                    {message.sources.map((source, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="h-6 p-1 text-xs justify-start"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {source.title}
                      </Button>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 opacity-50" />
                  <span className="text-xs opacity-75">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-xs text-muted-foreground ml-2">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t border-b">
          <div className="flex gap-2 flex-wrap">
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-muted text-xs"
              onClick={() => setInput("What are the latest safety updates?")}
            >
              Safety Updates
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-muted text-xs"
              onClick={() => setInput("Show me recent project progress")}
            >
              Project Status
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-muted text-xs"
              onClick={() => setInput("Summarize December revenue report")}
            >
              Revenue Summary
            </Badge>
          </div>
        </div>

        {/* Input */}
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about KMRL operations..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};