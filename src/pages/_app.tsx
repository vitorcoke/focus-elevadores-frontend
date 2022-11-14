import { Router } from "next/router";
import { CssBaseline } from "@mui/material";
import type { AppProps } from "next/app";
import { AuthProvider } from "../context/AuthContext";
import { LicenseInfo } from "@mui/x-license-pro";
import AppThemeProvider from "../context/ThemeContext";
import ControlerButtonPagesProvider from "../context/ControlerButtonPagesContext";
import Nprogress from "nprogress";

import "../styles/nprogress.css";
import "../styles/global.css";
import Head from "next/head";

Router.events.on("routeChangeStart", () => Nprogress.start());
Router.events.on("routeChangeComplete", () => Nprogress.done());
Router.events.on("routeChangeError", () => Nprogress.done());

const KEY = process.env.NEXT_PUBLIC_MUIX_KEY || "";

function MyApp({ Component, pageProps }: AppProps) {
  LicenseInfo.setLicenseKey(KEY);
  return (
    <>
      <Head>
        <title>Minha Portaria</title>
      </Head>
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
