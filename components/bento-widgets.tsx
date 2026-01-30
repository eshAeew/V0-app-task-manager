"use client";

import React from "react"

import { motion } from "framer-motion";
import type { Task } from "@/lib/types";
import { PRIORITIES, DEFAULT_CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Target,
  TrendingUp,
  Calendar,
  Zap,
  Flame,
  Trophy,
  Plus,
  Clock,
  ListTodo,
} from "lucide-react";

interface BentoWidgetProps {
  tasks: Task[];
}

// Large hero widget - spans 2 cols, 2 rows
export function HeroStatsWidget({ tasks }: BentoWidgetProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-3xl bg-card border border-border/50 p-8 h-full flex flex-col justify-between"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4" />
      
      <div className="relative z-10">
        <p className="text-sm font-medium text-muted-foreground mb-2">Task Overview</p>
        <h2 className="text-5xl font-bold text-foreground tracking-tight">
          Bento
        </h2>
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex items-end gap-8">
          <div>
            <p className="text-6xl font-bold text-foreground">{completionRate}%</p>
            <p className="text-sm text-muted-foreground mt-1">Completion rate</p>
          </div>
          <div className="flex-1 max-w-32">
            <div className="h-24 flex items-end gap-1">
              {[65, 45, 80, 55, 90, 70, completionRate].map((height, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-t-lg transition-all duration-500",
                    i === 6 ? "bg-primary" : "bg-muted"
                  )}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 p-4 rounded-2xl bg-secondary/50">
            <p className="text-2xl font-bold text-foreground">{totalTasks}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="flex-1 p-4 rounded-2xl bg-accent/10">
            <p className="text-2xl font-bold text-accent">{completedTasks}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
          <div className="flex-1 p-4 rounded-2xl bg-primary/10">
            <p className="text-2xl font-bold text-primary">{totalTasks - completedTasks}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Small square widget - shows single stat
export function CompactStatWidget({ 
  value, 
  label, 
  icon: Icon, 
  color = "primary",
  delay = 0 
}: { 
  value: string | number; 
  label: string; 
  icon: React.ElementType;
  color?: "primary" | "accent" | "destructive";
  delay?: number;
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative overflow-hidden rounded-3xl bg-card border border-border/50 p-6 h-full flex flex-col justify-between"
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorClasses[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

// Tall vertical priority widget
export function PriorityTowerWidget({ tasks }: BentoWidgetProps) {
  const priorityCounts = PRIORITIES.map((p) => ({
    ...p,
    count: tasks.filter((t) => t.priority === p.value).length,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-3xl bg-card border border-border/50 p-6 h-full flex flex-col"
    >
      <p className="text-xs font-medium text-muted-foreground mb-4">Priority</p>
      
      <div className="flex-1 flex flex-col justify-center gap-4">
        {priorityCounts.map((p, index) => (
          <div key={p.value} className="flex items-center gap-3">
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-foreground",
                index === 0 && "bg-priority-urgent/20",
                index === 1 && "bg-priority-high/20",
                index === 2 && "bg-priority-medium/20",
                index === 3 && "bg-priority-low/20"
              )}
              style={{ 
                opacity: 1 - (index * 0.2)
              }}
            >
              {p.count}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Typography style widget for categories
export function CategoryDisplayWidget({ tasks }: BentoWidgetProps) {
  const topCategory = DEFAULT_CATEGORIES
    .map(cat => ({
      ...cat,
      count: tasks.filter(t => t.category === cat.id).length
    }))
    .sort((a, b) => b.count - a.count)[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative overflow-hidden rounded-3xl bg-card border border-border/50 p-6 h-full flex flex-col justify-between"
    >
      <p className="text-xs font-medium text-muted-foreground">Top Category</p>
      <div>
        <p className="text-4xl font-bold text-foreground capitalize tracking-tight">
          {topCategory?.name?.slice(0, 2) || "Aa"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{topCategory?.name}</p>
      </div>
    </motion.div>
  );
}

// Wide upcoming tasks widget
export function UpcomingBarWidget({ tasks }: BentoWidgetProps) {
  const upcomingTasks = tasks
    .filter((t) => t.dueDate && t.status !== "done")
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 2);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff < 0) return "Overdue";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden rounded-3xl bg-card border border-border/50 p-6 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-muted-foreground">Upcoming</p>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="space-y-3">
        {upcomingTasks.length > 0 ? (
          upcomingTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3">
              <div className={cn(
                "w-1.5 h-8 rounded-full",
                PRIORITIES.find((p) => p.value === task.priority)?.color
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                <p className={cn(
                  "text-xs",
                  formatDate(task.dueDate!) === "Overdue" 
                    ? "text-destructive" 
                    : formatDate(task.dueDate!) === "Today"
                    ? "text-priority-urgent"
                    : "text-muted-foreground"
                )}>
                  {formatDate(task.dueDate!)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
        )}
      </div>
    </motion.div>
  );
}

// Progress streak widget
export function StreakWidget({ tasks }: BentoWidgetProps) {
  const completedCount = tasks.filter(t => t.status === "done").length;
  const streak = Math.min(completedCount, 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-6 h-full flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Streak</p>
        <Flame className="h-4 w-4 text-priority-high" />
      </div>
      
      <div>
        <p className="text-4xl font-bold text-foreground">{streak}</p>
        <p className="text-xs text-muted-foreground">days active</p>
      </div>

      <div className="flex gap-1 mt-2">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 h-1.5 rounded-full",
              i < streak ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Quick add widget
export function QuickAddWidget({ onNewTask }: { onNewTask: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden rounded-3xl bg-primary border border-primary p-6 h-full flex flex-col justify-between cursor-pointer hover:bg-primary/90 transition-colors"
      onClick={onNewTask}
    >
      <Plus className="h-6 w-6 text-primary-foreground" />
      <div>
        <p className="text-lg font-semibold text-primary-foreground">New Task</p>
        <p className="text-xs text-primary-foreground/70">Click to add</p>
      </div>
    </motion.div>
  );
}

// Category progress bars widget
export function CategoryBarsWidget({ tasks }: BentoWidgetProps) {
  const categoryCounts = DEFAULT_CATEGORIES.slice(0, 4).map((cat) => ({
    ...cat,
    count: tasks.filter((t) => t.category === cat.id).length,
  }));

  const total = tasks.length || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="relative overflow-hidden rounded-3xl bg-card border border-border/50 p-6 h-full"
    >
      <p className="text-xs font-medium text-muted-foreground mb-4">Categories</p>
      
      <div className="space-y-4">
        {categoryCounts.map((cat) => (
          <div key={cat.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground font-medium">{cat.name}</span>
              <span className="text-muted-foreground">{cat.count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(cat.count / total) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="h-full rounded-full"
                style={{ backgroundColor: cat.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// In progress count widget
export function InProgressWidget({ tasks }: BentoWidgetProps) {
  const inProgress = tasks.filter(t => t.status === "in-progress").length;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="relative overflow-hidden rounded-3xl bg-card border border-border/50 p-6 h-full flex flex-col justify-between"
    >
      <Clock className="h-5 w-5 text-status-progress" />
      <div>
        <p className="text-3xl font-bold text-foreground">{inProgress}</p>
        <p className="text-xs text-muted-foreground">In Progress</p>
      </div>
    </motion.div>
  );
}
