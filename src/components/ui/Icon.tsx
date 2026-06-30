"use client";

import {
  Activity, AlertCircle, ArrowRight, ArrowUpRight, Award, Baby, BarChart3,
  Bone, BookOpen, Bot, Brain, BrainCircuit, CalendarClock, CalendarDays, Check,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Circle, ClipboardList,
  Clock, Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudRainWind,
  CloudSnow, CloudSun, Coffee, Copy, Dna, Download, Droplet, Droplets, Dumbbell,
  Ear, ExternalLink, Eye, Film, Filter, FlaskConical, Flame, GlassWater,
  GraduationCap, HardDrive, HeartPulse, Hospital, LayoutGrid, Link as LinkIcon,
  ListChecks, ListTodo, Loader2, Mail, Maximize2, MessageCircle, Microscope,
  Minus, Moon, MoreHorizontal, Music, Newspaper, NotebookPen, Pause, Pencil,
  Pill, Play, Plus, Quote, RefreshCw, RotateCcw, Scale, Scissors, Search, Send,
  Settings2, Smile, SmilePlus, Sparkle, Sparkles, Star, Stethoscope, StickyNote,
  Sun, Sunrise, Syringe, Target, Timer, TrendingUp, Trash2, User, Volume2, Wand2,
  WifiOff, Wind, X, Zap,
  ArrowUpDown, Bitcoin, Cherry, CircleDot, Clapperboard, Club, Coins, Diamond, Dices, Hash, Heart, LineChart, Mic, MicOff, Rocket, Spade, Triangle, TrendingDown, Trophy, Tv, VolumeX,
  type LucideProps,
} from "lucide-react";

const registry = {
  Activity, AlertCircle, ArrowRight, ArrowUpRight, Award, Baby, BarChart3,
  Bone, BookOpen, Bot, Brain, BrainCircuit, CalendarClock, CalendarDays, Check,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Circle, ClipboardList,
  Clock, Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudRainWind,
  CloudSnow, CloudSun, Coffee, Copy, Dna, Download, Droplet, Droplets, Dumbbell,
  Ear, ExternalLink, Eye, Film, Filter, FlaskConical, Flame, GlassWater,
  GraduationCap, HardDrive, HeartPulse, Hospital, LayoutGrid, Link: LinkIcon,
  ListChecks, ListTodo, Loader2, Mail, Maximize2, MessageCircle, Microscope,
  Minus, Moon, MoreHorizontal, Music, Newspaper, NotebookPen, Pause, Pencil,
  Pill, Play, Plus, Quote, RefreshCw, RotateCcw, Scale, Scissors, Search, Send,
  Settings2, Smile, SmilePlus, Sparkle, Sparkles, Star, Stethoscope, StickyNote,
  Sun, Sunrise, Syringe, Target, Timer, TrendingUp, Trash2, User, Volume2, Wand2,
  WifiOff, Wind, X, Zap,
  ArrowUpDown, Bitcoin, Cherry, CircleDot, Clapperboard, Club, Coins, Diamond, Dices, Hash, Heart, LineChart, Mic, MicOff, Rocket, Spade, Triangle, TrendingDown, Trophy, Tv, VolumeX,
};

export type IconName = keyof typeof registry;

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = (registry as Record<string, React.ComponentType<LucideProps>>)[name] ?? Circle;
  return <Cmp strokeWidth={1.6} {...props} />;
}
