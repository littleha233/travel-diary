import { Platform } from 'react-native';

export const theme = {
  colors: {
    mint: '#78E6D6',
    mintLight: '#B9FFF7',
    purple: '#B79CFF',
    blue: '#8DBBFF',
    gold: '#FFD66E',
    background: '#F8F7FF',
    surface: '#FFFFFF',
    surfaceWarm: '#FFFDFF',
    card: 'rgba(255,255,255,0.74)',
    cardSoft: 'rgba(255,255,255,0.58)',
    darkGlass: 'rgba(43,48,88,0.54)',
    mapDark: '#1B1F3A',
    mapDarkAlt: '#252A4A',
    text: '#2E3350',
    textSoft: '#60678F',
    muted: '#8E94B8',
    line: 'rgba(183,156,255,0.22)',
    success: '#42B8A9',
    danger: '#EF5D6C',
    shadow: 'rgba(75,70,120,0.16)',
    white: '#FFFFFF',
    black: '#111427',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    page: 16,
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 22,
    xl: 30,
    pill: 999,
  },
  typography: {
    title: {
      fontSize: 30,
      lineHeight: 34,
      fontWeight: '900' as const,
    },
    h2: {
      fontSize: 22,
      lineHeight: 27,
      fontWeight: '900' as const,
    },
    h3: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '800' as const,
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '500' as const,
    },
    caption: {
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '700' as const,
    },
  },
  shadow: {
    soft: Platform.select({
      ios: {
        shadowColor: '#4B4678',
        shadowOpacity: 0.12,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 12 },
      },
      android: {
        elevation: 5,
      },
      default: {
        boxShadow: '0 12px 32px rgba(75,70,120,0.12)',
      },
    }),
    glow: Platform.select({
      ios: {
        shadowColor: '#78E6D6',
        shadowOpacity: 0.42,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 0 },
      },
      android: {
        elevation: 8,
      },
      default: {
        boxShadow: '0 0 30px rgba(120,230,214,0.34)',
      },
    }),
  },
  zIndex: {
    base: 1,
    floating: 10,
    tab: 20,
    modal: 30,
  },
  components: {
    tabHeight: 78,
    pageMaxWidth: 430,
    mapHeight: 650,
    buttonHeight: 46,
  },
};

export type AppTheme = typeof theme;
