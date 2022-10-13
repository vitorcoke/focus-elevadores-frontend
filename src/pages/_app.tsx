import { CssBaseline } from "@mui/material";
import type { AppProps } from "next/app";
import { AuthProvider } from "../context/AuthContext";
import AppThemeProvider from "../context/ThemeContext";
import { LicenseInfo } from "@mui/x-license-pro";
import ControlerButtonPagesProvider from "../context/ControlerButtonPagesContext";
import Nprogress from "nprogress";
import { Router } from "next/router";

import "../styles/nprogress.css";
import "../styles/global.css";

Router.events.on("routeChangeStart", () => Nprogress.start());
Router.events.on("routeChangeComplete", () => Nprogress.done());
Router.events.on("routeChangeError", () => Nprogress.done());

const KEY = process.env.NEXT_PUBLIC_MUIX_KEY || "";

function MyApp({ Component, pageProps }: AppProps) {
  LicenseInfo.setLicenseKey(KEY);
  return (
    <>
      <CssBaseline />
      <AuthProvider>
        <AppThemeProvider>
          <ControlerButtonPagesProvider>
            <Component {...pageProps} />
          </ControlerButtonPagesProvider>
        </AppThemeProvider>
      </AuthProvider>
    </>
  );
}

export default MyApp;
