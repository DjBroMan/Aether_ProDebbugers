/**
 * AETHER Design System — Light + Dark token sets.
 * Derived from the reference "your-app-maker-main" Tailwind palette,
 * translated to React Native-compatible values.
 */
import { useColorScheme } from 'react-native';

/* ── Brand gradient stops ─────────────────────────────────── */
export const GRADIENT = {
  start: '#5B7FFF',   // aether-blue
  mid:   '#8B5CF6',   // aether-violet
  end:   '#EC4899',   // aether-pink
} as const;

/* ── Per-scheme palettes ──────────────────────────────────── */
const light = {
  background:       '#F5F0FF',
  backgroundAlt:    '#EDE6FA',
  card:             '#FFFFFF',
  cardAlt:          '#F8F5FF',
  foreground:       '#1E1040',
  foregroundSoft:   '#6B5B8A',
  muted:            '#A394C0',
  mutedBg:          '#F0ECF6',
  border:           '#E4DCF0',
  accent:           '#EDE6FA',
  accentForeground: '#5B3FA0',
  primary:          '#7C3AED',
  primaryForeground:'#FFFFFF',
  destructive:      '#EF4444',
  destructiveFg:    '#FFFFFF',
  secondary:        '#F0ECF6',
  secondaryFg:      '#3D2A6E',
  tabBar:           'rgba(255,255,255,0.75)',
  tabBarBorder:     'rgba(228,220,240,0.6)',
  tabBarInactive:   '#A394C0',
  tabBarActive:     '#7C3AED',
  overlay:          'rgba(30,16,64,0.4)',
  inputBg:          'rgba(240,236,246,0.6)',
};

const dark = {
  background:       '#0B0B1A',
  backgroundAlt:    '#111126',
  card:             '#161632',
  cardAlt:          '#1C1C3A',
  foreground:       '#F0ECF6',
  foregroundSoft:   '#A394C0',
  muted:            '#6B5B8A',
  mutedBg:          '#1E1A3A',
  border:           '#2A2550',
  accent:           '#251E48',
  accentForeground: '#C4B5FD',
  primary:          '#8B5CF6',
  primaryForeground:'#FFFFFF',
  destructive:      '#F87171',
  destructiveFg:    '#FFFFFF',
  secondary:        '#1E1A3A',
  secondaryFg:      '#C4B5FD',
  tabBar:           'rgba(11,11,26,0.85)',
  tabBarBorder:     'rgba(42,37,80,0.6)',
  tabBarInactive:   '#6B5B8A',
  tabBarActive:     '#A78BFA',
  overlay:          'rgba(0,0,0,0.5)',
  inputBg:          'rgba(30,26,58,0.6)',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

/* ── Shadows ──────────────────────────────────────────────── */
export const SHADOWS = {
  card: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  soft: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  glow: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

/* ── Radius ───────────────────────────────────────────────── */
export const RADIUS = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  '2xl': 24,
  '3xl': 28,
  full: 999,
} as const;

/* ── Spacing ──────────────────────────────────────────────── */
export const SPACE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

/* ── Typography ───────────────────────────────────────────── */
export const FONT = {
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
  },
  body: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  small: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  tiny: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 2,
  },
} as const;
