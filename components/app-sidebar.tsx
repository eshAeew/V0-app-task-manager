"use client";

import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Category, ViewMode, CustomList, Column } from "@/lib/types";
import { DEFAULT_CATEGORIES, LIST_COLORS, DEFAULT_COLUMNS } from "@/lib/types";
import { generateId } from "@/lib/task-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Calendar,
  Plus,
  Briefcase,
  User,
  Palette,
  Code,
  Star,
  Archive,
  MoreHorizontal,
  Pencil,
  Trash2,
  List,
  Tag,
  ChevronDown,
  ChevronRight,
  GripVertical,
  CheckCircle2,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AppSidebarProps {
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  taskCounts: Record<string, number>;
  isCollapsed?: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  customLists: CustomList[];
  onAddList: (list: CustomList) => void;
  onUpdateList: (list: CustomList) => void;
  onDeleteList: (listId: string) => void;
  selectedListId: string | null;
  onSelectList: (listId: string | null) => void;
  favoriteCount: number;
  archivedCount: number;
  trashCount: number;
  // New props for custom categories
  categories: Category[];
  onAddCategory: (category: Category) => void;
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  // New props for custom columns (global)
  columns: Column[];
  onAddColumn: (column: Column) => void;
  onUpdateColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
  // Status filter
  selectedStatus: string | null;
  onStatusSelect: (statusId: string | null) => void;
  // List-specific column handlers
  onAddListColumn: (listId: string, column: Column) => void;
  onUpdateListColumn: (listId: string, column: Column) => void;
  onDeleteListColumn: (listId: string, columnId: string) => void;
  // Drag and drop to lists
  onDropTaskToList?: (taskId: string, listId: string) => void;
  onDropStatusToList?: (statusId: string, listId: string) => void;
  // Status/column reordering
  onReorderColumns?: (newOrder: Column[]) => void;
}

const iconMap: Record<string, React.ElementType> = {
  briefcase: Briefcase,
  user: User,
  palette: Palette,
  code: Code,
  tag: Tag,
};

const CATEGORY_ICONS = [
  { id: "briefcase", icon: Briefcase, label: "Briefcase" },
  { id: "user", icon: User, label: "User" },
  { id: "palette", icon: Palette, label: "Palette" },
  { id: "code", icon: Code, label: "Code" },
  { id: "tag", icon: Tag, label: "Tag" },
];

