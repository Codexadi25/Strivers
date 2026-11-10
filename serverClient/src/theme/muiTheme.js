import { createTheme } from '@mui/material/styles';

export function buildServerClientTheme(isDark = false) {
  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#2563EB',
        dark: '#1D4ED8',
      },
      secondary: {
        main: '#7C3AED',
      },
      success: {
        main: '#059669',
      },
      error: {
        main: '#DC2626',
      },
      warning: {
        main: '#D97706',
      },
      background: {
        default: isDark ? '#0F172A' : '#F8FAFC',
        paper: isDark ? '#1E293B' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F1F5F9' : '#0F172A',
        secondary: isDark ? '#94A3B8' : '#64748B',
      },
    },
    typography: {
      fontFamily: "'Inter', 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      h5: { fontWeight: 800, letterSpacing: '-0.4px' },
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 700 },
    },
    shape: {
      borderRadius: 10,
    },
  });
}
