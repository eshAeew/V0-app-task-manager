"use client";

import { motion } from "framer-motion";
import type { CustomList, ViewMode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { List, X, Home } from "lucide-react";

interface StatusBarProps {
  customLists: CustomList[];
  selectedListId: string | null;
  onSelectList: (listId: string | null) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  taskCount: number;
  completedCount: number;
}

export function StatusBar({
  customLists,
  selectedListId,
  onSelectList,
  viewMode,
  onViewModeChange,
  taskCount,
  completedCount,
}: StatusBarProps) {
  const selectedList = customLists.find((l) => l.id === selectedListId);

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 h-10 bg-muted/80 backdrop-blur-lg border-t border-border/50 z-40 px-6"
    >
      <div className="flex items-center justify-between h-full max-w-screen-2xl mx-auto">
        {/* Left - List Selection */}
        <div className="flex items-center gap-2">
          {selectedListId && selectedList ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div
                className="w-3 h-3 rounded-md"
                style={{ backgroundColor: selectedList.color }}
              />
              <span className="text-sm font-medium text-foreground">
                {selectedList.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-md"
                onClick={() => {
                  onSelectList(null);
                  onViewModeChange("all");
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Home className="h-4 w-4" />
              <span className="text-sm">All Tasks</span>
            </div>
          )}

          {/* Quick List Switches */}
          <div className="hidden md:flex items-center gap-1 ml-4 border-l border-border/50 pl-4">
            {customLists.slice(0, 4).map((list) => (
              <Button
                key={list.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-2 rounded-md text-xs gap-1.5",
                  selectedListId === list.id && "bg-secondary"
                )}
                onClick={() => {
                  onSelectList(list.id);
                  onViewModeChange("all");
                }}
              >
                <div
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: list.color }}
                />
                <span className="max-w-[80px] truncate">{list.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Center - Task Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{taskCount} tasks</span>
          <span className="text-green-500">{completedCount} completed</span>
          <span>{taskCount - completedCount} remaining</span>
        </div>

        {/* Right - View Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{viewMode} view</span>
        </div>
      </div>
    </motion.div>
  );
}
