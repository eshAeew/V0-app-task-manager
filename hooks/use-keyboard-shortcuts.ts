"use client";

import { useEffect, useCallback } from "react";

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || 
                      target.tagName === "TEXTAREA" || 
                      target.isContentEditable;

      for (const shortcut of shortcuts) {
        const ctrlOrMeta = shortcut.ctrlKey || shortcut.metaKey;
        const matchesCtrl = ctrlOrMeta 
          ? (event.ctrlKey || event.metaKey) 
          : (!event.ctrlKey && !event.metaKey);
        const matchesShift = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const matchesAlt = shortcut.altKey ? event.altKey : !event.altKey;
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          // Allow Escape even in inputs
          if (shortcut.key === "Escape" || !isInput) {
            event.preventDefault();
            shortcut.callback();
            return;
          }
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// Predefined shortcuts list for help dialog
export const SHORTCUT_DEFINITIONS = [
  { keys: ["Ctrl", "N"], description: "Create new task" },
  { keys: ["Ctrl", "F"], description: "Focus search" },
  { keys: ["Ctrl", "B"], description: "Toggle sidebar" },
  { keys: ["Ctrl", "Shift", "A"], description: "Toggle selection mode" },
  { keys: ["Escape"], description: "Close dialog / Cancel" },
  { keys: ["Ctrl", "P"], description: "Print view" },
  { keys: ["Ctrl", "E"], description: "Export data" },
  { keys: ["?"], description: "Show keyboard shortcuts" },
];
