"use client";

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task } from "@/lib/types";
import { CATEGORIES } from "@/lib/task-store";
import {
  AVAILABLE_WIDGETS,
  DEFAULT_ACTIVE_WIDGETS,
  type ActiveBentoWidget,
  type BentoWidgetType,
} from "@/lib/bento-widgets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  ListTodo,
  Calendar,
  Plus,
  Clock,
  Zap,
  Flag,
  FolderOpen,
  X,
  GripVertical,
  BookOpen,
  History,
  Type,
  Lightbulb,
  HelpCircle,
  Quote,
  Target,
  Wind,
  Cloud,
  MapPin,
  Shuffle,
  Sun,
  AlertCircle,
  Timer,
  StickyNote,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  Star,
  Maximize2,
  Minimize2,
  Moon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  CloudSun,
  CloudMoon,
  Droplets,
  Thermometer,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/storage";

interface BentoGridProps {
  tasks: Task[];
  onNewTask: () => void;
  onEditTask?: (task: Task) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onToggleFavorite?: (taskId: string) => void;
}

// Static random data - generated once on page load
const RANDOM_FACTS = [
  "Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible.",
  "Octopuses have three hearts and blue blood.",
  "A day on Venus is longer than its year.",
  "Bananas are berries, but strawberries aren't.",
  "The shortest war in history lasted 38 to 45 minutes.",
  "A group of flamingos is called a 'flamboyance'.",
  "The Eiffel Tower can grow up to 6 inches taller during summer due to heat expansion.",
];

const RANDOM_QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
];

const WORDS_OF_DAY = [
  { word: "Serendipity", meaning: "Finding something good without looking for it", pronunciation: "ser-uhn-DIP-i-tee" },
  { word: "Ephemeral", meaning: "Lasting for a very short time", pronunciation: "ih-FEM-er-uhl" },
  { word: "Luminous", meaning: "Emitting or reflecting light; bright", pronunciation: "LOO-muh-nuhs" },
  { word: "Petrichor", meaning: "The pleasant smell after rain", pronunciation: "PET-ri-kor" },
];

const ON_THIS_DAY = [
  "1969: Apollo 11 launched, carrying the first humans to walk on the Moon.",
  "1990: The Hubble Space Telescope was deployed.",
  "2007: The first iPhone was released by Apple.",
  "1903: The Wright Brothers made the first powered flight.",
];

const TRIVIA = [
  { question: "What is the largest planet in our solar system?", answer: "Jupiter" },
  { question: "What year did World War II end?", answer: "1945" },
  { question: "What is the chemical symbol for gold?", answer: "Au" },
  { question: "How many bones are in the human body?", answer: "206" },
];

const DID_YOU_KNOW = [
  "The human brain uses about 20% of the body's energy.",
  "Light takes 8 minutes to travel from the Sun to Earth.",
  "There are more stars in the universe than grains of sand on Earth.",
  "Your heart beats about 100,000 times per day.",
];

const EMOJIS = ["🎯", "🚀", "💡", "🔥", "✨", "🌟", "💪", "🎉", "🌈", "⚡"];

const POLL_QUESTIONS = [
  { question: "Coffee or Tea?", optionA: "Coffee", optionB: "Tea" },
  { question: "Morning or Night?", optionA: "Morning", optionB: "Night" },
  { question: "Books or Movies?", optionA: "Books", optionB: "Movies" },
  { question: "Beach or Mountains?", optionA: "Beach", optionB: "Mountains" },
  { question: "Cats or Dogs?", optionA: "Cats", optionB: "Dogs" },
  { question: "Summer or Winter?", optionA: "Summer", optionB: "Winter" },
];

const SURPRISE_WIDGET_TYPES: BentoWidgetType[] = [
  "wiki-fact", "quote", "word-of-day", "did-you-know", "trivia", "random-emoji"
];

// Generate random indices once at module load time (page refresh)
const getRandomIndex = (max: number) => Math.floor(Math.random() * max);
const INITIAL_RANDOM_INDICES = {
  fact: getRandomIndex(RANDOM_FACTS.length),
  quote: getRandomIndex(RANDOM_QUOTES.length),
  word: getRandomIndex(WORDS_OF_DAY.length),
  event: getRandomIndex(ON_THIS_DAY.length),
  trivia: getRandomIndex(TRIVIA.length),
  dyk: getRandomIndex(DID_YOU_KNOW.length),
  emoji: getRandomIndex(EMOJIS.length),
  poll: getRandomIndex(POLL_QUESTIONS.length),
  surprise: getRandomIndex(SURPRISE_WIDGET_TYPES.length),
};

// Memoized Quick Notes component to prevent re-renders - with localStorage
const QuickNotesWidget = memo(function QuickNotesWidget() {
  const [notes, setNotes] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setNotes(storage.getQuickNotes(""));
    setIsHydrated(true);
  }, []);

  const handleChange = (value: string) => {
    setNotes(value);
    if (isHydrated) {
      storage.saveQuickNotes(value);
    }
  };
  
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center gap-2 mb-2">
        <StickyNote className="w-4 h-4 text-yellow-500" />
        <p className="text-xs text-muted-foreground font-medium">Quick Notes</p>
      </div>
      <Textarea
        placeholder="Write something..."
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        className="flex-1 text-sm resize-none rounded-lg"
      />
    </div>
  );
});

// Memoized Daily Intention component - with localStorage
const DailyIntentionWidget = memo(function DailyIntentionWidget() {
  const [intention, setIntention] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIntention(storage.getDailyIntention(""));
    setIsHydrated(true);
  }, []);

  const handleChange = (value: string) => {
    setIntention(value);
    if (isHydrated) {
      storage.saveDailyIntention(value);
    }
  };
  
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-4 h-4 text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Daily Intention</p>
      </div>
      <Input
        placeholder="Set your focus..."
        value={intention}
        onChange={(e) => handleChange(e.target.value)}
        className="text-sm h-8 rounded-lg"
      />
    </div>
  );
});

