// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // This is for dark mode
    primary: {
      main: '#E7B35F',
      contrastText: '#000000',
    },
    secondary: {
      main: '#FFE6B2',
    },
    error: {
      main: '#D23232',
    },
    warning: {
      main: '#CF6E1E',
    },
    success: {
      main: '#2E9F57',
    },
    info: {
      main: '#6F767E',
    },
    text: {
      primary: '#E7B35F',
      secondary: '#FFE6B2',
    },
    divider: '#33383F',
  },
  typography: {
    fontFamily: '"Mod Aber Mono", Arial, sans-serif',
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          '&:-webkit-autofill, &:hover, &:active, &:focus': {
            boxShadow: '0 0 0 100px #000000 inset',
            WebkitTextFillColor: '#E7B35F',
          },
        },
      },
    },
    MuiCssBaseline: { // Add this block to apply global styles
      styleOverrides: {
        hr: {
          borderColor: '#000',
        },
      },
    },
  },
});

export default theme;
