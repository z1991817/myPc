import type { GetStaticProps, InferGetStaticPropsType } from "next";
import type {
  FaqItemData,
  PricingPlanData,
  TechPillarData,
  TechPillarIconKey,
} from "@/data/homepage-content";

import { useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, animate, useInView, useReducedMotion } from "framer-motion";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Divider } from "@heroui/divider";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import {
  Sparkles,
  Palette,
  Zap,
  Maximize2,
  Check,
  Gift,
  Rocket,
} from "lucide-react";

import DefaultLayout from "@/layouts/default";
import { getGalleryList, GalleryImageItem } from "@/api/gallery";
import { normalizeImageURL } from "@/lib/image-base-url";
import Aurora from "@/components/Aurora";
import TopNavbar from "@/components/TopNavbar";
import { useLoginModalStore } from "@/store/useLoginModalStore";
import { useUserStore } from "@/store/useUserStore";

const ShowcaseSwiperBlock = dynamic(
  () => import("@/components/home/ShowcaseSwiperBlock"),
  {
    ssr: false,
  },
);

const GalleryMasonryBlock = dynamic(
  () => import("@/components/home/GalleryMasonryBlock"),
  {
    ssr: false,
  },
);

/* ============================
   类型定义
   ============================ */

/** 第一屏统计数据 */
interface StatItem {
  label: string;
  value: number;
  suffix: string;
  decimals?: number;
}

/** 第三屏技术支柱数据 */
interface TechPillar {
  id: number;
  title: string;
  description: string;
  bullets: string[];
  image: string;
  reverse: boolean;
  icon: React.ReactNode;
}

/** 通用滚动显隐包装组件属性 */
interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}

/** 通用标题组件属性 */
interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description: string;
}

/** 数字滚动组件属性 */
interface StatCounterProps extends StatItem {
  description?: string;
}

type IndexPageProps = {
  techPillarsData: TechPillarData[];
  pricingPlans: PricingPlanData[];
  faqItems: FaqItemData[];
};

const techPillarIconMap: Record<TechPillarIconKey, React.ReactNode> = {
  sparkles: <Sparkles size={20} />,
  palette: <Palette size={20} />,
  maximize2: <Maximize2 size={20} />,
  zap: <Zap size={20} />,
};

/* ============================
   动画与工具函数
   ============================ */

/** 数字格式化 */
function formatStatValue(
  value: number,
  suffix: string,
  decimals: number = 0,
): string {
  const displayValue =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();

  return `${displayValue}${suffix}`;
}

/**
 * 首页画廊卡片预览图优先级：
 * 1. 后端 preview_url / previewUrl
 * 2. cos_url（直接使用原图，避免前端拼接处理参数导致部分节点连接异常）
 */
function resolveGalleryPreviewURL(item: GalleryImageItem): string {
  const normalizedCosUrl = normalizeImageURL(item.cos_url);
  const rawPreviewUrl = item.preview_url || item.previewUrl;

  if (rawPreviewUrl) {
    return normalizeImageURL(rawPreviewUrl);
  }

  if (!normalizedCosUrl) {
    return normalizedCosUrl;
  }

  /**
   * 线上出现过 imageMogr2 查询参数触发 net::ERR_CONNECTION_CLOSED 的情况，
   * 因此前端不再自行拼接图片处理参数，统一回退原图。
   */
  return normalizedCosUrl;
}

/** 通用滚动显隐组件，统一处理首页滚动动画 */
function Reveal({ children, className, delay = 0, amount = 0.2 }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }
      }
      transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay }}
      viewport={{ once: true, amount }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

/** 通用标题组件，统一每屏标题结构 */
function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="mb-16 text-center">
      {eyebrow ? (
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.28em] text-blue-400">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <p className="mx-auto max-w-3xl text-base leading-7 text-white/55">
        {description}
      </p>
    </div>
  );
}

/** 第一屏数字滚动组件 */
function StatCounter({
  label,
  value,
  suffix,
  decimals = 0,
  description,
}: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    if (prefersReducedMotion) {
      setDisplayValue(value);

      return;
    }

    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(latest) {
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [isInView, prefersReducedMotion, value]);

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-5 backdrop-blur-sm"
    >
      <p className="text-3xl font-bold text-white sm:text-4xl">
        {formatStatValue(displayValue, suffix, decimals)}
      </p>
      <p className="mt-2 text-sm font-medium text-white/70">{label}</p>
      {description ? (
        <p className="mt-1 text-xs leading-6 text-white/35">{description}</p>
      ) : null}
    </div>
  );
}