// Memoized Pomodoro Timer with customizable duration - with localStorage
const PomodoroWidget = memo(function PomodoroWidget() {
  const [duration, setDuration] = useState(25);
  const [time, setTime] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedDuration = storage.getPomodoroDuration(25);
    setDuration(savedDuration);
    setTime(savedDuration * 60);
  }, []);

  useEffect(() => {
    if (running && time > 0) {
      const timer = setInterval(() => setTime((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [running, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDurationChange = (newDuration: number) => {
    const clamped = Math.min(Math.max(1, newDuration), 120);
    setDuration(clamped);
    setTime(clamped * 60);
    setRunning(false);
    storage.savePomodoroDuration(clamped);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <p className="text-xs text-muted-foreground font-medium mb-2">Pomodoro</p>
      {isEditing ? (
        <div className="flex items-center gap-2 mb-2">
          <Input
            type="number"
            min={1}
            max={120}
            value={duration}
            onChange={(e) => handleDurationChange(parseInt(e.target.value) || 25)}
            className="w-16 h-8 text-center text-sm"
          />
          <span className="text-xs text-muted-foreground">min</span>
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-8 px-2">
            Done
          </Button>
        </div>
      ) : (
        <button 
          onClick={() => setIsEditing(true)}
          className="text-3xl font-bold text-foreground font-mono hover:text-primary transition-colors"
        >
          {formatTime(time)}
        </button>
      )}
      <div className="flex gap-2 mt-3">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 rounded-full bg-transparent"
          onClick={() => setRunning(!running)}
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 rounded-full bg-transparent"
          onClick={() => {
            setTime(duration * 60);
            setRunning(false);
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      {!isEditing && (
        <p className="text-[10px] text-muted-foreground mt-1">Click time to edit</p>
      )}
    </div>
  );
});

// Memoized Mood Check widget - with localStorage
const MoodCheckWidget = memo(function MoodCheckWidget() {
  const [mood, setMood] = useState<string | null>(null);
  const moods = ["😊", "😐", "😔", "😤", "🤩"];

  useEffect(() => {
    setMood(storage.getMood(null));
  }, []);

  const handleMoodSelect = (m: string) => {
    setMood(m);
    storage.saveMood(m);
  };
  
  return (
    <div className="h-full flex flex-col p-4">
      <p className="text-xs text-muted-foreground font-medium mb-2">How are you?</p>
      <div className="flex gap-2 justify-center flex-1 items-center">
        {moods.map((m) => (
          <button
            key={m}
            onClick={() => handleMoodSelect(m)}
            className={cn(
              "text-2xl transition-transform hover:scale-110",
              mood === m && "scale-125"
            )}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
});

// Memoized Breathing Box widget
const BreathingWidget = memo(function BreathingWidget() {
  const [phase, setPhase] = useState<"idle" | "inhale" | "hold" | "exhale">("idle");

  const startBreathing = () => {
    if (phase === "idle") {
      setPhase("inhale");
      setTimeout(() => setPhase("hold"), 4000);
      setTimeout(() => setPhase("exhale"), 8000);
      setTimeout(() => setPhase("idle"), 12000);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <p className="text-xs text-muted-foreground font-medium mb-3">Breathing</p>
      <motion.div
        animate={{
          scale: phase === "inhale" ? 1.3 : phase === "hold" ? 1.3 : 1,
        }}
        transition={{ duration: 4 }}
        className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center"
      >
        <Wind className="w-6 h-6 text-primary" />
      </motion.div>
      <p className="text-xs text-muted-foreground mt-2 capitalize">
        {phase === "idle" ? "Tap to start" : phase}
      </p>
      {phase === "idle" && (
        <button onClick={startBreathing} className="text-xs text-primary mt-2">
          Start
        </button>
      )}
    </div>
  );
});

// Memoized Mini Poll widget - changes on refresh
const MiniPollWidget = memo(function MiniPollWidget() {
  const [vote, setVote] = useState<"a" | "b" | null>(null);
  const poll = POLL_QUESTIONS[INITIAL_RANDOM_INDICES.poll];
  
  return (
    <div className="h-full flex flex-col p-4">
      <p className="text-xs text-muted-foreground font-medium mb-2">This or That?</p>
      <p className="text-sm text-foreground mb-3">{poll.question}</p>
      <div className="flex gap-2">
        <button
          onClick={() => setVote("a")}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm transition-colors",
            vote === "a" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          )}
        >
          {poll.optionA}
        </button>
        <button
          onClick={() => setVote("b")}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm transition-colors",
            vote === "b" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          )}
        >
          {poll.optionB}
        </button>
      </div>
    </div>
  );
});

// Weather data interface
interface WeatherData {
  current: {
    temp: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    feelsLike: number;
    uvIndex: number;
    visibility: number;
    pressure: number;
    isDay: boolean;
  };
  hourly: Array<{
    time: string;
    temp: number;
  }>;
  daily: Array<{
    date: string;
    day: string;
    tempMax: number;
    tempMin: number;
    condition: string;
    icon: string;
  }>;
  location: {
    city: string;
    timezone: string;
  };
}

// Weather icon component
function WeatherIcon({ icon, className }: { icon: string; className?: string }) {
  const iconMap: Record<string, React.ElementType> = {
    sun: Sun,
    moon: Moon,
    cloud: Cloud,
    "cloud-sun": CloudSun,
    "cloud-moon": CloudMoon,
    "cloud-rain": CloudRain,
    "cloud-drizzle": CloudDrizzle,
    "cloud-snow": CloudSnow,
    "cloud-lightning": CloudLightning,
    "cloud-fog": CloudFog,
  };
  const IconComponent = iconMap[icon] || Sun;
  return <IconComponent className={className} />;
}

// Weather widget with location permission - comprehensive view
const WeatherWidget = memo(function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationStatus, setLocationStatus] = useState<"pending" | "granted" | "denied">("pending");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"temperature" | "precipitation" | "wind">("temperature");
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Initializing...");

  const convertTemp = (temp: number) => {
    if (unit === "F") {
      return Math.round((temp * 9) / 5 + 32);
    }
    return temp;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async (lat: number, lng: number) => {
      if (!isMounted) return;
      setStatusMessage("Fetching weather data...");
      console.log("[v0] Fetching weather for:", lat, lng);
      
      try {
        const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
        console.log("[v0] Weather API response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("[v0] Weather API error:", errorText);
          throw new Error("Failed to fetch weather");
        }
        
        const data = await response.json();
        console.log("[v0] Weather data received:", data);
        
        if (isMounted) {
          setWeather(data);
          setLocationStatus("granted");
          setLoading(false);
        }
      } catch (e) {
        console.error("[v0] Weather fetch error:", e);
        if (isMounted) {
          setError("Failed to load weather data");
          setLocationStatus("denied");
          setLoading(false);
        }
      }
    };

    const getLocation = () => {
      setStatusMessage("Checking saved location...");
      const savedLocation = storage.getUserLocation<{ lat?: number; lng?: number } | null>(null);
      console.log("[v0] Saved location:", savedLocation);
      
      if (savedLocation?.lat && savedLocation?.lng) {
        fetchWeather(savedLocation.lat, savedLocation.lng);
      } else if (navigator.geolocation) {
        setStatusMessage("Requesting location access...");
        console.log("[v0] Requesting geolocation...");
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("[v0] Geolocation success:", position.coords);
            const { latitude, longitude } = position.coords;
            storage.saveUserLocation({ 
              lat: latitude, 
              lng: longitude,
            });
            fetchWeather(latitude, longitude);
          },
          (err) => {
            console.error("[v0] Geolocation error:", err.code, err.message);
            if (isMounted) {
              setError(`Location error: ${err.message}`);
              setLocationStatus("denied");
              setLoading(false);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }
        );
      } else {
        console.error("[v0] Geolocation not supported");
        if (isMounted) {
          setError("Geolocation not supported");
          setLocationStatus("denied");
          setLoading(false);
        }
      }
    };

    // Small delay to ensure component is mounted
    const timer = setTimeout(getLocation, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-2" />
        <p className="text-sm text-slate-400">{statusMessage}</p>
        <p className="text-xs text-slate-500 mt-1">Please allow location access if prompted</p>
      </div>
    );
  }

  if (locationStatus === "denied" || error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl">
        <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
        <p className="text-sm text-slate-300 mb-1">Location access needed</p>
        <p className="text-xs text-slate-500 mb-3">{error || "Allow location to see weather"}</p>
        <button 
          onClick={() => {
            storage.saveUserLocation(null);
            window.location.reload();
          }}
          className="text-xs text-sky-400 hover:text-sky-300 transition-colors px-3 py-1.5 border border-sky-400/30 rounded-lg hover:bg-sky-400/10"
        >
          Retry Location Access
        </button>
      </div>
    );
  }

  if (!weather) return null;

  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", { 
    hour: "numeric", 
    minute: "2-digit",
    hour12: true 
  });
  const dayString = now.toLocaleDateString("en-US", { weekday: "long" });

  // Find min/max temps for chart scaling
  const hourlyTemps = weather.hourly.map(h => h.temp);
  const minTemp = Math.min(...hourlyTemps);
  const maxTemp = Math.max(...hourlyTemps);
  const tempRange = maxTemp - minTemp || 1;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden text-white">
      {/* Header section */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <WeatherIcon 
            icon={weather.current.icon} 
            className={cn(
              "w-12 h-12",
              weather.current.isDay ? "text-yellow-400" : "text-blue-300"
            )} 
          />
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-light">{convertTemp(weather.current.temp)}</span>
              <div className="flex items-center text-sm text-slate-400">
                <button 
                  onClick={() => setUnit("C")}
                  className={cn("transition-colors", unit === "C" ? "text-white" : "text-slate-500 hover:text-slate-300")}
                >
                  °C
                </button>
                <span className="mx-0.5">|</span>
                <button 
                  onClick={() => setUnit("F")}
                  className={cn("transition-colors", unit === "F" ? "text-white" : "text-slate-500 hover:text-slate-300")}
                >
                  °F
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                {weather.current.precipitation}%
              </span>
              <span className="flex items-center gap-1">
                <Wind className="w-3 h-3" />
                {weather.current.humidity}%
              </span>
              <span className="flex items-center gap-1">
                <Cloud className="w-3 h-3" />
                {weather.current.windSpeed} km/h
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-200">Weather</p>
          <p className="text-xs text-slate-400">{dayString}, {timeString}</p>
          <p className="text-xs text-slate-400">{weather.current.condition}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 px-4 border-b border-slate-700/50">
        {(["temperature", "precipitation", "wind"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "text-xs py-2 capitalize transition-colors border-b-2 -mb-px",
              activeTab === tab 
                ? "text-sky-400 border-sky-400" 
                : "text-slate-500 border-transparent hover:text-slate-300"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Hourly Chart */}
      <div className="flex-1 px-4 py-3 min-h-0">
        <div className="h-full flex flex-col">
          {/* Chart area */}
          <div className="flex-1 relative min-h-[60px]">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-500 w-6">
              <span>{convertTemp(maxTemp)}</span>
              <span>{convertTemp(Math.round((maxTemp + minTemp) / 2))}</span>
              <span>{convertTemp(minTemp)}</span>
            </div>
            
            {/* Chart */}
            <div className="absolute left-8 right-0 top-0 bottom-0">
              <svg className="w-full h-full" preserveAspectRatio="none">
                {/* Gradient fill */}
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(234 179 8 / 0.3)" />
                    <stop offset="100%" stopColor="rgb(234 179 8 / 0.05)" />
                  </linearGradient>
                </defs>
                
                {/* Area fill */}
                <path
                  d={`
                    M 0,${100 - ((weather.hourly[0]?.temp - minTemp) / tempRange) * 80}
                    ${weather.hourly.slice(0, 12).map((h, i) => {
                      const x = (i / 11) * 100;
                      const y = 100 - ((h.temp - minTemp) / tempRange) * 80;
                      return `L ${x},${y}`;
                    }).join(" ")}
                    L 100,100 L 0,100 Z
                  `}
                  fill="url(#tempGradient)"
                  className="opacity-60"
                />
                
                {/* Line */}
                <path
                  d={`
                    M 0,${100 - ((weather.hourly[0]?.temp - minTemp) / tempRange) * 80}
                    ${weather.hourly.slice(0, 12).map((h, i) => {
                      const x = (i / 11) * 100;
                      const y = 100 - ((h.temp - minTemp) / tempRange) * 80;
                      return `L ${x},${y}`;
                    }).join(" ")}
                  `}
                  fill="none"
                  stroke="rgb(234 179 8)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>
          
          {/* X-axis labels */}
          <div className="flex justify-between text-[10px] text-slate-500 pt-1 pl-8">
            {weather.hourly.slice(0, 12).filter((_, i) => i % 3 === 0).map((h, i) => (
              <span key={i}>{h.time}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 7-day forecast */}
      <div className="border-t border-slate-700/50">
        <div className="flex overflow-x-auto scrollbar-hide">
          {weather.daily.slice(0, 8).map((day, i) => (
            <div
              key={day.date}
              className={cn(
                "flex-shrink-0 flex flex-col items-center py-2 px-3 min-w-[60px]",
                i === 0 && "bg-slate-700/30"
              )}
            >
              <span className="text-[10px] text-slate-400 mb-1">{day.day}</span>
              <WeatherIcon 
                icon={day.icon} 
                className="w-5 h-5 text-yellow-500 my-1" 
              />
              <div className="flex items-center gap-1 text-[10px]">
                <span className="text-slate-200">{convertTemp(day.tempMax)}°</span>
                <span className="text-slate-500">{convertTemp(day.tempMin)}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {weather.location.city}
        </span>
        <button 
          onClick={() => {
            setLoading(true);
            storage.saveUserLocation(null);
            window.location.reload();
          }}
          className="hover:text-slate-300 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
});

// Location widget with permission
const LocationWidget = memo(function LocationWidget() {
  const [location, setLocation] = useState<{ city: string; country: string; timezone: string; coords?: { lat: number; lng: number } } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"pending" | "granted" | "denied">("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocationName = async (lat: number, lng: number) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
          { headers: { "User-Agent": "TaskManager/1.0" } }
        );
        if (response.ok) {
          const data = await response.json();
          const city = data.address?.city || 
                       data.address?.town || 
                       data.address?.village || 
                       data.address?.municipality ||
                       data.address?.county ||
                       "Your Location";
          const country = data.address?.country || "Unknown";
          return { city, country };
        }
      } catch (e) {
        console.error("Reverse geocoding error:", e);
      }
      return { city: "Your Location", country: "Unknown" };
    };

    const savedLocation = storage.getUserLocation<{ lat?: number; lng?: number; city?: string; country?: string; timezone?: string } | null>(null);
    
    if (savedLocation?.city && savedLocation?.lat && savedLocation?.lng) {
      const tz = savedLocation.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      setLocation({ 
        city: savedLocation.city, 
        country: savedLocation.country || "Unknown", 
        timezone: tz,
        coords: { lat: savedLocation.lat, lng: savedLocation.lng }
      });
      setLocationStatus("granted");
      setLoading(false);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const { city, country } = await fetchLocationName(latitude, longitude);
          
          storage.saveUserLocation({ 
            lat: latitude, 
            lng: longitude,
            city,
            country,
            timezone: tz 
          });
          setLocation({ city, country, timezone: tz, coords: { lat: latitude, lng: longitude } });
          setLocationStatus("granted");
          setLoading(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLocationStatus("denied");
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationStatus("denied");
      setLoading(false);
    }
  }, []);

  // Get sunrise/sunset times (simplified calculation)
  const getSunTimes = () => {
    const now = new Date();
    const sunrise = new Date(now);
    sunrise.setHours(6, 30, 0);
    const sunset = new Date(now);
    sunset.setHours(19, 45, 0);
    return {
      rise: sunrise.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
      set: sunset.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
    };
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  if (locationStatus === "denied") {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-6 h-6 text-muted-foreground mb-2" />
        <p className="text-xs text-muted-foreground">Location access needed</p>
        <button 
          onClick={() => {
            storage.saveUserLocation(null);
            window.location.reload();
          }}
          className="text-xs text-primary mt-2 hover:underline"
        >
          Enable Location
        </button>
      </div>
    );
  }

  const sunTimes = getSunTimes();

  return (
    <div className="h-full flex flex-col p-4">
      <MapPin className="w-4 h-4 text-primary mb-2" />
      <p className="text-sm font-medium text-foreground">{location?.city}</p>
      <p className="text-xs text-muted-foreground">{location?.country}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{location?.timezone}</p>
      <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
        <span>Rise: {sunTimes.rise}</span>
        <span>Set: {sunTimes.set}</span>
      </div>
      {location?.coords && (
        <p className="text-[9px] text-muted-foreground/60 mt-1">
          {location.coords.lat.toFixed(4)}°, {location.coords.lng.toFixed(4)}°
        </p>
      )}
    </div>
  );
});

// Clock widget with 12h/24h toggle and location-based timezone
const ClockWidget = memo(function ClockWidget() {
  const [time, setTime] = useState(new Date());
  const [format, setFormat] = useState<"12h" | "24h">("12h");
  const [timezone, setTimezone] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<"pending" | "granted" | "denied">("pending");

  useEffect(() => {
    // Load saved format
    setFormat(storage.getClockFormat("12h"));
    
    // Try to get user's timezone from location
    const savedLocation = storage.getUserLocation<{ timezone?: string } | null>(null);
    if (savedLocation?.timezone) {
      setTimezone(savedLocation.timezone);
      setLocationStatus("granted");
    } else {
      // Request location permission
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Get timezone from coordinates (simplified - uses browser's timezone)
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            setTimezone(tz);
            setLocationStatus("granted");
            storage.saveUserLocation({ 
              lat: position.coords.latitude, 
              lng: position.coords.longitude,
              timezone: tz 
            });
          },
          () => {
            setLocationStatus("denied");
            // Use browser's default timezone
            setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
          }
        );
      } else {
        setLocationStatus("denied");
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFormat = () => {
    const newFormat = format === "12h" ? "24h" : "12h";
    setFormat(newFormat);
    storage.saveClockFormat(newFormat);
  };

  const formatTime = () => {
    if (format === "24h") {
      return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return (
    <div 
      className="h-full flex flex-col items-center justify-center p-4 cursor-pointer relative"
      onClick={toggleFormat}
      title="Click to toggle 12h/24h format"
    >
      <span className="absolute top-2 right-2 text-[10px] text-muted-foreground font-medium">
        {format}
      </span>
      <Clock className="w-5 h-5 text-muted-foreground mb-2" />
      <p className="text-2xl font-bold text-foreground font-mono">
        {formatTime()}
      </p>
      <p className="text-xs text-muted-foreground">
        {time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
      </p>
    </div>
  );
});

// Trivia widget with isolated state
const TriviaWidget = memo(function TriviaWidget() {
  const [showAnswer, setShowAnswer] = useState(false);
  const trivia = TRIVIA[INITIAL_RANDOM_INDICES.trivia];
  
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="w-4 h-4 text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Mini Trivia</p>
      </div>
      <p className="text-sm text-foreground mb-2">{trivia.question}</p>
      <button
        onClick={() => setShowAnswer(!showAnswer)}
        className="text-xs text-primary hover:underline text-left"
      >
        {showAnswer ? trivia.answer : "Tap to reveal answer"}
      </button>
    </div>
  );
});

// Random Emoji widget with isolated state
const RandomEmojiWidget = memo(function RandomEmojiWidget() {
  const [emoji, setEmoji] = useState(EMOJIS[INITIAL_RANDOM_INDICES.emoji]);
  
  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <p className="text-5xl">{emoji}</p>
      <button
        onClick={() => setEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)])}
        className="text-xs text-primary mt-2 flex items-center gap-1"
      >
        <RefreshCw className="w-3 h-3" /> Refresh
      </button>
    </div>
  );
});

type WidgetSize = "small" | "medium" | "large" | "wide" | "tall";

interface WidgetState extends ActiveBentoWidget {
  size: WidgetSize;
}

export function ResizableBentoGrid({ tasks, onNewTask, onEditTask, onToggleSubtask, onToggleFavorite }: BentoGridProps) {
  const [activeWidgets, setActiveWidgets] = useState<WidgetState[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOverWidget, setDragOverWidget] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load widgets from localStorage on mount
  useEffect(() => {
    const savedWidgets = storage.getBentoWidgets<WidgetState[] | null>(null);
    if (savedWidgets && savedWidgets.length > 0) {
      setActiveWidgets(savedWidgets);
    } else {
      // Use defaults if nothing saved
      setActiveWidgets(DEFAULT_ACTIVE_WIDGETS.map(w => ({ ...w, size: "small" as WidgetSize })));
    }
    setIsHydrated(true);
  }, []);

  // Save widgets to localStorage when they change
  useEffect(() => {
    if (isHydrated && activeWidgets.length > 0) {
      storage.saveBentoWidgets(activeWidgets);
    }
  }, [activeWidgets, isHydrated]);

  // Memoized task stats
  const stats = useMemo(() => {
    const nonArchived = tasks.filter((t) => !t.isArchived);
    const totalTasks = nonArchived.length;
    const completedTasks = nonArchived.filter((t) => t.status === "done").length;
    const inProgressTasks = nonArchived.filter((t) => t.status === "in-progress").length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const urgentCount = nonArchived.filter((t) => t.priority === "urgent").length;
    const highCount = nonArchived.filter((t) => t.priority === "high").length;
    const mediumCount = nonArchived.filter((t) => t.priority === "medium").length;
    const lowCount = nonArchived.filter((t) => t.priority === "low").length;

    const categoryCount = nonArchived.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategoryEntry = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
    const topCategoryData = topCategoryEntry ? CATEGORIES.find((c) => c.id === topCategoryEntry[0]) : null;

    const today = new Date().toISOString().split("T")[0];
    const upcomingTasks = nonArchived
      .filter((t) => t.dueDate && t.status !== "done")
      .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))
      .slice(0, 5);

    const todaysTasks = nonArchived.filter((t) => t.dueDate === today);
    const recentTasks = [...nonArchived]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
    const recentlyCompleted = nonArchived.filter((t) => t.status === "done").slice(0, 3);

    const categoriesWithCounts = CATEGORIES.map((cat) => ({
      ...cat,
      count: nonArchived.filter((t) => t.category === cat.id).length,
    })).filter((c) => c.count > 0);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      completionRate,
      urgentCount,
      highCount,
      mediumCount,
      lowCount,
      topCategoryName: topCategoryData?.name || (topCategoryEntry ? topCategoryEntry[0] : "None"),
      topCategoryCount: topCategoryEntry ? topCategoryEntry[1] : 0,
      upcomingTasks,
      todaysTasks,
      recentTasks,
      recentlyCompleted,
      categoriesWithCounts,
      today,
    };
  }, [tasks]);

  const formatDate = useCallback((dateStr: string) => {
    if (dateStr === stats.today) return "Today";
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateStr === tomorrow.toISOString().split("T")[0]) return "Tomorrow";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, [stats.today]);

  const handleAddWidget = useCallback((widgetId: string) => {
    setActiveWidgets((prev) => {
      if (prev.length >= 10) {
        const newWidgets = prev.slice(0, 9);
        return [...newWidgets, { id: Date.now().toString(), widgetId, position: 9, size: "small" }];
      }
      return [...prev, { id: Date.now().toString(), widgetId, position: prev.length, size: "small" }];
    });
  }, []);

  const handleRemoveWidget = useCallback((id: string) => {
    setActiveWidgets((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const handleToggleSize = useCallback((id: string) => {
    setActiveWidgets((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const sizes: WidgetSize[] = ["small", "medium", "large", "wide", "tall"];
        const currentIndex = sizes.indexOf(w.size);
        const nextSize = sizes[(currentIndex + 1) % sizes.length];
        return { ...w, size: nextSize };
      })
    );
  }, []);

  const handleDragStart = useCallback((widgetId: string) => {
    setDraggedWidget(widgetId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverWidget(targetId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverWidget(null);
  }, []);

  const handleDrop = useCallback((targetId: string) => {
    if (!draggedWidget || draggedWidget === targetId) {
      setDraggedWidget(null);
      setDragOverWidget(null);
      return;
    }

    setActiveWidgets((prev) => {
      const widgets = [...prev];
      const draggedIndex = widgets.findIndex((w) => w.id === draggedWidget);
      const targetIndex = widgets.findIndex((w) => w.id === targetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        [widgets[draggedIndex], widgets[targetIndex]] = [widgets[targetIndex], widgets[draggedIndex]];
        return widgets.map((w, i) => ({ ...w, position: i }));
      }
      return widgets;
    });
    setDraggedWidget(null);
    setDragOverWidget(null);
  }, [draggedWidget]);

  const selectedWidgetIds = useMemo(() => activeWidgets.map((w) => w.widgetId), [activeWidgets]);

  const getSizeClasses = (size: WidgetSize) => {
    switch (size) {
      case "small": return "";
      case "medium": return "col-span-2";
      case "large": return "col-span-2 row-span-2";
      case "wide": return "col-span-3";
      case "tall": return "row-span-2";
      default: return "";
    }
  };

  const renderWidget = useCallback((widgetType: BentoWidgetType, size: WidgetSize) => {
    switch (widgetType) {
      case "task-overview":
        return (
          <div className="h-full flex flex-col justify-between p-5">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Task Overview</p>
              <h2 className="text-3xl font-bold text-foreground mt-1">Bento</h2>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-bold text-foreground">{stats.completionRate}%</p>
                <p className="text-xs text-muted-foreground">Completion rate</p>
              </div>
              <div className="flex items-end gap-1 h-16 flex-1 max-w-24">
                {[40, 65, 45, 80, 55, 70, stats.completionRate].map((height, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-sm transition-all ${i === 6 ? "bg-primary" : "bg-muted"}`}
                    style={{ height: `${Math.max(height, 10)}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl bg-muted/50 p-2 text-center">
                <p className="text-lg font-bold text-foreground">{stats.totalTasks}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
              <div className="flex-1 rounded-xl bg-accent/10 p-2 text-center">
                <p className="text-lg font-bold text-accent">{stats.completedTasks}</p>
                <p className="text-[10px] text-muted-foreground">Done</p>
              </div>
              <div className="flex-1 rounded-xl bg-destructive/10 p-2 text-center">
                <p className="text-lg font-bold text-destructive">{stats.totalTasks - stats.completedTasks}</p>
                <p className="text-[10px] text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        );

      case "total-tasks":
        return (
          <div className="h-full flex flex-col justify-between p-4">
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <ListTodo className="w-4 h-4 text-primary" />
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase">Top Category</p>
                <p className="text-sm font-semibold text-foreground capitalize">{stats.topCategoryName}</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{stats.totalTasks}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
              <p className="text-sm text-muted-foreground">{stats.topCategoryCount} tasks</p>
            </div>
          </div>
        );

      case "priority-tower":
        return (
          <div className="h-full flex flex-col p-4">
            <p className="text-xs text-muted-foreground font-medium mb-3">Priority</p>
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-red-500/30">
                {stats.urgentCount}
              </div>
              <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-400/30">
                {stats.highCount}
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-300 flex items-center justify-center text-amber-900 font-bold text-sm shadow-lg shadow-amber-300/30">
                {stats.mediumCount}
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-400/30">
                {stats.lowCount}
              </div>
            </div>
          </div>
        );

      case "completed":
        return (
          <div className="h-full flex flex-col justify-between p-4">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center self-end">
              <CheckCircle2 className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.completedTasks}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        );

      case "upcoming":
        return (
          <div className="h-full flex flex-col p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium">Upcoming</p>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1.5 overflow-auto scrollbar-thin">
              {stats.upcomingTasks.length > 0 ? (
                stats.upcomingTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center gap-2">
                    <div
                      className="w-1 h-5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          task.priority === "urgent" ? "#ef4444" :
                          task.priority === "high" ? "#f97316" :
                          task.priority === "medium" ? "#eab308" : "#22c55e",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{task.title}</p>
                      <p className="text-[10px] text-orange-500">{formatDate(task.dueDate!)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No upcoming tasks</p>
              )}
            </div>
          </div>
        );

      case "new-task":
        return (
          <button
            onClick={onNewTask}
            className="h-full w-full flex flex-col items-center justify-center text-primary-foreground p-4"
          >
            <Plus className="w-6 h-6 mb-1" />
            <p className="text-sm font-semibold">New Task</p>
            <p className="text-[10px] opacity-80">Click to add</p>
          </button>
        );

      case "streak":
        return (
          <div className="h-full flex items-center justify-between p-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-xs text-muted-foreground font-medium">Streak</p>
                <Zap className="w-3 h-3 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">1</p>
              <p className="text-xs text-muted-foreground">days active</p>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="w-2 h-2 rounded-full bg-muted" />
              <div className="w-2 h-2 rounded-full bg-muted" />
            </div>
          </div>
        );

      case "in-progress":
        return (
          <div className="h-full flex flex-col justify-between p-4">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.inProgressTasks}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </div>
        );

      case "categories":
        return (
          <div className="h-full flex flex-col p-4">
            <p className="text-xs text-muted-foreground font-medium mb-2">Categories</p>
            <div className="flex-1 space-y-1.5 overflow-auto scrollbar-thin">
              {stats.categoriesWithCounts.length > 0 ? (
                stats.categoriesWithCounts.slice(0, 4).map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs font-medium text-foreground truncate">{cat.name}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${stats.totalTasks > 0 ? (cat.count / stats.totalTasks) * 100 : 0}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{cat.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No categories yet</p>
              )}
            </div>
          </div>
        );

      case "recent-tasks":
        return (
          <div className="h-full flex flex-col p-4">
            <p className="text-xs text-muted-foreground font-medium mb-3">Recent Tasks</p>
            <div className="flex-1 grid grid-cols-2 gap-2 overflow-auto">
              {stats.recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl bg-card border border-border/50 cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => onEditTask?.(task)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                      style={{
                        backgroundColor:
                          task.priority === "urgent" ? "#ef4444" :
                          task.priority === "high" ? "#f97316" :
                          task.priority === "medium" ? "#eab308" : "#22c55e",
                      }}
                    />
                    {task.isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">{task.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Subtasks</span>
                        <span>{task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}</span>
                      </div>
                      <Progress
                        value={(task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100}
                        className="h-1"
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {task.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {task.dueDate && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-orange-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(task.dueDate)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "random-wiki-fact":
        const fact = RANDOM_FACTS[INITIAL_RANDOM_INDICES.fact];
        return (
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground font-medium">Random Fact</p>
            </div>
            <p className="text-sm text-foreground flex-1">{fact}</p>
          </div>
        );

      case "on-this-day":
        const event = ON_THIS_DAY[INITIAL_RANDOM_INDICES.event];
        return (
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground font-medium">On This Day</p>
            </div>
            <p className="text-sm text-foreground flex-1">{event}</p>
          </div>
        );

      case "word-of-day":
        const word = WORDS_OF_DAY[INITIAL_RANDOM_INDICES.word];
        return (
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground font-medium">Word of the Day</p>
            </div>
            <p className="text-xl font-bold text-foreground">{word.word}</p>
            <p className="text-xs text-muted-foreground italic mb-1">{word.pronunciation}</p>
            <p className="text-sm text-foreground/80">{word.meaning}</p>
          </div>
        );

      case "did-you-know":
        const dyk = DID_YOU_KNOW[INITIAL_RANDOM_INDICES.dyk];
        return (
          <div className="h-full flex flex-col p-4">
            <Lightbulb className="w-5 h-5 text-yellow-500 mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Did You Know?</p>
            <p className="text-sm text-foreground">{dyk}</p>
          </div>
        );

      case "mini-trivia":
        return <TriviaWidget />;

      case "random-quote":
        const quote = RANDOM_QUOTES[INITIAL_RANDOM_INDICES.quote];
        return (
          <div className="h-full flex flex-col p-4">
            <Quote className="w-5 h-5 text-primary/50 mb-2" />
            <p className="text-sm text-foreground italic flex-1">"{quote.text}"</p>
            <p className="text-xs text-muted-foreground text-right">— {quote.author}</p>
          </div>
        );

      case "daily-intention":
        return <DailyIntentionWidget />;

      case "mood-check":
        return <MoodCheckWidget />;

      case "breathing-box":
        return <BreathingWidget />;

case "weather":
  return <WeatherWidget />;

      case "clock":
        return <ClockWidget />;

case "location":
  return <LocationWidget />;

      case "todays-tasks":
        return (
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-yellow-500" />
              <p className="text-xs text-muted-foreground font-medium">Today's Tasks</p>
            </div>
            <div className="flex-1 space-y-1 overflow-auto">
              {stats.todaysTasks.length > 0 ? (
                stats.todaysTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={task.status === "done"}
                      className="h-3 w-3 cursor-pointer"
                    />
                    <span className={cn("truncate", task.status === "done" && "line-through text-muted-foreground")}>
                      {task.title}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No tasks for today</p>
              )}
            </div>
          </div>
        );

      case "upcoming-deadlines":
        return (
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-xs text-muted-foreground font-medium">Deadlines</p>
            </div>
            <div className="flex-1 space-y-1.5 overflow-auto">
              {stats.upcomingTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <span className="text-xs truncate flex-1">{task.title}</span>
                  <span className="text-[10px] text-destructive">{formatDate(task.dueDate!)}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "pomodoro":
        return <PomodoroWidget />;

      case "quick-notes":
        return <QuickNotesWidget />;

      case "recently-completed":
        return (
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <p className="text-xs text-muted-foreground font-medium">Completed</p>
            </div>
            <div className="flex-1 space-y-1 overflow-auto">
              {stats.recentlyCompleted.length > 0 ? (
                stats.recentlyCompleted.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-3 h-3 text-accent flex-shrink-0" />
                    <span className="truncate text-muted-foreground line-through">{task.title}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No completed tasks yet</p>
              )}
            </div>
          </div>
        );

      case "random-emoji":
        return <RandomEmojiWidget />;

      case "mini-poll":
        return <MiniPollWidget />;

case "surprise-me": {
  // Show a random widget type that changes on refresh
  const surpriseType = SURPRISE_WIDGET_TYPES[INITIAL_RANDOM_INDICES.surprise];
  const surpriseContent = (() => {
    switch (surpriseType) {
      case "wiki-fact":
        return { icon: <BookOpen className="w-4 h-4 text-blue-500" />, title: "Random Fact", content: RANDOM_FACTS[INITIAL_RANDOM_INDICES.fact] };
      case "quote":
        const q = RANDOM_QUOTES[INITIAL_RANDOM_INDICES.quote];
        return { icon: <Quote className="w-4 h-4 text-primary" />, title: "Quote", content: `"${q.text}" - ${q.author}` };
      case "word-of-day":
        const w = WORDS_OF_DAY[INITIAL_RANDOM_INDICES.word];
        return { icon: <Type className="w-4 h-4 text-emerald-500" />, title: w.word, content: w.meaning };
      case "did-you-know":
        return { icon: <Lightbulb className="w-4 h-4 text-yellow-500" />, title: "Did You Know?", content: DID_YOU_KNOW[INITIAL_RANDOM_INDICES.dyk] };
      case "trivia":
        const t = TRIVIA[INITIAL_RANDOM_INDICES.trivia];
        return { icon: <HelpCircle className="w-4 h-4 text-purple-500" />, title: "Trivia", content: t.question };
      default:
        return { icon: <Shuffle className="w-4 h-4 text-primary" />, title: "Surprise!", content: EMOJIS[INITIAL_RANDOM_INDICES.emoji] };
    }
  })();
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center gap-2 mb-2">
        <Shuffle className="w-4 h-4 text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Surprise!</p>
      </div>
      <div className="flex items-center gap-2 mb-1">
        {surpriseContent.icon}
        <p className="text-xs font-medium text-foreground">{surpriseContent.title}</p>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-3">{surpriseContent.content}</p>
    </div>
  );
}

      default:
        return (
          <div className="h-full flex items-center justify-center p-4">
            <p className="text-sm text-muted-foreground">Widget not found</p>
          </div>
        );
    }
  }, [stats, formatDate, onNewTask, onEditTask]);

  const getWidgetStyles = useCallback((widgetType: BentoWidgetType, size: WidgetSize) => {
    const baseClasses = "rounded-2xl border border-border/50 overflow-hidden transition-all duration-200";
    const sizeClasses = getSizeClasses(size);

    switch (widgetType) {
      case "total-tasks":
        return cn(baseClasses, sizeClasses, "bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/40 dark:to-cyan-950/40 border-sky-100 dark:border-sky-900/50");
      case "new-task":
        return cn(baseClasses, sizeClasses, "bg-primary cursor-pointer hover:bg-primary/90");
      case "streak":
        return cn(baseClasses, sizeClasses, "bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30 border-rose-100 dark:border-rose-900/50");
      case "recent-tasks":
        return cn(baseClasses, "bg-muted/30 col-span-4 row-span-2");
      default:
        return cn(baseClasses, sizeClasses, "bg-card");
    }
  }, []);

  return (
    <div className="w-full">
      {/* Add Widget Button */}
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          onClick={() => setSelectorOpen(true)}
          className="rounded-xl gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Bento
          <Badge variant="secondary" className="ml-1">{activeWidgets.length}/10</Badge>
        </Button>
      </div>

      {/* Bento Grid */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          gridAutoRows: "120px",
        }}
      >
        <AnimatePresence mode="popLayout">
          {activeWidgets.map((widget) => {
            const widgetInfo = AVAILABLE_WIDGETS.find((w) => w.id === widget.widgetId);
            if (!widgetInfo) return null;

            return (
              <motion.div
                key={widget.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: draggedWidget === widget.id ? 1.02 : 1,
                  zIndex: draggedWidget === widget.id ? 10 : 1,
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                draggable
                onDragStart={() => handleDragStart(widget.id)}
                onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, widget.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(widget.id)}
                onDragEnd={() => {
                  setDraggedWidget(null);
                  setDragOverWidget(null);
                }}
                className={cn(
                  getWidgetStyles(widgetInfo.type, widget.size),
                  "relative group cursor-grab active:cursor-grabbing",
                  draggedWidget === widget.id && "ring-2 ring-primary shadow-xl",
                  dragOverWidget === widget.id && draggedWidget !== widget.id && "ring-2 ring-primary/50"
                )}
              >
                {/* Controls - Drag Handle, Resize & Remove */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                  <div className="p-1 rounded bg-background/80 backdrop-blur-sm cursor-grab">
                    <GripVertical className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSize(widget.id);
                    }}
                    className="p-1 rounded bg-background/80 backdrop-blur-sm hover:bg-muted transition-colors"
                    title={`Current: ${widget.size}. Click to cycle size.`}
                  >
                    {widget.size === "small" || widget.size === "tall" ? (
                      <Maximize2 className="w-3 h-3 text-muted-foreground" />
                    ) : (
                      <Minimize2 className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveWidget(widget.id);
                    }}
                    className="p-1 rounded bg-background/80 backdrop-blur-sm hover:bg-destructive/20 transition-colors"
                  >
                    <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>

                {/* Widget Content */}
                {renderWidget(widgetInfo.type, widget.size)}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Widget Selector Dialog */}
      <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-xl">Add Bento Widgets</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Select widgets to add to your dashboard (max 10)
            </p>
          </DialogHeader>

          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
            {["productivity", "knowledge", "motivation", "utilities", "fun"].map((category) => {
              const categoryWidgets = AVAILABLE_WIDGETS.filter((w) => w.category === category);
              const categoryLabels: Record<string, string> = {
                productivity: "Productivity",
                knowledge: "Knowledge & Curiosity",
                motivation: "Motivation & Mind",
                utilities: "Utilities & Live Data",
                fun: "Fun & Personal",
              };

              return (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-foreground mb-3">{categoryLabels[category]}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categoryWidgets.map((widget) => {
                      const isSelected = selectedWidgetIds.includes(widget.id);
                      const isDisabled = !isSelected && activeWidgets.length >= 10;

                      return (
                        <button
                          key={widget.id}
                          onClick={() => {
                            if (isSelected) {
                              const activeWidget = activeWidgets.find((w) => w.widgetId === widget.id);
                              if (activeWidget) handleRemoveWidget(activeWidget.id);
                            } else if (!isDisabled) {
                              handleAddWidget(widget.id);
                            }
                          }}
                          disabled={isDisabled}
                          className={cn(
                            "p-4 rounded-xl border text-left transition-all",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                            isDisabled && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                              {widget.icon === "ListTodo" && <ListTodo className="w-4 h-4" />}
                              {widget.icon === "CheckCircle2" && <CheckCircle2 className="w-4 h-4" />}
                              {widget.icon === "Calendar" && <Calendar className="w-4 h-4" />}
                              {widget.icon === "Clock" && <Clock className="w-4 h-4" />}
                              {widget.icon === "Zap" && <Zap className="w-4 h-4" />}
                              {widget.icon === "Flag" && <Flag className="w-4 h-4" />}
                              {widget.icon === "FolderOpen" && <FolderOpen className="w-4 h-4" />}
                              {widget.icon === "Plus" && <Plus className="w-4 h-4" />}
                              {widget.icon === "BookOpen" && <BookOpen className="w-4 h-4" />}
                              {widget.icon === "History" && <History className="w-4 h-4" />}
                              {widget.icon === "Type" && <Type className="w-4 h-4" />}
                              {widget.icon === "Lightbulb" && <Lightbulb className="w-4 h-4" />}
                              {widget.icon === "HelpCircle" && <HelpCircle className="w-4 h-4" />}
                              {widget.icon === "Quote" && <Quote className="w-4 h-4" />}
                              {widget.icon === "Target" && <Target className="w-4 h-4" />}
                              {widget.icon === "Wind" && <Wind className="w-4 h-4" />}
                              {widget.icon === "Cloud" && <Cloud className="w-4 h-4" />}
                              {widget.icon === "MapPin" && <MapPin className="w-4 h-4" />}
                              {widget.icon === "Sun" && <Sun className="w-4 h-4" />}
                              {widget.icon === "AlertCircle" && <AlertCircle className="w-4 h-4" />}
                              {widget.icon === "Timer" && <Timer className="w-4 h-4" />}
                              {widget.icon === "StickyNote" && <StickyNote className="w-4 h-4" />}
                              {widget.icon === "Trophy" && <Trophy className="w-4 h-4" />}
                              {widget.icon === "Shuffle" && <Shuffle className="w-4 h-4" />}
                              {widget.icon === "LayoutDashboard" && <ListTodo className="w-4 h-4" />}
                              {widget.icon === "Vote" && <HelpCircle className="w-4 h-4" />}
                              {widget.icon === "Smile" && <HelpCircle className="w-4 h-4" />}
                            </div>
                            <Checkbox checked={isSelected} className="cursor-pointer" />
                          </div>
                          <p className="text-sm font-medium text-foreground">{widget.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{widget.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {activeWidgets.length} of 10 widgets selected
            </p>
            <Button onClick={() => setSelectorOpen(false)} className="rounded-xl">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
