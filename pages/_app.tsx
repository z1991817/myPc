import type { AppProps } from "next/app";

import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastProvider } from "@heroui/toast";
import { appWithTranslation } from "next-i18next";

import { fontSans, fontMono } from "@/config/fonts";
import "@/styles/globals.css";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider attribute="class" defaultTheme="dark">
          <Component {...pageProps} />
          <ToastProvider />
        </NextThemesProvider>
      </HeroUIProvider>
    </QueryClientProvider>
  );
}

export default appWithTranslation(App);

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};
