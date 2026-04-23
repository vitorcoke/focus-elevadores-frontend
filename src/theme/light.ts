import { alpha, createTheme } from "@mui/material";
import { ptBR } from "@mui/x-data-grid-pro";

export const LightTheme = createTheme(
  {
    palette: {
      mode: "dark",
      background: {
        default: "#090d18",
        paper: "#11182a",
      },
      primary: {
        main: "#6d5bff",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#2ac9ff",
      },
      success: {
        main: "#2ecf8f",
      },
      text: {
        primary: "#eef2ff",
        secondary: alpha("#eef2ff", 0.62),
      },
      warning: {
        main: "#f3b544",
        contrastText: "#07111b",
      },
      divider: alpha("#ffffff", 0.08),
      error: {
        main: "#ff5d77",
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: "MyriadWeb",
      allVariants: {
        color: "#eef2ff",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: "#090d18",
            color: "#eef2ff",
          },
          "*, *::before, *::after": {
            boxSizing: "border-box",
          },
          "input, textarea, select, button": {
            color: "#eef2ff",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backdropFilter: "blur(18px)",
            border: `1px solid ${alpha("#ffffff", 0.08)}`,
            boxShadow: "0 24px 60px rgba(6, 11, 24, 0.34)",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            color: "#eef2ff",
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            minHeight: 40,
            borderRadius: 12,
            textTransform: "none",
            fontWeight: 700,
          },
          containedPrimary: {
            background: "var(--gradient-primary)",
            boxShadow: "0 18px 34px rgba(109, 91, 255, 0.24)",
          },
          outlined: {
            borderColor: alpha("#ffffff", 0.12),
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: "#E6E6E6",
            borderRadius: 12,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: alpha("#eef2ff", 0.66),
            "&.Mui-focused": {
              color: "#eef2ff",
            },
            "&.Mui-disabled": {
              color: alpha("#eef2ff", 0.42),
            },
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            color: alpha("#eef2ff", 0.66),
            "&.Mui-focused": {
              color: "#eef2ff",
            },
            "&.Mui-disabled": {
              color: alpha("#eef2ff", 0.42),
            },
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            color: alpha("#eef2ff", 0.54),
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: alpha("#ffffff", 0.03),
            borderRadius: 14,
            color: "#eef2ff",
            "& fieldset": {
              borderColor: alpha("#ffffff", 0.1),
            },
            "&:hover fieldset": {
              borderColor: alpha("#ffffff", 0.16),
            },
            "&.Mui-focused fieldset": {
              borderColor: alpha("#6d5bff", 0.6),
            },
            "&.Mui-disabled": {
              color: alpha("#eef2ff", 0.48),
            },
          },
          input: {
            color: "#eef2ff",
            WebkitTextFillColor: "#eef2ff",
          },
          notchedOutline: {
            borderColor: alpha("#ffffff", 0.1),
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            color: "#eef2ff",
          },
          input: {
            color: "#eef2ff",
            WebkitTextFillColor: "#eef2ff",
            "&::placeholder": {
              color: alpha("#eef2ff", 0.42),
              opacity: 1,
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            color: "#eef2ff",
          },
          icon: {
            color: alpha("#eef2ff", 0.66),
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: "#eef2ff",
            backgroundColor: "#11182a",
            "&:hover": {
              backgroundColor: alpha("#ffffff", 0.06),
            },
            "&.Mui-selected": {
              backgroundColor: alpha("#6d5bff", 0.18),
            },
            "&.Mui-selected:hover": {
              backgroundColor: alpha("#6d5bff", 0.24),
            },
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            color: "#eef2ff",
            backgroundColor: "#11182a",
          },
          option: {
            color: "#eef2ff",
            "&[aria-selected='true']": {
              backgroundColor: alpha("#6d5bff", 0.18),
            },
            "&.Mui-focused": {
              backgroundColor: alpha("#ffffff", 0.06),
            },
          },
          inputRoot: {
            color: "#eef2ff",
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            color: "#eef2ff",
          },
          secondary: {
            color: alpha("#eef2ff", 0.58),
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: "#eef2ff",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backdropFilter: "blur(16px)",
          },
        },
      },
    },
  },
  ptBR
);
