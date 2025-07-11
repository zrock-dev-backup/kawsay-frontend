import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: '#044cd3', // Vibrant Blue
    },
    secondary: {
      main: '#c21784', // Vibrant Magenta
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ed6c02',
    },
    info: {
      main: '#60c4da', // Light Cyan for informational alerts
    },
    success: {
      main: '#2e7d32',
    },

    // TEXT: Defines default text colors for hierarchy.
    text: {
      primary: '#29323c',   // Dark Charcoal for headings and primary body text
      secondary: '#31637A', // Muted Teal for less important text
      disabled: 'rgba(41, 50, 60, 0.5)', // A derived disabled state
    },
    // BACKGROUND: Defines the base colors for the app's surface.
    background: {
      default: '#F5F7FA', // Light cool grey for the main app background
      paper: '#FFFFFF',   // White for cards, modals, and sheets
    },
    // DIVIDER: Use a softer, derived color for dividers.
    divider: 'rgba(49, 99, 122, 0.2)', // Derived from Muted Teal
  },
  typography: {
    fontFamily: 'Inter, Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { color: '#29323c' },
    h2: { color: '#29323c' },
    h3: { color: '#29323c' },
    h4: { color: '#29323c' },
    h5: { color: '#29323c' },
    h6: { color: '#29323c' },
  },
  components: {
    // Example of applying the theme to a specific component
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#29323c',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          }
        },
      },
    },
  },
});
