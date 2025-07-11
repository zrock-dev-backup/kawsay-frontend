import React, {
  createContext,
  useState,
  useMemo,
  useEffect,
  useContext,
} from "react";
import { ThemeProvider as MuiThemeProvider, PaletteMode } from "@mui/material";
import { getTheme } from "../theme";

interface ThemeContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  toggleColorMode: () => {
    // This is a placeholder and will be overridden by the provider
    console.error("toggleColorMode function called outside of ThemeProvider");
  },
});

export const useThemeContext = () => useContext(ThemeContext);

interface ThemeProviderWrapperProps {
  children: React.ReactNode;
}

export const ThemeProviderWrapper: React.FC<ThemeProviderWrapperProps> = ({
  children,
}) => {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const storedMode = localStorage.getItem("themeMode");
    return (storedMode as PaletteMode) || "light";
  });

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
      mode,
    }),
    [mode],
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
