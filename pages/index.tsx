import type { GetStaticProps, InferGetStaticPropsType } from "next";
import type {
  FaqItemData,
  PricingPlanData,
  TechPillarData,
  TechPillarIconKey,
} from "@/data/homepage-content";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Accordion, AccordionItem } from "@heroui/accordion";
import {
  Check,
  Crown,
  Gift,
  Maximize2,
  Palette,
  Sparkles,
  WandSparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { getGalleryList, type GalleryImageItem } from "@/api/gallery";
import DefaultLayout from "@/layouts/default";
import { normalizeImageURL } from "@/lib/image-base-url";
import TopNavbar from "@/components/TopNavbar";

const Aurora = dynamic(() => import("@/components/Aurora"), {
  ssr: false,
});

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

interface IndexPageProps {
  techPillarsData: TechPillarData[];
  pricingPlans: PricingPlanData[];
  faqItems: FaqItemData[];
}

interface StatItem {
  label: string;
  value: string;
  description: string;
}

const stats: StatItem[] = [
  {
    label: "活跃用户",
    value: "10K+",
    description: "持续增长的创作者社区",
  },
  {
    label: "生成图片",
    value: "500K+",
    description: "覆盖商业、电商与内容创作",
  },
  {
    label: "服务可用率",
    value: "99.9%",
    description: "稳定可用的在线生成体验",
  },
];

const galleryPlaceholderHeights = [
  "h-[280px]",
  "h-[360px]",
  "h-[320px]",
  "h-[420px]",
  "h-[300px]",
  "h-[380px]",
  "h-[340px]",
  "h-[400px]",
];

const techPillarIconMap: Record<TechPillarIconKey, React.ReactNode> = {
  sparkles: <Sparkles className="h-5 w-5" />,
  palette: <Palette className="h-5 w-5" />,
  maximize2: <Maximize2 className="h-5 w-5" />,
  zap: <Zap className="h-5 w-5" />,
};

const pricingPlanIcons: Record<number, LucideIcon> = {
  1: Gift,
  2: Sparkles,
  3: Crown,
};

const pricingPlanCredits: Record<number, string> = {
  1: "1,000 积分",
  2: "4,500积分",
  3: "15,000 积分",
};

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="home-section-heading mx-auto mb-12 max-w-3xl text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-sky-300/80">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-bold text-white sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-white/65">{description}</p>
    </div>
  );
}

function resolveGalleryPreviewURL(item: GalleryImageItem): string {
  const normalizedCosUrl = normalizeImageURL(item.cos_url);
  const rawThumbnailUrl = item.thumbnail_url || item.thumbnailUrl;
  const rawPreviewUrl = item.preview_url || item.previewUrl;

  if (rawThumbnailUrl) {
    return normalizeImageURL(rawThumbnailUrl);
  }

  if (rawPreviewUrl) {
    return normalizeImageURL(rawPreviewUrl);
  }

  return normalizedCosUrl;
}

function AnimatedStatValue({ value }: { value: string }) {
  const containerRef = useRef<HTMLParagraphElement | null>(null);
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const parsedValue = /^(\d+(?:\.\d+)?)(.*)$/.exec(value);

    if (!parsedValue) {
      setDisplayValue(value);

      return;
    }

    const [, rawNumber, suffix] = parsedValue;
    const targetValue = Number(rawNumber);
    const decimals = rawNumber.includes(".")
      ? rawNumber.split(".")[1].length
      : 0;
    let animationFrameId = 0;
    let observer: IntersectionObserver | null = null;

    const formatValue = (nextValue: number) => {
      if (decimals > 0) {
        return `${nextValue.toFixed(decimals)}${suffix}`;
      }

      return `${Math.round(nextValue)}${suffix}`;
    };

    const startAnimation = () => {
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setDisplayValue(value);

        return;
      }

      const startTime = performance.now();
      const duration = 1400;

      const tick = (currentTime: number) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        const nextValue = targetValue * easedProgress;

        setDisplayValue(formatValue(nextValue));

        if (progress < 1) {
          animationFrameId = window.requestAnimationFrame(tick);

          return;
        }

        setDisplayValue(value);
      };

      animationFrameId = window.requestAnimationFrame(tick);
    };

    if (!containerRef.current || typeof IntersectionObserver === "undefined") {
      startAnimation();

      return () => {
        window.cancelAnimationFrame(animationFrameId);
      };
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          startAnimation();
          observer?.disconnect();
        });
      },
      { threshold: 0.45 },
    );

    observer.observe(containerRef.current);

    return () => {
      observer?.disconnect();
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [value]);

  return (
    <p ref={containerRef} className="text-3xl font-bold text-white sm:text-4xl">
      {displayValue}
    </p>
  );
}

