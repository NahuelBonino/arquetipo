'use client';
import { Roboto } from 'next/font/google';
import { createTheme } from '@mui/material/styles';
import { enUS } from "@mui/material/locale";

const typography = {
  fontFamily: ["Quicksand", "sans-serif"].join(","),
};

const themeEn = createTheme({
  typography,
  components: {
    MuiTextField: {
      defaultProps: {
        InputLabelProps: {
          shrink: true,
        }
      },
    },
  }
}, enUS);

export default themeEn;