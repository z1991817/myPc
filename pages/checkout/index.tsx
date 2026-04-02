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
  packageLoadFailed: "\u5957\u9910\u52a0\u8f7d\u5931\u8d25",
  payTimeout:
    "\u652f\u4ed8\u8d85\u65f6\uff0c\u5982\u5df2\u652f\u4ed8\u8bf7\u7a0d\u540e\u5237\u65b0\u786e\u8ba4\u79ef\u5206\u5230\u8d26",
  paySuccess: "\u652f\u4ed8\u6210\u529f\uff0c\u79ef\u5206\u5df2\u5230\u8d26",
  payFailed:
    "\u652f\u4ed8\u5931\u8d25\uff0c\u8bf7\u91cd\u65b0\u53d1\u8d77\u652f\u4ed8",
  orderStatusFailed:
    "\u8ba2\u5355\u72b6\u6001\u67e5\u8be2\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u5728\u8ba2\u5355\u9875\u786e\u8ba4\u652f\u4ed8\u7ed3\u679c",
  loginFirst: "\u8bf7\u5148\u767b\u5f55\u540e\u518d\u8d2d\u4e70",
  packageLoading:
    "\u5957\u9910\u52a0\u8f7d\u4e2d\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5",
  packageUnavailable:
    "\u5f53\u524d\u5957\u9910\u6682\u4e0d\u53ef\u8d2d\u4e70",
  createOrderFailed: "\u521b\u5efa\u8ba2\u5355\u5931\u8d25",
  pageBadge: "\u6536\u94f6\u53f0",
  safePay: "\u5b89\u5168\u652f\u4ed8",
  pageTitle: "\u9009\u62e9\u5957\u9910\uff0c\u7acb\u5373\u8d2d\u4e70",
  pageDescription:
    "\u9875\u9762\u4f1a\u6839\u636e\u5f53\u524d\u8bbe\u5907\u73af\u5883\u81ea\u52a8\u9009\u62e9\u652f\u4ed8\u65b9\u5f0f\uff1aPC \u7aef\u4f7f\u7528\u5fae\u4fe1\u626b\u7801\u652f\u4ed8\uff0c\u5fae\u4fe1\u5185\u7f6e\u6d4f\u89c8\u5668\u4f7f\u7528\u5fae\u4fe1\u5185\u652f\u4ed8\uff0c\u624b\u673a\u666e\u901a\u6d4f\u89c8\u5668\u4f7f\u7528\u5fae\u4fe1 H5 \u652f\u4ed8\u3002",
  recommended: "\u63a8\u8350",
  gainPoints: "\u83b7\u5f97\u79ef\u5206",
  autoArrive: "\u652f\u4ed8\u540e\u81ea\u52a8\u5230\u8d26",
  buyNow: "\u7acb\u5373\u8d2d\u4e70",
  qrSubtitle: "\u4f7f\u7528\u5fae\u4fe1\u626b\u7801\u5b8c\u6210\u652f\u4ed8",
  qrAlt: "\u652f\u4ed8\u4e8c\u7ef4\u7801",
  gain: "\u83b7\u5f97",
  qrTip:
    "\u652f\u4ed8\u6210\u529f\u540e\uff0c\u5bf9\u5e94\u5957\u9910\u6743\u76ca\u4f1a\u81ea\u52a8\u5230\u8d26\u3002\u8bf7\u5728 5 \u5206\u949f\u5185\u5b8c\u6210\u652f\u4ed8\u3002",
} as const;

