import { LightTheme } from "../theme/light";
import { DarkTheme } from "../theme/dark";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { ThemeProvider } from "@mui/material";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeContextData = {
  themeName: string;
  toogleTheme: () => void;
};

const ThemeContext = createContext({} as ThemeContextData);

export const useThemeContext = () => {
  return useContext(ThemeContext);
};

const AppThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeName, setThemeName] = useState<"light" | "dark">("light");

  const toogleTheme = useCallback(() => {
    setThemeName((theme) => (theme === "light" ? "dark" : "light"));
  }, []);

  const theme = useMemo(() => {
    if (themeName === "light") return LightTheme;
    return DarkTheme;
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ themeName, toogleTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default AppThemeProvider;
