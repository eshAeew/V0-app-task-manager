"use client";

import React from "react"

import { useState, useEffect } from "react";
import type { Task, Priority, Status, CustomList, Category, Column, TaskTemplate, RecurrenceType, Subtask } from "@/lib/types";
import { PRIORITIES, DEFAULT_COLUMNS, DEFAULT_CATEGORIES } from "@/lib/types";
import { generateId } from "@/lib/task-store";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Tag,
  Plus,
  X,
  Flag,
  Folder,
  Bell,
  CheckSquare,
  List,
  Timer,
  Repeat,
  Link2,
  FileText,
  GripVertical,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultStatus?: Status;
  defaultDueDate?: string;
  defaultListId?: string;
  onSave: (task: Task) => void;
  customLists?: CustomList[];
  categories?: Category[];
  columns?: Column[];
  templates?: TaskTemplate[];
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultStatus = "todo",
  defaultDueDate,
  defaultListId,
  onSave,
  customLists = [],
  categories = DEFAULT_CATEGORIES,
  columns = DEFAULT_COLUMNS,
  templates = [],
}: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>(defaultStatus);
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState("work");
  const [dueDate, setDueDate] = useState("");
  const [reminder, setReminder] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [listId, setListId] = useState<string | undefined>(undefined);
  
  // New fields
  const [timeEstimate, setTimeEstimate] = useState<number | undefined>(undefined);
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [dependsOn, setDependsOn] = useState<string[]>([]);
  const [draggedSubtaskIndex, setDraggedSubtaskIndex] = useState<number | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setCategory(task.category);
      setDueDate(task.dueDate || "");
      setReminder(task.reminder || "");
      setTags(task.tags);
      setSubtasks(task.subtasks || []);
      setListId(task.listId);
      setTimeEstimate(task.timeEstimate);
      setRecurrence(task.recurrence || "none");
      setDependsOn(task.dependsOn || []);
    } else {
      resetForm();
    }
  }, [task, defaultStatus, defaultDueDate, defaultListId, open]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus(defaultStatus);
    setPriority("medium");
    setCategory("work");
    setDueDate(defaultDueDate || "");
    setReminder("");
    setTags([]);
    setSubtasks([]);
    setListId(defaultListId);
    setTimeEstimate(undefined);
    setRecurrence("none");
    setDependsOn([]);
  };

  const applyTemplate = (template: TaskTemplate) => {
    setTitle(template.title);
    setDescription(template.description);
    setPriority(template.priority);
    setCategory(template.category);
    setTags(template.tags);
    setSubtasks(template.subtasks?.map(s => ({ ...s, id: generateId() })) || []);
    setTimeEstimate(template.timeEstimate);
    setRecurrence(template.recurrence || "none");
  };

  const handleSave = () => {
    const newTask: Task = {
      id: task?.id || generateId(),
      title,
      description,
      status,
      priority,
      category,
      dueDate: dueDate || undefined,
      reminder: reminder || undefined,
      tags,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      createdAt: task?.createdAt || new Date().toISOString().split("T")[0],
      isFavorite: task?.isFavorite,
      isArchived: task?.isArchived,
      isPinned: task?.isPinned,
      listId,
      timeEstimate,
      recurrence: recurrence !== "none" ? recurrence : undefined,
      dependsOn: dependsOn.length > 0 ? dependsOn : undefined,
    };
    onSave(newTask);
    onOpenChange(false);
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const addSubtask = () => {
    if (newSubtask) {
      setSubtasks([
        ...subtasks,
        { id: generateId(), title: newSubtask, completed: false },
      ]);
      setNewSubtask("");
    }
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s
      )
    );
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  // Subtask drag and drop for reordering
  const handleSubtaskDragStart = (index: number) => {
    setDraggedSubtaskIndex(index);
  };

  const handleSubtaskDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSubtaskIndex === null || draggedSubtaskIndex === index) return;
    
    const newSubtasks = [...subtasks];
    const [removed] = newSubtasks.splice(draggedSubtaskIndex, 1);
    newSubtasks.splice(index, 0, removed);
    setSubtasks(newSubtasks);
    setDraggedSubtaskIndex(index);
  };

  const handleSubtaskDragEnd = () => {
    setDraggedSubtaskIndex(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] rounded-3xl border-border/50 bg-card/95 backdrop-blur-xl p-0 overflow-hidden flex flex-col">
        <div className="p-6 pb-0">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-semibold">
              {task ? "Edit Task" : "Create New Task"}
            </DialogTitle>
          </DialogHeader>

          {/* Templates - only show when creating new task */}
          {!task && templates.length > 0 && (
            <div className="mb-4">
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Templates
              </Label>
              <div className="flex flex-wrap gap-2">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs bg-transparent"
                    onClick={() => applyTemplate(template)}
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 scrollbar-thin">
          <div className="space-y-5 pb-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Task Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                className="rounded-xl bg-secondary/50 border-border/50 focus:border-primary"
                autoFocus
              />
            </div>

            {/* Description with markdown hint */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium flex items-center justify-between">
                <span>Description</span>
                <span className="text-xs text-muted-foreground">Markdown supported</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add task details... (supports **bold**, *italic*, - lists)"
                className="min-h-[80px] rounded-xl bg-secondary/50 border-border/50 focus:border-primary resize-none font-mono text-sm"
              />
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  Status
                </Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                  <SelectTrigger className="rounded-xl bg-secondary/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {columns.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: col.color }}
                          />
                          {col.title}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  Priority
                </Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger className="rounded-xl bg-secondary/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", p.color)} />
                          {p.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category & List */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="rounded-xl bg-secondary/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {customLists.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <List className="h-4 w-4 text-muted-foreground" />
                    List
                  </Label>
                  <Select value={listId || "none"} onValueChange={(v) => setListId(v === "none" ? undefined : v)}>
                    <SelectTrigger className="rounded-xl bg-secondary/50 border-border/50">
                      <SelectValue placeholder="Select list" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none">No list</SelectItem>
                      {customLists.map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: list.color }}
                            />
                            {list.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Due Date & Reminder */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Due Date
                </Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded-xl bg-secondary/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  Reminder
                </Label>
                <Input
                  type="datetime-local"
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                  className="rounded-xl bg-secondary/50 border-border/50"
                />
              </div>
            </div>

            {/* Time Estimate & Recurrence */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  Time Estimate (minutes)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={timeEstimate || ""}
                  onChange={(e) => setTimeEstimate(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g. 30"
                  className="rounded-xl bg-secondary/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-muted-foreground" />
                  Recurrence
                </Label>
                <Select value={recurrence} onValueChange={(v) => setRecurrence(v as RecurrenceType)}>
                  <SelectTrigger className="rounded-xl bg-secondary/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="none">No repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                Tags
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-lg pr-1 flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-muted rounded p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  className="rounded-xl bg-secondary/50 border-border/50"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={addTag}
                  className="rounded-xl"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Subtasks with drag reorder */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                Subtasks
                {subtasks.length > 0 && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    Drag to reorder
                  </span>
                )}
              </Label>
              <div className="space-y-2 mb-2">
                {subtasks.map((subtask, index) => (
                  <div
                    key={subtask.id}
                    draggable
                    onDragStart={() => handleSubtaskDragStart(index)}
                    onDragOver={(e) => handleSubtaskDragOver(e, index)}
                    onDragEnd={handleSubtaskDragEnd}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-xl bg-secondary/30 cursor-move",
                      draggedSubtaskIndex === index && "opacity-50"
                    )}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => toggleSubtask(subtask.id)}
                    />
                    <span
                      className={cn(
                        "flex-1 text-sm",
                        subtask.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => removeSubtask(subtask.id)}
                      className="hover:bg-muted rounded p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add subtask..."
                  className="rounded-xl bg-secondary/50 border-border/50"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubtask())}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={addSubtask}
                  className="rounded-xl"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border/50 bg-muted/30 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="rounded-xl" disabled={!title}>
            {task ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
