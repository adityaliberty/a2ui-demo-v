import React, { useState, useRef, useEffect } from "react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Trash2 } from "lucide-react";
import DashboardPanel from "./DashboardPanel";
import Sidebar from "./Sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  hasDashboard?: boolean;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to Asset Lifecycle Management. Ask me to analyze your IT assets and I'll show you a comprehensive dashboard.",
      hasDashboard: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId] = useState(() => nanoid());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, userId }),
      });

      if (!response.ok) throw new Error("API error");

      const data = await response.json();

      const assistantMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content:
          data.text ||
          "Analysis complete. Click the box below to view the dashboard.",
        hasDashboard: !!data.dashboardData,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.dashboardData) {
        setDashboardData(data.dashboardData);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [
        ...prev,
        {
          id: nanoid(),
          role: "assistant",
          content: "Error: Failed to process request. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Welcome to Asset Lifecycle Management. Ask me to analyze your IT assets and I'll show you a comprehensive dashboard.",
        hasDashboard: false,
      },
    ]);
    setDashboardData(null);
    setShowDashboard(false);
  };

  const handleOpenDashboard = () => {
    setShowDashboard(true);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        {/* Left Panel - Sidebar */}
        <ResizablePanel
          defaultSize={20}
          minSize={5}
          maxSize={30}
          collapsible={true}
          onCollapse={() => setSidebarCollapsed(true)}
          onExpand={() => setSidebarCollapsed(false)}
          className="transition-all duration-300"
        >
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            onClearChat={handleClearChat}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Middle Panel - Chat */}
        <ResizablePanel defaultSize={showDashboard ? 40 : 80} minSize={30}>
          <div className="flex flex-col h-full border-r border-gray-200">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Asset Lifecycle Management
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Analyze IT asset data and plan tech refresh strategies
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearChat}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>

                    {/* Clickable Dashboard Box */}
                    {msg.hasDashboard && dashboardData && (
                      <div
                        onClick={handleOpenDashboard}
                        className="mt-3 p-4 bg-white rounded-lg border-2 border-blue-400 cursor-pointer hover:bg-blue-50 hover:border-blue-600 transition-all transform hover:scale-105"
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">📊</div>
                          <p className="text-xs font-semibold text-gray-900">
                            View Dashboard
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Click to see lifecycle phases
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Ask about your IT assets..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={loading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </ResizablePanel>

        {/* Right Panel - Dashboard */}
        {showDashboard && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40} minSize={20}>
              <div className="flex flex-col h-full border-l border-gray-200 bg-white">
                {/* Dashboard Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDashboard(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ✕
                  </Button>
                </div>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto">
                  <DashboardPanel data={dashboardData} />
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};
