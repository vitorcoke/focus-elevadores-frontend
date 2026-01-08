import { createTheme } from "@mui/material";
import { ptBR } from "@mui/x-data-grid-pro";

export const LightTheme = createTheme(
  {
    palette: {
      primary: {
        main: "#1d1552",
        contrastText: "#E6E6E6",
      },

      text: {
        primary: "#1d1d1b",
      },
      warning: {
        main: "#D18306",
        contrastText: "#1d1d1b",
      },
    },
    typography: {
      fontFamily: "MyriadWeb",
      allVariants: {
        color: "#1d1d1b",
      },
    },
    components: {
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: "#E6E6E6",
          },
        },
      },
    },
  },
  ptBR
);
