import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { addToast } from "@heroui/toast";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import {
  Check,
  Crown,
  Gift,
  type LucideIcon,
  QrCode,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import QRCode from "qrcode";

import {
  createRechargeOrder,
  getPointsLogs,
  getRechargeOrderDetail,
  getRechargePackages,
  type RechargePackage,
} from "@/api/recharge";
import Footer from "@/components/Footer";
import TopNavbar from "@/components/TopNavbar";
import DefaultLayout from "@/layouts/default";
import { useUserStore } from "@/store/useUserStore";

type PlanTemplate = {
  id: number;
  name: string;
  price: string;
  description: string;
  credits: string;
  features: string[];
  isPopular: boolean;
};

type CheckoutPlan = PlanTemplate & {
  amount: number | null;
  packageId: string | null;
  points: number | null;
};

type ActivePayment = {
  amount: number | null;
  orderId: number;
  packageName: string;
  payUrl: string;
  points: number | null;
};

type PayType = 1 | 2 | 3;

type PendingPayment = ActivePayment & {
  payType: PayType;
};

const COPY = {
  packageLoadFailed: "套餐加载失败",
  payTimeout: "支付超时，如已支付请稍后刷新确认积分到账",
  paySuccess: "支付成功，积分已到账",
  payFailed: "支付失败，请重新发起支付",
  orderStatusFailed: "订单状态查询失败，请稍后在订单页确认支付结果",
  loginFirst: "请先登录后再购买",
  packageLoading: "套餐加载中，请稍后重试",
  packageUnavailable: "当前套餐暂不可购买",
  createOrderFailed: "创建订单失败",
  pageBadge: "收银台",
  safePay: "安全支付",
  pageTitle: "选择套餐，立即购买",
  pageDescription:
    "购买积分，解锁更多创作可能。选择适合你的套餐，轻松获得积分，畅享创作乐趣！",
  recommended: "推荐",
  gainPoints: "获得积分",
  autoArrive: "支付后自动到账",
  buyNow: "立即购买",
  qrSubtitle: "使用微信扫码完成支付",
  qrAlt: "支付二维码",
  gain: "获得",
  qrTip: "支付成功后，对应套餐权益会自动到账。请在 5 分钟内完成支付。",
} as const;

const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: 1,
    name: "尝鲜体验包",
    price: "¥9.9",
    description: "适合第一次购买，快速体验生成效果。",
    credits: "1,000 积分",
    features: [
      "约可生成 20 张 Banana2 高级图像",
      "或 50 张基础图像",
      "支持无水印下载",
    ],
    isPopular: false,
  },
  {
    id: 2,
    name: "专业创作包",
    price: "¥39.9",
    description: "适合高频创作，积分更充足，性价比更高。",
    credits: "4,500 + 500 积分",
    features: [
      "约可生成 90 张 Banana2 高级图像",
      "优先排队出图特权",
      "支持无水印下载",
      "商业使用许可",
    ],
    isPopular: true,
  },
  {
    id: 3,
    name: "创世合伙人卡",
    price: "¥99",
    description: "适合长期使用者，一次购买获得更大额度。",
    credits: "15,000 积分",
    features: [
      "一次性获得 15,000 积分",
      "终身特权：每月自动发放 500 积分",
      "官网展示“创世赞助者”专属徽章",
      "所有专业版功能",
      "优先技术支持",
    ],
    isPopular: false,
  },
];

const PLAN_PACKAGE_IDS: Record<number, string> = {
  1: "recharge_9_9",
  2: "recharge_39_9",
  3: "recharge_99",
};

const planIcons: Record<number, LucideIcon> = {
  1: Gift,
  2: Sparkles,
  3: Crown,
};

const MAX_POLL_TIMES = 100;
const POLL_INTERVAL_MS = 3000;
const QR_CODE_SIZE = 480;
const PENDING_PAYMENT_STORAGE_KEY = "checkout-pending-payment";
const PAYMENT_RETURN_MARKER_KEY = "checkout-payment-return";

const hasPaymentReturnMarker = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(PAYMENT_RETURN_MARKER_KEY) === "1";
};

const clearPaymentReturnMarker = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(PAYMENT_RETURN_MARKER_KEY);
};

const formatCurrency = (value: number) =>
  `¥${new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)}`;

const formatPoints = (value: number) =>
  `${new Intl.NumberFormat("zh-CN").format(value)} 积分`;

const isWechatBrowser = (userAgent: string) =>
  /MicroMessenger/i.test(userAgent);

const isMobileBrowser = (userAgent: string) =>
  /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(userAgent);

