import { createTheme } from "@mui/material";

export const LightTheme = createTheme({
    palette: {
        primary: {
            main:'#ad201e',
            contrastText: '#1d1d1b',
        
        },
        text: {
            primary: '#1d1d1b',
        }
    },
    typography: {
        fontFamily: 'MyriadWeb',
        allVariants: {
            color: '#1d1d1b'
        }
    },
    
})