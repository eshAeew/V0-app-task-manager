"use client";

import React from "react";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task, Status, Priority, ViewMode, CustomList, Category, Column, TaskTemplate, BoardViewType } from "@/lib/types";
import { DEFAULT_COLUMNS, DEFAULT_CATEGORIES } from "@/lib/types";
import { INITIAL_TASKS, INITIAL_LISTS, generateId } from "@/lib/task-store";
import { Header, type Notification } from "@/components/header";
import { AppSidebar } from "@/components/app-sidebar";
import { KanbanColumn } from "@/components/kanban-column";
import { TaskDialog } from "@/components/task-dialog";
import { CalendarView } from "@/components/calendar-view";
import { StatusBar } from "@/components/status-bar";
import { ResizableBentoGrid } from "@/components/resizable-bento-grid";
import { AnalyticsCard } from "@/components/analytics-card";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardShortcuts, SHORTCUT_DEFINITIONS } from "@/hooks/use-keyboard-shortcuts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowUpDown,
  Filter,
  SlidersHorizontal,
  Plus,
  Trash2,
  Archive,
  Star,
  CheckSquare,
  X,
  Download,
  Upload,
  Printer,
  Keyboard,
  LayoutGrid,
  Layers,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { storage } from "@/lib/storage";

type SortOption = "priority" | "dueDate" | "title" | "createdAt";

const DEFAULT_NOTIFICATIONS: Notification[] = [];
const DEFAULT_TEMPLATES: TaskTemplate[] = [
  {
    id: "template-1",
    name: "Bug Fix",
    title: "Fix: ",
    description: "Bug description and steps to reproduce",
    priority: "high",
    category: "development",
    tags: ["bug"],
    subtasks: [
      { id: "s1", title: "Investigate issue", completed: false },
      { id: "s2", title: "Write fix", completed: false },
      { id: "s3", title: "Test fix", completed: false },
    ],
  },
  {
    id: "template-2",
    name: "Feature Request",
    title: "Feature: ",
    description: "Feature description and requirements",
    priority: "medium",
    category: "development",
    tags: ["feature"],
    subtasks: [
      { id: "s1", title: "Design solution", completed: false },
      { id: "s2", title: "Implement", completed: false },
      { id: "s3", title: "Test", completed: false },
      { id: "s4", title: "Document", completed: false },
    ],
  },
  {
    id: "template-3",
    name: "Meeting Notes",
    title: "Meeting: ",
    description: "Attendees:\n\nAgenda:\n\nNotes:\n\nAction Items:",
    priority: "low",
    category: "work",
    tags: ["meeting"],
  },
];

