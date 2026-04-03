import type { AppProps } from "next/app";

import Head from "next/head";
import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { ToastProvider } from "@heroui/toast";
import { appWithTranslation } from "next-i18next";

import { fontSans, fontMono } from "@/config/fonts";
import InsufficientPointsModal from "@/components/InsufficientPointsModal";
import { useInsufficientPointsModal } from "@/store/useInsufficientPointsModal";
import { useUserStore } from "@/store/useUserStore";
import { refreshCurrentUser } from "@/api/auth";
import "@/styles/globals.css";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [queryClient] = useState(() => new QueryClient());
  const { isOpen, message, closeModal } = useInsufficientPointsModal();

  const lastUserRefreshAt = useRef(0);
  const refreshUserProfile = useCallback(async () => {
    const { token } = useUserStore.getState();
    const now = Date.now();

    if (!token || now - lastUserRefreshAt.current < 1500) {
      return;
    }

    lastUserRefreshAt.current = now;
    await refreshCurrentUser({ silent: true });
  }, []);

  useEffect(() => {
    const syncOnRouteChange = () => {
      void refreshUserProfile();
    };

    if (useUserStore.persist.hasHydrated()) {
      void refreshUserProfile();
    }

    const unsubscribeHydration = useUserStore.persist.onFinishHydration(() => {
      void refreshUserProfile();
    });

    router.events.on("routeChangeComplete", syncOnRouteChange);

    return () => {
      unsubscribeHydration();
      router.events.off("routeChangeComplete", syncOnRouteChange);
    };
  }, [refreshUserProfile, router.events]);

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider attribute="class" defaultTheme="dark">
          <Head>
            <meta
              key="viewport"
              content="width=device-width, initial-scale=1, viewport-fit=cover"
              name="viewport"
            />
          </Head>
          <Component {...pageProps} />
          <ToastProvider
            placement="top-center"
            regionProps={{ className: "z-[70]" }}
            toastOffset={80}
          />
          {/* 全局积分不足模态框 */}
          <InsufficientPointsModal
            isOpen={isOpen}
            message={message}
            onClose={closeModal}
          />
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
