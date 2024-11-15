'use client';
import { Roboto } from 'next/font/google';
import { createTheme } from '@mui/material/styles';
import { esES } from "@mui/material/locale";


const typography = {
  fontFamily: ["Quicksand", "sans-serif"].join(","),
};

const themeEs = createTheme({
  typography,
  components: {
    MuiTextField: {
      defaultProps: {
        InputLabelProps: {
          shrink: true,
        }
      },
    },
  },
}, esES);

export default themeEs;