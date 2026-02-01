"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Bell,
  Plus,
  Moon,
  Sun,
  LayoutGrid,
  Columns,
  Command,
  Sparkles,
  Check,
  X,
  Clock,
  AlertCircle,
  BarChart3,
} from "lucide-react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "reminder" | "deadline" | "info";
  unread: boolean;
  taskId?: string;
}

interface HeaderProps {
  view: "board" | "bento" | "analytics";
  onViewChange: (view: "board" | "bento" | "analytics") => void;
  onNewTask: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotification: (id: string) => void;
  onClearAllNotifications: () => void;
}

export function Header({
  view,
  onViewChange,
  onNewTask,
  searchQuery,
  onSearchChange,
  notifications,
  onMarkNotificationRead,
  onClearNotification,
  onClearAllNotifications,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const isDark = resolvedTheme === "dark";

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "reminder":
        return <Clock className="h-4 w-4 text-primary" />;
      case "deadline":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-pulse" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Bento</h1>
              <p className="text-xs text-muted-foreground">Task Manager</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search tasks..."
                className="pl-10 pr-12 rounded-2xl bg-secondary/50 border-border/50 focus:border-primary h-11"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
                <Command className="h-3 w-3" />
                <span>K</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="hidden sm:flex items-center bg-secondary/50 rounded-2xl p-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-xl h-9 px-3 transition-all",
                  view === "board" && "bg-card shadow-sm"
                )}
                onClick={() => onViewChange("board")}
              >
                <Columns className="h-4 w-4 mr-2" />
                Board
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-xl h-9 px-3 transition-all",
                  view === "bento" && "bg-card shadow-sm"
                )}
                onClick={() => onViewChange("bento")}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Bento
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-xl h-9 px-3 transition-all",
                  view === "analytics" && "bg-card shadow-sm"
                )}
                onClick={() => onViewChange("analytics")}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Stats
              </Button>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-10 w-10"
              onClick={toggleTheme}
            >
              {mounted ? (
                isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Notifications */}
            <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl h-10 w-10 relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96 rounded-2xl p-2">
                <div className="flex items-center justify-between px-2 py-1">
                  <DropdownMenuLabel className="text-lg font-semibold">
                    Notifications
                  </DropdownMenuLabel>
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground h-7"
                      onClick={(e) => {
                        e.preventDefault();
                        onClearAllNotifications();
                      }}
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                <DropdownMenuSeparator />
                
                <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                  <AnimatePresence>
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors",
                            notif.unread ? "bg-primary/5" : "hover:bg-secondary/50"
                          )}
                          onClick={() => onMarkNotificationRead(notif.id)}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {notif.unread && (
                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                              )}
                              <span className="font-medium text-sm text-foreground truncate">
                                {notif.title}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-muted-foreground mt-1 block">
                              {notif.time}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClearNotification(notif.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* New Task Button */}
            <Button
              onClick={onNewTask}
              className="rounded-2xl h-10 px-4 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Task</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