export function AppSidebar({
  selectedCategory,
  onCategorySelect,
  taskCounts,
  isCollapsed = false,
  viewMode,
  onViewModeChange,
  customLists,
  onAddList,
  onUpdateList,
  onDeleteList,
  selectedListId,
  onSelectList,
  favoriteCount,
  archivedCount,
  trashCount,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  columns,
  onAddColumn,
  onUpdateColumn,
  onDeleteColumn,
  selectedStatus,
  onStatusSelect,
  onAddListColumn,
  onUpdateListColumn,
  onDeleteListColumn,
  onDropTaskToList,
  onDropStatusToList,
  onReorderColumns,
}: AppSidebarProps) {
  const [showNewListDialog, setShowNewListDialog] = useState(false);
  const [editingList, setEditingList] = useState<CustomList | null>(null);
  const [newListName, setNewListName] = useState("");
  const [newListColor, setNewListColor] = useState(LIST_COLORS[0]);
  const [dragOverListId, setDragOverListId] = useState<string | null>(null);
  
  // Collapsible states
  const [listsExpanded, setListsExpanded] = useState(true);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [statusExpanded, setStatusExpanded] = useState(true);

  // Category dialog state
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(LIST_COLORS[0]);
  const [newCategoryIcon, setNewCategoryIcon] = useState("tag");

  // Column dialog state
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnColor, setNewColumnColor] = useState(LIST_COLORS[0]);
  const [newColumnIsCompletion, setNewColumnIsCompletion] = useState(false);

  // Status drag reordering state
  const [draggingStatusId, setDraggingStatusId] = useState<string | null>(null);
  const [dragOverStatusId, setDragOverStatusId] = useState<string | null>(null);

  const totalTasks = Object.values(taskCounts).reduce((a, b) => a + b, 0) / 2; // Divided by 2 because we count both category and status
  const completedTasks = taskCounts.done || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Get active columns: use list-specific columns if a list is selected and has columns, otherwise use global columns
  const selectedList = customLists.find((l) => l.id === selectedListId);
  const activeColumns = selectedListId && selectedList?.columns && selectedList.columns.length > 0
    ? selectedList.columns
    : columns;
  const isUsingListColumns = selectedListId && selectedList?.columns && selectedList.columns.length > 0;

  const menuItems = [
    { icon: Home, label: "All Tasks", mode: "all" as ViewMode, count: Math.floor(totalTasks) },
    { icon: Star, label: "Favorites", mode: "favorites" as ViewMode, count: favoriteCount },
    { icon: Calendar, label: "Calendar", mode: "calendar" as ViewMode },
    { icon: Archive, label: "Archived", mode: "archived" as ViewMode, count: archivedCount },
    { icon: Trash2, label: "Trash", mode: "trash" as ViewMode, count: trashCount },
  ];

  // List handlers
  const handleCreateList = () => {
    if (newListName.trim()) {
      const newList: CustomList = {
        id: generateId(),
        name: newListName.trim(),
        color: newListColor,
        createdAt: new Date().toISOString(),
      };
      onAddList(newList);
      setNewListName("");
      setNewListColor(LIST_COLORS[0]);
      setShowNewListDialog(false);
    }
  };

  const handleUpdateList = () => {
    if (editingList && newListName.trim()) {
      onUpdateList({
        ...editingList,
        name: newListName.trim(),
        color: newListColor,
      });
      setEditingList(null);
      setNewListName("");
      setNewListColor(LIST_COLORS[0]);
    }
  };

  const openEditListDialog = (list: CustomList) => {
    setEditingList(list);
    setNewListName(list.name);
    setNewListColor(list.color);
  };

  // Category handlers
  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: generateId(),
        name: newCategoryName.trim(),
        color: newCategoryColor,
        icon: newCategoryIcon,
        isCustom: true,
      };
      onAddCategory(newCategory);
      setNewCategoryName("");
      setNewCategoryColor(LIST_COLORS[0]);
      setNewCategoryIcon("tag");
      setShowCategoryDialog(false);
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory && newCategoryName.trim()) {
      onUpdateCategory({
        ...editingCategory,
        name: newCategoryName.trim(),
        color: newCategoryColor,
        icon: newCategoryIcon,
      });
      setEditingCategory(null);
      setNewCategoryName("");
      setNewCategoryColor(LIST_COLORS[0]);
      setNewCategoryIcon("tag");
    }
  };

  const openEditCategoryDialog = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryColor(category.color);
    setNewCategoryIcon(category.icon);
  };

  // Column handlers - now support list-specific columns
  const handleCreateColumn = () => {
    if (newColumnName.trim()) {
      const newColumn: Column = {
        id: generateId(), // Use unique ID to avoid conflicts
        title: newColumnName.trim(),
        color: newColumnColor,
        isCustom: true,
        isCompletionStatus: newColumnIsCompletion,
      };
      
      // If a list is selected, add column to that list
      if (selectedListId) {
        onAddListColumn(selectedListId, newColumn);
      } else {
        onAddColumn(newColumn);
      }
      
      setNewColumnName("");
      setNewColumnColor(LIST_COLORS[0]);
      setNewColumnIsCompletion(false);
      setShowColumnDialog(false);
    }
  };

  const handleUpdateColumn = () => {
    if (editingColumn && newColumnName.trim()) {
      const updatedColumn = {
        ...editingColumn,
        title: newColumnName.trim(),
        color: newColumnColor,
        isCompletionStatus: newColumnIsCompletion,
      };
      
      // If a list is selected and using list columns, update list column
      if (selectedListId && isUsingListColumns) {
        onUpdateListColumn(selectedListId, updatedColumn);
      } else {
        onUpdateColumn(updatedColumn);
      }
      
      setEditingColumn(null);
      setNewColumnName("");
      setNewColumnColor(LIST_COLORS[0]);
      setNewColumnIsCompletion(false);
    }
  };

  const handleDeleteColumnClick = (columnId: string) => {
    // If a list is selected and using list columns, delete from list
    if (selectedListId && isUsingListColumns) {
      onDeleteListColumn(selectedListId, columnId);
    } else {
      onDeleteColumn(columnId);
    }
  };

  const openEditColumnDialog = (column: Column) => {
    setEditingColumn(column);
    setNewColumnName(column.title);
    setNewColumnColor(column.color);
    setNewColumnIsCompletion(column.isCompletionStatus || false);
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-[calc(100vh-73px)] sticky top-[73px]",
        "bg-sidebar border-r border-sidebar-border",
        "transition-all duration-300",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Progress Section */}
      <div className="p-4 border-b border-sidebar-border">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-sidebar-foreground">Today&apos;s Progress</span>
            <span className="text-xs text-sidebar-foreground/70">
              {completedTasks}/{Math.floor(totalTasks)}
            </span>
          </div>
          <Progress value={progress} className="h-2 mb-2" />
          <p className="text-xs text-sidebar-foreground/70">
            {Math.round(progress)}% completed
          </p>
        </motion.div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin">
        <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-3">
          Navigation
        </p>
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 rounded-xl h-11 px-3",
              "hover:bg-sidebar-accent text-sidebar-foreground",
              viewMode === item.mode && !selectedCategory && !selectedListId && "bg-sidebar-accent"
            )}
            onClick={() => {
              onViewModeChange(item.mode);
              onCategorySelect(null);
              onSelectList(null);
            }}
          >
            <item.icon className="h-5 w-5 text-sidebar-foreground/70" />
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span className="ml-auto text-xs bg-sidebar-primary/10 text-sidebar-primary px-2 py-0.5 rounded-md">
                {item.count}
              </span>
            )}
          </Button>
        ))}

        {/* Custom Lists */}
        <Collapsible open={listsExpanded} onOpenChange={setListsExpanded} className="pt-4 mt-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between px-3 mb-2">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-1 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider hover:text-sidebar-foreground/70 transition-colors">
                {listsExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                Lists
                <span className="text-[10px] ml-1">({customLists.length})</span>
              </button>
            </CollapsibleTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-lg"
              onClick={() => setShowNewListDialog(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <CollapsibleContent>
            <div className="space-y-1">
              {customLists.map((list) => (
                <div 
                  key={list.id} 
                  className="group relative"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverListId(list.id);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setDragOverListId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const taskId = e.dataTransfer.getData("taskId");
                    const statusId = e.dataTransfer.getData("statusId");
                    const columnId = e.dataTransfer.getData("columnId");
                    if (taskId && onDropTaskToList) {
                      onDropTaskToList(taskId, list.id);
                    } else if ((statusId || columnId) && onDropStatusToList) {
                      onDropStatusToList(statusId || columnId, list.id);
                    }
                    setDragOverListId(null);
                  }}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 rounded-xl h-11 px-3 pr-9 transition-all",
                      "hover:bg-sidebar-accent text-sidebar-foreground",
                      selectedListId === list.id && "bg-sidebar-accent",
                      dragOverListId === list.id && "bg-primary/20 ring-2 ring-primary ring-inset"
                    )}
                    onClick={() => {
                      onSelectList(list.id);
                      onViewModeChange("all");
                      onCategorySelect(null);
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${list.color}20` }}
                    >
                      <List className="h-3.5 w-3.5" style={{ color: list.color }} />
                    </div>
                    <span className="flex-1 text-left truncate">{list.name}</span>
                    {dragOverListId === list.id && (
                      <span className="text-xs text-primary font-medium shrink-0">Drop here</span>
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-sidebar-accent/50"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => openEditListDialog(list)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteList(list.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Categories */}
        <Collapsible open={categoriesExpanded} onOpenChange={setCategoriesExpanded} className="pt-4 mt-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between px-3 mb-2">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-1 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider hover:text-sidebar-foreground/70 transition-colors">
                {categoriesExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                Categories
                <span className="text-[10px] ml-1">({categories.length})</span>
              </button>
            </CollapsibleTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-lg"
              onClick={() => setShowCategoryDialog(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <CollapsibleContent>
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = iconMap[category.icon] || Tag;
                const count = taskCounts[category.id] || 0;

                return (
                  <div key={category.id} className="group relative">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 rounded-xl h-11 px-3 pr-9",
                        "hover:bg-sidebar-accent text-sidebar-foreground",
                        selectedCategory === category.id && "bg-sidebar-accent"
                      )}
                      onClick={() => {
                        onCategorySelect(category.id);
                        onViewModeChange("all");
                        onSelectList(null);
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Icon
                          className="h-3.5 w-3.5"
                          style={{ color: category.color }}
                        />
                      </div>
                      <span className="flex-1 text-left truncate">{category.name}</span>
                      <span className="text-xs text-sidebar-foreground/50 shrink-0">{count}</span>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-sidebar-accent/50"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => openEditCategoryDialog(category)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteCategory(category.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Status Quick Filters */}
        <Collapsible open={statusExpanded} onOpenChange={setStatusExpanded} className="pt-4 mt-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between px-3 mb-2">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-1 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider hover:text-sidebar-foreground/70 transition-colors">
                {statusExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                <div className="flex flex-col items-start">
                  <span>Status</span>
                  {selectedListId && (
                    <span className="text-[10px] text-sidebar-foreground/40 normal-case tracking-normal">
                      {isUsingListColumns ? `For "${selectedList?.name}"` : "Using global"}
                    </span>
                  )}
                </div>
                <span className="text-[10px] ml-1">({activeColumns.length})</span>
              </button>
            </CollapsibleTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-lg"
              onClick={() => setShowColumnDialog(true)}
              title={selectedListId ? `Add status to "${selectedList?.name}"` : "Add global status"}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <CollapsibleContent>
            <div className="space-y-1">
              {activeColumns.map((column, index) => (
                <div 
                  key={column.id} 
                  className={cn(
                    "group relative transition-all duration-200",
                    draggingStatusId === column.id && "opacity-50",
                    dragOverStatusId === column.id && "border-t-2 border-primary"
                  )}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("statusId", column.id);
                    e.dataTransfer.setData("statusReorder", "true");
                    e.dataTransfer.effectAllowed = "move";
                    setDraggingStatusId(column.id);
                  }}
                  onDragEnd={() => {
                    setDraggingStatusId(null);
                    setDragOverStatusId(null);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (draggingStatusId && draggingStatusId !== column.id) {
                      setDragOverStatusId(column.id);
                    }
                  }}
                  onDragLeave={() => {
                    setDragOverStatusId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const isReorder = e.dataTransfer.getData("statusReorder");
                    if (isReorder && draggingStatusId && draggingStatusId !== column.id && onReorderColumns) {
                      const dragIndex = activeColumns.findIndex((c) => c.id === draggingStatusId);
                      const dropIndex = index;
                      if (dragIndex !== -1 && dropIndex !== -1) {
                        const newColumns = [...activeColumns];
                        const [removed] = newColumns.splice(dragIndex, 1);
                        newColumns.splice(dropIndex, 0, removed);
                        onReorderColumns(newColumns);
                      }
                    }
                    setDraggingStatusId(null);
                    setDragOverStatusId(null);
                  }}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2 rounded-xl h-10 px-3 pr-8",
                      "hover:bg-sidebar-accent text-sidebar-foreground",
                      selectedStatus === column.id && "bg-sidebar-accent"
                    )}
                    onClick={() => {
                      onStatusSelect(selectedStatus === column.id ? null : column.id);
                      onViewModeChange("all");
                      onCategorySelect(null);
                      // Don't clear list selection when clicking status within a list
                      if (!selectedListId) {
                        onSelectList(null);
                      }
                    }}
                  >
                    <GripVertical className="h-3 w-3 text-sidebar-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                    {column.isCompletionStatus ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <div 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: column.color }}
                      />
                    )}
                    <span className="text-sm flex-1 text-left truncate">{column.title}</span>
                    {column.isCompletionStatus && (
                      <span className="text-[10px] text-emerald-500 font-medium shrink-0">Done</span>
                    )}
                  </Button>

                  {/* Task count - shows when not hovered */}
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-sidebar-foreground/50 group-hover:opacity-0 transition-opacity pointer-events-none">
                    {taskCounts[column.id] || 0}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-sidebar-accent/50"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => openEditColumnDialog(column)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteColumnClick(column.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </nav>

      {/* New/Edit List Dialog */}
      <Dialog
        open={showNewListDialog || !!editingList}
        onOpenChange={(open) => {
          if (!open) {
            setShowNewListDialog(false);
            setEditingList(null);
            setNewListName("");
            setNewListColor(LIST_COLORS[0]);
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingList ? "Edit List" : "Create New List"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">List Name</label>
              <Input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name..."
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {LIST_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewListColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-xl transition-all",
                      newListColor === color && "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowNewListDialog(false);
                setEditingList(null);
              }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={editingList ? handleUpdateList : handleCreateList}
              className="rounded-xl"
              disabled={!newListName.trim()}
            >
              {editingList ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog
        open={showCategoryDialog || !!editingCategory}
        onOpenChange={(open) => {
          if (!open) {
            setShowCategoryDialog(false);
            setEditingCategory(null);
            setNewCategoryName("");
            setNewCategoryColor(LIST_COLORS[0]);
            setNewCategoryIcon("tag");
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Create New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category Name</label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name..."
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_ICONS.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setNewCategoryIcon(item.id)}
                      className={cn(
                        "w-10 h-10 rounded-xl transition-all flex items-center justify-center border",
                        newCategoryIcon === item.id 
                          ? "ring-2 ring-offset-2 ring-primary border-primary" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <IconComponent className="h-5 w-5" style={{ color: newCategoryColor }} />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {LIST_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCategoryColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-xl transition-all",
                      newCategoryColor === color && "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowCategoryDialog(false);
                setEditingCategory(null);
              }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
              className="rounded-xl"
              disabled={!newCategoryName.trim()}
            >
              {editingCategory ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Column/Status Dialog */}
      <Dialog
        open={showColumnDialog || !!editingColumn}
        onOpenChange={(open) => {
          if (!open) {
            setShowColumnDialog(false);
            setEditingColumn(null);
            setNewColumnName("");
            setNewColumnColor(LIST_COLORS[0]);
            setNewColumnIsCompletion(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingColumn 
                ? "Edit Status Column" 
                : selectedListId 
                  ? `Create Status for "${selectedList?.name}"`
                  : "Create Global Status Column"
              }
            </DialogTitle>
          </DialogHeader>
          {selectedListId && !editingColumn && (
            <p className="text-sm text-muted-foreground -mt-2">
              This status will only appear in the &quot;{selectedList?.name}&quot; list.
            </p>
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Name</label>
              <Input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="e.g., Blocked, Testing, Deployed..."
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {LIST_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColumnColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-xl transition-all",
                      newColumnColor === color && "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Checkbox
                id="completion-status"
                checked={newColumnIsCompletion}
                onCheckedChange={(checked) => setNewColumnIsCompletion(checked as boolean)}
                className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              />
              <div className="flex-1">
                <label htmlFor="completion-status" className="text-sm font-medium cursor-pointer">
                  Mark as completion status
                </label>
                <p className="text-xs text-muted-foreground">
                  Tasks moved to this status will be marked as completed
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowColumnDialog(false);
                setEditingColumn(null);
              }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={editingColumn ? handleUpdateColumn : handleCreateColumn}
              className="rounded-xl"
              disabled={!newColumnName.trim()}
            >
              {editingColumn ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
