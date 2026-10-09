import type { TextStyle, ViewStyle } from 'react-native';

export const Radius = {
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const ScreenPadding = 20;

export const ButtonHeight = 52;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  hero: 30,
} as const;

export const Shadow: Record<'soft' | 'card' | 'button', ViewStyle> = {
  soft: {
    shadowColor: '#1C1D25',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  card: {
    shadowColor: '#1C1D25',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  button: {
    shadowColor: '#4F20D8',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
};

export const TextStyles: Record<'title' | 'subtitle' | 'caption', TextStyle> = {
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: '#1C1D25', letterSpacing: -0.3 },
  subtitle: { fontSize: FontSize.md, color: '#5B5D6B', lineHeight: 22 },
  caption: { fontSize: FontSize.sm, color: '#9A9CAB' },
};
