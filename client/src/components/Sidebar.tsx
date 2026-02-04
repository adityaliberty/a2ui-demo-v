import React from "react";
import {
  Plus,
  MessageSquare,
  FolderRoot,
  Layers,
  Code,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onClearChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  onClearChat,
}) => {
  const navItems = [
    { icon: MessageSquare, label: "Chats" },
    { icon: FolderRoot, label: "Projects" },
    { icon: Layers, label: "Artifacts" },
    { icon: Code, label: "Code" },
  ];

  const recents = [
    "Building A2UI to Adaptive...",
    "Using a2ui",
    "Social impact POC for...",
    "POC with renewable energy...",
    "Digital waste reduction...",
  ];

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-[#171717] text-gray-300 transition-all duration-300 ease-in-out border-r border-gray-800",
        isCollapsed ? "w-[60px]" : "w-[260px]"
      )}
    >
      {/* Top Section */}
      <div className="p-3 flex items-center justify-between">
        {!isCollapsed && (
          <span className="font-semibold text-white text-lg px-2">DEMO</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 mb-4">
        <Button
          onClick={onClearChat}
          className={cn(
            "w-full bg-gray-800 hover:bg-gray-700 text-white border-none justify-start gap-2",
            isCollapsed ? "px-2" : "px-4"
          )}
        >
          <Plus className="w-5 h-5" />
          {!isCollapsed && <span>New chat</span>}
        </Button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {/* {navItems.map((item, idx) => (
          <button
            key={idx}
            className={cn(
              "flex items-center w-full p-2 rounded-md hover:bg-gray-800 transition-colors gap-3",
              isCollapsed ? "justify-center" : "justify-start"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">{item.label}</span>}
          </button>
        ))} */}

        {!isCollapsed && (
          <div className="mt-6">
            <p className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Recents
            </p>
            {/* {recents.map((recent, idx) => (
              <button
                key={idx}
                className="flex items-center w-full p-2 rounded-md hover:bg-gray-800 text-sm text-gray-400 truncate text-left"
              >
                {recent}
              </button>
            ))} */}
          </div>
        )}
      </nav>

      {/* Bottom Profile */}
      <div className="p-3 border-t border-gray-800">
        <button
          className={cn(
            "flex items-center w-full p-2 rounded-md hover:bg-gray-800 gap-3",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
            S
          </div>
          {!isCollapsed && (
            <div className="text-left overflow-hidden">
              <p className="text-sm font-medium text-white truncate">sdds</p>
              <p className="text-xs text-gray-500 truncate">Free plan</p>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
