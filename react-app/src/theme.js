import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Create a custom theme with improved colors, typography, and component styling
const theme = createTheme({
  palette: {
    primary: {
      main: '#2a6cff',
      light: '#6c9fff',
      dark: '#1a4ccc',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6c47ff',
      light: '#9e7aff',
      dark: '#4a2fcc',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
      gradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    },
    text: {
      primary: '#1a237e',
      secondary: '#5a5a89',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    divider: alpha('#6c47ff', 0.12),
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontWeight: 800,
      fontSize: '2rem',
      lineHeight: 1.2,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.2,
      letterSpacing: '0em',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.2,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.25rem',
      lineHeight: 1.2,
      letterSpacing: '0em',
    },
    h6: {
      fontWeight: 700,
      fontSize: '1rem',
      lineHeight: 1.2,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01071em',
    },
    button: {
      fontWeight: 700,
      fontSize: '0.875rem',
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(44, 100, 255, 0.05)',
    '0 4px 8px rgba(44, 100, 255, 0.08)',
    '0 6px 12px rgba(44, 100, 255, 0.10)',
    '0 8px 16px rgba(44, 100, 255, 0.12)',
    '0 10px 20px rgba(44, 100, 255, 0.14)',
    '0 12px 24px rgba(44, 100, 255, 0.16)',
    '0 14px 28px rgba(44, 100, 255, 0.18)',
    '0 16px 32px rgba(44, 100, 255, 0.20)',
    '0 18px 36px rgba(44, 100, 255, 0.22)',
    '0 20px 40px rgba(44, 100, 255, 0.24)',
    '0 22px 44px rgba(44, 100, 255, 0.26)',
    '0 24px 48px rgba(44, 100, 255, 0.28)',
    '0 26px 52px rgba(44, 100, 255, 0.30)',
    '0 28px 56px rgba(44, 100, 255, 0.32)',
    '0 30px 60px rgba(44, 100, 255, 0.34)',
    '0 32px 64px rgba(44, 100, 255, 0.36)',
    '0 34px 68px rgba(44, 100, 255, 0.38)',
    '0 36px 72px rgba(44, 100, 255, 0.40)',
    '0 38px 76px rgba(44, 100, 255, 0.42)',
    '0 40px 80px rgba(44, 100, 255, 0.44)',
    '0 42px 84px rgba(44, 100, 255, 0.46)',
    '0 44px 88px rgba(44, 100, 255, 0.48)',
    '0 46px 92px rgba(44, 100, 255, 0.50)',
    '0 48px 96px rgba(44, 100, 255, 0.52)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 700,
          boxShadow: '0 4px 14px rgba(44, 100, 255, 0.25)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(44, 100, 255, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
          '&:hover': {
            background: 'linear-gradient(90deg, #6c47ff 0%, #2a6cff 100%)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(44, 100, 255, 0.08)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 48px rgba(44, 100, 255, 0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(44, 100, 255, 0.06)',
        },
        elevation2: {
          boxShadow: '0 8px 30px rgba(44, 100, 255, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#6c47ff',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(44, 100, 255, 0.08)',
          backgroundImage: 'linear-gradient(90deg, #2a6cff 0%, #6c47ff 100%)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#f8f9ff',
          borderRight: '1px solid rgba(44, 100, 255, 0.08)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(44, 100, 255, 0.08)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: alpha('#6c47ff', 0.08),
            color: '#6c47ff',
            '&:hover': {
              backgroundColor: alpha('#6c47ff', 0.12),
            },
            '& .MuiListItemIcon-root': {
              color: '#6c47ff',
            },
          },
          '&:hover': {
            backgroundColor: alpha('#6c47ff', 0.04),
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#5a5a89',
          minWidth: 40,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#6c47ff',
          color: '#ffffff',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          '&.Mui-selected': {
            color: '#6c47ff',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#6c47ff',
          height: 3,
          borderRadius: 3,
        },
      },
    },
  },
});

export default theme;