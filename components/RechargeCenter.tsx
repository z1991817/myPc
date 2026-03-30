import { useCallback, useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { addToast } from "@heroui/toast";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Coins,
  CreditCard,
  History,
  ReceiptText,
  Rocket,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

import {
  createRechargeOrder,
  getPointsLogs,
  getRechargeOrderDetail,
  getRechargeOrders,
  getRechargePackages,
  mockPayRechargeOrder,
  type PaymentOrder,
  type PaymentTransaction,
  type PointsLog,
  type RechargePackage,
} from "@/api/recharge";
import { useUserStore } from "@/store/useUserStore";

type ActiveTab = "packages" | "orders" | "logs";

const ORDER_PAGE_SIZE = 6;
const LOG_PAGE_SIZE = 8;

const typeLabels: Record<string, string> = {
  recharge: "充值到账",
  register_bonus: "注册赠送",
  image_generate: "图片生成",
  text_to_image: "文生图",
  image_to_image: "图生图",
};

const statusMap: Record<string, { label: string; className: string }> = {
  pending: {
    label: "待支付",
    className: "border border-amber-400/25 bg-amber-400/10 text-amber-100",
  },
  paid: {
    label: "已支付",
    className:
      "border border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
  },
};

const formatNumber = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "--";
  const numeric = Number(value);

  return Number.isFinite(numeric)
    ? new Intl.NumberFormat("zh-CN").format(numeric)
    : String(value);
};

const formatCurrency = (value: number) =>
  `¥${new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)}`;

