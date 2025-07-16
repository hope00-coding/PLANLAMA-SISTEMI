import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Headphones } from "lucide-react";
import type { ChatMessage } from "@shared/schema";

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", sessionId, "messages"],
    queryFn: async () => {
      const response = await fetch(`/api/chat/${sessionId}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
    refetchInterval: isOpen ? 2000 : false, // Poll every 2 seconds when open
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat/messages", {
        sessionId,
        message,
        isFromUser: true,
      });
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat", sessionId, "messages"] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const handleQuickResponse = (response: string) => {
    sendMessageMutation.mutate(response);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const unreadCount = messages.filter(msg => !msg.isFromUser).length;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg relative transition-all transform hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && !isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{Math.min(unreadCount, 9)}</span>
          </div>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold">Live Support</h4>
                <p className="text-xs text-blue-100">Usually responds in minutes</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-blue-100 hover:text-white hover:bg-blue-500"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4" style={{ maxHeight: "240px" }}>
            {messages.length === 0 && (
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <Headphones className="w-3 h-3 text-blue-600" />
                </div>
                <div className="bg-slate-100 rounded-lg p-3 max-w-xs">
                  <p className="text-sm text-slate-800">Hi! How can I help you today?</p>
                  <span className="text-xs text-slate-500">Just now</span>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className={`flex items-start ${message.isFromUser ? 'justify-end' : ''}`}>
                {!message.isFromUser && (
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <Headphones className="w-3 h-3 text-blue-600" />
                  </div>
                )}
                <div className={`rounded-lg p-3 max-w-xs ${
                  message.isFromUser 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  <p className="text-sm">{message.message}</p>
                  <span className={`text-xs ${
                    message.isFromUser ? 'text-blue-100' : 'text-slate-500'
                  }`}>
                    {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 'Just now'}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Responses */}
          <div className="p-4 border-t border-slate-200">
            {messages.length <= 1 && (
              <div className="mb-3">
                <p className="text-xs text-slate-600 mb-2">Quick responses:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleQuickResponse("How does it work?")}
                    className="text-xs"
                  >
                    How does it work?
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleQuickResponse("Tell me about pricing")}
                    className="text-xs"
                  >
                    Pricing info
                  </Button>
                </div>
              </div>
            )}

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sendMessageMutation.isPending}
                className="flex-1 text-sm"
              />
              <Button 
                type="submit"
                size="sm"
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
