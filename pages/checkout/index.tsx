import { useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
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

import Footer from "@/components/Footer";
import TopNavbar from "@/components/TopNavbar";
import DefaultLayout from "@/layouts/default";

type Plan = {
  id: number;
  name: string;
  price: string;
  description: string;
  credits: string;
  features: string[];
  isPopular: boolean;
};

const plans: Plan[] = [
  {
    id: 1,
    name: "尝鲜体验包",
    price: "¥9.9",
    description: "适合第一次购买，快速体验生成效果。",
    credits: "1,000 积分",
    features: [
      "约可生成 20 张 Banana2 顶级图像",
      "或 50 张基础图像",
      "无水印下载",
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
      "约可生成 90 张 Banana2 顶级图像",
      "优先排队出图特权",
      "无水印下载",
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

const planIcons: Record<number, LucideIcon> = {
  1: Gift,
  2: Sparkles,
  3: Crown,
};

export default function CheckoutPage() {
  const [selectedPlanId, setSelectedPlanId] = useState<number>(2);
  const [isQrOpen, setIsQrOpen] = useState(false);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[1],
    [selectedPlanId],
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
                  收银台
                </Chip>
                <Chip
                  className="border border-white/10 bg-white/[0.06] text-white/75"
                  radius="full"
                  startContent={<ShieldCheck className="ml-2 h-3.5 w-3.5" />}
                  variant="flat"
                >
                  简洁支付
                </Chip>
              </div>

              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                选择套餐，立即购买。
              </h1>
              <p className="mt-4 text-base leading-8 text-white/60 sm:text-lg">
                页面只保留三个套餐和购买入口。点击按钮后，直接弹出对应套餐的收款二维码。
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
                            推荐
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
                              获得积分
                            </span>
                            <span
                              className={`text-xs ${
                                plan.isPopular
                                  ? "text-orange-200/70"
                                  : "text-blue-200/70"
                              }`}
                            >
                              支付后自动到账
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
                        radius="full"
                        size="lg"
                        variant={plan.isPopular ? "solid" : "bordered"}
                        onPress={() => {
                          setSelectedPlanId(plan.id);
                          setIsQrOpen(true);
                        }}
                      >
                        立即购买
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
          onOpenChange={setIsQrOpen}
        >
          <ModalContent className="border border-white/10 bg-[#08111f] text-white">
            <ModalHeader className="flex flex-col gap-1 px-6 pt-6">
              <span className="text-2xl font-semibold">
                {selectedPlan.name}
              </span>
              <span className="text-sm font-normal text-white/55">
                使用微信或支付宝扫码支付
              </span>
            </ModalHeader>
            <ModalBody className="px-6 pb-6 pt-2">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 text-center">
                <div className="mx-auto flex aspect-square w-full max-w-[240px] items-center justify-center rounded-[1.75rem] bg-[linear-gradient(135deg,#f8fafc_0%,#dbeafe_100%)] text-slate-900">
                  <div className="flex h-[78%] w-[78%] items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white">
                    <QrCode className="h-32 w-32" />
                  </div>
                </div>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-white">
                  {selectedPlan.price}
                </p>
                <p className="mt-2 text-base font-semibold text-blue-200/85">
                  获得 {selectedPlan.credits}
                </p>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  支付成功后，对应套餐权益会自动到账。
                </p>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    </DefaultLayout>
  );
}