const formatDateTime = (value?: string | null) => {
  if (!value) return "--";
  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const readUserPoints = (
  user: ReturnType<typeof useUserStore.getState>["user"],
) =>
  user?.points ??
  user?.credits ??
  user?.balance ??
  user?.coin ??
  user?.coins ??
  user?.score ??
  null;

const StatusChip = ({ status }: { status: string }) => {
  const config = statusMap[status] ?? {
    label: status,
    className: "border border-white/15 bg-white/8 text-white/80",
  };
  const Icon = status === "paid" ? CheckCircle2 : Clock3;

  return (
    <Chip
      className={config.className}
      radius="full"
      startContent={<Icon className="ml-2 h-3.5 w-3.5" />}
      variant="flat"
    >
      {config.label}
    </Chip>
  );
};

export default function RechargeCenter() {
  const token = useUserStore((state) => state.token);
  const user = useUserStore((state) => state.user);
  const patchUser = useUserStore((state) => state.patchUser);

  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("packages");
  const [packages, setPackages] = useState<RechargePackage[]>([]);
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [logs, setLogs] = useState<PointsLog[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  const [creatingPackageId, setCreatingPackageId] = useState<string | null>(
    null,
  );
  const [payingOrderId, setPayingOrderId] = useState<number | null>(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOrder, setDetailOrder] = useState<PaymentOrder | null>(null);
  const [detailTransactions, setDetailTransactions] = useState<
    PaymentTransaction[]
  >([]);

  const balance = useMemo(() => readUserPoints(user), [user]);
  const selectedPackage = useMemo(
    () => packages.find((item) => item.id === selectedPackageId) ?? null,
    [packages, selectedPackageId],
  );

  useEffect(() => {
    setHydrated(useUserStore.persist.hasHydrated());
    const unsubscribe = useUserStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    return () => unsubscribe();
  }, []);

  const fetchPackages = useCallback(async () => {
    setPackagesLoading(true);
    try {
      const response = await getRechargePackages();

      setPackages(response.data);
      setSelectedPackageId(
        (current) => current ?? response.data[0]?.id ?? null,
      );
    } catch (error: any) {
      addToast({
        title: error?.response?.data?.message || "充值套餐加载失败",
        color: "danger",
      });
    } finally {
      setPackagesLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async (page: number = 1) => {
    setOrdersLoading(true);
    try {
      const response = await getRechargeOrders(page, ORDER_PAGE_SIZE);

      setOrders(response.data.list);
      setOrdersPage(response.data.page);
      setOrdersTotalPages(response.data.totalPages || 1);
    } catch (error: any) {
      addToast({
        title: error?.response?.data?.message || "订单列表加载失败",
        color: "danger",
      });
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async (page: number = 1) => {
    setLogsLoading(true);
    try {
      const response = await getPointsLogs(page, LOG_PAGE_SIZE);

      setLogs(response.data.list);
      setLogsPage(response.data.page);
      setLogsTotalPages(response.data.totalPages || 1);
    } catch (error: any) {
      addToast({
        title: error?.response?.data?.message || "积分流水加载失败",
        color: "danger",
      });
    } finally {
      setLogsLoading(false);
    }
  }, []);

  const fetchOrderDetail = useCallback(async (orderId: number, open = true) => {
    setDetailLoading(true);
    if (open) setDetailOpen(true);
    try {
      const response = await getRechargeOrderDetail(orderId);

      setDetailOrder(response.data.order);
      setDetailTransactions(response.data.transactions);
    } catch (error: any) {
      addToast({
        title: error?.response?.data?.message || "订单详情加载失败",
        color: "danger",
      });
      if (open) setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || !token) {
      if (hydrated) {
        setPackagesLoading(false);
        setOrdersLoading(false);
        setLogsLoading(false);
      }

      return;
    }

    void Promise.all([fetchPackages(), fetchOrders(1), fetchLogs(1)]);
  }, [fetchLogs, fetchOrders, fetchPackages, hydrated, token]);

  const handleCreateOrder = async (packageId: string) => {
    setCreatingPackageId(packageId);
    try {
      const response = await createRechargeOrder(packageId);

      addToast({ title: "订单已创建，请继续支付", color: "success" });
      setActiveTab("orders");
      await fetchOrders(1);
      await fetchOrderDetail(response.data.order.id, true);
    } catch (error: any) {
      addToast({
        title: error?.response?.data?.message || "创建订单失败",
        color: "danger",
      });
    } finally {
      setCreatingPackageId(null);
    }
  };

  const handleMockPay = async (orderId: number) => {
    setPayingOrderId(orderId);
    try {
      const response = await mockPayRechargeOrder(orderId);

      if (Number.isFinite(response.data.currentPoints)) {
        patchUser({ points: response.data.currentPoints });
      }

      addToast({
        title: response.data.alreadyPaid ? "该订单已支付" : "模拟支付成功",
        color: "success",
      });
      await Promise.all([
        fetchOrders(ordersPage),
        fetchLogs(1),
        fetchOrderDetail(orderId, detailOpen),
      ]);
    } catch (error: any) {
      addToast({
        title: error?.response?.data?.message || "支付失败",
        color: "danger",
      });
    } finally {
      setPayingOrderId(null);
    }
  };

  const unauthenticated = hydrated && !token;

  return (
    <>
      <section className="px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="overflow-hidden border border-white/10 bg-white/[0.04]">
              <CardBody className="relative gap-6 p-6 sm:p-8">
                <div className="absolute -left-16 top-0 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl" />
                <div className="absolute right-0 top-10 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />
                <div className="relative">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <Chip
                      className="border border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-100"
                      radius="full"
                      startContent={
                        <WalletCards className="ml-2 h-3.5 w-3.5" />
                      }
                      variant="flat"
                    >
                      充值中心
                    </Chip>
                    <Chip
                      className="border border-white/10 bg-white/[0.06] text-white/75"
                      radius="full"
                      startContent={
                        <ShieldCheck className="ml-2 h-3.5 w-3.5" />
                      }
                      variant="flat"
                    >
                      支持 mock-pay 联调
                    </Chip>
                  </div>
                  <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                    购买积分包，统一查看订单状态与积分流水。
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
                    已接入充值套餐、创建订单、订单详情、模拟支付和积分流水接口，
                    视觉风格延续站点当前的深色霓虹体系。
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button
                      className="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-rose-500 font-semibold text-white"
                      radius="full"
                      onPress={() => setActiveTab("packages")}
                    >
                      选择套餐
                    </Button>
                    <Button
                      className="border-white/12 text-white/80 hover:bg-white/6 hover:text-white"
                      radius="full"
                      variant="bordered"
                      onPress={() => setActiveTab("logs")}
                    >
                      查看积分流水
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="overflow-hidden border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]">
              <CardBody className="gap-6 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-white/45">
                      Points Wallet
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">当前积分</h2>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-400/10 text-amber-200">
                    <Coins className="h-7 w-7" />
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(124,58,237,0.2),rgba(244,63,94,0.12),rgba(255,255,255,0.04))] p-5">
                  <div className="text-sm text-white/60">余额</div>
                  <div className="mt-2 text-4xl font-semibold tracking-tight">
                    {formatNumber(balance)}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/55">
                    模拟支付完成后，导航栏和这里的积分会同步刷新。
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center gap-2 text-sm text-white/55">
                      <Rocket className="h-4 w-4 text-fuchsia-300" />
                      推荐流程
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/78">
                      先选套餐创建订单，再在订单详情中完成支付。
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center gap-2 text-sm text-white/55">
                      <History className="h-4 w-4 text-cyan-300" />
                      数据联动
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/78">
                      支付后自动刷新订单与积分流水，便于联调确认。
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {unauthenticated ? (
            <Card className="mt-8 border border-white/10 bg-white/[0.04]">
              <CardBody className="items-center gap-4 px-6 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
                  <CreditCard className="h-8 w-8 text-fuchsia-200" />
                </div>
                <h2 className="text-2xl font-semibold">
                  登录后查看充值与积分数据
                </h2>
                <p className="max-w-xl text-sm leading-7 text-white/60">
                  这些接口都要求登录态。登录后页面会自动拉取套餐、订单和积分流水。
                </p>
                <Button
                  as={NextLink}
                  className="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-rose-500 font-semibold text-white"
                  href="/login"
                  radius="full"
                >
                  前往登录
                </Button>
              </CardBody>
            </Card>
          ) : (
            <>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  {
                    key: "packages" as const,
                    label: "充值套餐",
                    icon: Sparkles,
                  },
                  {
                    key: "orders" as const,
                    label: "我的订单",
                    icon: ReceiptText,
                  },
                  { key: "logs" as const, label: "积分流水", icon: History },
                ].map((item) => {
                  const isActive = activeTab === item.key;
                  const CurrentIcon = item.icon;

                  return (
                    <Button
                      key={item.key}
                      className={
                        isActive
                          ? "bg-gradient-to-r from-fuchsia-500/90 to-violet-500/90 text-white shadow-lg shadow-fuchsia-500/15"
                          : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:text-white"
                      }
                      radius="full"
                      startContent={<CurrentIcon className="h-4 w-4" />}
                      variant={isActive ? "solid" : "bordered"}
                      onPress={() => setActiveTab(item.key)}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </div>

              {activeTab === "packages" ? (
                <section className="mt-8">
                  {packagesLoading ? (
                    <div className="flex justify-center py-16">
                      <Spinner color="secondary" size="lg" />
                    </div>
                  ) : (
                    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {packages.map((item, index) => {
                          const isSelected = selectedPackageId === item.id;

                          return (
                            <Card
                              key={item.id}
                              className={`overflow-hidden border transition-all duration-300 ${
                                isSelected
                                  ? "border-fuchsia-400/50 bg-[linear-gradient(160deg,rgba(124,58,237,0.18),rgba(244,63,94,0.12),rgba(255,255,255,0.05))] shadow-[0_24px_80px_rgba(124,58,237,0.16)]"
                                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                              }`}
                            >
                              <CardBody className="h-full p-6">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-fuchsia-200">
                                    <Sparkles className="h-5 w-5" />
                                  </div>
                                  <Chip
                                    className={
                                      index === 1
                                        ? "border border-amber-400/20 bg-amber-400/10 text-amber-100"
                                        : "border border-white/10 bg-white/[0.06] text-white/65"
                                    }
                                    radius="full"
                                    variant="flat"
                                  >
                                    {index === 1 ? "推荐" : "积分包"}
                                  </Chip>
                                </div>
                                <div className="mt-8">
                                  <h3 className="text-2xl font-semibold">
                                    {item.name}
                                  </h3>
                                  <p className="mt-3 text-sm leading-7 text-white/55">
                                    购买后积分自动到账，可用于图片生成等积分消费场景。
                                  </p>
                                </div>
                                <div className="mt-8">
                                  <div className="text-4xl font-semibold tracking-tight">
                                    {formatCurrency(item.amount)}
                                  </div>
                                  <div className="mt-2 text-sm text-fuchsia-100/70">
                                    到账 {formatNumber(item.points)} 积分
                                  </div>
                                </div>
                                <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/45">
                                    <span>兑换效率</span>
                                    <span>即时到账</span>
                                  </div>
                                  <div className="mt-4 text-xl font-semibold">
                                    1 元 ≈{" "}
                                    {formatNumber(
                                      Math.round(item.points / item.amount),
                                    )}{" "}
                                    积分
                                  </div>
                                </div>
                                <div className="mt-8 flex gap-3">
                                  <Button
                                    className="flex-1 border-white/10 text-white/85"
                                    radius="full"
                                    variant="bordered"
                                    onPress={() =>
                                      setSelectedPackageId(item.id)
                                    }
                                  >
                                    {isSelected ? "已选中" : "选择套餐"}
                                  </Button>
                                  <Button
                                    className="flex-1 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-rose-500 font-semibold text-white"
                                    isLoading={creatingPackageId === item.id}
                                    radius="full"
                                    onPress={() => handleCreateOrder(item.id)}
                                  >
                                    创建订单
                                  </Button>
                                </div>
                              </CardBody>
                            </Card>
                          );
                        })}
                      </div>

                      <Card className="border border-white/10 bg-white/[0.04]">
                        <CardBody className="gap-5 p-6">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                              Preview
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold">
                              当前选择
                            </h3>
                          </div>
                          {selectedPackage ? (
                            <>
                              <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
                                <div className="text-sm text-white/55">
                                  套餐名称
                                </div>
                                <div className="mt-2 text-2xl font-semibold">
                                  {selectedPackage.name}
                                </div>
                                <div className="mt-5 flex items-end justify-between gap-4">
                                  <div>
                                    <div className="text-sm text-white/55">
                                      支付金额
                                    </div>
                                    <div className="mt-1 text-3xl font-semibold">
                                      {formatCurrency(selectedPackage.amount)}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-white/55">
                                      到账积分
                                    </div>
                                    <div className="mt-1 text-xl font-semibold text-fuchsia-100">
                                      +{formatNumber(selectedPackage.points)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3 rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
                                {[
                                  "创建订单后可在“我的订单”查看完整详情",
                                  "开发联调可直接使用 mock-pay 完成支付",
                                  "支付成功后积分流水会新增一条充值记录",
                                ].map((item) => (
                                  <div
                                    key={item}
                                    className="flex items-start gap-3 text-sm text-white/75"
                                  >
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                                    <span className="leading-7">{item}</span>
                                  </div>
                                ))}
                              </div>
                              <Button
                                className="h-14 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-rose-500 font-semibold text-white"
                                isLoading={
                                  creatingPackageId === selectedPackage.id
                                }
                                radius="full"
                                onPress={() =>
                                  handleCreateOrder(selectedPackage.id)
                                }
                              >
                                立即创建订单
                              </Button>
                            </>
                          ) : (
                            <div className="rounded-[1.75rem] border border-dashed border-white/12 bg-white/[0.02] px-4 py-10 text-center text-sm text-white/55">
                              当前没有可用套餐数据。
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    </div>
                  )}
                </section>
              ) : null}
              {activeTab === "orders" ? (
                <section className="mt-8">
                  <Card className="border border-white/10 bg-white/[0.03]">
                    <CardBody className="gap-6 p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h2 className="text-2xl font-semibold">
                            我的充值订单
                          </h2>
                          <p className="mt-2 text-sm leading-7 text-white/55">
                            支持查看订单详情和开发环境模拟支付。
                          </p>
                        </div>
                        <Button
                          className="border-white/10 text-white/80"
                          radius="full"
                          variant="bordered"
                          onPress={() => fetchOrders(ordersPage)}
                        >
                          刷新订单
                        </Button>
                      </div>
                      {ordersLoading ? (
                        <div className="flex justify-center py-14">
                          <Spinner color="secondary" size="lg" />
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="rounded-[1.75rem] border border-dashed border-white/12 bg-white/[0.02] px-4 py-12 text-center">
                          <p className="text-lg font-medium">还没有充值订单</p>
                          <p className="mt-2 text-sm text-white/55">
                            先去选择一个积分套餐创建首笔订单。
                          </p>
                          <Button
                            className="mt-5 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-rose-500 font-semibold text-white"
                            radius="full"
                            onPress={() => setActiveTab("packages")}
                          >
                            去充值
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-4">
                            {orders.map((order) => (
                              <Card
                                key={order.id}
                                className="border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]"
                              >
                                <CardBody className="gap-5 p-5">
                                  <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                      <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-xl font-semibold">
                                          {order.package_name}
                                        </h3>
                                        <StatusChip status={order.status} />
                                      </div>
                                      <p className="mt-3 text-sm text-white/55">
                                        订单号 {order.order_no}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm text-white/55">
                                        支付金额
                                      </div>
                                      <div className="mt-1 text-2xl font-semibold">
                                        {formatCurrency(order.amount)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 md:grid-cols-4">
                                    <div>
                                      <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                                        积分
                                      </div>
                                      <div className="mt-2 text-base font-medium">
                                        +{formatNumber(order.points)}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                                        创建时间
                                      </div>
                                      <div className="mt-2 text-base font-medium">
                                        {formatDateTime(order.created_at)}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                                        支付时间
                                      </div>
                                      <div className="mt-2 text-base font-medium">
                                        {formatDateTime(order.paid_at)}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                                        支付渠道
                                      </div>
                                      <div className="mt-2 text-base font-medium uppercase">
                                        {order.payment_channel || "--"}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-3">
                                    <Button
                                      className="border-white/10 text-white/85"
                                      radius="full"
                                      variant="bordered"
                                      onPress={() =>
                                        fetchOrderDetail(order.id, true)
                                      }
                                    >
                                      查看详情
                                    </Button>
                                    {order.status === "pending" ? (
                                      <Button
                                        className="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-rose-500 font-semibold text-white"
                                        isLoading={payingOrderId === order.id}
                                        radius="full"
                                        startContent={
                                          payingOrderId === order.id ? null : (
                                            <ArrowRight className="h-4 w-4" />
                                          )
                                        }
                                        onPress={() => handleMockPay(order.id)}
                                      >
                                        模拟支付
                                      </Button>
                                    ) : null}
                                  </div>
                                </CardBody>
                              </Card>
                            ))}
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-4">
                            <div className="text-sm text-white/55">
                              第 {ordersPage} / {ordersTotalPages} 页
                            </div>
                            <div className="flex gap-3">
                              <Button
                                className="border-white/10 text-white/80"
                                isDisabled={ordersPage <= 1}
                                radius="full"
                                variant="bordered"
                                onPress={() => fetchOrders(ordersPage - 1)}
                              >
                                上一页
                              </Button>
                              <Button
                                className="border-white/10 text-white/80"
                                isDisabled={ordersPage >= ordersTotalPages}
                                radius="full"
                                variant="bordered"
                                onPress={() => fetchOrders(ordersPage + 1)}
                              >
                                下一页
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </CardBody>
                  </Card>
                </section>
              ) : null}

              {activeTab === "logs" ? (
                <section className="mt-8">
                  <Card className="border border-white/10 bg-white/[0.03]">
                    <CardBody className="gap-6 p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h2 className="text-2xl font-semibold">积分流水</h2>
                          <p className="mt-2 text-sm leading-7 text-white/55">
                            展示积分变化类型、变动值、余额、备注和关联订单。
                          </p>
                        </div>
                        <Button
                          className="border-white/10 text-white/80"
                          radius="full"
                          variant="bordered"
                          onPress={() => fetchLogs(logsPage)}
                        >
                          刷新流水
                        </Button>
                      </div>
                      {logsLoading ? (
                        <div className="flex justify-center py-14">
                          <Spinner color="secondary" size="lg" />
                        </div>
                      ) : logs.length === 0 ? (
                        <div className="rounded-[1.75rem] border border-dashed border-white/12 bg-white/[0.02] px-4 py-12 text-center text-white/55">
                          当前没有积分流水记录。
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-4">
                            {logs.map((item) => {
                              const positive = item.change_amount >= 0;

                              return (
                                <Card
                                  key={item.id}
                                  className="border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]"
                                >
                                  <CardBody className="gap-4 p-5">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                      <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                          <h3 className="text-lg font-semibold">
                                            {typeLabels[item.change_type] ||
                                              item.change_type}
                                          </h3>
                                          <Chip
                                            className={
                                              positive
                                                ? "border border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
                                                : "border border-rose-400/25 bg-rose-400/10 text-rose-100"
                                            }
                                            radius="full"
                                            variant="flat"
                                          >
                                            {positive ? "收入" : "支出"}
                                          </Chip>
                                        </div>
                                        <p className="mt-3 text-sm text-white/55">
                                          {formatDateTime(item.created_at)}
                                        </p>
                                      </div>
                                      <div
                                        className={`text-2xl font-semibold ${
                                          positive
                                            ? "text-emerald-200"
                                            : "text-rose-200"
                                        }`}
                                      >
                                        {positive ? "+" : ""}
                                        {formatNumber(item.change_amount)}
                                      </div>
                                    </div>
                                    <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 md:grid-cols-3">
                                      <div>
                                        <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                                          余额
                                        </div>
                                        <div className="mt-2 text-base font-medium">
                                          {formatNumber(item.balance_after)}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                                          关联订单
                                        </div>
                                        <div className="mt-2 text-base font-medium">
                                          {item.order_id
                                            ? `#${item.order_id}`
                                            : "--"}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                                          备注
                                        </div>
                                        <div className="mt-2 text-base font-medium">
                                          {item.remark || "--"}
                                        </div>
                                      </div>
                                    </div>
                                  </CardBody>
                                </Card>
                              );
                            })}
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-4">
                            <div className="text-sm text-white/55">
                              第 {logsPage} / {logsTotalPages} 页
                            </div>
                            <div className="flex gap-3">
                              <Button
                                className="border-white/10 text-white/80"
                                isDisabled={logsPage <= 1}
                                radius="full"
                                variant="bordered"
                                onPress={() => fetchLogs(logsPage - 1)}
                              >
                                上一页
                              </Button>
                              <Button
                                className="border-white/10 text-white/80"
                                isDisabled={logsPage >= logsTotalPages}
                                radius="full"
                                variant="bordered"
                                onPress={() => fetchLogs(logsPage + 1)}
                              >
                                下一页
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </CardBody>
                  </Card>
                </section>
              ) : null}
            </>
          )}
        </div>
      </section>

      <Modal
        isOpen={detailOpen}
        placement="center"
        scrollBehavior="inside"
        size="3xl"
        onOpenChange={setDetailOpen}
      >
        <ModalContent className="border border-white/10 bg-[#0b1020] text-white">
          <ModalHeader className="flex flex-col gap-2 border-b border-white/10 px-6 py-5">
            <span className="text-2xl font-semibold">订单详情</span>
            {detailOrder ? (
              <span className="text-sm font-normal text-white/55">
                {detailOrder.order_no}
              </span>
            ) : null}
          </ModalHeader>
          <ModalBody className="px-6 py-6">
            {detailLoading ? (
              <div className="flex justify-center py-16">
                <Spinner color="secondary" size="lg" />
              </div>
            ) : detailOrder ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {detailOrder.package_name}
                    </h3>
                    <p className="mt-2 text-sm text-white/55">
                      创建于 {formatDateTime(detailOrder.created_at)}
                    </p>
                  </div>
                  <StatusChip status={detailOrder.status} />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    ["支付金额", formatCurrency(detailOrder.amount)],
                    ["到账积分", `+${formatNumber(detailOrder.points)}`],
                    ["交易单号", detailOrder.third_party_order_no || "--"],
                  ].map(([label, value]) => (
                    <Card
                      key={label}
                      className="border border-white/10 bg-white/[0.04]"
                    >
                      <CardBody className="p-4">
                        <div className="text-sm text-white/55">{label}</div>
                        <div className="mt-2 text-xl font-semibold">
                          {value}
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold">交易流水</h4>
                      <p className="mt-2 text-sm text-white/55">
                        展示该订单关联的支付记录。
                      </p>
                    </div>
                    {detailOrder.status === "pending" ? (
                      <Button
                        className="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-rose-500 font-semibold text-white"
                        isLoading={payingOrderId === detailOrder.id}
                        radius="full"
                        onPress={() => handleMockPay(detailOrder.id)}
                      >
                        模拟支付
                      </Button>
                    ) : null}
                  </div>
                  {detailTransactions.length > 0 ? (
                    <div className="mt-5 space-y-4">
                      {detailTransactions.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-fuchsia-200">
                                <ReceiptText className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {item.transaction_type}
                                </div>
                                <div className="mt-1 text-sm text-white/55">
                                  {formatDateTime(item.created_at)}
                                </div>
                              </div>
                            </div>
                            <Chip
                              className="border border-white/10 bg-white/[0.06] text-white/80"
                              radius="full"
                              variant="flat"
                            >
                              {item.status}
                            </Chip>
                          </div>
                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <div>
                              <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                                渠道
                              </div>
                              <div className="mt-2 text-sm text-white/80">
                                {item.channel || "--"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                                交易号
                              </div>
                              <div className="mt-2 text-sm text-white/80">
                                {item.trade_no || "--"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                                更新时间
                              </div>
                              <div className="mt-2 text-sm text-white/80">
                                {formatDateTime(item.updated_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[1.25rem] border border-dashed border-white/12 bg-white/[0.02] px-4 py-10 text-center text-sm text-white/55">
                      暂无交易流水。
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-sm text-white/55">
                未找到订单详情。
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
