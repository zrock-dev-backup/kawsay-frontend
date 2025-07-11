import { createTheme, PaletteMode } from "@mui/material/styles";
import { alpha } from "@mui/material";

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? // --- LIGHT THEME PALETTE ---
          {
            primary: {
              main: "#044cd3",
            },
            secondary: {
              main: "#c21784",
            },
            error: {
              main: "#d32f2f",
            },
            warning: {
              main: "#ed6c02",
            },
            info: {
              main: "#60c4da",
            },
            success: {
              main: "#2e7d32",
            },
            text: {
              primary: "#29323c",
              secondary: "#31637A",
              disabled: "rgba(41, 50, 60, 0.5)",
            },
            background: {
              default: "#F5F7FA",
              paper: "#FFFFFF",
            },
            divider: "rgba(49, 99, 122, 0.2)",
          }
        : // --- DARK THEME PALETTE ---
          {
            primary: {
              main: "#5893ff", // A lighter, more vibrant blue for dark backgrounds
            },
            secondary: {
              main: "#ff6ad5", // A lighter magenta
            },
            error: {
              main: "#ff8a80",
            },
            warning: {
              main: "#ffab40",
            },
            info: {
              main: "#4dd0e1",
            },
            success: {
              main: "#69f0ae",
            },
            text: {
              primary: "#e8e6e3", // Off-white for primary text
              secondary: "#a0a0a0", // Grey for secondary text
              disabled: "rgba(232, 230, 227, 0.5)",
            },
            background: {
              default: "#121212", // Standard dark mode background
              paper: "#1E1E1E", // Slightly lighter for surfaces like cards
            },
            divider: "rgba(232, 230, 227, 0.12)",
          }),
    },
    typography: {
      fontFamily: 'Inter, Roboto, "Helvetica Neue", Arial, sans-serif',
      h1: { color: mode === "light" ? "#29323c" : "#e8e6e3" },
      h2: { color: mode === "light" ? "#29323c" : "#e8e6e3" },
      h3: { color: mode === "light" ? "#29323c" : "#e8e6e3" },
      h4: { color: mode === "light" ? "#29323c" : "#e8e6e3" },
      h5: { color: mode === "light" ? "#29323c" : "#e8e6e3" },
      h6: { color: mode === "light" ? "#29323c" : "#e8e6e3" },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: "none",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          },
        },
      },
      // Ensure ListItemButton active state looks good in both modes
      MuiListItemButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            "&.Mui-selected": {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.15),
              },
            },
          }),
        },
      },
    },
  });
