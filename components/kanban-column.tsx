"use client";

import React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task, Column, Priority, Category } from "@/lib/types";
import { DEFAULT_CATEGORIES } from "@/lib/types";
import { TaskCard } from "./task-card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, ChevronDown, ChevronRight, ChevronUp, ArrowUpDown, Layers, CheckCircle2, GripVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (status: Column["id"]) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: Column["id"]) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onToggleFavorite: (taskId: string) => void;
  onArchive: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  draggedTaskId: string | null;
  isArchivedView?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: (columnId: string) => void;
  // New props for QoL features
  onDuplicate?: (task: Task) => void;
  onTogglePin?: (taskId: string) => void;
  onInlineEdit?: (taskId: string, title: string) => void;
  isSelectionMode?: boolean;
  selectedTaskIds?: string[];
  onSelectTask?: (taskId: string, selected: boolean) => void;
  isCompact?: boolean;
  searchQuery?: string;
  categories?: Category[];
  onMarkComplete?: (taskId: string) => void;
  columns?: Column[];
}

const priorityOrder: Record<Priority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function KanbanColumn({
  column,
  tasks,
  onEditTask,
  onDeleteTask,
  onAddTask,
  onDragOver,
  onDrop,
  onDragStart,
  onToggleFavorite,
  onArchive,
  onToggleSubtask,
  draggedTaskId,
  isArchivedView = false,
  isCollapsed = false,
  onToggleCollapse,
  onDuplicate,
  onTogglePin,
  onInlineEdit,
  isSelectionMode = false,
  selectedTaskIds = [],
  onSelectTask,
  isCompact = false,
  searchQuery = "",
  categories = DEFAULT_CATEGORIES,
  onMarkComplete,
  columns = [],
}: KanbanColumnProps) {
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [sortType, setSortType] = useState<"none" | "priority" | "dueDate">("none");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTarget(true);
    onDragOver(e);
  };

  const handleDragLeave = () => {
    setIsDropTarget(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    setIsDropTarget(false);
    onDrop(e, column.id);
  };

  // Sort tasks - pinned first, then by selected sort type
  const sortedTasks = [...tasks].sort((a, b) => {
    // Pinned tasks always come first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (sortType === "priority") {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    if (sortType === "dueDate") {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });

  // Number of tasks to show when collapsed
  const COLLAPSED_TASK_LIMIT = 4;
  const hasMoreTasks = sortedTasks.length > COLLAPSED_TASK_LIMIT;
  const hiddenTaskCount = sortedTasks.length - COLLAPSED_TASK_LIMIT;

  // Limit visible tasks when not expanded and there are many tasks
  const visibleTasks = hasMoreTasks && !isExpanded 
    ? sortedTasks.slice(0, COLLAPSED_TASK_LIMIT) 
    : sortedTasks;

  if (isCollapsed) {
    return (
      <div
        className={cn(
          "flex flex-col min-h-[500px] w-16 rounded-3xl bg-muted/30 backdrop-blur-sm",
          "border border-border/30 transition-all duration-300 cursor-pointer"
        )}
        onClick={() => onToggleCollapse?.(column.id)}
      >
        <div className="flex flex-col items-center py-4 gap-3">
          {column.isCompletionStatus ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: column.color }}
            />
          )}
          <span className="text-xs font-medium text-foreground writing-vertical transform rotate-180" style={{ writingMode: "vertical-rl" }}>
            {column.title}
          </span>
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
            {tasks.length}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col min-h-[500px] rounded-3xl bg-muted/30 backdrop-blur-sm",
        "border border-border/30 transition-all duration-300",
        isDropTarget && "ring-2 ring-primary/30 bg-primary/5",
        isCompact ? "w-64" : "w-80"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 pb-2 overflow-hidden cursor-grab active:cursor-grabbing group/header">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <GripVertical className="w-4 h-4 text-muted-foreground/30 group-hover/header:text-muted-foreground/70 transition-colors shrink-0" />
          <button
            onClick={() => onToggleCollapse?.(column.id)}
            className="hover:bg-secondary/50 rounded-lg p-1 transition-colors shrink-0"
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          {column.isCompletionStatus ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <div 
              className="w-3 h-3 rounded-full shrink-0" 
              style={{ backgroundColor: column.color }}
            />
          )}
          <h2 className="font-semibold text-foreground truncate">
            {column.title}
            {column.isCompletionStatus && <span className="text-xs text-emerald-500 ml-1 font-normal">(Done)</span>}
          </h2>
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-medium shrink-0">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!isArchivedView && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10"
              onClick={() => onAddTask(column.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem 
                onClick={() => setSortType(sortType === "priority" ? "none" : "priority")}
                className="rounded-lg"
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort by priority
                {sortType === "priority" && <span className="ml-auto text-primary">Active</span>}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSortType(sortType === "dueDate" ? "none" : "dueDate")}
                className="rounded-lg"
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort by due date
                {sortType === "dueDate" && <span className="ml-auto text-primary">Active</span>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onToggleCollapse?.(column.id)}
                className="rounded-lg"
              >
                <ChevronRight className="h-4 w-4 mr-2" />
                Collapse column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Sort indicator */}
      {sortType !== "none" && (
        <div className="px-4 pb-2">
          <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-lg">
            Sorted by {sortType === "priority" ? "priority" : "due date"}
          </span>
        </div>
      )}

      {/* Tasks Container */}
      <div className={cn(
        "flex-1 p-3 pt-1 space-y-3 overflow-y-auto scrollbar-thin",
        isExpanded && hasMoreTasks && "max-h-[600px]"
      )}>
        <AnimatePresence mode="popLayout">
          {visibleTasks.map((task) => (
            <div
              key={task.id}
              draggable={!isSelectionMode}
              onDragStart={(e) => !isSelectionMode && onDragStart(e, task)}
              className={cn(
                "task-card",
                !isSelectionMode && "cursor-grab active:cursor-grabbing"
              )}
            >
              <TaskCard
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onToggleFavorite={onToggleFavorite}
                onArchive={onArchive}
                onToggleSubtask={onToggleSubtask}
                onDuplicate={onDuplicate}
                onTogglePin={onTogglePin}
                onInlineEdit={onInlineEdit}
                onMarkComplete={onMarkComplete}
                isDragging={draggedTaskId === task.id}
                isSelected={selectedTaskIds.includes(task.id)}
                onSelect={onSelectTask}
                isSelectionMode={isSelectionMode}
  isCompact={isCompact}
  searchQuery={searchQuery}
  categories={categories}
  columns={columns}
  />
            </div>
          ))}
        </AnimatePresence>

        {/* Show More/Less Button */}
        {hasMoreTasks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-1"
          >
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-center text-xs text-muted-foreground",
                "hover:text-foreground hover:bg-secondary/50 rounded-xl",
                "border border-dashed border-border/50"
              )}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show {hiddenTaskCount} more task{hiddenTaskCount !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "flex flex-col items-center justify-center py-12 px-4",
              "border-2 border-dashed border-border/50 rounded-2xl",
              "text-muted-foreground text-sm"
            )}
          >
            <Layers className="h-8 w-8 mb-2 opacity-50" />
            <p>{isArchivedView ? "No archived tasks" : "No tasks yet"}</p>
            {!isArchivedView && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-primary"
                onClick={() => onAddTask(column.id)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add task
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* Quick Add - hidden in archived view */}
      {!isArchivedView && (
        <div className="p-3 pt-0">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl"
            onClick={() => onAddTask(column.id)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add task
          </Button>
        </div>
      )}
    </div>
  );
}
