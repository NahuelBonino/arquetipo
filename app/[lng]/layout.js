import { dir } from "i18next"
import { languages } from '../i18n/settings'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import themeEs from './themeEs';
import themeEn from './themeEn';
import "assets/css/cssloader.css";
import "assets/css/cssmain.css";
import "assets/css/cssother.css?v=1.0.0";

const typography = {
  fontFamily: ["Quicksand", "sans-serif"].join(","),
};


export const metadata = {
  title: "Arquetipo",
  description: "Sofis Solutions arquetipo react next",
}

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}

export default async function RootLayout({ children, params: { lng } }) {

  return (
    <html lang={lng} dir={dir(lng)}>
      <head />
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={lng == "en" ? themeEn : themeEs}>
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
