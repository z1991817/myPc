import { useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { useDisclosure } from "@heroui/modal";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import DefaultLayout from "@/layouts/default";
import { useUserStore } from "@/store/useUserStore";
import { ImageIcon, PaletteIcon, SparklesIcon } from "@/components/icons";
import LoginModal from "@/components/LoginModal";

const navItems = [
  { label: "提示词", href: "#scenarios" },
  { label: "AI 视频", href: "#features" },
  { label: "价格", href: "#pricing" },
];

const scenarioSlides = [
  {
    title: "电商主图与详情页",
    description:
      "为商品生成高质感白底图、场景图和促销视觉，适合电商首页、详情页和活动落地页。",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
    tag: "E-commerce",
  },
  {
    title: "品牌海报与社媒内容",
    description:
      "快速产出带有强视觉冲击力的品牌 KV、广告海报和社媒封面，统一风格并提高出图效率。",
    image:
      "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=1200&q=80",
    tag: "Marketing",
  },
  {
    title: "角色设定与概念设计",
    description:
      "适合角色一致性探索、IP 概念设计、服装风格变化和多版本方向提案。",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
    tag: "Character",
  },
  {
    title: "创意短片分镜参考",
    description:
      "先用静帧建立场景、镜头语言和灯光氛围，再衔接到视频生成工作流。",
    image:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
    tag: "Storyboard",
  },
];

const featureCards = [
  {
    title: "深色产品质感",
    text: "整体视觉跟随参考站的暗黑主题，强调霓虹渐变、玻璃面板和高对比排版。",
  },
  {
    title: "文字驱动生成",
    text: "输入一句描述即可产出可用视觉，不需要先理解复杂参数面板。",
  },
  {
    title: "图像与视频双入口",
    text: "首页先承接图像生成，再自然过渡到视频与扩展功能入口。",
  },
  {
    title: "适合营销转化",
    text: "从首屏到场景轮播、定价和 FAQ，结构都更像真实产品落地页。",
  },
];

const pricingItems = [
  "1000 点数 / 月",
  "每月最多 100 张图像",
  "支持 AI 图像增强",
  "支持 AI 图像背景移除",
  "商业使用许可证",
];

const faqItems = [
  {
    q: "第二屏为什么改成应用场景轮播？",
    a: "参考站第二屏就是用场景化内容承接用户理解，比继续堆功能卡更像成熟的产品首页。",
  },
  {
    q: "这次轮播和之前有什么不同？",
    a: "现在改成了基于 Swiper 的轮播，保留了平滑过渡、自动播放和三卡布局，同时避免了初始化状态不稳定的问题。",
  },
  {
    q: "首页还能继续扩展吗？",
    a: "可以，首屏、场景、生成器、价格和 FAQ 已经是完整结构，后面继续补登录、案例库和生成页即可。",
  },
];

function ArrowRight() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 12h14m-7-7 7 7-7 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function Spark() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function IndexPage() {
  const router = useRouter();
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeScenario, setActiveScenario] = useState(0);
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  // 等待客户端水合完成，避免 SSR 不匹配
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  // 登录弹窗控制
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure();
  const heroAnimation = useScrollAnimation(0.15);
  const scenarioAnimation = useScrollAnimation(0.12);
  const featuresAnimation = useScrollAnimation(0.12);
  const pricingAnimation = useScrollAnimation(0.12);
  const faqAnimation = useScrollAnimation(0.12);
  const footerAnimation = useScrollAnimation(0.08);
  const displayName =
    hydrated ? (user?.nickname || user?.name || user?.username || user?.email || null) : null;

  return (
    <DefaultLayout fullWidth hideFooter hideNavbar>
      <div className="min-h-screen bg-[#030712] text-white">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030712]/75 px-6 py-3 backdrop-blur-md">
          <nav className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-8">
              <NextLink className="flex items-center gap-2" href="/">
                <span className="bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] bg-clip-text text-xl font-semibold text-transparent">
                  ArtImgPro
                </span>
              </NextLink>

              <div className="hidden items-center gap-2 text-sm text-white/70 md:flex">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    className="rounded-xl px-4 py-2 transition hover:bg-white/10 hover:text-white"
                    href={item.href}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <button
                className="rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm text-white/80"
                type="button"
              >
                简体中文
              </button>
              {displayName ? (
                <Dropdown shouldBlockScroll={false} placement="bottom-end">
                  <DropdownTrigger>
                    <div className="cursor-pointer rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-white/10">
                      {displayName}
                    </div>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="用户菜单"
                    className="w-56"
                    itemClasses={{ base: "gap-2" }}
                  >
                    {/* 用户信息头部 */}
                    <DropdownItem key="profile-info" isReadOnly className="cursor-default opacity-100">
                      <div className="flex items-center gap-2 pb-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-xs font-bold text-white">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-medium leading-none text-foreground">{displayName}</p>
                          {user?.email && (
                            <p className="text-xs leading-none text-foreground/50">{user.email}</p>
                          )}
                        </div>
                      </div>
                    </DropdownItem>
                    <DropdownItem key="divider" isReadOnly className="h-px bg-divider p-0 opacity-100" />
                    <DropdownItem
                      key="gallery"
                      className="py-3"
                      startContent={<ImageIcon className="h-4 w-4" />}
                      onPress={() => router.push("/my-creations")}
                    >
                      我的创作
                    </DropdownItem>
                    <DropdownItem
                      key="logout"
                      className="py-3 text-danger"
                      color="danger"
                      startContent={
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      }
                      onPress={() => {
                        clearUser();
                        router.push("/login");
                      }}
                    >
                      退出登录
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              ) : (
                <button
                  className="rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-4 py-2 text-sm font-medium shadow-lg"
                  type="button"
                  onClick={onLoginOpen}
                >
                  登录
                </button>
              )}
            </div>
          </nav>
        </header>

        <main className="flex flex-col items-center">
          <section
            ref={heroAnimation.ref}
            className={`hero-animated-gradient relative w-full overflow-hidden px-4 py-16 text-gray-200 md:py-28 2xl:py-40 ${heroAnimation.isVisible ? "animate-fade-in-scale" : "scroll-animate"}`}
          >
            <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.18),transparent_34%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.22),transparent_28%)] opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,rgba(244,114,182,0.16),transparent_24%)] opacity-80" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(3,7,18,0.04),rgba(3,7,18,0.58))]" />

            <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center">
              <div className="group relative mb-8">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#7c3aed] via-[#f472b6] to-[#a855f7] opacity-60 blur-lg" />
                <div className="relative flex items-center gap-3 rounded-full border border-white/10 bg-black/45 px-6 py-3 text-sm text-white/90 backdrop-blur-md">
                  <Spark />
                  革命性的 AI 图片生成与编辑
                </div>
              </div>

              <h1 className="max-w-5xl text-center text-5xl font-semibold tracking-tight text-white md:text-7xl">
                使用简单的文字命令
                <span className="mt-2 block bg-gradient-to-r from-white via-[#d8b4fe] to-[#a855f7] bg-clip-text text-transparent">
                  转换你的图片
                </span>
              </h1>

              <p className="mt-8 max-w-3xl text-center text-lg leading-8 text-white/70 md:text-xl">
                体验更像参考站的暗黑产品官网结构。首屏只负责建立品牌感，第二屏直接切入应用场景。
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <NextLink
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-black transition hover:-translate-y-1"
                  href="/createNew"
                >
                  立即开始
                  <SparklesIcon className="h-4 w-4" />
                </NextLink>
                <a
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-base font-medium text-white transition hover:-translate-y-1 hover:bg-white/10"
                  href="#scenarios"
                >
                  画廊展示
                  <PaletteIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
          </section>

          <section
            ref={scenarioAnimation.ref}
            className={`w-full border-b border-white/10 bg-[#030712] px-4 py-20 ${scenarioAnimation.isVisible ? "animate-fade-in-up" : "scroll-animate"}`}
            id="scenarios"
          >
            <div className="mx-auto max-w-7xl">
              <div
                className={scenarioAnimation.isVisible ? "animate-fade-in-left" : "scroll-animate"}
              >
                <div className="max-w-3xl">
                  <p className="text-sm uppercase tracking-[0.35em] text-[#7c3aed]">
                    Use Cases
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold md:text-5xl">
                    应用场景
                  </h2>
                  <p className="mt-5 text-lg leading-8 text-white/65">
                    参考目标站的表达方式，用场景化轮播承接用户理解，而不是继续堆静态功能模块。
                  </p>
                </div>
              </div>

              <div
                className={`mt-12 ${scenarioAnimation.isVisible ? "animate-fade-in-right delay-200" : "scroll-animate"}`}
              >
                <div className="scenario-swiper-shell">
                  <button
                    aria-label="Previous scenario"
                    className="scenario-swiper__nav scenario-swiper__nav--prev"
                    onClick={() => swiperRef.current?.slidePrev()}
                    type="button"
                  >
                    <ArrowRight />
                  </button>

                  <Swiper
                    autoplay={{ delay: 3200, disableOnInteraction: false }}
                    centeredSlides
                    className="scenario-swiper"
                    initialSlide={0}
                    modules={[Autoplay]}
                    observeParents
                    observer
                    onSlideChange={(swiper) => setActiveScenario(swiper.activeIndex)}
                    onSwiper={(swiper) => {
                      swiperRef.current = swiper;
                      setActiveScenario(swiper.activeIndex);
                    }}
                    rewind
                    slidesPerView="auto"
                    spaceBetween={0}
                    speed={700}
                    watchSlidesProgress
                  >
                    {scenarioSlides.map((slide, index) => (
                      <SwiperSlide key={`${slide.title}-${index}`}>
                        <article className="scenario-card">
                          <div className="relative">
                            <img
                              alt={slide.title}
                              className="h-[22rem] w-full object-cover md:h-[28rem]"
                              loading="eager"
                              src={slide.image}
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.72))]" />
                            <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-white/80 backdrop-blur-md">
                              {slide.tag}
                            </div>
                          </div>

                          <div className="p-6 md:p-8">
                            <h3 className="text-2xl font-semibold text-white">{slide.title}</h3>
                            <p className="mt-4 text-base leading-8 text-white/65">
                              {slide.description}
                            </p>
                          </div>
                        </article>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  <button
                    aria-label="Next scenario"
                    className="scenario-swiper__nav scenario-swiper__nav--next"
                    onClick={() => swiperRef.current?.slideNext()}
                    type="button"
                  >
                    <ArrowRight />
                  </button>
                </div>

                <div className="scenario-swiper__pagination">
                  {scenarioSlides.map((slide, index) => (
                    <button
                      key={slide.title}
                      aria-label={`Go to scenario ${index + 1}`}
                      className={`scenario-swiper__dot${index === activeScenario ? " is-active" : ""}`}
                      onClick={() => swiperRef.current?.slideTo(index)}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            ref={featuresAnimation.ref}
            className={`w-full bg-[#050b16] px-4 py-20 ${featuresAnimation.isVisible ? "animate-fade-in-up" : "scroll-animate"}`}
            id="features"
          >
            <div className="mx-auto max-w-7xl">
              <div
                className={featuresAnimation.isVisible ? "animate-fade-in-left" : "scroll-animate"}
              >
                <div className="max-w-3xl">
                  <p className="text-sm uppercase tracking-[0.35em] text-[#7c3aed]">
                    Features
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold md:text-5xl">
                    暗黑霓虹风格的 AI 产品首页
                  </h2>
                  <p className="mt-5 text-lg leading-8 text-white/65">
                    这一版不再沿用上一版的白底金色结构，而是切到更接近参考站的深色产品视觉。
                  </p>
                </div>
              </div>

              <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {featureCards.map((item) => (
                  <article
                    key={item.title}
                    className={`rounded-[2rem] border border-white/10 bg-white/5 p-7 backdrop-blur-md ${featuresAnimation.isVisible ? "animate-fade-in-up delay-200" : "scroll-animate"}`}
                  >
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white">
                      <Spark />
                    </div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="mt-4 leading-7 text-white/65">{item.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section
            ref={pricingAnimation.ref}
            className={`w-full border-y border-white/10 bg-[#030712] px-4 py-20 ${pricingAnimation.isVisible ? "animate-fade-in-up" : "scroll-animate"}`}
            id="pricing"
          >
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div className={pricingAnimation.isVisible ? "animate-fade-in-left" : "scroll-animate"}>
                <p className="text-sm uppercase tracking-[0.35em] text-[#7c3aed]">
                  Pricing
                </p>
                <h2 className="mt-4 text-3xl font-semibold md:text-5xl">
                  深色定价区也切到同一套产品语气
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">
                  用更明确的套餐卡和商业授权描述，把首页从展示页拉成真正可承接转化的产品首页。
                </p>
              </div>

              <div
                className={`rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(124,58,237,0.22),rgba(19,255,170,0.12),rgba(255,255,255,0.04))] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] ${pricingAnimation.isVisible ? "animate-fade-in-right delay-200" : "scroll-animate"}`}
              >
                <div className="text-sm uppercase tracking-[0.3em] text-[#7c3aed]">
                  基础方案
                </div>
                <div className="mt-4 text-5xl font-semibold">$7.49</div>
                <p className="mt-3 text-white/65">
                  适合爱好者和初学者，保留参考站那种高亮价格卡的暗色观感。
                </p>

                <div className="mt-8 flex flex-col gap-3 text-sm text-white/80">
                  {pricingItems.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-white/8 bg-black/20 px-4 py-3"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <NextLink
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 font-semibold text-black transition hover:-translate-y-1"
                    href="/createNew"
                  >
                    立即订阅
                    <ArrowRight />
                  </NextLink>
                  <NextLink
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-4 font-medium text-white transition hover:-translate-y-1 hover:bg-white/10"
                    href="/pricing"
                  >
                    查看价格
                    <ArrowRight />
                  </NextLink>
                </div>
              </div>
            </div>
          </section>

          <section
            ref={faqAnimation.ref}
            className={`w-full bg-[#050b16] px-4 py-20 ${faqAnimation.isVisible ? "animate-fade-in-up" : "scroll-animate"}`}
            id="prompts"
          >
            <div className="mx-auto max-w-7xl">
              <div className={faqAnimation.isVisible ? "animate-fade-in-left" : "scroll-animate"}>
                <div className="max-w-3xl">
                  <p className="text-sm uppercase tracking-[0.35em] text-[#7c3aed]">FAQ</p>
                  <h2 className="mt-4 text-3xl font-semibold md:text-5xl">常见问题</h2>
                </div>
              </div>
              <div className="mt-10 grid gap-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className={`rounded-[1.6rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md ${faqAnimation.isVisible ? "animate-fade-in-up delay-200" : "scroll-animate"}`}
                  >
                    <summary className="cursor-pointer list-none text-lg font-semibold">
                      {item.q}
                    </summary>
                    <p className="mt-4 max-w-4xl leading-8 text-white/65">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer
          ref={footerAnimation.ref}
          className={`border-t border-white/10 bg-[#030712] px-4 py-14 ${footerAnimation.isVisible ? "animate-fade-in-up" : "scroll-animate"}`}
        >
          <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] bg-clip-text text-2xl font-semibold text-transparent">
                ArtImgPro
              </div>
              <p className="mt-4 max-w-xs text-sm leading-7 text-white/60">
                暗黑霓虹风格的 AI 图片生成首页，第二屏已切为应用场景插件轮播。
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">产品</h3>
              <div className="space-y-3 text-sm text-white/60">
                <a className="block transition hover:text-white" href="#features">
                  AI 视频
                </a>
                <a className="block transition hover:text-white" href="#pricing">
                  价格
                </a>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">导航</h3>
              <div className="space-y-3 text-sm text-white/60">
                <a className="block transition hover:text-white" href="#scenarios">
                  应用场景
                </a>
                <a className="block transition hover:text-white" href="/about">
                  联系我们
                </a>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">账户</h3>
              <div className="space-y-3 text-sm text-white/60">
                <button className="block transition hover:text-white" type="button" onClick={onLoginOpen}>
                  登录
                </button>
                <a className="block transition hover:text-white" href="/pricing">
                  订阅
                </a>
                <a className="block transition hover:text-white" href="/createNew">
                  开始生成
                </a>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-8 text-center text-sm text-white/45">
            © 2026 ArtImgPro. All rights reserved.
          </div>
        </footer>
      </div>

      {/* 登录弹窗 */}
      <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />
    </DefaultLayout>
  );
}
