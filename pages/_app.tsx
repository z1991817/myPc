import type { AppProps } from "next/app";

import Head from "next/head";
import dynamic from "next/dynamic";
import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { ToastProvider } from "@heroui/toast";
import { appWithTranslation } from "next-i18next";

import { fontSans, fontMono } from "@/config/fonts";
import { useInsufficientPointsModal } from "@/store/useInsufficientPointsModal";
import { useLoginModalStore } from "@/store/useLoginModalStore";
import { useUserStore } from "@/store/useUserStore";
import { refreshCurrentUser } from "@/api/auth";
import "@/styles/globals.css";
// Swiper CSS 已在 globals.css 中统一导入，此处不再重复引入

const LoginModal = dynamic(() => import("@/components/LoginModal"), {
  ssr: false,
});

const InsufficientPointsModal = dynamic(
  () => import("@/components/InsufficientPointsModal"),
  { ssr: false },
);

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [queryClient] = useState(() => new QueryClient());
  const { isOpen, message, closeModal } = useInsufficientPointsModal();
  const { isOpen: isLoginModalOpen, closeModal: closeLoginModal } =
    useLoginModalStore();
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

  const scheduleRefreshUserProfile = useCallback(() => {
    if (typeof window === "undefined") {
      return () => undefined;
    }

    const runRefresh = () => {
      void refreshUserProfile();
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(runRefresh, { timeout: 1200 });

      return () => {
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(runRefresh, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [refreshUserProfile]);

  useEffect(() => {
    let cleanupScheduledRefresh: (() => void) | undefined;

    const syncOnRouteChange = () => {
      cleanupScheduledRefresh?.();
      cleanupScheduledRefresh = scheduleRefreshUserProfile();
    };

    if (useUserStore.persist.hasHydrated()) {
      cleanupScheduledRefresh = scheduleRefreshUserProfile();
    }

    const unsubscribeHydration = useUserStore.persist.onFinishHydration(() => {
      cleanupScheduledRefresh?.();
      cleanupScheduledRefresh = scheduleRefreshUserProfile();
    });

    router.events.on("routeChangeComplete", syncOnRouteChange);

    return () => {
      cleanupScheduledRefresh?.();
      unsubscribeHydration();
      router.events.off("routeChangeComplete", syncOnRouteChange);
    };
  }, [router.events, scheduleRefreshUserProfile]);

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
          {isLoginModalOpen ? (
            <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
          ) : null}
          {/* 全局积分不足模态框：仅在打开时按需挂载 */}
          {isOpen ? (
            <InsufficientPointsModal
              isOpen={isOpen}
              message={message}
              onClose={closeModal}
            />
          ) : null}
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
