"use client";

import { useState } from "react";
import type { Task, Category, Column } from "@/lib/types";
import { PRIORITIES, DEFAULT_CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { parseMarkdown } from "@/lib/markdown";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Star,
  Pin,
  Timer,
  Repeat,
  Link2,
  Tag,
  FolderOpen,
  CheckCircle2,
  Circle,
  X,
} from "lucide-react";

interface ViewTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onMarkComplete?: (taskId: string) => void;
  categories?: Category[];
  columns?: Column[];
}

export function ViewTaskDialog({
  task,
  open,
  onOpenChange,
  onToggleSubtask,
  onMarkComplete,
  categories = DEFAULT_CATEGORIES,
  columns = [],
}: ViewTaskDialogProps) {
  if (!task) return null;

  const priority = PRIORITIES.find((p) => p.value === task.priority);
  const category = categories.find((c) => c.id === task.category);
  const status = columns.find((c) => c.id === task.status);

  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

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
    if (diff <= 7) return { color: "text-yellow-600", label: `${diff} days left` };
    return { color: "text-muted-foreground", label: "" };
  };

  const dueDateInfo = getDueDateInfo();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      weekday: "short",
      month: "short", 
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 rounded-2xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-muted/30">
          <div className="flex items-start gap-4">
            {/* Completion toggle */}
            <button
              onClick={() => onMarkComplete?.(task.id)}
              className={cn(
                "shrink-0 mt-1 transition-all duration-200 hover:scale-110",
                task.isCompleted 
                  ? "text-emerald-500 hover:text-emerald-600" 
                  : "text-muted-foreground/50 hover:text-emerald-500"
              )}
              title={task.isCompleted ? "Mark as incomplete" : "Mark as complete"}
            >
              {task.isCompleted ? (
                <CheckCircle2 className="h-6 w-6 fill-emerald-500/20" />
              ) : (
                <Circle className="h-6 w-6" />
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <DialogTitle className={cn(
                "text-xl font-semibold leading-tight",
                task.isCompleted && "line-through text-muted-foreground"
              )}>
                {task.title}
              </DialogTitle>
              
              {/* Status and badges */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {status && (
                  <Badge 
                    variant="outline" 
                    className="gap-1.5"
                    style={{ borderColor: status.color }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    />
                    {status.title}
                  </Badge>
                )}
                {priority && (
                  <Badge variant="outline" className="gap-1.5">
                    <div className={cn("w-2 h-2 rounded-full", priority.color)} />
                    {priority.label}
                  </Badge>
                )}
                {task.isPinned && (
                  <Badge variant="secondary" className="gap-1">
                    <Pin className="h-3 w-3 fill-primary text-primary" />
                    Pinned
                  </Badge>
                )}
                {task.isFavorite && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    Favorite
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(85vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Description */}
            {task.description && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                <div 
                  className="prose prose-sm prose-slate dark:prose-invert max-w-none bg-muted/30 rounded-xl p-4"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(task.description) }}
                />
              </div>
            )}

            {/* Subtasks */}
            {totalSubtasks > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Subtasks</h4>
                  <span className="text-sm text-muted-foreground">
                    {completedSubtasks} of {totalSubtasks} completed
                  </span>
                </div>
                <Progress value={progress} className="h-2 mb-4" />
                <div className="space-y-2 bg-muted/30 rounded-xl p-4">
                  {task.subtasks?.map((subtask) => (
                    <label 
                      key={subtask.id} 
                      className="flex items-center gap-3 cursor-pointer group hover:bg-background/50 rounded-lg p-2 -m-2 transition-colors"
                    >
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => onToggleSubtask?.(task.id, subtask.id)}
                        className="h-4 w-4 cursor-pointer"
                      />
                      <span
                        className={cn(
                          "flex-1 text-sm transition-colors",
                          subtask.completed && "line-through text-muted-foreground"
                        )}
                      >
                        {subtask.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Due Date */}
              {task.dueDate && (
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                  <Calendar className={cn("h-5 w-5 mt-0.5", dueDateInfo.color)} />
                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className={cn("text-sm font-medium", dueDateInfo.color)}>
                      {formatDate(task.dueDate)}
                      {dueDateInfo.label && (
                        <span className="ml-1 text-xs">({dueDateInfo.label})</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Category */}
              {category && (
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                  <FolderOpen className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <p className="text-sm font-medium">{category.name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Time Estimate */}
              {task.timeEstimate && (
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                  <Timer className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Estimated Time</p>
                    <p className="text-sm font-medium">{task.timeEstimate} minutes</p>
                  </div>
                </div>
              )}

              {/* Time Actual */}
              {task.timeActual && (
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                  <Clock className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Actual Time</p>
                    <p className="text-sm font-medium">{task.timeActual} minutes</p>
                  </div>
                </div>
              )}

              {/* Recurrence */}
              {task.recurrence && task.recurrence !== "none" && (
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                  <Repeat className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Repeats</p>
                    <p className="text-sm font-medium capitalize">{task.recurrence}</p>
                  </div>
                </div>
              )}

              {/* Dependencies */}
              {task.dependsOn && task.dependsOn.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                  <Link2 className="h-5 w-5 mt-0.5 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Dependencies</p>
                    <p className="text-sm font-medium">{task.dependsOn.length} task(s)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs px-2.5 py-1 rounded-lg"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="pt-4 border-t text-xs text-muted-foreground">
              <p>Created: {new Date(task.createdAt).toLocaleString()}</p>
              {task.updatedAt && task.updatedAt !== task.createdAt && (
                <p>Updated: {new Date(task.updatedAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