/* ============================
   页面主组件
   ============================ */

export default function IndexNewPage({
  techPillarsData,
  pricingPlans,
  faqItems,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const token = useUserStore((state) => state.token);
  const openLoginModal = useLoginModalStore((state) => state.openModal);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [announcementReady, setAnnouncementReady] = useState(false);

  /** 画廊数据状态 */
  const [galleryImages, setGalleryImages] = useState<GalleryImageItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const gallerySectionRef = useRef<HTMLElement>(null);
  const isGallerySectionInView = useInView(gallerySectionRef, {
    once: true,
    amount: 0.08,
    margin: "200px 0px",
  });
  const hasRequestedGalleryRef = useRef(false);

  const techPillars: TechPillar[] = techPillarsData.map((pillar) => ({
    ...pillar,
    icon: techPillarIconMap[pillar.icon],
  }));

  const handleCloseAnnouncement = () => {
    setIsAnnouncementOpen(false);
  };

  const handleClaimPoints = () => {
    setIsAnnouncementOpen(false);
    openLoginModal();
  };

  /** 加载画廊数据 */
  useEffect(() => {
    if (!isGallerySectionInView || hasRequestedGalleryRef.current) {
      return;
    }

    hasRequestedGalleryRef.current = true;

    const fetchGallery = async () => {
      setGalleryLoading(true);
      try {
        const res = await getGalleryList(1, 12);

        if (res.code === 200 && res.data?.list) {
          const normalizedGalleryImages = res.data.list.map((item) => ({
            ...item,
            cos_url: normalizeImageURL(item.cos_url),
            preview_url: resolveGalleryPreviewURL(item),
          }));

          setGalleryImages(normalizedGalleryImages);
        }
      } catch (error) {
        console.error("画廊数据加载失败:", error);
      } finally {
        setGalleryLoading(false);
      }
    };

    fetchGallery();
  }, [isGallerySectionInView]);

  useEffect(() => {
    const syncAnnouncementVisibility = () => {
      setAnnouncementReady(true);
      setIsAnnouncementOpen(!useUserStore.getState().token);
    };

    if (useUserStore.persist.hasHydrated()) {
      syncAnnouncementVisibility();
    }

    const unsubscribeHydration = useUserStore.persist.onFinishHydration(() => {
      syncAnnouncementVisibility();
    });

    return () => {
      unsubscribeHydration();
    };
  }, []);

  useEffect(() => {
    if (!announcementReady) {
      return;
    }

    if (token) {
      setIsAnnouncementOpen(false);
    }
  }, [announcementReady, token]);

  return (
    <DefaultLayout fullWidth hideNavbar>
      <div className="min-h-screen overflow-x-hidden bg-[#030712]">
        <TopNavbar />
        {announcementReady && !token ? (
          <Modal
            isOpen={isAnnouncementOpen}
            placement="center"
            shouldBlockScroll={false}
            onClose={handleCloseAnnouncement}
          >
            <ModalContent className="overflow-hidden border border-amber-300/20 bg-[#0b1020] text-white shadow-2xl shadow-amber-500/10">
              <ModalHeader className="border-b border-white/10 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-amber-300/80">
                      NEW SITE
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-white">
                      新站上线
                    </h2>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="px-6 py-6">
                <div className="rounded-[1.5rem] border border-amber-400/20 bg-gradient-to-br from-amber-400/12 via-orange-400/10 to-transparent p-5 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950 shadow-xl shadow-amber-500/30">
                    <Gift className="h-8 w-8" />
                  </div>
                  <p className="text-sm uppercase tracking-[0.35em] text-amber-200/70">
                    限时福利
                  </p>
                  <p className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
                    注册就送
                    <span className="mx-2 bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                      200
                    </span>
                    积分
                  </p>
                  <p className="mt-4 text-sm leading-7 text-white/68">
                    现在注册即可领取新站专属积分，直接开始体验 AI
                    图片生成、修图和创作流程。
                  </p>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-white/10 px-6 py-5">
                <Button
                  className="text-white/70"
                  variant="light"
                  onPress={handleCloseAnnouncement}
                >
                  稍后再看
                </Button>
                <Button
                  className="bg-gradient-to-r from-amber-400 to-orange-500 font-bold text-slate-950 shadow-lg shadow-amber-500/30"
                  onPress={handleClaimPoints}
                >
                  立即领取
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        ) : null}
        {/* 顶部导航 */}

        {/* ============================================
            第一屏 - Hero 网站介绍
            ============================================ */}
        <section className="hero-new-bg relative flex min-h-screen items-center overflow-hidden px-4 sm:px-6 ">
          <Aurora
            amplitude={0.9}
            blend={0.5}
            colorStops={["#3B82F6", "#6366F1", "#8B5CF6"]}
            speed={0.9}
          />
          {/* 网格背景 */}
          <div className="hero-grid-overlay pointer-events-none absolute inset-0" />

          {/* 背景光斑 */}
          <div className="pointer-events-none absolute left-[8%] top-[18%] h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[18%] right-[10%] h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[8%] left-[35%] h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10 mx-auto w-full max-w-7xl py-24 md:py-32">
            <Reveal className="mx-auto max-w-5xl text-center">
              <Chip
                className="mb-8 border border-white/10 bg-white/5 text-xs text-white/80"
                radius="full"
                variant="flat"
              >
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                  Nano Banana 2 已发布
                </span>
              </Chip>

              <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                AI 驱动的下一代
                <br />
                <span className="gradient-text">图片创作平台</span>
              </h1>

              <p className="mx-auto mb-10 max-w-3xl text-base leading-8 text-white/60 md:text-lg lg:text-xl">
                输入一句描述，搭载全新 Nano Banana 2 引擎，单张成本低至 0.5
                元。完美解决光影质感与细节崩坏，100% 放心商用。
              </p>

              <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  as={NextLink}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 px-8 text-base font-semibold text-white shadow-lg shadow-blue-500/25"
                  href="/create"
                  radius="full"
                  size="lg"
                >
                  开始创作
                </Button>
                <Button
                  className="border-white/20 px-8 text-base text-white/80 hover:bg-white/5"
                  radius="full"
                  size="lg"
                  variant="bordered"
                  onPress={() => {
                    document
                      .getElementById("gallery")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  浏览画廊
                </Button>
                {/* <Button
                  as={NextLink}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 px-8 text-base font-semibold text-white shadow-lg shadow-blue-500/25"
                  href="/create"
                  radius="full"
                  size="lg"
                >
                  测试按钮
                </Button> */}
              </div>
            </Reveal>

            {/* 第一屏数字滚动区域 */}
            <Reveal
              className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3"
              delay={0.15}
            >
              <StatCounter label="活跃用户" suffix="K+" value={10} />
              <StatCounter label="生成图片" suffix="K+" value={500} />
              <StatCounter
                decimals={1}
                label="服务可用率"
                suffix="%"
                value={99.9}
              />
            </Reveal>
          </div>
        </section>

        {/* ============================================
            第二屏 - 应用场景对比轮播
            ============================================ */}
        <section
          className="w-full bg-[#050b16] px-4 py-20 md:py-28"
          id="showcase"
        >
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading
                description="从原始素材到处理结果，每个场景都会展示一组前后视觉变化。Nano Banana 把修图、增强、重绘与风格化整合成一条更高效的视觉生产链路。"
                eyebrow="Use Cases"
                title="看看 AI 能做什么"
              />
            </Reveal>

            <Reveal delay={0.08}>
              <ShowcaseSwiperBlock />
            </Reveal>
          </div>
        </section>

        {/* ============================================
            第三屏 - 四大技术支柱（与画廊互换位置）
            ============================================ */}
        <section
          className="hidden w-full border-y border-white/5 bg-[#030712] px-4 py-20 md:block md:py-28"
          id="tech"
        >
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading
                description="Nano Banana 2 攻克了 AI 图像生成领域最棘手的难题。以下是专业人士信赖它进行生产工作的原因。"
                eyebrow="Core Technology"
                title="Nano Banana 2 的技术特点"
              />
            </Reveal>

            <div className="space-y-8 md:space-y-10">
              {techPillars.map((pillar, index) => (
                <Reveal key={pillar.id} delay={index * 0.06}>
                  <Card className="overflow-hidden border border-white/8 bg-white/[0.03]">
                    <CardBody className="p-5 md:p-7 lg:p-8">
                      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                        {/* 文案区 */}
                        <div
                          className={
                            pillar.reverse
                              ? "order-2 lg:order-2"
                              : "order-2 lg:order-1"
                          }
                        >
                          <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white">
                              {pillar.icon}
                            </div>
                            <Chip
                              className="border border-white/10 bg-white/5 text-white/70"
                              radius="full"
                              size="sm"
                              variant="flat"
                            >
                              技术支柱 0{pillar.id}
                            </Chip>
                          </div>

                          <h3 className="mb-4 text-2xl font-bold text-white md:text-3xl">
                            {pillar.title}
                          </h3>

                          <p className="mb-6 text-base leading-8 text-white/60">
                            {pillar.description}
                          </p>

                          <div className="grid gap-3 sm:grid-cols-3">
                            {pillar.bullets.map((bullet) => (
                              <div
                                key={bullet}
                                className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white/72"
                              >
                                {bullet}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 图片区 */}
                        <div
                          className={
                            pillar.reverse
                              ? "order-1 lg:order-1"
                              : "order-1 lg:order-2"
                          }
                        >
                          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
                            <Image
                              alt={pillar.title}
                              className="h-[280px] w-full object-cover md:h-[360px] lg:h-[420px]"
                              height={840}
                              loading="lazy"
                              sizes="(max-width: 1024px) 100vw, 50vw"
                              src={pillar.image}
                              width={1400}
                            />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 to-transparent" />
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            第四屏 - 画廊瀑布流（与技术支柱互换位置）
            ============================================ */}
        <section
          ref={gallerySectionRef}
          className="w-full bg-[#050b16] px-4 py-20 md:py-28"
          id="gallery"
        >
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading
                description="探索由 Nano Banana 生成的真实作品，从商业视觉、角色设定到广告海报与产品展示，快速了解平台在不同场景中的输出能力。"
                eyebrow="Gallery"
                title="AI 创作画廊"
              />
            </Reveal>

            {/* 动态分包：瀑布流区块 */}
            <Reveal delay={0.06}>
              {isGallerySectionInView ||
              galleryLoading ||
              galleryImages.length > 0 ? (
                <GalleryMasonryBlock
                  galleryImages={galleryImages}
                  galleryLoading={galleryLoading}
                />
              ) : (
                <div className="h-[360px] rounded-[1.5rem] border border-white/5 bg-white/[0.02]" />
              )}
            </Reveal>

            <Reveal className="mt-12 text-center" delay={0.1}>
              <Button
                as={NextLink}
                className="border-white/15 px-8 text-white/75 hover:bg-white/5"
                href="/gallery"
                radius="full"
                size="lg"
                variant="bordered"
              >
                查看更多作品
              </Button>
            </Reveal>
          </div>
        </section>

        {/* ============================================
            第五屏 - 定价
            ============================================ */}
        <section
          className="w-full scroll-mt-28 border-y border-white/5 bg-[#030712] px-4 py-20 md:scroll-mt-32 md:py-28"
          id="pricing"
        >
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading
                description="量化价值，透明定价。每一分投入都能换算成实实在在的创作产出。"
                eyebrow="Pricing"
                title="选择适合你的方案"
              />
            </Reveal>

            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3 md:items-center md:pt-4">
              {pricingPlans.map((plan, index) => (
                <Reveal key={plan.id} delay={index * 0.06}>
                  <div
                    className={`relative ${
                      plan.isPopular ? "pricing-cyber-shell" : ""
                    }`}
                  >
                    {/* 角标 - 放在卡片外层 */}
                    {plan.isPopular ? (
                      <div className="absolute -top-5 left-1/2 z-20 -translate-x-1/2 md:-top-6">
                        <Chip
                          className="border border-orange-500/40 bg-gradient-to-r from-orange-500 to-red-500 px-4 text-xs font-bold text-white shadow-lg"
                          radius="full"
                          size="sm"
                          startContent={<span className="text-sm">🔥</span>}
                          variant="solid"
                        >
                          性价比之王
                        </Chip>
                      </div>
                    ) : null}

                    {plan.isPopular ? (
                      <>
                        <div
                          aria-hidden="true"
                          className="pricing-cyber-border"
                        />
                        <div
                          aria-hidden="true"
                          className="pricing-cyber-blur"
                        />
                        <div
                          aria-hidden="true"
                          className="pricing-cyber-beam"
                        />
                      </>
                    ) : null}

                    <Card
                      className={`relative border p-2 transition-all duration-300 ${
                        plan.isPopular
                          ? "pricing-popular-glow pricing-cyber-card scale-[1.02] border-orange-500/50 bg-gradient-to-br from-orange-500/[0.08] to-purple-500/[0.08] shadow-2xl shadow-orange-500/20 md:scale-[1.15]"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
                      }`}
                    >
                      <CardHeader
                        className={`flex-col items-start gap-2 px-6 pb-0 ${
                          plan.isPopular ? "pt-10 md:pt-12" : "pt-8"
                        }`}
                      >
                        <h3
                          className={`text-xl font-bold ${
                            plan.isPopular ? "text-white" : "text-white/70"
                          }`}
                        >
                          {plan.name}
                        </h3>
                        <p
                          className={`text-sm leading-7 ${
                            plan.isPopular ? "text-white/70" : "text-white/40"
                          }`}
                        >
                          {plan.description}
                        </p>
                      </CardHeader>

                      <CardBody className="px-6 py-6">
                        <div className="mb-6">
                          <span
                            className={`text-5xl font-bold ${
                              plan.isPopular
                                ? "bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent"
                                : "text-white/60"
                            }`}
                          >
                            {plan.price}
                          </span>
                          {plan.period ? (
                            <span
                              className={`ml-1 text-base ${
                                plan.isPopular
                                  ? "text-white/50"
                                  : "text-white/30"
                              }`}
                            >
                              {plan.period}
                            </span>
                          ) : null}
                        </div>

                        <Divider
                          className={
                            plan.isPopular ? "bg-white/15" : "bg-white/5"
                          }
                        />

                        <ul className="mt-6 space-y-3">
                          {plan.features.map((feature) => (
                            <li
                              key={feature}
                              className={`flex items-start gap-2.5 text-sm leading-7 ${
                                plan.isPopular
                                  ? "text-white/80"
                                  : "text-white/50"
                              }`}
                            >
                              <Check
                                className={`mt-0.5 h-4 w-4 shrink-0 ${
                                  plan.isPopular
                                    ? "text-orange-400"
                                    : "text-green-400/50"
                                }`}
                              />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardBody>

                      <CardFooter className="px-6 pb-6 pt-0">
                        <Button
                          fullWidth
                          as={NextLink}
                          className={
                            plan.isPopular
                              ? "pricing-popular-button w-full bg-gradient-to-r from-orange-500 to-purple-500 font-bold text-white shadow-xl shadow-orange-500/30 transition-all hover:shadow-2xl hover:shadow-orange-500/40"
                              : "w-full border-white/10 font-semibold text-white/60 hover:border-white/20 hover:bg-white/5 hover:text-white/80"
                          }
                          href={plan.ctaHref}
                          radius="full"
                          size="lg"
                          variant={plan.isPopular ? "solid" : "bordered"}
                        >
                          {plan.ctaText}
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            第六屏 - FAQ
            ============================================ */}
        <section className="w-full bg-[#050b16] px-4 py-20 md:py-28" id="faq">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <SectionHeading
                description="关于 Nano Banana 你可能想知道的一切。"
                eyebrow="FAQ"
                title="常见问题"
              />
            </Reveal>

            <Reveal delay={0.08}>
              <Accordion
                itemClasses={{
                  base: "mb-3 rounded-2xl border border-white/8 bg-white/[0.03] px-6 data-[open=true]:border-white/15",
                  title: "text-base font-medium text-white",
                  content: "pb-5 text-sm leading-7 text-white/60",
                  trigger: "py-5",
                  indicator: "text-white/50",
                }}
                selectionMode="multiple"
                variant="splitted"
              >
                {faqItems.map((item) => (
                  <AccordionItem
                    key={item.key}
                    aria-label={item.question}
                    title={item.question}
                  >
                    {item.answer}
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </section>
      </div>

      {/* 底部 Footer */}
    </DefaultLayout>
  );
}

export const getStaticProps: GetStaticProps<IndexPageProps> = async () => {
  const { techPillarsData, pricingPlansData, faqItemsData } = await import(
    "@/data/homepage-content"
  );

  return {
    props: {
      techPillarsData,
      pricingPlans: pricingPlansData,
      faqItems: faqItemsData,
    },
  };
};