const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: 1,
    name: "\u5c1d\u9c9c\u4f53\u9a8c\u5305",
    price: "\u00a59.9",
    description:
      "\u9002\u5408\u7b2c\u4e00\u6b21\u8d2d\u4e70\uff0c\u5feb\u901f\u4f53\u9a8c\u751f\u6210\u6548\u679c\u3002",
    credits: "1,000 \u79ef\u5206",
    features: [
      "\u7ea6\u53ef\u751f\u6210 20 \u5f20 Banana2 \u9ad8\u7ea7\u56fe\u50cf",
      "\u6216 50 \u5f20\u57fa\u7840\u56fe\u50cf",
      "\u652f\u6301\u65e0\u6c34\u5370\u4e0b\u8f7d",
    ],
    isPopular: false,
  },
  {
    id: 2,
    name: "\u4e13\u4e1a\u521b\u4f5c\u5305",
    price: "\u00a539.9",
    description:
      "\u9002\u5408\u9ad8\u9891\u521b\u4f5c\uff0c\u79ef\u5206\u66f4\u5145\u8db3\uff0c\u6027\u4ef7\u6bd4\u66f4\u9ad8\u3002",
    credits: "4,500 + 500 \u79ef\u5206",
    features: [
      "\u7ea6\u53ef\u751f\u6210 90 \u5f20 Banana2 \u9ad8\u7ea7\u56fe\u50cf",
      "\u4f18\u5148\u6392\u961f\u51fa\u56fe\u7279\u6743",
      "\u652f\u6301\u65e0\u6c34\u5370\u4e0b\u8f7d",
      "\u5546\u4e1a\u4f7f\u7528\u8bb8\u53ef",
    ],
    isPopular: true,
  },
  {
    id: 3,
    name: "\u521b\u4e16\u5408\u4f19\u4eba\u5361",
    price: "\u00a599",
    description:
      "\u9002\u5408\u957f\u671f\u4f7f\u7528\u8005\uff0c\u4e00\u6b21\u8d2d\u4e70\u83b7\u5f97\u66f4\u5927\u989d\u5ea6\u3002",
    credits: "15,000 \u79ef\u5206",
    features: [
      "\u4e00\u6b21\u6027\u83b7\u5f97 15,000 \u79ef\u5206",
      "\u7ec8\u8eab\u7279\u6743\uff1a\u6bcf\u6708\u81ea\u52a8\u53d1\u653e 500 \u79ef\u5206",
      "\u5b98\u7f51\u5c55\u793a\u201c\u521b\u4e16\u8d5e\u52a9\u8005\u201d\u4e13\u5c5e\u5fbd\u7ae0",
      "\u6240\u6709\u4e13\u4e1a\u7248\u529f\u80fd",
      "\u4f18\u5148\u6280\u672f\u652f\u6301",
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

const formatCurrency = (value: number) =>
  `\u00a5${new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)}`;

const formatPoints = (value: number) =>
  `${new Intl.NumberFormat("zh-CN").format(value)} \u79ef\u5206`;

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

  useEffect(() => {
    setHydrated(useUserStore.persist.hasHydrated());
    const unsubscribe = useUserStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    return () => unsubscribe();
  }, []);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
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
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

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

  const refreshUserPoints = useCallback(async () => {
    try {
      const response = await getPointsLogs(1, 1);
      const latestBalance = response.data.list[0]?.balance_after;

      if (typeof latestBalance === "number") {
        patchUser({ points: latestBalance });
      }
    } catch {
      // Ignore refresh failures after payment success.
    }
  }, [patchUser]);

  const pollOrderStatus = useCallback(
    async (orderId: number) => {
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
        const response = await getRechargeOrderDetail(orderId);
        const status = response.data.order.status;

        if (status === "paid") {
          stopPolling();
          await refreshUserPoints();
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
      } catch {
        if (pollCountRef.current >= MAX_POLL_TIMES) {
          stopPolling();
          addToast({
            title: COPY.orderStatusFailed,
            color: "warning",
          });

          return;
        }
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

    const restorePayment = async () => {
      try {
        const response = await getRechargeOrderDetail(pendingPayment.orderId);
        const status = response.data.order.status;

        if (status === "paid") {
          await refreshUserPoints();
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

        stopPolling();
        pollCountRef.current = 0;
        void pollOrderStatus(pendingPayment.orderId);
      } catch {
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
          title: packagesLoading ? COPY.packageLoading : COPY.packageUnavailable,
          color: "warning",
        });

        return;
      }

      setCreatingPlanId(planId);

      try {
        const payType = resolvePayType();
        const response = await createRechargeOrder(targetPlan.packageId, payType);
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
