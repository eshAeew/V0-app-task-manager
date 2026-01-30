// Browser storage utility for persisting app data

const STORAGE_KEYS = {
  TASKS: "bento-tasks",
  CUSTOM_LISTS: "bento-custom-lists",
  CUSTOM_CATEGORIES: "bento-custom-categories",
  CUSTOM_COLUMNS: "bento-custom-columns",
  ACTIVITY_LOGS: "bento-activity-logs",
  BENTO_WIDGETS: "bento-active-widgets",
  QUICK_NOTES: "bento-quick-notes",
  DAILY_INTENTION: "bento-daily-intention",
  MOOD: "bento-mood",
  POMODORO_DURATION: "bento-pomodoro-duration",
  VIEW_PREFERENCE: "bento-view",
  SORT_PREFERENCE: "bento-sort",
  NOTIFICATIONS: "bento-notifications",
  CLOCK_FORMAT: "bento-clock-format",
  USER_LOCATION: "bento-user-location",
  COLLAPSED_COLUMNS: "bento-collapsed-columns",
  TASK_TEMPLATES: "bento-task-templates",
  COMPACT_VIEW: "bento-compact-view",
  BOARD_VIEW_TYPE: "bento-board-view-type",
} as const;

// Generic storage functions
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to storage:", error);
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from storage:", error);
  }
}

// Specific storage functions
export const storage = {
  // Tasks
  getTasks: <T>(defaultValue: T) => getFromStorage(STORAGE_KEYS.TASKS, defaultValue),
  saveTasks: <T>(tasks: T) => saveToStorage(STORAGE_KEYS.TASKS, tasks),

  // Custom Lists
  getCustomLists: <T>(defaultValue: T) => getFromStorage(STORAGE_KEYS.CUSTOM_LISTS, defaultValue),
  saveCustomLists: <T>(lists: T) => saveToStorage(STORAGE_KEYS.CUSTOM_LISTS, lists),

  // Bento Widgets
  getBentoWidgets: <T>(defaultValue: T) => getFromStorage(STORAGE_KEYS.BENTO_WIDGETS, defaultValue),
  saveBentoWidgets: <T>(widgets: T) => saveToStorage(STORAGE_KEYS.BENTO_WIDGETS, widgets),

  // Quick Notes
  getQuickNotes: (defaultValue: string = "") => getFromStorage(STORAGE_KEYS.QUICK_NOTES, defaultValue),
  saveQuickNotes: (notes: string) => saveToStorage(STORAGE_KEYS.QUICK_NOTES, notes),

  // Daily Intention
  getDailyIntention: (defaultValue: string = "") => getFromStorage(STORAGE_KEYS.DAILY_INTENTION, defaultValue),
  saveDailyIntention: (intention: string) => saveToStorage(STORAGE_KEYS.DAILY_INTENTION, intention),

  // Mood
  getMood: (defaultValue: string | null = null) => getFromStorage(STORAGE_KEYS.MOOD, defaultValue),
  saveMood: (mood: string | null) => saveToStorage(STORAGE_KEYS.MOOD, mood),

  // Pomodoro Duration
  getPomodoroDuration: (defaultValue: number = 25) => getFromStorage(STORAGE_KEYS.POMODORO_DURATION, defaultValue),
  savePomodoroDuration: (duration: number) => saveToStorage(STORAGE_KEYS.POMODORO_DURATION, duration),

  // View Preference
  getViewPreference: (defaultValue: "board" | "bento" = "board") => getFromStorage(STORAGE_KEYS.VIEW_PREFERENCE, defaultValue),
  saveViewPreference: (view: "board" | "bento") => saveToStorage(STORAGE_KEYS.VIEW_PREFERENCE, view),

  // Sort Preference
  getSortPreference: <T>(defaultValue: T) => getFromStorage(STORAGE_KEYS.SORT_PREFERENCE, defaultValue),
  saveSortPreference: <T>(sort: T) => saveToStorage(STORAGE_KEYS.SORT_PREFERENCE, sort),

  // Notifications
  getNotifications: <T>(defaultValue: T) => getFromStorage(STORAGE_KEYS.NOTIFICATIONS, defaultValue),
  saveNotifications: <T>(notifications: T) => saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications),

  // Clock Format (12h or 24h)
  getClockFormat: (defaultValue: "12h" | "24h" = "12h") => getFromStorage(STORAGE_KEYS.CLOCK_FORMAT, defaultValue),
  saveClockFormat: (format: "12h" | "24h") => saveToStorage(STORAGE_KEYS.CLOCK_FORMAT, format),

  // User Location
  getUserLocation: <T>(defaultValue: T) => getFromStorage(STORAGE_KEYS.USER_LOCATION, defaultValue),
  saveUserLocation: <T>(location: T) => saveToStorage(STORAGE_KEYS.USER_LOCATION, location),

  // Custom Categories
  getCustomCategories: <T>(defaultValue: T) => getFromStorage(STORAGE_KEYS.CUSTOM_CATEGORIES, defaultValue),
  saveCustomCategories: <T>(categories: T) => saveToStorage(STORAGE_KEYS.CUSTOM_CATEGORIES, categories),

  // Custom Columns (Status)
  getCustomColumns: <T>(defaultValue: T) => getFromStorage(STORAGE_KEYS.CUSTOM_COLUMNS, defaultValue),
  saveCustomColumns: <T>(columns: T) => saveToStorage(STORAGE_KEYS.CUSTOM_COLUMNS, columns),

  // Activity Logs
  getActivityLogs: <T>(defaultValue: T) => getFromStorage(STORAGE_KEYS.ACTIVITY_LOGS, defaultValue),
  saveActivityLogs: <T>(logs: T) => saveToStorage(STORAGE_KEYS.ACTIVITY_LOGS, logs),

  // Collapsed Columns
  getCollapsedColumns: (defaultValue: string[] = []) => getFromStorage(STORAGE_KEYS.COLLAPSED_COLUMNS, defaultValue),
  saveCollapsedColumns: (columns: string[]) => saveToStorage(STORAGE_KEYS.COLLAPSED_COLUMNS, columns),

  // Task Templates
  getTaskTemplates: <T>(defaultValue: T) => getFromStorage(STORAGE_KEYS.TASK_TEMPLATES, defaultValue),
  saveTaskTemplates: <T>(templates: T) => saveToStorage(STORAGE_KEYS.TASK_TEMPLATES, templates),

  // Compact View
  getCompactView: (defaultValue: boolean = false) => getFromStorage(STORAGE_KEYS.COMPACT_VIEW, defaultValue),
  saveCompactView: (compact: boolean) => saveToStorage(STORAGE_KEYS.COMPACT_VIEW, compact),

  // Board View Type
  getBoardViewType: (defaultValue: string = "status") => getFromStorage(STORAGE_KEYS.BOARD_VIEW_TYPE, defaultValue),
  saveBoardViewType: (viewType: string) => saveToStorage(STORAGE_KEYS.BOARD_VIEW_TYPE, viewType),

  // Clear tasks (useful for resetting to defaults)
  clearTasks: () => removeFromStorage(STORAGE_KEYS.TASKS),
  
  // Clear all storage
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      removeFromStorage(key);
    });
  },
};