export default function TaskManager() {
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize state from localStorage or defaults
  const [tasks, setTasks] = useState<Task[]>([]);
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [collapsedColumns, setCollapsedColumns] = useState<string[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [view, setView] = useState<"board" | "bento" | "analytics">("board");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [boardViewType, setBoardViewType] = useState<BoardViewType>("status");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status>("todo");
  const [defaultDueDate, setDefaultDueDate] = useState<string | undefined>(undefined);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // New QoL state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isCompactView, setIsCompactView] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Toast helper
  const showToast = useCallback((title: string, description?: string) => {
    toast({ title, description });
  }, [toast]);

  // Activity logging helper
  const addActivityLog = useCallback((action: string, message: string) => {
    const newNotification: Notification = {
      id: generateId(),
      title: action,
      message: message,
      time: "Just now",
      type: "info",
      unread: true,
    };
    setNotifications((prev) => [newNotification, ...prev.slice(0, 49)]);
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "n",
      ctrlKey: true,
      callback: () => {
        setEditingTask(null);
        setDefaultStatus("todo");
        setDialogOpen(true);
      },
      description: "New task",
    },
    {
      key: "f",
      ctrlKey: true,
      callback: () => searchInputRef.current?.focus(),
      description: "Focus search",
    },
    {
      key: "Escape",
      callback: () => {
        if (isSelectionMode) {
          setIsSelectionMode(false);
          setSelectedTaskIds([]);
        }
        setDialogOpen(false);
        setShowKeyboardShortcuts(false);
        setShowExportDialog(false);
      },
      description: "Close/Cancel",
    },
    {
      key: "a",
      ctrlKey: true,
      shiftKey: true,
      callback: () => {
        setIsSelectionMode(!isSelectionMode);
        if (isSelectionMode) setSelectedTaskIds([]);
      },
      description: "Toggle selection mode",
    },
    {
      key: "p",
      ctrlKey: true,
      callback: () => window.print(),
      description: "Print",
    },
    {
      key: "e",
      ctrlKey: true,
      callback: () => setShowExportDialog(true),
      description: "Export",
    },
    {
      key: "/",
      callback: () => setShowKeyboardShortcuts(true),
      description: "Show shortcuts",
    },
  ]);

  // Load data from localStorage on mount
  useEffect(() => {
    const STORAGE_VERSION = "v4";
    const storedVersion = localStorage.getItem("bento-storage-version");
    
    if (storedVersion !== STORAGE_VERSION) {
      storage.clearTasks();
      localStorage.setItem("bento-storage-version", STORAGE_VERSION);
    }
    
    setTasks(storage.getTasks(INITIAL_TASKS));
    setCustomLists(storage.getCustomLists(INITIAL_LISTS));
    setCategories(storage.getCustomCategories(DEFAULT_CATEGORIES));
    setColumns(storage.getCustomColumns(DEFAULT_COLUMNS));
    setCollapsedColumns(storage.getCollapsedColumns([]));
    setTemplates(storage.getTaskTemplates(DEFAULT_TEMPLATES));
    setView(storage.getViewPreference("board"));
    setIsCompactView(storage.getCompactView(false));
    setBoardViewType(storage.getBoardViewType("status") as BoardViewType);
    setNotifications(storage.getNotifications(DEFAULT_NOTIFICATIONS));
    const sortPref = storage.getSortPreference({ sortBy: "priority", sortOrder: "desc" });
    setSortBy(sortPref.sortBy);
    setSortOrder(sortPref.sortOrder);
    setIsHydrated(true);
  }, []);

  // Save effects
  useEffect(() => {
    if (isHydrated) storage.saveTasks(tasks);
  }, [tasks, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCustomLists(customLists);
  }, [customLists, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCustomCategories(categories);
  }, [categories, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCustomColumns(columns);
  }, [columns, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCollapsedColumns(collapsedColumns);
  }, [collapsedColumns, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveTaskTemplates(templates);
  }, [templates, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveViewPreference(view);
  }, [view, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveCompactView(isCompactView);
  }, [isCompactView, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveBoardViewType(boardViewType);
  }, [boardViewType, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveSortPreference({ sortBy, sortOrder });
  }, [sortBy, sortOrder, isHydrated]);

  useEffect(() => {
    if (isHydrated) storage.saveNotifications(notifications);
  }, [notifications, isHydrated]);

  // Priority order for sorting
  const priorityOrder: Record<Priority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      // Filter out deleted tasks (trash)
      if (viewMode !== "trash" && task.isDeleted) return false;
      if (viewMode === "trash") return task.isDeleted;

      // Filter by view mode
      if (viewMode === "favorites" && !task.isFavorite) return false;
      if (viewMode === "archived") return task.isArchived;
      if (viewMode !== "archived" && task.isArchived) return false;

      // Filter by list
      if (selectedListId && task.listId !== selectedListId) return false;

      // Filter by category
      if (selectedCategory && task.category !== selectedCategory) return false;

      // Filter by status
      if (selectedStatus && task.status !== selectedStatus) return false;

      // Filter by priority
      if (filterPriority !== "all" && task.priority !== filterPriority) return false;

      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }
      return true;
    });

    // Sort tasks
    result = [...result].sort((a, b) => {
      // Pinned tasks first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      let comparison = 0;
      switch (sortBy) {
        case "priority":
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case "dueDate":
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "createdAt":
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
      }
      return sortOrder === "asc" ? -comparison : comparison;
    });

    return result;
  }, [tasks, selectedCategory, selectedListId, selectedStatus, searchQuery, sortBy, sortOrder, filterPriority, viewMode, priorityOrder]);

  // Task counts
  const taskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.filter((t) => !t.isArchived && !t.isDeleted).forEach((task) => {
      counts[task.category] = (counts[task.category] || 0) + 1;
      // For status counts, only count tasks in the selected list if a list is selected
      if (!selectedListId || task.listId === selectedListId) {
        counts[task.status] = (counts[task.status] || 0) + 1;
      }
    });
    return counts;
  }, [tasks, selectedListId]);

  const favoriteCount = tasks.filter((t) => t.isFavorite && !t.isArchived && !t.isDeleted).length;
  const archivedCount = tasks.filter((t) => t.isArchived && !t.isDeleted).length;
  const trashCount = tasks.filter((t) => t.isDeleted).length;
  const totalTasks = tasks.filter((t) => !t.isArchived && !t.isDeleted).length;
  const completedCount = tasks.filter((t) => t.status === "done" && !t.isArchived && !t.isDeleted).length;

  // Clear other filters when selecting
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setSelectedStatus(null);
      setSelectedListId(null);
    }
  };

  const handleListSelect = (listId: string | null) => {
    setSelectedListId(listId);
    if (listId) {
      setSelectedStatus(null);
      setSelectedCategory(null);
    }
  };

  const handleStatusSelect = (statusId: string | null) => {
    setSelectedStatus(statusId);
    if (statusId) {
      setSelectedCategory(null);
      setSelectedListId(null);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedListId(null);
    setSelectedStatus(null);
    setFilterPriority("all");
    setSearchQuery("");
    setViewMode("all");
  };

  const handleNewTask = () => {
    setEditingTask(null);
    // Use first status from active columns (list-specific or global)
    const selectedList = customLists.find((l) => l.id === selectedListId);
    const firstStatus = (selectedListId && selectedList?.columns?.length) 
      ? selectedList.columns[0].id 
      : columns[0]?.id || "todo";
    setDefaultStatus(firstStatus);
    setDefaultDueDate(undefined);
    setDialogOpen(true);
  };

  const handleNewTaskWithDate = (date: string) => {
    setEditingTask(null);
    setDefaultStatus("todo");
    setDefaultDueDate(date);
    setDialogOpen(true);
  };

  const handleAddTaskToColumn = (status: Status) => {
    setDefaultStatus(status);
    setDefaultDueDate(undefined);
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  // Move to trash instead of permanent delete
  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks(tasks.map((t) => 
      t.id === taskId 
        ? { ...t, isDeleted: true, deletedAt: new Date().toISOString() }
        : t
    ));
    if (task) {
      showToast("Task moved to trash", task.title);
      addActivityLog("Task Deleted", `Moved to trash: ${task.title}`);
    }
  };

  // Permanent delete
  const handlePermanentDelete = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks(tasks.filter((t) => t.id !== taskId));
    if (task) {
      showToast("Task permanently deleted", task.title);
      addActivityLog("Task Permanently Deleted", task.title);
    }
  };

  // Restore from trash
  const handleRestoreTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks(tasks.map((t) => 
      t.id === taskId 
        ? { ...t, isDeleted: false, deletedAt: undefined }
        : t
    ));
    if (task) {
      showToast("Task restored", task.title);
      addActivityLog("Task Restored", task.title);
    }
  };

  // Empty trash
  const handleEmptyTrash = () => {
    const deletedCount = tasks.filter((t) => t.isDeleted).length;
    setTasks(tasks.filter((t) => !t.isDeleted));
    showToast("Trash emptied", `${deletedCount} tasks permanently deleted`);
    addActivityLog("Trash Emptied", `${deletedCount} tasks deleted`);
  };

  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
      showToast("Task updated", task.title);
      addActivityLog("Task Updated", `Updated task: ${task.title}`);
    } else {
      const newTask = selectedListId ? { ...task, listId: selectedListId } : task;
      setTasks([...tasks, newTask]);
      showToast("Task created", task.title);
      addActivityLog("Task Created", `Created new task: ${task.title}`);
    }
  };

  const handleToggleFavorite = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks(tasks.map((t) => 
      t.id === taskId ? { ...t, isFavorite: !t.isFavorite } : t
    ));
    if (task) {
      const msg = task.isFavorite ? "Removed from favorites" : "Added to favorites";
      showToast(msg, task.title);
      addActivityLog(msg, task.title);
    }
  };

  const handleArchive = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks(tasks.map((t) => 
      t.id === taskId ? { ...t, isArchived: !t.isArchived } : t
    ));
    if (task) {
      const msg = task.isArchived ? "Task unarchived" : "Task archived";
      showToast(msg, task.title);
      addActivityLog(msg, task.title);
    }
  };

  const handleTogglePin = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks(tasks.map((t) => 
      t.id === taskId ? { ...t, isPinned: !t.isPinned } : t
    ));
    if (task) {
      const msg = task.isPinned ? "Task unpinned" : "Task pinned";
      showToast(msg, task.title);
    }
  };

  const handleDuplicateTask = (task: Task) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      title: `${task.title} (Copy)`,
      createdAt: new Date().toISOString(),
      isFavorite: false,
      isPinned: false,
    };
    setTasks([...tasks, newTask]);
    showToast("Task duplicated", newTask.title);
    addActivityLog("Task Duplicated", `Duplicated: ${task.title}`);
  };

  const handleInlineEdit = (taskId: string, title: string) => {
    setTasks(tasks.map((t) => 
      t.id === taskId ? { ...t, title } : t
    ));
    showToast("Task renamed", title);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map((task) => {
      if (task.id === taskId && task.subtasks) {
        return {
          ...task,
          subtasks: task.subtasks.map((subtask) =>
            subtask.id === subtaskId
              ? { ...subtask, completed: !subtask.completed }
              : subtask
          ),
        };
      }
      return task;
    }));
  };

  // Bulk actions
  const handleBulkDelete = () => {
    const count = selectedTaskIds.length;
    setTasks(tasks.map((t) => 
      selectedTaskIds.includes(t.id) 
        ? { ...t, isDeleted: true, deletedAt: new Date().toISOString() }
        : t
    ));
    setSelectedTaskIds([]);
    setIsSelectionMode(false);
    showToast(`${count} tasks moved to trash`);
    addActivityLog("Bulk Delete", `${count} tasks moved to trash`);
  };

  const handleBulkArchive = () => {
    const count = selectedTaskIds.length;
    setTasks(tasks.map((t) => 
      selectedTaskIds.includes(t.id) ? { ...t, isArchived: true } : t
    ));
    setSelectedTaskIds([]);
    setIsSelectionMode(false);
    showToast(`${count} tasks archived`);
    addActivityLog("Bulk Archive", `${count} tasks archived`);
  };

  const handleBulkFavorite = () => {
    const count = selectedTaskIds.length;
    setTasks(tasks.map((t) => 
      selectedTaskIds.includes(t.id) ? { ...t, isFavorite: true } : t
    ));
    setSelectedTaskIds([]);
    setIsSelectionMode(false);
    showToast(`${count} tasks added to favorites`);
  };

  const handleBulkMove = (status: Status) => {
    const count = selectedTaskIds.length;
    setTasks(tasks.map((t) => 
      selectedTaskIds.includes(t.id) ? { ...t, status } : t
    ));
    setSelectedTaskIds([]);
    setIsSelectionMode(false);
    const col = columns.find((c) => c.id === status);
    showToast(`${count} tasks moved to ${col?.title}`);
  };

  const handleSelectTask = (taskId: string, selected: boolean) => {
    if (selected) {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
    } else {
      setSelectedTaskIds(selectedTaskIds.filter((id) => id !== taskId));
    }
  };

  const handleSelectAll = () => {
    const visibleIds = filteredTasks.map((t) => t.id);
    setSelectedTaskIds(visibleIds);
  };

  const handleDeselectAll = () => {
    setSelectedTaskIds([]);
  };

  // Drag and drop
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("taskId", task.id);
    setDraggedTaskId(task.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t) => t.id === taskId);
    const oldStatus = task?.status;
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status } : t)));
    setDraggedTaskId(null);
    if (task && oldStatus !== status) {
      const column = columns.find((c) => c.id === status);
      showToast("Task moved", `${task.title} moved to ${column?.title}`);
      addActivityLog("Task Moved", `Moved "${task.title}" to ${column?.title || status}`);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleToggleColumnCollapse = (columnId: string) => {
    setCollapsedColumns((prev) => 
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  // Export data
  const handleExportData = (format: "json" | "csv") => {
    const data = {
      tasks,
      customLists,
      categories,
      columns,
      templates,
      exportDate: new Date().toISOString(),
    };

    if (format === "json") {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `task-manager-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const csvRows = [
        ["Title", "Description", "Status", "Priority", "Category", "Due Date", "Tags", "Created"],
        ...tasks.map((t) => [
          t.title,
          t.description,
          t.status,
          t.priority,
          t.category,
          t.dueDate || "",
          t.tags.join(";"),
          t.createdAt,
        ]),
      ];
      const csv = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tasks-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    showToast("Data exported", `Exported as ${format.toUpperCase()}`);
    setShowExportDialog(false);
  };

  // Import data
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.tasks) {
          setTasks(data.tasks);
          showToast("Data imported", `${data.tasks.length} tasks imported`);
          addActivityLog("Data Imported", `${data.tasks.length} tasks imported`);
        }
      } catch {
        showToast("Import failed", "Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  // List management
  const handleAddList = (list: CustomList) => {
    setCustomLists([...customLists, list]);
    showToast("List created", list.name);
    addActivityLog("List Created", `Created new list: ${list.name}`);
  };

  const handleUpdateList = (list: CustomList) => {
    setCustomLists(customLists.map((l) => (l.id === list.id ? list : l)));
    showToast("List updated", list.name);
    addActivityLog("List Updated", `Updated list: ${list.name}`);
  };

  const handleDeleteList = (listId: string) => {
    const list = customLists.find((l) => l.id === listId);
    setCustomLists(customLists.filter((l) => l.id !== listId));
    setTasks(tasks.map((t) => (t.listId === listId ? { ...t, listId: undefined } : t)));
    if (selectedListId === listId) setSelectedListId(null);
    if (list) {
      showToast("List deleted", list.name);
      addActivityLog("List Deleted", `Deleted list: ${list.name}`);
    }
  };

  // Category management
  const handleAddCategory = (category: Category) => {
    setCategories([...categories, category]);
    showToast("Category created", category.name);
    addActivityLog("Category Created", `Created new category: ${category.name}`);
  };

  const handleUpdateCategory = (category: Category) => {
    setCategories(categories.map((c) => (c.id === category.id ? category : c)));
    showToast("Category updated", category.name);
    addActivityLog("Category Updated", `Updated category: ${category.name}`);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    setCategories(categories.filter((c) => c.id !== categoryId));
    const firstCategory = categories.find((c) => c.id !== categoryId);
    if (firstCategory) {
      setTasks(tasks.map((t) => 
        t.category === categoryId ? { ...t, category: firstCategory.id } : t
      ));
    }
    if (selectedCategory === categoryId) setSelectedCategory(null);
    if (category) {
      showToast("Category deleted", category.name);
      addActivityLog("Category Deleted", `Deleted category: ${category.name}`);
    }
  };

  // Column/Status management
  const handleAddColumn = (column: Column) => {
    setColumns([...columns, column]);
    showToast("Status created", column.title);
    addActivityLog("Status Created", `Created new status: ${column.title}`);
  };

  const handleUpdateColumn = (column: Column) => {
    setColumns(columns.map((c) => (c.id === column.id ? column : c)));
    showToast("Status updated", column.title);
    addActivityLog("Status Updated", `Updated status: ${column.title}`);
  };

  const handleDeleteColumn = (columnId: string) => {
    const column = columns.find((c) => c.id === columnId);
    if (!column || columns.length <= 1) {
      showToast("Cannot delete", "At least one status is required");
      return;
    }
    setColumns(columns.filter((c) => c.id !== columnId));
    const remainingColumns = columns.filter((c) => c.id !== columnId);
    const targetColumn = remainingColumns[0];
    setTasks(tasks.map((t) => 
      t.status === columnId ? { ...t, status: targetColumn.id } : t
    ));
    if (selectedStatus === columnId) setSelectedStatus(null);
    showToast("Status deleted", `${column.title}. Tasks moved to ${targetColumn.title}`);
    addActivityLog("Status Deleted", `Deleted status: ${column.title}`);
  };

  // List-specific column/status management
  const handleAddListColumn = (listId: string, column: Column) => {
    setCustomLists(customLists.map((list) => {
      if (list.id === listId) {
        const existingColumns = list.columns || [];
        return { ...list, columns: [...existingColumns, column] };
      }
      return list;
    }));
    const list = customLists.find((l) => l.id === listId);
    showToast("Status created", `${column.title} added to "${list?.name}"`);
    addActivityLog("List Status Created", `Created "${column.title}" in list "${list?.name}"`);
  };

  const handleUpdateListColumn = (listId: string, column: Column) => {
    setCustomLists(customLists.map((list) => {
      if (list.id === listId && list.columns) {
        return {
          ...list,
          columns: list.columns.map((c) => (c.id === column.id ? column : c)),
        };
      }
      return list;
    }));
    showToast("Status updated", column.title);
    addActivityLog("List Status Updated", `Updated status: ${column.title}`);
  };

  const handleDeleteListColumn = (listId: string, columnId: string) => {
    const list = customLists.find((l) => l.id === listId);
    const listColumns = list?.columns || [];
    const column = listColumns.find((c) => c.id === columnId);
    
    if (!column || listColumns.length <= 1) {
      showToast("Cannot delete", "At least one status is required");
      return;
    }
    
    const remainingColumns = listColumns.filter((c) => c.id !== columnId);
    const targetColumn = remainingColumns[0];
    
    setCustomLists(customLists.map((l) => {
      if (l.id === listId) {
        return { ...l, columns: remainingColumns };
      }
      return l;
    }));
    
    // Move tasks with this status to the first remaining status
    setTasks(tasks.map((t) => 
      t.listId === listId && t.status === columnId 
        ? { ...t, status: targetColumn.id } 
        : t
    ));
    
    if (selectedStatus === columnId) setSelectedStatus(null);
    showToast("Status deleted", `${column.title}. Tasks moved to ${targetColumn.title}`);
    addActivityLog("List Status Deleted", `Deleted status: ${column.title}`);
  };

  // Notification management
  const handleMarkNotificationRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const handleClearNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Get view title
  const getViewTitle = () => {
    if (selectedListId) {
      const list = customLists.find((l) => l.id === selectedListId);
      return list?.name || "Tasks";
    }
    if (selectedCategory) {
      const category = categories.find((c) => c.id === selectedCategory);
      return `${category?.name || selectedCategory} Tasks`;
    }
    if (selectedStatus) {
      const column = columns.find((c) => c.id === selectedStatus);
      return `${column?.title || selectedStatus} Tasks`;
    }
    switch (viewMode) {
      case "favorites":
        return "Favorite Tasks";
      case "archived":
        return "Archived Tasks";
      case "trash":
        return "Trash";
      case "calendar":
        return "Calendar";
      default:
        return "All Tasks";
    }
  };

  // Check if any filters are active
  const hasActiveFilters = selectedCategory || selectedListId || selectedStatus || filterPriority !== "all" || searchQuery;

  // Get active columns: use list-specific columns if a list is selected and has columns, otherwise use global columns
  const selectedList = customLists.find((l) => l.id === selectedListId);
  const activeColumns = useMemo(() => {
    if (selectedListId && selectedList?.columns && selectedList.columns.length > 0) {
      return selectedList.columns;
    }
    return columns;
  }, [selectedListId, selectedList?.columns, columns]);

  // Show loading state
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10 print:pb-0">
      <Header
        view={view}
        onViewChange={setView}
        onNewTask={handleNewTask}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearNotification={handleClearNotification}
        onClearAllNotifications={handleClearAllNotifications}
        searchInputRef={searchInputRef}
      />

      <div className="flex print:block">
        <div className="print:hidden">
          <AppSidebar
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            taskCounts={taskCounts}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            customLists={customLists}
            onAddList={handleAddList}
            onUpdateList={handleUpdateList}
            onDeleteList={handleDeleteList}
            selectedListId={selectedListId}
            onSelectList={handleListSelect}
            favoriteCount={favoriteCount}
            archivedCount={archivedCount}
            trashCount={trashCount}
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            columns={columns}
            onAddColumn={handleAddColumn}
            onUpdateColumn={handleUpdateColumn}
            onDeleteColumn={handleDeleteColumn}
            selectedStatus={selectedStatus}
            onStatusSelect={handleStatusSelect}
            onAddListColumn={handleAddListColumn}
            onUpdateListColumn={handleUpdateListColumn}
            onDeleteListColumn={handleDeleteListColumn}
          />
        </div>

        <main className="flex-1 p-6 overflow-x-auto print:p-0">
          <AnimatePresence mode="wait">
            {viewMode === "calendar" ? (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <CalendarView
                  tasks={tasks}
                  onEditTask={handleEditTask}
                  onNewTask={handleNewTaskWithDate}
                />
              </motion.div>
            ) : viewMode === "trash" ? (
              <motion.div
                key="trash"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Trash</h2>
                    <p className="text-muted-foreground mt-1">
                      {trashCount} deleted tasks
                    </p>
                  </div>
                  {trashCount > 0 && (
                    <Button variant="destructive" onClick={handleEmptyTrash}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Empty Trash
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTasks.map((task) => (
                    <div key={task.id} className="p-4 rounded-xl bg-card border border-border">
                      <h3 className="font-medium text-foreground">{task.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {task.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Deleted {task.deletedAt ? new Date(task.deletedAt).toLocaleDateString() : ""}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => handleRestoreTask(task.id)}>
                          Restore
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handlePermanentDelete(task.id)}>
                          Delete Forever
                        </Button>
                      </div>
                    </div>
                  ))}
                  {trashCount === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      Trash is empty
                    </div>
                  )}
                </div>
              </motion.div>
            ) : view === "board" ? (
              <motion.div
                key="board"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="min-w-max"
              >
                {/* Board Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {getViewTitle()}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {filteredTasks.length} of {totalTasks} tasks
                      {hasActiveFilters && (
                        <Button
                          variant="link"
                          size="sm"
                          className="ml-2 h-auto p-0 text-primary"
                          onClick={clearAllFilters}
                        >
                          Clear filters
                        </Button>
                      )}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Selection Mode Toggle */}
                    <Button
                      variant={isSelectionMode ? "default" : "outline"}
                      size="sm"
                      className="rounded-xl h-9 gap-2"
                      onClick={() => {
                        setIsSelectionMode(!isSelectionMode);
                        if (isSelectionMode) setSelectedTaskIds([]);
                      }}
                    >
                      <CheckSquare className="h-4 w-4" />
                      Select
                    </Button>

                    {/* Compact View Toggle */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl h-9 w-9 bg-transparent"
                      onClick={() => setIsCompactView(!isCompactView)}
                      title={isCompactView ? "Comfortable view" : "Compact view"}
                    >
                      {isCompactView ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </Button>

                    {/* Sort Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="rounded-xl h-9 gap-2 bg-transparent">
                          <ArrowUpDown className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            {sortBy === "priority" ? "Priority" : sortBy === "dueDate" ? "Due Date" : sortBy === "title" ? "Title" : "Created"}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="rounded-xl">
                        <DropdownMenuItem onClick={() => setSortBy("priority")} className="rounded-lg">
                          Priority {sortBy === "priority" && "✓"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy("dueDate")} className="rounded-lg">
                          Due Date {sortBy === "dueDate" && "✓"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy("title")} className="rounded-lg">
                          Title {sortBy === "title" && "✓"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy("createdAt")} className="rounded-lg">
                          Created Date {sortBy === "createdAt" && "✓"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sort Order Toggle */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl h-9 w-9 bg-transparent"
                      onClick={toggleSortOrder}
                      title={sortOrder === "asc" ? "Ascending" : "Descending"}
                    >
                      <SlidersHorizontal className={`h-4 w-4 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`} />
                    </Button>

                    {/* Filter by Priority */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="rounded-xl h-9 gap-2 bg-transparent">
                          <Filter className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            {filterPriority === "all" ? "All" : filterPriority.charAt(0).toUpperCase() + filterPriority.slice(1)}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="rounded-xl">
                        <DropdownMenuItem onClick={() => setFilterPriority("all")} className="rounded-lg">
                          All Priorities {filterPriority === "all" && "✓"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterPriority("urgent")} className="rounded-lg">
                          <span className="w-2 h-2 rounded-full bg-priority-urgent mr-2" />
                          Urgent {filterPriority === "urgent" && "✓"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterPriority("high")} className="rounded-lg">
                          <span className="w-2 h-2 rounded-full bg-priority-high mr-2" />
                          High {filterPriority === "high" && "✓"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterPriority("medium")} className="rounded-lg">
                          <span className="w-2 h-2 rounded-full bg-priority-medium mr-2" />
                          Medium {filterPriority === "medium" && "✓"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterPriority("low")} className="rounded-lg">
                          <span className="w-2 h-2 rounded-full bg-priority-low mr-2" />
                          Low {filterPriority === "low" && "✓"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* More Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-xl h-9 w-9 bg-transparent">
                          <LayoutGrid className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl w-48">
                        <DropdownMenuItem onClick={() => setShowKeyboardShortcuts(true)} className="rounded-lg">
                          <Keyboard className="h-4 w-4 mr-2" />
                          Keyboard shortcuts
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowExportDialog(true)} className="rounded-lg">
                          <Download className="h-4 w-4 mr-2" />
                          Export data
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.print()} className="rounded-lg">
                          <Printer className="h-4 w-4 mr-2" />
                          Print
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Bulk Actions Bar */}
                {isSelectionMode && selectedTaskIds.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3 flex-wrap"
                  >
                    <span className="text-sm font-medium">
                      {selectedTaskIds.length} selected
                    </span>
                    <Button size="sm" variant="outline" onClick={handleSelectAll}>
                      Select all
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDeselectAll}>
                      Deselect all
                    </Button>
                    <div className="flex-1" />
                    <Button size="sm" variant="outline" onClick={handleBulkFavorite}>
                      <Star className="h-4 w-4 mr-1" />
                      Favorite
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleBulkArchive}>
                      <Archive className="h-4 w-4 mr-1" />
                      Archive
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Layers className="h-4 w-4 mr-1" />
                          Move to
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="rounded-xl">
                        {activeColumns.map((col) => (
                          <DropdownMenuItem
                            key={col.id}
                            onClick={() => handleBulkMove(col.id)}
                            className="rounded-lg"
                          >
                            <div
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: col.color }}
                            />
                            {col.title}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsSelectionMode(false);
                        setSelectedTaskIds([]);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}

                {/* Print Header */}
                <div className="hidden print:block mb-6">
                  <h1 className="text-2xl font-bold">{getViewTitle()}</h1>
                  <p className="text-sm text-muted-foreground">
                    Exported on {new Date().toLocaleDateString()}
                  </p>
                </div>

                {/* Kanban Board */}
                <div className="flex gap-6 print:block print:space-y-4">
                  {activeColumns.map((column) => (
                    <KanbanColumn
                      key={column.id}
                      column={column}
                      tasks={viewMode === "archived" 
                        ? filteredTasks.filter(t => t.status === column.id)
                        : filteredTasks.filter(t => t.status === column.id && !t.isArchived)
                      }
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                      onAddTask={handleAddTaskToColumn}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragStart={handleDragStart}
                      onToggleFavorite={handleToggleFavorite}
                      onArchive={handleArchive}
                      onToggleSubtask={handleToggleSubtask}
                      onDuplicate={handleDuplicateTask}
                      onTogglePin={handleTogglePin}
                      onInlineEdit={handleInlineEdit}
                      draggedTaskId={draggedTaskId}
                      isArchivedView={viewMode === "archived"}
                      isCollapsed={collapsedColumns.includes(column.id)}
                      onToggleCollapse={handleToggleColumnCollapse}
                      isSelectionMode={isSelectionMode}
                      selectedTaskIds={selectedTaskIds}
                      onSelectTask={handleSelectTask}
                      isCompact={isCompactView}
                      searchQuery={searchQuery}
                      categories={categories}
                    />
                  ))}
                </div>
              </motion.div>
            ) : view === "analytics" ? (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
                  <p className="text-muted-foreground mt-1">
                    Track your productivity and progress
                  </p>
                </div>

                <AnalyticsCard
                  tasks={tasks.filter(t => !t.isDeleted)}
                  categories={categories}
                  columns={columns}
                />
              </motion.div>
            ) : (
              <motion.div
                key="bento"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Bento</h2>
                  <p className="text-muted-foreground mt-1">
                    Your productivity at a glance
                  </p>
                </div>

                <ResizableBentoGrid
                  tasks={filteredTasks}
                  onNewTask={handleNewTask}
                  onEditTask={handleEditTask}
                  onToggleSubtask={handleToggleSubtask}
                  onToggleFavorite={handleToggleFavorite}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Status Bar */}
      <div className="print:hidden">
        <StatusBar
          customLists={customLists}
          selectedListId={selectedListId}
          onSelectList={setSelectedListId}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          taskCount={totalTasks}
          completedCount={completedCount}
        />
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        defaultStatus={defaultStatus}
        defaultDueDate={defaultDueDate}
        defaultListId={selectedListId || undefined}
        onSave={handleSaveTask}
        customLists={customLists}
        categories={categories}
        columns={activeColumns}
        templates={templates}
      />

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Quick actions to boost your productivity
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {SHORTCUT_DEFINITIONS.map((shortcut, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {shortcut.description}
                </span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, j) => (
                    <kbd
                      key={j}
                      className="px-2 py-1 text-xs font-mono bg-muted rounded-md border"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>
              Download your tasks and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 bg-transparent"
                onClick={() => handleExportData("json")}
              >
                <Download className="h-6 w-6" />
                <span>Export JSON</span>
                <span className="text-xs text-muted-foreground">Full backup</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 bg-transparent"
                onClick={() => handleExportData("csv")}
              >
                <Download className="h-6 w-6" />
                <span>Export CSV</span>
                <span className="text-xs text-muted-foreground">Tasks only</span>
              </Button>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">Import data</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose file
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportData}
                />
                <span className="text-xs text-muted-foreground">JSON only</span>
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Container */}
      <Toaster />
    </div>
  );
}