export default function HomePage({
  techPillarsData,
  pricingPlans,
  faqItems,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [showcaseReady, setShowcaseReady] = useState(false);
  const [galleryReady, setGalleryReady] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImageItem[]>([]);

  const showcaseSectionRef = useRef<HTMLElement | null>(null);
  const gallerySectionRef = useRef<HTMLElement | null>(null);
  const hasRequestedGalleryRef = useRef(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setShowcaseReady(true);
      setGalleryReady(true);

      return;
    }

    const targetMap = new Map<Element, () => void>();

    if (showcaseSectionRef.current) {
      targetMap.set(showcaseSectionRef.current, () => {
        setShowcaseReady(true);
      });
    }

    if (gallerySectionRef.current) {
      targetMap.set(gallerySectionRef.current, () => {
        setGalleryReady(true);
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const activate = targetMap.get(entry.target);

          if (!activate) {
            return;
          }

          activate();
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "320px 0px",
      },
    );

    targetMap.forEach((_, target) => {
      observer.observe(target);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!galleryReady || hasRequestedGalleryRef.current) {
      return;
    }

    hasRequestedGalleryRef.current = true;

    const fetchGallery = async () => {
      setGalleryLoading(true);

      try {
        const response = await getGalleryList(1, 12);

        if (response.code === 200 && response.data?.list) {
          const normalizedGalleryImages = response.data.list.map((item) => ({
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

    void fetchGallery();
  }, [galleryReady]);

  return (
    <DefaultLayout fullWidth hideNavbar>
      <div className="min-h-screen overflow-x-hidden bg-[#030712] text-white">
        <TopNavbar />

        <section className="home-hero-shell relative flex min-h-screen items-center overflow-hidden px-4 sm:px-6">
          <Aurora
            amplitude={0.75}
            blend={0.45}
            colorStops={["#38bdf8", "#6366f1", "#14b8a6"]}
            speed={0.8}
          />
          <div className="hero-grid-overlay pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute left-[8%] top-[18%] h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[18%] right-[10%] h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="home-hero-orb home-hero-orb--left pointer-events-none absolute" />
          <div className="home-hero-orb home-hero-orb--right pointer-events-none absolute" />

          <div className="relative z-10 mx-auto w-full max-w-7xl py-24 md:py-32">
            <div className="home-hero-stage mx-auto max-w-5xl text-center">
              <Chip
                className="home-hero-chip mb-6 border border-white/10 bg-white/5 text-xs text-white/80"
                radius="full"
                variant="flat"
              >
                <span className="flex items-center gap-2">
                  <WandSparkles className="h-3.5 w-3.5 text-emerald-300" />
                  Nano Banana 2 已上线
                </span>
              </Chip>

              <h1 className="home-hero-title text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                更轻、更快的
                <br />
                <span className="gradient-text">AI 图片创作平台</span>
              </h1>

              <p className="home-hero-copy mx-auto mt-6 max-w-3xl text-base leading-8 text-white/65 md:text-lg">
                输入一句描述，快速完成生成、修图、增强和风格化。首页首屏保留必要内容，把轮播和画廊延后到接近可视区再加载，减少主线程压力。
              </p>

              <div className="home-hero-actions mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  as={NextLink}
                  className="home-cta-primary bg-gradient-to-r from-sky-500 to-indigo-500 px-8 font-semibold text-white shadow-lg shadow-sky-500/20"
                  href="/create"
                  prefetch={false}
                  radius="full"
                  size="lg"
                >
                  立即创作
                </Button>
                <Button
                  className="home-cta-secondary border-white/15 px-8 text-white/80 hover:bg-white/5"
                  radius="full"
                  size="lg"
                  variant="bordered"
                  onPress={() => {
                    gallerySectionRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                >
                  浏览画廊
                </Button>
              </div>
            </div>

            <div className="home-hero-stats mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-3">
              {stats.map((item, index) => (
                <Card
                  key={item.label}
                  className="home-stat-card border border-white/8 bg-white/[0.03]"
                  style={{ animationDelay: `${index * 90 + 280}ms` }}
                >
                  <CardBody className="px-6 py-5">
                    <AnimatedStatValue value={item.value} />
                    <p className="mt-2 text-sm font-medium text-white/72">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs leading-6 text-white/45">
                      {item.description}
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          ref={showcaseSectionRef}
          className="home-section-shell w-full bg-[#050b16] px-4 py-20 md:py-28"
          id="showcase"
        >
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              description="对比轮播保持原来的展示能力，但不再跟着首屏一起抢主线程，只有接近可视区时才真正挂载。"
              eyebrow="Use Cases"
              title="看看 AI 能做什么"
            />

            {showcaseReady ? (
              <div className="home-reveal-block">
                <ShowcaseSwiperBlock />
              </div>
            ) : (
              <div className="home-showcase-placeholder h-[720px] rounded-[1.75rem] border border-white/8 bg-white/[0.03]" />
            )}
          </div>
        </section>

        <section
          className="home-section-shell border-y border-white/5 bg-[#030712] px-4 py-20 md:py-28"
          id="tech"
        >
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              description="技术说明区改成更直接的静态渲染，避免首页首屏再为滚动动效和复杂布局付出额外成本。"
              eyebrow="Core Technology"
              title="Nano Banana 2 的技术特点"
            />

            <div className="space-y-8">
              {techPillarsData.map((pillar, index) => (
                <Card
                  key={pillar.id}
                  className="home-surface-card overflow-hidden border border-white/8 bg-white/[0.03]"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <CardBody className="p-5 md:p-7 lg:p-8">
                    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                      <div className={pillar.reverse ? "lg:order-2" : ""}>
                        <div className="mb-5 flex items-center gap-3">
                          <div className="home-icon-badge flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-white">
                            {techPillarIconMap[pillar.icon]}
                          </div>
                          <Chip
                            className="border border-white/10 bg-white/5 text-white/75"
                            radius="full"
                            size="sm"
                            variant="flat"
                          >
                            技术支柱 0{pillar.id}
                          </Chip>
                        </div>

                        <h3 className="text-2xl font-bold text-white md:text-3xl">
                          {pillar.title}
                        </h3>
                        <p className="mt-4 text-base leading-8 text-white/65">
                          {pillar.description}
                        </p>

                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                          {pillar.bullets.map((bullet) => (
                            <div
                              key={bullet}
                              className="home-pill-card rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white/75"
                            >
                              {bullet}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={pillar.reverse ? "lg:order-1" : ""}>
                        <div className="home-media-frame relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
                          <Image
                            alt={pillar.title}
                            className="h-[280px] w-full object-cover md:h-[360px] lg:h-[420px]"
                            height={840}
                            loading="lazy"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            src={pillar.image}
                            width={1400}
                          />
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          ref={gallerySectionRef}
          className="home-section-shell w-full bg-[#050b16] px-4 py-20 md:py-28"
          id="gallery"
        >
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              description="画廊接口和瀑布流布局改成接近可视区时再请求、再挂载，避免首页一打开就为下方内容做布局计算。"
              eyebrow="Gallery"
              title="AI 创作画廊"
            />

            {galleryReady && (galleryLoading || galleryImages.length > 0) ? (
              <div className="home-reveal-block home-reveal-block--soft">
                <GalleryMasonryBlock
                  galleryImages={galleryImages}
                  galleryLoading={galleryLoading}
                />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {galleryPlaceholderHeights.map((heightClass, index) => (
                  <Card
                    key={`gallery-placeholder-${heightClass}-${index}`}
                    className={`${index >= 4 ? "hidden md:block" : ""} home-gallery-placeholder overflow-hidden border border-white/5 bg-white/[0.03]`}
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <CardBody className="p-0">
                      <div
                        className={`${heightClass} bg-[linear-gradient(135deg,rgba(56,189,248,0.08),rgba(99,102,241,0.08),rgba(255,255,255,0.03))]`}
                      />
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}

            <div className="mt-12 text-center">
              <Button
                as={NextLink}
                className="home-cta-secondary border-white/15 px-8 text-white/75 hover:bg-white/5"
                href="/gallery"
                prefetch={false}
                radius="full"
                size="lg"
                variant="bordered"
              >
                查看更多作品
              </Button>
            </div>
          </div>
        </section>

        <section
          className="home-section-shell border-y border-white/5 bg-[#030712] px-4 py-20 md:py-28"
          id="pricing"
        >
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              description="定价信息保持静态渲染，卡片结构更简单，减少不必要的装饰性渲染成本。"
              eyebrow="Pricing"
              title="选择适合你的方案"
            />

            <div className="mx-auto mt-12 grid gap-6 lg:grid-cols-3">
              {pricingPlans.map((plan, index) => {
                const Icon = pricingPlanIcons[plan.id] ?? Sparkles;
                const credits =
                  pricingPlanCredits[plan.id] ?? plan.features[0] ?? "";

                return (
                  <div
                    key={plan.id}
                    className="home-pricing-shell"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <Card
                      className={`home-surface-card border p-2 transition-all duration-300 ${
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
                          <h3
                            className={`text-2xl font-bold ${
                              plan.isPopular ? "text-white" : "text-white/70"
                            }`}
                          >
                            {plan.name}
                          </h3>
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
                              {credits}
                            </p>
                          </div>
                        </div>

                        <ul className="mt-8 space-y-3">
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
                                    : "text-cyan-300"
                                }`}
                              />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <Button
                          as={NextLink}
                          className={
                            plan.isPopular
                              ? "mt-8 h-14 w-full bg-gradient-to-r from-orange-500 to-purple-500 font-bold text-white shadow-xl shadow-orange-500/30 transition-all hover:shadow-2xl hover:shadow-orange-500/40"
                              : "mt-8 h-14 w-full border-white/10 font-semibold text-white/80 hover:border-white/20 hover:bg-white/5 hover:text-white"
                          }
                          href={plan.ctaHref}
                          prefetch={false}
                          radius="full"
                          size="lg"
                          variant={plan.isPopular ? "solid" : "bordered"}
                        >
                          立即购买
                        </Button>
                      </CardBody>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className="home-section-shell w-full bg-[#050b16] px-4 py-20 md:py-28"
          id="faq"
        >
          <div className="mx-auto max-w-4xl">
            <SectionHeading
              description="常见问题区域保持服务端输出，用户进入页面时不需要再等待动效或额外的客户端初始化。"
              eyebrow="FAQ"
              title="常见问题"
            />

            <Accordion
              itemClasses={{
                base: "mb-3 rounded-2xl border border-white/8 bg-white/[0.03] px-6 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.045] data-[open=true]:border-white/15",
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
          </div>
        </section>
      </div>
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
