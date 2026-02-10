// ─── Visual Theme System ──────────────────────────────
// 6 unique card themes that cycle per card index

export const CARD_THEMES = [
  {
    name: 'ocean',
    primary: '#0078d7',
    secondary: '#00a6ff',
    accent: '#e6f3ff',
    gradient: 'linear-gradient(135deg, #0078d7 0%, #00a6ff 100%)',
    bgPattern: 'radial-gradient(circle at 90% 10%, rgba(0,120,215,0.06) 0%, transparent 50%)',
    barColors: ['#0078d7', '#00a6ff', '#4dc3ff'],
  },
  {
    name: 'emerald',
    primary: '#059669',
    secondary: '#10B981',
    accent: '#ecfdf5',
    gradient: 'linear-gradient(135deg, #059669 0%, #34D399 100%)',
    bgPattern: 'radial-gradient(circle at 10% 90%, rgba(5,150,105,0.06) 0%, transparent 50%)',
    barColors: ['#059669', '#10B981', '#34D399'],
  },
  {
    name: 'amber',
    primary: '#D97706',
    secondary: '#F59E0B',
    accent: '#fffbeb',
    gradient: 'linear-gradient(135deg, #D97706 0%, #FBBF24 100%)',
    bgPattern: 'radial-gradient(circle at 85% 85%, rgba(217,119,6,0.06) 0%, transparent 50%)',
    barColors: ['#D97706', '#F59E0B', '#FBBF24'],
  },
  {
    name: 'rose',
    primary: '#DC2626',
    secondary: '#EF4444',
    accent: '#fef2f2',
    gradient: 'linear-gradient(135deg, #DC2626 0%, #F87171 100%)',
    bgPattern: 'radial-gradient(circle at 15% 15%, rgba(220,38,38,0.06) 0%, transparent 50%)',
    barColors: ['#DC2626', '#EF4444', '#F87171'],
  },
  {
    name: 'indigo',
    primary: '#4338CA',
    secondary: '#6366F1',
    accent: '#eef2ff',
    gradient: 'linear-gradient(135deg, #4338CA 0%, #818CF8 100%)',
    bgPattern: 'radial-gradient(circle at 80% 20%, rgba(67,56,202,0.06) 0%, transparent 50%)',
    barColors: ['#4338CA', '#6366F1', '#818CF8'],
  },
  {
    name: 'teal',
    primary: '#0D9488',
    secondary: '#14B8A6',
    accent: '#f0fdfa',
    gradient: 'linear-gradient(135deg, #0D9488 0%, #5EEAD4 100%)',
    bgPattern: 'radial-gradient(circle at 50% 50%, rgba(13,148,136,0.06) 0%, transparent 50%)',
    barColors: ['#0D9488', '#14B8A6', '#5EEAD4'],
  },
];

// ─── Icon Map ──────────────────────────────────────────

import {
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CompareArrows as CompareArrowsIcon,
  ShowChart as ShowChartIcon,
  TableChart as TableChartIcon,
  Lightbulb as LightbulbIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  Error as ErrorIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import MoneyIcon from '@mui/icons-material/Money';

export const ICON_MAP = {
  Warning: WarningIcon, TrendingUp: TrendingUpIcon, TrendingDown: TrendingDownIcon,
  CompareArrows: CompareArrowsIcon, Compare: CompareArrowsIcon, ShowChart: ShowChartIcon,
  TableChart: TableChartIcon, Table: TableChartIcon, Lightbulb: LightbulbIcon,
  Info: InfoIcon, CheckCircle: CheckCircleIcon, Money: MoneyIcon,
  Star: StarIcon, Timeline: TimelineIcon, AlertIcon: ErrorIcon, ChartBar: BarChartIcon,
};

export const URGENCY_CONFIG = {
  critical: { color: '#EF4444', bgColor: '#FEF2F2', borderColor: '#FCA5A5', label: 'Critical' },
  high: { color: '#F59E0B', bgColor: '#FFFBEB', borderColor: '#FCD34D', label: 'High' },
  medium: { color: '#3B82F6', bgColor: '#EFF6FF', borderColor: '#BFDBFE', label: 'Medium' },
  low: { color: '#0D9488', bgColor: '#F0FDFA', borderColor: '#5EEAD4', label: 'Low' },
  info: { color: '#6366F1', bgColor: '#EEF2FF', borderColor: '#A5B4FC', label: 'Info' },
};

export const STATUS_COLORS = {
  good: { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' },
  warning: { bg: '#FFFBEB', color: '#D97706', border: '#FCD34D' },
  critical: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  info: { bg: '#EFF6FF', color: '#3B82F6', border: '#BFDBFE' },
  neutral: { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' },
};
