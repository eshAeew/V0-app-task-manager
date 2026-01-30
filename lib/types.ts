export type Priority = "urgent" | "high" | "medium" | "low";
export type Status = string; // Now dynamic - can be any custom status
export type ViewMode = "all" | "favorites" | "calendar" | "archived" | "trash";
export type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly";
export type BoardViewType = "status" | "priority" | "category" | "dueDate";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  category: string;
  dueDate?: string;
  tags: string[];
  createdAt: string;
  reminder?: string;
  subtasks?: Subtask[];
  isFavorite?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean; // For trash/recently deleted
  deletedAt?: string; // When task was deleted
  listId?: string; // For custom lists
  isPinned?: boolean; // Pin to top of column
  timeEstimate?: number; // Estimated time in minutes
  timeSpent?: number; // Actual time spent in minutes
  recurrence?: RecurrenceType; // Recurring task settings
  recurrenceEndDate?: string; // When recurrence ends
  dependsOn?: string[]; // Task IDs this task depends on
  blockedBy?: string[]; // Task IDs blocking this task
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isCustom?: boolean;
}

export interface Column {
  id: string;
  title: string;
  color: string;
  isCustom?: boolean;
}

// Activity log type for notifications
export interface ActivityLog {
  id: string;
  action: "task_created" | "task_updated" | "task_deleted" | "task_completed" | "list_created" | "list_deleted" | "category_created" | "category_deleted" | "status_created" | "status_deleted" | "bento_added" | "bento_removed";
  message: string;
  time: string;
  entityId?: string;
  entityName?: string;
}

export interface CustomList {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  columns?: Column[]; // List-specific statuses/columns
}

// Task template for reusable task configurations
export interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  tags: string[];
  subtasks?: Subtask[];
  timeEstimate?: number;
  recurrence?: RecurrenceType;
}

// For bulk selection
export interface SelectionState {
  selectedTaskIds: string[];
  isSelectionMode: boolean;
}

export const DEFAULT_COLUMNS: Column[] = [
  { id: "todo", title: "To Do", color: "#6366f1" },
  { id: "in-progress", title: "In Progress", color: "#f59e0b" },
  { id: "review", title: "Review", color: "#ec4899" },
  { id: "done", title: "Done", color: "#22c55e" },
];

// For backwards compatibility
export const COLUMNS = DEFAULT_COLUMNS;

export const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "urgent", label: "Urgent", color: "bg-priority-urgent" },
  { value: "high", label: "High", color: "bg-priority-high" },
  { value: "medium", label: "Medium", color: "bg-priority-medium" },
  { value: "low", label: "Low", color: "bg-priority-low" },
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "work", name: "Work", color: "#6366f1", icon: "briefcase" },
  { id: "personal", name: "Personal", color: "#22c55e", icon: "user" },
  { id: "design", name: "Design", color: "#f43f5e", icon: "palette" },
  { id: "development", name: "Development", color: "#3b82f6", icon: "code" },
];

export const LIST_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", 
  "#f97316", "#eab308", "#22c55e", "#14b8a6", 
  "#3b82f6", "#06b6d4"
];
