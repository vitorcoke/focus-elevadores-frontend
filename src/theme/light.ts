import { createTheme } from "@mui/material";
import { ptBR } from "@mui/x-data-grid-pro";

export const LightTheme = createTheme({
    palette: {
        primary: {
            main:'#ad201e',
            contrastText: '#1d1d1b',
        
        },
        text: {
            primary: '#1d1d1b',
        },
        warning : {
            main: '#D18306',
            contrastText: '#1d1d1b',
        }
        
    },
    typography: {
        fontFamily: 'MyriadWeb',
        allVariants: {
            color: '#1d1d1b'
        }
    },
    
}, ptBR);