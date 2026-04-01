import { useCallback, useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { addToast } from "@heroui/toast";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { Pagination } from "@heroui/pagination";
import { Spinner } from "@heroui/spinner";
import { Tab, Tabs } from "@heroui/tabs";
import {
  ArrowUpRight,
  Clock3,
  CreditCard,
  History,
  ReceiptText,
} from "lucide-react";

import {
  getPointsLogs,
  getRechargeOrderDetail,
  getRechargeOrders,
  type PaymentOrder,
  type PaymentTransaction,
  type PointsLog,
} from "@/api/recharge";
import TopNavbar from "@/components/TopNavbar";
import DefaultLayout from "@/layouts/default";
import { useUserStore } from "@/store/useUserStore";

type ActiveTab = "orders" | "logs";

const ORDER_PAGE_SIZE = 6;
const LOG_PAGE_SIZE = 10;

const orderStatusMap: Record<string, { label: string; className: string }> = {
  pending: {
    label: "待支付",
    className: "border border-amber-300/35 bg-amber-400/12 text-amber-100",
  },
  paid: {
    label: "已支付",
    className:
      "border border-emerald-300/35 bg-emerald-400/12 text-emerald-100",
  },
};

const logTypeMap: Record<string, string> = {
  recharge: "充值到账",
  register_bonus: "注册赠送",
  image_generate: "图片生成",
  text_to_image: "文生图",
  image_to_image: "图生图",
};

const formatNumber = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "--";
  const numeric = Number(value);

  return Number.isFinite(numeric)
    ? new Intl.NumberFormat("zh-CN").format(numeric)
    : String(value);
};

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return "--";

  return `¥${new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
};

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

const StatusChip = ({ status }: { status: string }) => {
  const config = orderStatusMap[status] ?? {
    label: status,
    className: "border border-white/15 bg-white/8 text-white/80",
  };

  return (
    <Chip className={config.className} radius="full" variant="flat">
      {config.label}
    </Chip>
  );
};

export default function MyOrdersPage() {
  const router = useRouter();
  const token = useUserStore((state) => state.token);

  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("orders");
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [logs, setLogs] = useState<PointsLog[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOrder, setDetailOrder] = useState<PaymentOrder | null>(null);
  const [detailTransactions, setDetailTransactions] = useState<
    PaymentTransaction[]
  >([]);

  useEffect(() => {
    setHydrated(useUserStore.persist.hasHydrated());
    const unsubscribe = useUserStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace("/login");
    }
  }, [hydrated, router, token]);

  const fetchOrders = useCallback(async (page: number = 1) => {
    setOrdersLoading(true);
    try {
      const response = await getRechargeOrders(page, ORDER_PAGE_SIZE);

      setOrders(response.data.list);
      setOrdersPage(response.data.page);
      setOrdersTotalPages(response.data.totalPages || 1);
      setOrdersTotal(response.data.total || 0);
    } catch (error: any) {
      addToast({
        title: error?.response?.data?.message || "充值记录加载失败",
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
      setLogsTotal(response.data.total || 0);
    } catch (error: any) {
      addToast({
        title: error?.response?.data?.message || "积分流水加载失败",
        color: "danger",
      });
    } finally {
      setLogsLoading(false);
    }
  }, []);

  const fetchDetail = useCallback(async (orderId: number) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const response = await getRechargeOrderDetail(orderId);

      setDetailOrder(response.data.order);
      setDetailTransactions(response.data.transactions);
    } catch (error: any) {
      addToast({
        title: error?.response?.data?.message || "订单详情加载失败",
        color: "danger",
      });
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || !token) {
      if (hydrated) {
        setOrdersLoading(false);
        setLogsLoading(false);
      }

      return;
    }

    void Promise.all([fetchOrders(1), fetchLogs(1)]);
  }, [fetchLogs, fetchOrders, hydrated, token]);

  if (!hydrated || !token) {
    return (
      <DefaultLayout fullWidth hideNavbar>
        <div className="min-h-dvh bg-[radial-gradient(circle_at_top,rgba(30,64,175,0.16),transparent_26%),radial-gradient(circle_at_85%_10%,rgba(245,158,11,0.14),transparent_18%),linear-gradient(180deg,#08101d_0%,#040816_52%,#02050d_100%)] text-white">
          <TopNavbar />
          <section className="px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-32">
            <div className="mx-auto max-w-3xl">
              <Card className="border border-white/10 bg-white/[0.04]">
                <CardBody className="items-center gap-4 px-6 py-14 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-blue-200">
                    <CreditCard className="h-8 w-8" />
                  </div>
                  <h1 className="text-3xl font-semibold tracking-tight">
                    正在跳转登录
                  </h1>
                  <p className="max-w-xl text-sm leading-7 text-white/60">
                    我的订单页需要登录后才能查看充值记录和积分流水。
                  </p>
                  <Button
                    as={NextLink}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 font-semibold text-white"
                    href="/login"
                    radius="full"
                  >
                    前往登录
                  </Button>
                </CardBody>
              </Card>
            </div>
          </section>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout fullWidth hideNavbar>
      <div className="min-h-dvh bg-[radial-gradient(circle_at_top,rgba(30,64,175,0.16),transparent_26%),radial-gradient(circle_at_85%_10%,rgba(245,158,11,0.14),transparent_18%),linear-gradient(180deg,#08101d_0%,#040816_52%,#02050d_100%)] text-white">
        <TopNavbar />
        <section className="px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-7xl">
            <Card className="border border-white/10 bg-white/[0.035] shadow-[0_20px_70px_rgba(2,6,23,0.28)]">
              <CardBody className="gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                      Billing Ledger
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      账单明细
                    </h2>
                  </div>
                  <Tabs
                    fullWidth
                    aria-label="账单标签"
                    classNames={{
                      base: "w-full md:w-auto",
                      tabList:
                        "grid w-full grid-cols-2 rounded-2xl border border-white/10 bg-[#0d1626] p-1 md:w-[320px]",
                      cursor:
                        "rounded-xl bg-gradient-to-r from-blue-500 to-purple-500",
                      tab: "h-12 text-sm",
                      tabContent:
                        "group-data-[selected=true]:text-white text-white/65",
                    }}
                    color="primary"
                    selectedKey={activeTab}
                    size="lg"
                    variant="light"
                    onSelectionChange={(key) => setActiveTab(key as ActiveTab)}
                  >
                    <Tab
                      key="orders"
                      title={
                        <div className="flex items-center gap-2">
                          <ReceiptText className="h-4 w-4" />
                          <span>充值记录</span>
                        </div>
                      }
                    />
                    <Tab
                      key="logs"
                      title={
                        <div className="flex items-center gap-2">
                          <History className="h-4 w-4" />
                          <span>积分流水</span>
                        </div>
                      }
                    />
                  </Tabs>
                </div>

                {activeTab === "orders" ? (
                  <>
                    {ordersLoading ? (
                      <div className="flex justify-center py-16">
                        <Spinner color="primary" size="lg" />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="rounded-[1.75rem] border border-dashed border-white/12 bg-white/[0.02] px-4 py-16 text-center">
                        <p className="text-lg font-medium text-white/86">
                          暂无充值记录
                        </p>
                        <p className="mt-2 text-sm text-white/52">
                          创建充值订单后，这里会展示订单号、金额、积分和支付状态。
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-4">
                          {orders.map((item) => (
                            <Card
                              key={item.id}
                              className="border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] transition-colors duration-200 hover:border-white/15"
                            >
                              <CardBody className="gap-5 p-5 sm:p-6">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                      <h3 className="text-xl font-semibold tracking-tight">
                                        {item.package_name}
                                      </h3>
                                      <StatusChip status={item.status} />
                                    </div>
                                    <p className="mt-3 text-sm text-white/52">
                                      订单号 {item.order_no}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <div className="text-sm text-white/45">
                                        支付金额
                                      </div>
                                      <div className="mt-1 text-2xl font-semibold text-white">
                                        {formatCurrency(item.amount)}
                                      </div>
                                    </div>
                                    <Button
                                      className="border-white/12 text-white/82"
                                      endContent={
                                        <ArrowUpRight className="h-4 w-4" />
                                      }
                                      radius="full"
                                      variant="bordered"
                                      onPress={() => fetchDetail(item.id)}
                                    >
                                      查看详情
                                    </Button>
                                  </div>
                                </div>
                                <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-[#09111e]/90 p-4 md:grid-cols-4">
                                  <div>
                                    <div className="text-xs uppercase tracking-[0.2em] text-white/42">
                                      到账积分
                                    </div>
                                    <div className="mt-2 text-base font-medium text-blue-100">
                                      +{formatNumber(item.points)}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs uppercase tracking-[0.2em] text-white/42">
                                      创建时间
                                    </div>
                                    <div className="mt-2 text-base font-medium">
                                      {formatDateTime(item.created_at)}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs uppercase tracking-[0.2em] text-white/42">
                                      支付时间
                                    </div>
                                    <div className="mt-2 text-base font-medium">
                                      {formatDateTime(item.paid_at)}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs uppercase tracking-[0.2em] text-white/42">
                                      支付渠道
                                    </div>
                                    <div className="mt-2 text-base font-medium uppercase">
                                      {item.payment_channel || "--"}
                                    </div>
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          ))}
                        </div>
                        <div className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm text-white/55">
                            共 {ordersTotal} 笔充值记录
                          </p>
                          <Pagination
                            showControls
                            classNames={{
                              item: "bg-white/[0.04] text-white/70",
                              cursor:
                                "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
                            }}
                            page={ordersPage}
                            total={Math.max(ordersTotalPages, 1)}
                            onChange={(page) => {
                              void fetchOrders(page);
                            }}
                          />
                        </div>
                      </>
                    )}
                  </>
                ) : null}

                {activeTab === "logs" ? (
                  <>
                    {logsLoading ? (
                      <div className="flex justify-center py-16">
                        <Spinner color="secondary" size="lg" />
                      </div>
                    ) : logs.length === 0 ? (
                      <div className="rounded-[1.75rem] border border-dashed border-white/12 bg-white/[0.02] px-4 py-16 text-center">
                        <p className="text-lg font-medium text-white/86">
                          暂无积分流水
                        </p>
                        <p className="mt-2 text-sm text-white/52">
                          后续到账、扣费和赠送都会按时间倒序出现在这里。
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-4">
                          {logs.map((item) => {
                            const positive = item.change_amount >= 0;

                            return (
                              <Card
                                key={item.id}
                                className="border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))]"
                              >
                                <CardBody className="gap-5 p-5 sm:p-6">
                                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div>
                                      <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-lg font-semibold">
                                          {logTypeMap[item.change_type] ||
                                            item.change_type}
                                        </h3>
                                        <Chip
                                          className={
                                            positive
                                              ? "border border-emerald-300/35 bg-emerald-400/12 text-emerald-100"
                                              : "border border-rose-300/35 bg-rose-400/12 text-rose-100"
                                          }
                                          radius="full"
                                          variant="flat"
                                        >
                                          {positive ? "收入" : "支出"}
                                        </Chip>
                                      </div>
                                      <p className="mt-3 text-sm text-white/52">
                                        {formatDateTime(item.created_at)}
                                      </p>
                                    </div>
                                    <div
                                      className={`text-2xl font-semibold tracking-tight ${positive ? "text-emerald-200" : "text-rose-200"}`}
                                    >
                                      {positive ? "+" : ""}
                                      {formatNumber(item.change_amount)}
                                    </div>
                                  </div>
                                  <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-[#09111e]/90 p-4 md:grid-cols-3">
                                    <div>
                                      <div className="text-xs uppercase tracking-[0.2em] text-white/42">
                                        变动后余额
                                      </div>
                                      <div className="mt-2 text-base font-medium">
                                        {formatNumber(item.balance_after)}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs uppercase tracking-[0.2em] text-white/42">
                                        关联订单
                                      </div>
                                      <div className="mt-2 text-base font-medium">
                                        {item.order_id
                                          ? `#${item.order_id}`
                                          : "--"}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs uppercase tracking-[0.2em] text-white/42">
                                        备注
                                      </div>
                                      <div className="mt-2 text-base font-medium text-white/78">
                                        {item.remark || "--"}
                                      </div>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            );
                          })}
                        </div>
                        <div className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm text-white/55">
                            共 {logsTotal} 条积分流水
                          </p>
                          <Pagination
                            showControls
                            classNames={{
                              item: "bg-white/[0.04] text-white/70",
                              cursor:
                                "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
                            }}
                            page={logsPage}
                            total={Math.max(logsTotalPages, 1)}
                            onChange={(page) => {
                              void fetchLogs(page);
                            }}
                          />
                        </div>
                      </>
                    )}
                  </>
                ) : null}
              </CardBody>
            </Card>
          </div>
        </section>

        <Modal
          isOpen={detailOpen}
          placement="center"
          scrollBehavior="inside"
          shouldBlockScroll={false}
          size="3xl"
          onOpenChange={setDetailOpen}
        >
          <ModalContent className="border border-white/10 bg-[#09111d] text-white">
            <ModalHeader className="flex flex-col gap-2 border-b border-white/10 px-6 py-5">
              <span className="text-2xl font-semibold tracking-tight">
                订单详情
              </span>
              {detailOrder ? (
                <span className="text-sm font-normal text-white/55">
                  {detailOrder.order_no}
                </span>
              ) : null}
            </ModalHeader>
            <ModalBody className="px-6 py-6">
              {detailLoading ? (
                <div className="flex justify-center py-16">
                  <Spinner color="primary" size="lg" />
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
                  <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 md:grid-cols-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-white/42">
                        支付时间
                      </div>
                      <div className="mt-2 text-sm text-white/82">
                        {formatDateTime(detailOrder.paid_at)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-white/42">
                        支付渠道
                      </div>
                      <div className="mt-2 text-sm uppercase text-white/82">
                        {detailOrder.payment_channel || "--"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-white/42">
                        更新时间
                      </div>
                      <div className="mt-2 text-sm text-white/82">
                        {formatDateTime(detailOrder.updated_at)}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-blue-200">
                        <Clock3 className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">交易流水</h4>
                        <p className="mt-1 text-sm text-white/55">
                          显示该订单关联的支付记录。
                        </p>
                      </div>
                    </div>
                    {detailTransactions.length > 0 ? (
                      <div className="mt-5 space-y-4">
                        {detailTransactions.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-[1.25rem] border border-white/10 bg-[#0b1423] p-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <div className="text-base font-medium">
                                  {item.transaction_type}
                                </div>
                                <div className="mt-1 text-sm text-white/55">
                                  {formatDateTime(item.created_at)}
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
                                <div className="text-xs uppercase tracking-[0.2em] text-white/42">
                                  渠道
                                </div>
                                <div className="mt-2 text-sm text-white/82">
                                  {item.channel || "--"}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs uppercase tracking-[0.2em] text-white/42">
                                  交易号
                                </div>
                                <div className="mt-2 text-sm text-white/82">
                                  {item.trade_no || "--"}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs uppercase tracking-[0.2em] text-white/42">
                                  更新时间
                                </div>
                                <div className="mt-2 text-sm text-white/82">
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
      </div>
    </DefaultLayout>
  );
}
