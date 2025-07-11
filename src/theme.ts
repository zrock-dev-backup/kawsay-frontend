import {
  createTheme,
  responsiveFontSizes,
  ThemeOptions,
} from "@mui/material/styles";
import { PaletteMode } from "@mui/material";

const colors = {
  primaryBlue: "#044cd3",
  accentMagenta: "#c21784",
  brightCyan: "#60c4da",
  deepTeal: "#31637A",
  darkCharcoal: "#29323c",
};

const baseThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 700, fontSize: "2.125rem" },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600, fontSize: "1.25rem" },
    subtitle1: { fontWeight: 600 },
    button: {
      textTransform: "none", // Modern buttons are often sentence case
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  transitions: {
    duration: {
      short: 250,
    },
  },
};

export const getTheme = (mode: PaletteMode) => {
  let theme = createTheme({
    ...baseThemeOptions,
    palette: {
      mode,
      primary: {
        main: colors.primaryBlue,
      },
      secondary: {
        main: colors.accentMagenta,
      },
      info: {
        main: colors.brightCyan,
        dark: colors.deepTeal,
      },
      ...(mode === "light"
        ? {
            // --- Light Mode Palette ---
            text: {
              primary: colors.darkCharcoal,
              secondary: "#6c757d",
            },
            background: {
              default: "#f8f9fa",
              paper: "#ffffff",
            },
          }
        : {
            // --- Dark Mode Palette ---
            text: {
              primary: "#e9ecef",
              secondary: "#adb5bd",
            },
            background: {
              default: "#121212",
              paper: "#1e1e1e",
            },
          }),
    },
  });

  theme = responsiveFontSizes(theme);
  return theme;
};