const resolvePayType = (): PayType => {
  if (typeof window === "undefined") {
    return 2;
  }

  const userAgent = window.navigator.userAgent;

  if (isWechatBrowser(userAgent)) {
    return 1;
  }

  if (isMobileBrowser(userAgent)) {
    return 3;
  }

  return 2;
};

const readPendingPayment = (): PendingPayment | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(PENDING_PAYMENT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PendingPayment;
  } catch {
    window.sessionStorage.removeItem(PENDING_PAYMENT_STORAGE_KEY);

    return null;
  }
};

const savePendingPayment = (payment: PendingPayment) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    PENDING_PAYMENT_STORAGE_KEY,
    JSON.stringify(payment),
  );
};

const markPaymentReturn = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(PAYMENT_RETURN_MARKER_KEY, "1");
};

const clearPendingPayment = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(PENDING_PAYMENT_STORAGE_KEY);
};

export default function CheckoutPage() {
  const router = useRouter();
  const token = useUserStore((state) => state.token);
  const patchUser = useUserStore((state) => state.patchUser);
  const userPoints = useUserStore((state) => state.user?.points);

  const [hydrated, setHydrated] = useState(false);
  const [packages, setPackages] = useState<RechargePackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<number>(2);
  const [creatingPlanId, setCreatingPlanId] = useState<number | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [activePayment, setActivePayment] = useState<ActivePayment | null>(
    null,
  );

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCountRef = useRef(0);
  const isPollingActiveRef = useRef(false);
  const pollAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setHydrated(useUserStore.persist.hasHydrated());
    const unsubscribe = useUserStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    return () => unsubscribe();
  }, []);

  const stopPolling = useCallback(() => {
    isPollingActiveRef.current = false;
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (pollAbortControllerRef.current) {
      pollAbortControllerRef.current.abort();
      pollAbortControllerRef.current = null;
    }
    pollCountRef.current = 0;
  }, []);

  const clearPaymentFlow = useCallback(() => {
    stopPolling();
    setIsQrOpen(false);
    setQrCodeDataUrl(null);
    setActivePayment(null);
    clearPendingPayment();
  }, [stopPolling]);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      stopPolling();
    };

    const handlePageHide = () => {
      stopPolling();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopPolling();
      }
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopPolling();
    };
  }, [router.events, stopPolling]);

  useEffect(() => {
    if (!hydrated || !token) {
      if (hydrated) {
        setPackagesLoading(false);
      }

      return;
    }

    const fetchPackages = async () => {
      setPackagesLoading(true);

      try {
        const response = await getRechargePackages();

        setPackages(response.data);
      } catch (error: any) {
        addToast({
          title: error?.response?.data?.message || COPY.packageLoadFailed,
          color: "danger",
        });
      } finally {
        setPackagesLoading(false);
      }
    };

    void fetchPackages();
  }, [hydrated, token]);

  const plans = useMemo<CheckoutPlan[]>(
    () =>
      PLAN_TEMPLATES.map((template) => {
        const packageId = PLAN_PACKAGE_IDS[template.id];
        const matchedPackage = packages.find((item) => item.id === packageId);

        return {
          ...template,
          amount: matchedPackage?.amount ?? null,
          credits:
            matchedPackage?.points !== undefined
              ? formatPoints(matchedPackage.points)
              : template.credits,
          name: template.name,
          packageId,
          points: matchedPackage?.points ?? null,
          price:
            matchedPackage?.amount !== undefined
              ? formatCurrency(matchedPackage.amount)
              : template.price,
        };
      }),
    [packages],
  );

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[1],
    [plans, selectedPlanId],
  );

  const modalAmount = activePayment?.amount ?? selectedPlan?.amount ?? null;
  const modalPoints = activePayment?.points ?? selectedPlan?.points ?? null;
  const modalPackageName =
    activePayment?.packageName ?? selectedPlan?.name ?? "";

  const getNumericPoints = useCallback((value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const normalized = Number(value);

      if (Number.isFinite(normalized)) {
        return normalized;
      }
    }

    return null;
  }, []);

  const refreshUserPoints = useCallback(
    async (fallbackAddedPoints?: number | null) => {
      try {
        const response = await getPointsLogs(1, 1);
        const latestBalance = response.data.list[0]?.balance_after;

        if (typeof latestBalance === "number") {
          patchUser({ points: latestBalance });

          return;
        }

        const currentPoints = getNumericPoints(userPoints);

        if (currentPoints !== null && typeof fallbackAddedPoints === "number") {
          patchUser({ points: currentPoints + fallbackAddedPoints });
        }
      } catch {
        const currentPoints = getNumericPoints(userPoints);

        if (currentPoints !== null && typeof fallbackAddedPoints === "number") {
          patchUser({ points: currentPoints + fallbackAddedPoints });
        }
      }
    },
    [getNumericPoints, patchUser, userPoints],
  );

  const pollOrderStatus = useCallback(
    async (orderId: number) => {
      if (!isPollingActiveRef.current) {
        return;
      }

      pollCountRef.current += 1;

      if (pollCountRef.current > MAX_POLL_TIMES) {
        stopPolling();
        addToast({
          title: COPY.payTimeout,
          color: "warning",
        });

        return;
      }

      try {
        pollAbortControllerRef.current?.abort();
        const controller = new AbortController();

        pollAbortControllerRef.current = controller;
        const response = await getRechargeOrderDetail(orderId, {
          signal: controller.signal,
        });

        if (pollAbortControllerRef.current === controller) {
          pollAbortControllerRef.current = null;
        }

        if (!isPollingActiveRef.current) {
          return;
        }

        const status = response.data.order.status;

        if (status === "paid") {
          stopPolling();
          await refreshUserPoints(response.data.order.points);
          clearPaymentFlow();
          addToast({ title: COPY.paySuccess, color: "success" });

          return;
        }

        if (status === "failed") {
          stopPolling();
          clearPendingPayment();
          addToast({ title: COPY.payFailed, color: "danger" });

          return;
        }
      } catch (error: any) {
        if (
          error?.name === "CanceledError" ||
          error?.code === "ERR_CANCELED" ||
          error?.name === "AbortError"
        ) {
          return;
        }

        if (!isPollingActiveRef.current) {
          return;
        }

        if (pollCountRef.current >= MAX_POLL_TIMES) {
          stopPolling();
          addToast({
            title: COPY.orderStatusFailed,
            color: "warning",
          });

          return;
        }
      }

      if (!isPollingActiveRef.current) {
        return;
      }

      pollTimerRef.current = setTimeout(() => {
        void pollOrderStatus(orderId);
      }, POLL_INTERVAL_MS);
    },
    [clearPaymentFlow, refreshUserPoints, stopPolling],
  );

  const openPaymentModal = useCallback(
    async (payment: PendingPayment) => {
      const qrCode = await QRCode.toDataURL(payment.payUrl, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: QR_CODE_SIZE,
      });

      savePendingPayment(payment);
      setActivePayment(payment);
      setQrCodeDataUrl(qrCode);
      setIsQrOpen(true);
      stopPolling();
      isPollingActiveRef.current = true;
      pollCountRef.current = 0;
      void pollOrderStatus(payment.orderId);
    },
    [pollOrderStatus, stopPolling],
  );

  useEffect(() => {
    if (!hydrated || !token) {
      return;
    }

    const pendingPayment = readPendingPayment();

    if (!pendingPayment) {
      return;
    }

    const isPaymentReturn = hasPaymentReturnMarker();

    const restorePayment = async () => {
      try {
        pollAbortControllerRef.current?.abort();
        const controller = new AbortController();

        pollAbortControllerRef.current = controller;
        const response = await getRechargeOrderDetail(pendingPayment.orderId, {
          signal: controller.signal,
        });

        if (pollAbortControllerRef.current === controller) {
          pollAbortControllerRef.current = null;
        }

        const status = response.data.order.status;

        if (status === "paid") {
          await refreshUserPoints(response.data.order.points);
          clearPaymentFlow();
          addToast({ title: COPY.paySuccess, color: "success" });

          return;
        }

        if (status === "failed") {
          clearPaymentFlow();
          addToast({ title: COPY.payFailed, color: "danger" });

          return;
        }

        if (pendingPayment.payType === 2) {
          await openPaymentModal(pendingPayment);

          return;
        }

        if (!isPaymentReturn) {
          stopPolling();

          return;
        }

        clearPaymentReturnMarker();
        stopPolling();
        isPollingActiveRef.current = true;
        pollCountRef.current = 0;
        void pollOrderStatus(pendingPayment.orderId);
      } catch (error: any) {
        if (
          error?.name === "CanceledError" ||
          error?.code === "ERR_CANCELED" ||
          error?.name === "AbortError"
        ) {
          return;
        }

        clearPendingPayment();
      }
    };

    void restorePayment();
  }, [
    clearPaymentFlow,
    hydrated,
    openPaymentModal,
    pollOrderStatus,
    refreshUserPoints,
    stopPolling,
    token,
  ]);

  const handlePurchase = useCallback(
    async (planId: number) => {
      setSelectedPlanId(planId);

      if (!hydrated) {
        return;
      }

      if (!token) {
        addToast({ title: COPY.loginFirst, color: "warning" });
        void router.push("/login");

        return;
      }

      const targetPlan = plans.find((plan) => plan.id === planId);

      if (!targetPlan?.packageId) {
        addToast({
          title: packagesLoading
            ? COPY.packageLoading
            : COPY.packageUnavailable,
          color: "warning",
        });

        return;
      }

      setCreatingPlanId(planId);

      try {
        const payType = resolvePayType();
        const response = await createRechargeOrder(
          targetPlan.packageId,
          payType,
        );
        const orderId = response.data.order?.id ?? response.data.orderId;
        const payUrl = response.data.payment?.payUrl ?? response.data.payUrl;

        if (!orderId || !payUrl) {
          throw new Error("Missing pay order response");
        }

        const payment: PendingPayment = {
          amount:
            response.data.order?.amount ??
            response.data.amount ??
            targetPlan.amount,
          orderId,
          packageName: targetPlan.name,
          payType,
          payUrl,
          points:
            response.data.order?.points ??
            response.data.points ??
            targetPlan.points,
        };

        savePendingPayment(payment);

        if (payType === 3) {
          markPaymentReturn();
          const paymentWindow = window.open(
            payUrl,
            "_blank",
            "noopener,noreferrer",
          );

          if (paymentWindow) {
            paymentWindow.opener = null;

            return;
          }

          stopPolling();
          window.location.href = payUrl;

          return;
        }

        if (payType !== 2 || /^https?:\/\//i.test(payUrl)) {
          markPaymentReturn();
          stopPolling();
          window.location.href = payUrl;

          return;
        }

        await openPaymentModal(payment);
      } catch (error: any) {
        addToast({
          title: error?.response?.data?.message || COPY.createOrderFailed,
          color: "danger",
        });
      } finally {
        setCreatingPlanId(null);
      }
    },
    [
      hydrated,
      openPaymentModal,
      packagesLoading,
      plans,
      router,
      stopPolling,
      token,
    ],
  );

  const handleQrOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        clearPaymentFlow();

        return;
      }

      setIsQrOpen(true);
    },
    [clearPaymentFlow],
  );

  return (
    <DefaultLayout fullWidth hideFooter hideNavbar>
      <div className="min-h-dvh bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_24%),radial-gradient(circle_at_85%_10%,rgba(168,85,247,0.16),transparent_20%),linear-gradient(180deg,#07111f_0%,#030712_55%,#02030a_100%)] text-white">
        <TopNavbar />

        <section className="px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
                <Chip
                  className="border border-blue-400/25 bg-blue-400/10 text-blue-200"
                  radius="full"
                  startContent={<WalletCards className="ml-2 h-3.5 w-3.5" />}
                  variant="flat"
                >
                  {COPY.pageBadge}
                </Chip>
                <Chip
                  className="border border-white/10 bg-white/[0.06] text-white/75"
                  radius="full"
                  startContent={<ShieldCheck className="ml-2 h-3.5 w-3.5" />}
                  variant="flat"
                >
                  {COPY.safePay}
                </Chip>
              </div>

              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {COPY.pageTitle}
              </h1>
              <p className="mt-4 text-base leading-8 text-white/60 sm:text-lg">
                {COPY.pageDescription}
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => {
                const Icon = planIcons[plan.id];

                return (
                  <Card
                    key={plan.id}
                    className={`border p-2 transition-all duration-300 ${
                      plan.isPopular
                        ? "border-orange-500/50 bg-gradient-to-br from-orange-500/[0.08] to-purple-500/[0.08] shadow-2xl shadow-orange-500/20"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
                    }`}
                  >
                    <CardBody className="flex h-full p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-blue-200">
                          <Icon className="h-5 w-5" />
                        </div>
                        {plan.isPopular ? (
                          <Chip
                            className="border border-orange-500/40 bg-gradient-to-r from-orange-500/90 to-purple-500/90 text-xs font-bold text-white shadow-lg"
                            radius="full"
                            size="sm"
                            variant="solid"
                          >
                            {COPY.recommended}
                          </Chip>
                        ) : null}
                      </div>

                      <div className="mt-8">
                        <h2
                          className={`text-2xl font-bold ${
                            plan.isPopular ? "text-white" : "text-white/70"
                          }`}
                        >
                          {plan.name}
                        </h2>
                        <p
                          className={`mt-3 text-sm leading-7 ${
                            plan.isPopular ? "text-white/70" : "text-white/40"
                          }`}
                        >
                          {plan.description}
                        </p>
                      </div>

                      <div className="mt-8">
                        <span
                          className={`text-5xl font-bold ${
                            plan.isPopular
                              ? "bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent"
                              : "text-white/60"
                          }`}
                        >
                          {plan.price}
                        </span>
                      </div>

                      <div
                        className={`relative mt-6 overflow-hidden rounded-[1.75rem] border px-5 py-5 ${
                          plan.isPopular
                            ? "border-orange-400/25 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(249,115,22,0.08),rgba(168,85,247,0.1))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                            : "border-blue-400/20 bg-[linear-gradient(135deg,rgba(59,130,246,0.12),rgba(168,85,247,0.06),rgba(255,255,255,0.03))] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        }`}
                      >
                        <div
                          aria-hidden="true"
                          className={`absolute inset-x-6 bottom-0 h-16 rounded-full blur-2xl ${
                            plan.isPopular
                              ? "bg-gradient-to-r from-orange-500/20 to-purple-500/20"
                              : "bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                          }`}
                        />
                        <div className="relative">
                          <div className="flex items-center justify-between gap-3">
                            <span
                              className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                                plan.isPopular
                                  ? "border-white/10 bg-white/[0.06] text-white/60"
                                  : "border-blue-300/15 bg-blue-400/10 text-blue-100/80"
                              }`}
                            >
                              {COPY.gainPoints}
                            </span>
                            <span
                              className={`text-xs ${
                                plan.isPopular
                                  ? "text-orange-200/70"
                                  : "text-blue-200/70"
                              }`}
                            >
                              {COPY.autoArrive}
                            </span>
                          </div>
                          <p
                            className={`mt-4 whitespace-nowrap text-[1.75rem] font-bold tracking-[-0.03em] sm:text-[2.1rem] ${
                              plan.isPopular ? "text-white" : "text-blue-50"
                            }`}
                          >
                            {plan.credits}
                          </p>
                        </div>
                      </div>

                      <ul className="mt-8 space-y-3">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className={`flex items-start gap-2.5 text-sm leading-7 ${
                              plan.isPopular ? "text-white/80" : "text-white/50"
                            }`}
                          >
                            <Check
                              className={`mt-0.5 h-4 w-4 shrink-0 ${
                                plan.isPopular
                                  ? "text-orange-400"
                                  : "text-cyan-300"
                              }`}
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={
                          plan.isPopular
                            ? "mt-8 h-14 w-full bg-gradient-to-r from-orange-500 to-purple-500 font-bold text-white shadow-xl shadow-orange-500/30 transition-all hover:shadow-2xl hover:shadow-orange-500/40"
                            : "mt-8 h-14 w-full border-white/10 font-semibold text-white/80 hover:border-white/20 hover:bg-white/5 hover:text-white"
                        }
                        isDisabled={
                          creatingPlanId !== null ||
                          (packagesLoading && creatingPlanId !== plan.id)
                        }
                        isLoading={creatingPlanId === plan.id}
                        radius="full"
                        size="lg"
                        variant={plan.isPopular ? "solid" : "bordered"}
                        onPress={() => {
                          void handlePurchase(plan.id);
                        }}
                      >
                        {COPY.buyNow}
                      </Button>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <Footer />

        <Modal
          isOpen={isQrOpen}
          placement="center"
          shouldBlockScroll={false}
          size="md"
          onOpenChange={handleQrOpenChange}
        >
          <ModalContent className="border border-white/10 bg-[#08111f] text-white">
            <ModalHeader className="flex flex-col gap-1 px-6 pt-6">
              <span className="text-2xl font-semibold">{modalPackageName}</span>
              <span className="text-sm font-normal text-white/55">
                {COPY.qrSubtitle}
              </span>
            </ModalHeader>
            <ModalBody className="px-6 pb-6 pt-2">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 text-center">
                <div className="mx-auto flex aspect-square w-full max-w-[240px] items-center justify-center rounded-[1.75rem] bg-[linear-gradient(135deg,#f8fafc_0%,#dbeafe_100%)] text-slate-900">
                  <div className="flex h-[78%] w-[78%] items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white p-4">
                    {qrCodeDataUrl ? (
                      <img
                        alt={COPY.qrAlt}
                        className="h-full w-full rounded-[1rem] object-contain"
                        src={qrCodeDataUrl}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        {activePayment ? (
                          <Spinner color="primary" />
                        ) : (
                          <QrCode className="h-32 w-32" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-white">
                  {modalAmount !== null ? formatCurrency(modalAmount) : "--"}
                </p>
                <p className="mt-2 text-base font-semibold text-blue-200/85">
                  {COPY.gain}{" "}
                  {modalPoints !== null ? formatPoints(modalPoints) : "--"}
                </p>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  {COPY.qrTip}
                </p>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    </DefaultLayout>
  );
}
