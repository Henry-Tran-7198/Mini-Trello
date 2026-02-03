import { createContext, useState, useEffect, useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export const ThemeContext = createContext();

const APP_BAR_HEIGHT = "58px";
const BOARD_BAR_HEIGHT = "60px";
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`;
const COLUMN_HEADER_HEIGHT = "50px";
const COLUMN_FOOTER_HEIGHT = "56px";

const createCustomTheme = (mode) => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode: mode,
      primary: {
        main: isDark ? "#42a5f5" : "#1565c0",
        dark: isDark ? "#1e88e5" : "#0d47a1",
        light: isDark ? "#64b5f6" : "#42a5f5",
      },
      background: {
        default: isDark ? "#121212" : "#f5f6fa",
        paper: isDark ? "#1e1e1e" : "#ffffff",
      },
      text: {
        primary: isDark ? "#ffffff" : "#000000",
        secondary: isDark ? "#b0bec5" : "#666666",
      },
      divider: isDark ? "#424242" : "#e0e0e0",
      action: {
        hover: isDark ? "#ffffff14" : "#0000000f",
      },
    },
    trello: {
      appBarHeight: APP_BAR_HEIGHT,
      boardBarHeight: BOARD_BAR_HEIGHT,
      boardContentHeight: BOARD_CONTENT_HEIGHT,
      columnHeaderHeight: COLUMN_HEADER_HEIGHT,
      columnFooterHeight: COLUMN_FOOTER_HEIGHT,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            "*::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "*::-webkit-scrollbar-thumb": {
              backgroundColor: isDark ? "#424242" : "#dcdde1",
              borderRadius: "8px",
            },
            "*::-webkit-scrollbar-thumb:hover": {
              backgroundColor: isDark ? "#616161" : "#bdbdbd",
            },
            "*::-webkit-scrollbar-track": {
              m: 2,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderWidth: "0.5px",
            "&:hover": { borderWidth: "0.5px" },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: "0.875rem",
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            "&.MuiTyppgraphy-body1": { fontSize: "0.875rem" },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            fontSize: "0.875rem",
            "& fieldset": {
              borderWidth: "0.5px !important",
            },
            "&:hover fieldset": {
              borderWidth: "1px !important",
            },
            "&.Mui-focused fieldset": {
              borderWidth: "1px !important",
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            bgcolor: isDark ? "#2d2d2d" : "#1565c0",
            backgroundImage: "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  });
};

export function CustomThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(() => {
    // Get theme from localStorage or default to "system"
    if (typeof window !== "undefined") {
      return localStorage.getItem("app-theme") || "system";
    }
    return "system";
  });

  // Detect system theme preference
  const [systemMode, setSystemMode] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      setSystemMode(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Determine current mode
  const currentMode = useMemo(() => {
    if (themeMode === "system") {
      return systemMode;
    }
    return themeMode;
  }, [themeMode, systemMode]);

  // Create theme based on current mode
  const theme = useMemo(() => createCustomTheme(currentMode), [currentMode]);

  // Handle theme change
  const handleThemeChange = (newMode) => {
    setThemeMode(newMode);
    localStorage.setItem("app-theme", newMode);
  };

  return (
    <ThemeContext.Provider
      value={{ themeMode, currentMode, setThemeMode: handleThemeChange }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
