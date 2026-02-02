"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { Task, Category, Column } from "@/lib/types";
import { PRIORITIES, DEFAULT_CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { parseMarkdown } from "@/lib/markdown";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  MoreHorizontal,
  GripVertical,
  Star,
  Archive,
  Copy,
  Pin,
  Link2,
  Timer,
  Repeat,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleFavorite?: (taskId: string) => void;
  onArchive?: (taskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onDuplicate?: (task: Task) => void;
  onTogglePin?: (taskId: string) => void;
  onInlineEdit?: (taskId: string, title: string) => void;
  isDragging?: boolean;
  isSelected?: boolean;
  onSelect?: (taskId: string, selected: boolean) => void;
  isSelectionMode?: boolean;
  isCompact?: boolean;
  searchQuery?: string;
  categories?: Category[];
  columns?: Column[];
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleFavorite,
  onArchive,
  onToggleSubtask,
  onDuplicate,
  onTogglePin,
  onInlineEdit,
  isDragging,
  isSelected,
  onSelect,
  isSelectionMode,
  isCompact = false,
  searchQuery = "",
  categories = DEFAULT_CATEGORIES,
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [expandedSubtasks, setExpandedSubtasks] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const priority = PRIORITIES.find((p) => p.value === task.priority);
  const category = categories.find((c) => c.id === task.category);

  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // Due date color coding
  const getDueDateInfo = () => {
    if (!task.dueDate) return { color: "text-muted-foreground", label: "" };
    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return { color: "text-red-500 font-medium", label: "Overdue" };
    if (diff === 0) return { color: "text-orange-500 font-medium", label: "Today" };
    if (diff === 1) return { color: "text-amber-500", label: "Tomorrow" };
    if (diff <= 7) return { color: "text-yellow-600", label: `${diff} days` };
    return { color: "text-muted-foreground", label: "" };
  };

  const dueDateInfo = getDueDateInfo();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Highlight search matches
  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Handle inline edit
  const handleDoubleClick = () => {
    if (onInlineEdit) {
      setIsInlineEditing(true);
      setEditTitle(task.title);
    }
  };

  const handleInlineEditSave = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onInlineEdit?.(task.id, editTitle.trim());
    }
    setIsInlineEditing(false);
  };

  const handleInlineEditCancel = () => {
    setEditTitle(task.title);
    setIsInlineEditing(false);
  };

  useEffect(() => {
    if (isInlineEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isInlineEditing]);

  const cardContent = (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: isSelectionMode ? 1 : 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative rounded-2xl bg-card shadow-sm border border-border/50",
        isCompact ? "p-2" : "p-4",
        "hover:shadow-lg hover:border-primary/20 transition-all duration-300",
        isDragging && "shadow-2xl rotate-2 scale-105 cursor-grabbing",
        task.isArchived && "opacity-60",
        task.isPinned && "ring-2 ring-primary/30",
        isSelected && "ring-2 ring-primary bg-primary/5"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Selection Checkbox */}
      {isSelectionMode && (
        <div className="absolute left-2 top-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect?.(task.id, checked as boolean)}
            className="h-5 w-5"
          />
        </div>
      )}

      {/* Drag Handle */}
      {!isSelectionMode && (
        <div
          className={cn(
            "absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100",
            "transition-opacity cursor-grab active:cursor-grabbing"
          )}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Pin & Favorite indicators */}
      <div className="absolute -top-1 -right-1 flex gap-1">
        {task.isPinned && (
          <Pin className="h-4 w-4 fill-primary text-primary" />
        )}
        {task.isFavorite && (
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        )}
      </div>

      {/* Header */}
      <div className={cn("flex items-start justify-between gap-2 mb-3", isSelectionMode ? "pl-8" : "pl-4")}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {priority && (
            <div
              className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                priority.color
              )}
              title={priority.label}
            />
          )}
          {isInlineEditing ? (
            <Input
              ref={inputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleInlineEditSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInlineEditSave();
                if (e.key === "Escape") handleInlineEditCancel();
              }}
              className="h-6 text-sm font-medium py-0 px-1"
            />
          ) : (
            <h3 className="font-medium text-card-foreground text-sm leading-tight truncate">
              {highlightText(task.title)}
            </h3>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                isHovered && "opacity-100"
              )}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              Edit task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate?.(task)}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTogglePin?.(task.id)}>
              <Pin className={cn("h-4 w-4 mr-2", task.isPinned && "fill-primary text-primary")} />
              {task.isPinned ? "Unpin" : "Pin to top"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleFavorite?.(task.id)}>
              <Star className={cn("h-4 w-4 mr-2", task.isFavorite && "fill-yellow-400 text-yellow-400")} />
              {task.isFavorite ? "Remove favorite" : "Add to favorites"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onArchive?.(task.id)}>
              <Archive className="h-4 w-4 mr-2" />
              {task.isArchived ? "Unarchive" : "Archive"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(task.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description with markdown - hide in compact mode */}
      {!isCompact && task.description && (
        <div 
          className={cn("text-xs text-muted-foreground line-clamp-2 mb-3 prose prose-sm prose-slate dark:prose-invert max-w-none", isSelectionMode ? "pl-8" : "pl-4")}
          dangerouslySetInnerHTML={{ __html: parseMarkdown(task.description) }}
        />
      )}

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className={cn("mb-3", isSelectionMode ? "pl-8" : "pl-4")}>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Subtasks</span>
            <span>
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
          <Progress value={progress} className="h-1.5 mb-2" />
          {/* Show subtask list - hide in compact mode */}
          {!isCompact && (
            <div className="space-y-1.5">
              {task.subtasks?.slice(0, expandedSubtasks ? undefined : 3).map((subtask) => (
                <label 
                  key={subtask.id} 
                  className="flex items-center gap-2 text-xs cursor-pointer group/subtask hover:bg-muted/50 rounded-md p-1 -m-1 transition-colors"
                >
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => onToggleSubtask?.(task.id, subtask.id)}
                    className="h-3.5 w-3.5 cursor-pointer hover:border-primary transition-colors data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span
                    className={cn(
                      "truncate transition-colors flex-1",
                      subtask.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {subtask.title}
                  </span>
                </label>
              ))}
              {totalSubtasks > 3 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedSubtasks(!expandedSubtasks);
                  }}
                  className="text-xs text-primary hover:text-primary/80 transition-colors font-medium py-1 px-1 -m-1 rounded hover:bg-primary/5"
                >
                  {expandedSubtasks ? "Show less" : `+${totalSubtasks - 3} more`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tags - hide in compact mode */}
      {!isCompact && task.tags.length > 0 && (
        <div className={cn("flex flex-wrap gap-1 mb-3", isSelectionMode ? "pl-8" : "pl-4")}>
          {task.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-5 font-normal rounded-md"
            >
              {highlightText(tag)}
            </Badge>
          ))}
          {task.tags.length > 3 && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-5 font-normal rounded-md"
            >
              +{task.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Footer */}
      <div className={cn("flex items-center justify-between pt-2 border-t border-border/50", isSelectionMode ? "pl-8" : "pl-4")}>
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className={cn("flex items-center gap-1 text-xs", dueDateInfo.color)}>
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.dueDate)}</span>
              {dueDateInfo.label && (
                <span className="text-[10px]">({dueDateInfo.label})</span>
              )}
            </div>
          )}
          {task.reminder && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
            </div>
          )}
          {task.timeEstimate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Timer className="h-3 w-3" />
              <span>{task.timeEstimate}m</span>
            </div>
          )}
          {task.recurrence && task.recurrence !== "none" && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Repeat className="h-3 w-3" />
            </div>
          )}
          {task.dependsOn && task.dependsOn.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-orange-500">
              <Link2 className="h-3 w-3" />
              <span>{task.dependsOn.length}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {category && (
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: category.color }}
              title={category.name}
            />
          )}
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100",
          "bg-gradient-to-br from-primary/5 via-transparent to-accent/5",
          "pointer-events-none transition-opacity duration-300"
        )}
      />
    </motion.div>
  );

  // Wrap with context menu for right-click actions
  return (
    <ContextMenu>
      <ContextMenuTrigger>{cardContent}</ContextMenuTrigger>
      <ContextMenuContent className="w-48 rounded-xl">
        <ContextMenuItem onClick={() => onEdit(task)}>
          Edit task
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onDuplicate?.(task)}>
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onTogglePin?.(task.id)}>
          <Pin className={cn("h-4 w-4 mr-2", task.isPinned && "fill-primary")} />
          {task.isPinned ? "Unpin" : "Pin to top"}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onToggleFavorite?.(task.id)}>
          <Star className={cn("h-4 w-4 mr-2", task.isFavorite && "fill-yellow-400")} />
          {task.isFavorite ? "Unfavorite" : "Favorite"}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onArchive?.(task.id)}>
          <Archive className="h-4 w-4 mr-2" />
          {task.isArchived ? "Unarchive" : "Archive"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => onDelete(task.id)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
