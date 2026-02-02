"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task, Status, Column } from "@/lib/types";
import { PRIORITIES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
} from "lucide-react";

interface CalendarViewProps {
  tasks: Task[];
  columns: Column[];
  onEditTask: (task: Task) => void;
  onNewTask: (date: string) => void;
}

export function CalendarView({ tasks, columns, onEditTask, onNewTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay, year, month };
  };

  const { daysInMonth, startingDay, year, month } = getDaysInMonth(currentDate);

  const calendarDays = useMemo(() => {
    const days = [];
    
    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i),
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }
    
    return days;
  }, [year, month, daysInMonth, startingDay]);

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return tasks.filter(
      (task) => task.dueDate === dateStr && !task.isArchived
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateStr = (date: Date) => date.toISOString().split("T")[0];

  const selectedDateTasks = selectedDate
    ? tasks.filter((t) => t.dueDate === selectedDate && !t.isArchived)
    : [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Calendar Grid */}
      <div className="flex-1 rounded-3xl bg-card border border-border/50 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-foreground">
              {monthNames[month]} {year}
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl bg-transparent"
              onClick={goToToday}
            >
              Today
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => navigateMonth(-1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => navigateMonth(1)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayData, index) => {
            const dayTasks = getTasksForDate(dayData.date);
            const dateStr = formatDateStr(dayData.date);
            const isSelected = selectedDate === dateStr;

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedDate(dateStr)}
                className={cn(
                  "relative min-h-[100px] p-2 rounded-2xl border border-transparent cursor-pointer transition-all",
                  dayData.isCurrentMonth
                    ? "bg-secondary/30 hover:bg-secondary/50"
                    : "bg-muted/20 opacity-50",
                  isToday(dayData.date) && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  isSelected && "border-primary bg-primary/10"
                )}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isToday(dayData.date) ? "text-primary" : "text-foreground"
                )}>
                  {dayData.day}
                </div>
                
                {/* Task indicators */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => {
                    const priority = PRIORITIES.find((p) => p.value === task.priority);
                    return (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask(task);
                        }}
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-md truncate",
                          "bg-secondary text-secondary-foreground",
                          "hover:bg-primary/20 transition-colors cursor-pointer"
                        )}
                      >
                        <div className="flex items-center gap-1">
                          <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", priority?.color)} />
                          <span className="truncate">{task.title}</span>
                        </div>
                      </div>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] text-muted-foreground px-1">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>

                {/* Add task button on hover */}
                {dayData.isCurrentMonth && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNewTask(dateStr);
                    }}
                    className="absolute top-2 right-2 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
                  >
                    <Plus className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Sidebar */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full lg:w-80 rounded-3xl bg-card border border-border/50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-xl"
                onClick={() => onNewTask(selectedDate)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin">
              {selectedDateTasks.length > 0 ? (
                selectedDateTasks.map((task) => {
                  const priority = PRIORITIES.find((p) => p.value === task.priority);
                  const status = columns.find((c) => c.id === task.status);
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => onEditTask(task)}
                      className="p-3 rounded-2xl bg-secondary/50 hover:bg-secondary/70 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", priority?.color)} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-[10px]">
                              {status?.title || task.status}
                            </Badge>
                            {task.subtasks && task.subtasks.length > 0 && (
                              <span className="text-[10px] text-muted-foreground">
                                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tasks for this day</p>
                  <Button
                    variant="link"
                    className="text-primary mt-2"
                    onClick={() => onNewTask(selectedDate)}
                  >
                    Add a task
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
