import { useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import Masonry from "react-masonry-css";
import { motion, animate, useInView, useReducedMotion } from "framer-motion";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";

import DefaultLayout from "@/layouts/default";
import {
  Logo,
  SparklesIcon,
  PaletteIcon,
  LightningIcon,
  ExpandIcon,
  ImageIcon,
} from "@/components/icons";
import { getGalleryList, GalleryImageItem } from "@/api/gallery";

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

/** 第二屏场景对比轮播数据 */
interface CompareSlide {
  id: number;
  title: string;
  tag: string;
  description: string;
  detail: string;
  bullets: string[];
  beforeImage: string;
  afterImage: string;
  beforeLabel: string;
  afterLabel: string;
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

/** 第五屏定价数据 */
interface PricingPlan {
  id: number;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular: boolean;
  ctaText: string;
  ctaHref: string;
}

/** 第六屏 FAQ 数据 */
interface FaqItem {
  key: string;
  question: string;
  answer: string;
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

/* ============================
   静态数据
   ============================ */

/** 落地页导航数据 */
const landingNavItems = [
  { label: "能力展示", href: "#showcase" },
  { label: "技术支柱", href: "#tech" },
  { label: "创作画廊", href: "#gallery" },
  { label: "订阅价格", href: "#pricing" },
  { label: "常见问题", href: "#faq" },
];

/** 第二屏对比轮播数据，补充更饱满的文案 */
const compareSlides: CompareSlide[] = [
  {
    id: 1,
    title: "人像美化与商业肖像",
    tag: "Portrait Workflow",
    description:
      "Nano Banana 2 不只是简单磨皮，而是会理解肤质、轮廓、妆面和氛围光。它能在保留真实表情与人物辨识度的前提下，快速提升人像质感，让普通照片获得接近商业摄影棚的成片效果。",
    detail:
      "适合社媒封面、个人写真、品牌肖像和宣传海报。拖动中线后你会发现，AI 处理后并没有丢失原始神态，反而进一步强化了肤色层次、服装纹理与画面氛围。",
    bullets: [
      "保留人物神态与皮肤真实纹理",
      "统一商业级光影与高级色调",
      "适合写真封面、品牌 KV 与社媒内容",
    ],
    beforeImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=80",
    beforeLabel: "原始照片",
    afterLabel: "AI 精修后",
  },
  {
    id: 2,
    title: "电商主图与营销素材",
    tag: "E-commerce Asset",
    description:
      "从普通商品拍摄图到高转化率主图，Nano Banana 2 可以快速完成背景重塑、质感增强和场景包装。无论是新品上线、活动页投放还是社媒广告，你都能在极短时间内产出统一风格的营销素材。",
    detail:
      "相比传统后期流程，它更适合高频上新和批量投放场景。你可以先生成白底图，再延展成场景图、促销海报和细节展示图，整体产能会有明显提升。",
    bullets: [
      "支持白底图、场景图和广告图连续生产",
      "统一商品质感、光感与背景风格",
      "适合电商首页、详情页与投流素材",
    ],
    beforeImage:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    beforeLabel: "普通商品图",
    afterLabel: "营销成片",
  },
  {
    id: 3,
    title: "风景增强与氛围重建",
    tag: "Landscape Upgrade",
    description:
      "面对光线平淡、层次不足的原始风景照，Nano Banana 2 可以自动识别天空、地貌、植被和远近景关系，重建更有电影感的氛围光与空间层次，让作品更像真正完成调色与后期的摄影成片。",
    detail:
      "特别适合旅游内容、壁纸素材、品牌视觉和宣传页面。你可以保留原始构图，仅提升色彩与情绪，也可以继续叠加风格指令，让一张照片拥有完全不同的视觉表达。",
    bullets: [
      "增强天空层次与环境色彩细节",
      "提升画面纵深感与电影氛围",
      "适合旅游海报、品牌背景与壁纸素材",
    ],
    beforeImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
    beforeLabel: "原始风景",
    afterLabel: "氛围增强后",
  },
  {
    id: 4,
    title: "老照片修复与记忆重现",
    tag: "Restoration",
    description:
      "Nano Banana 2 可识别泛黄、模糊、划痕和局部缺失等问题，通过 AI 修复与智能补全恢复人物轮廓、服装细节和画面清晰度，让珍贵的家庭记忆与历史影像重新焕发可用价值。",
    detail:
      "在处理过程中，它会尽量保留年代质感，同时提升可读性与观感。对于需要展示、印刷或数字存档的老照片，这种能力能大幅降低人工修图成本。",
    bullets: [
      "修复模糊、划痕与泛黄老旧痕迹",
      "还原人物轮廓与服装面部细节",
      "适合纪念册、展览与数字化存档",
    ],
    beforeImage:
      "https://images.unsplash.com/photo-1504194104404-433180773017?auto=format&fit=crop&w=1200&q=80",
    afterImage:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=1200&q=80",
    beforeLabel: "旧照片",
    afterLabel: "修复后",
  },
];

/** 第三屏技术支柱数据，使用用户提供文案并做左右交替布局 */
const techPillars: TechPillar[] = [
  {
    id: 1,
    title: "99%+文字渲染准确率",
    description:
      "Nano Banana 2 是业界最精准的图内文字引擎。30+语言完美生成海报、产品标签和品牌视觉，多行排版完美无缺，无需手动修图。",
    bullets: [
      "30+语言 99%+ 准确率",
      "密集多行排版支持",
      "中日韩、阿拉伯文及特殊字符",
    ],
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1400&q=80",
    reverse: false,
    icon: <SparklesIcon size={20} />,
  },
  {
    id: 2,
    title: "跨图像身份一致性",
    description:
      "Nano Banana 2 的跨图像语义对齐架构，在不同场景、角度和光照下保持面部、服装和产品细节像素级一致。同时追踪 5 个角色，批量生成中保持 90%+ 一致性。",
    bullets: [
      "14 张参考图，5 个角色",
      "90%+ 批量一致性（大批量）",
      "98.7% 面部身份保持",
    ],
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=80",
    reverse: true,
    icon: <PaletteIcon size={20} />,
  },
  {
    id: 3,
    title: "多图智能融合",
    description:
      "上传最多 14 张参考图，Nano Banana 2 智能融合主体、风格和构图。轻松创建分镜、产品系列图和一致性角色序列。",
    bullets: [
      "支持最多 14 张参考图",
      "跨图像语义对齐",
      "分镜与序列化生成",
    ],
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    reverse: false,
    icon: <ExpandIcon size={20} />,
  },
  {
    id: 4,
    title: "原生 4K 生产流水线",
    description:
      "Nano Banana 2 直接以 4096×4096 分辨率生成，无放大伪影。内置 Canny、深度和蒙版控制，高效快速处理流程优化。",
    bullets: [
      "真 4K，无需后期处理",
      "内置 Canny / 深度 / 蒙版控制",
      "高效快速生成，批量最多 15 张",
    ],
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
    reverse: true,
    icon: <LightningIcon size={20} />,
  },
];

/** 第五屏定价数据 */
const pricingPlans: PricingPlan[] = [
  {
    id: 1,
    name: "免费版",
    price: "¥0",
    period: "永久",
    description: "适合初次体验 AI 图像生成",
    features: [
      "每日 5 次免费生成",
      "基础模型使用",
      "标准分辨率输出",
      "社区画廊浏览",
    ],
    isPopular: false,
    ctaText: "免费开始",
    ctaHref: "/createNew",
  },
  {
    id: 2,
    name: "专业版",
    price: "¥49",
    period: "/月",
    description: "适合创意工作者和设计师",
    features: [
      "1000 点数 / 月",
      "所有高级模型",
      "4K 超高清输出",
      "AI 图像增强",
      "AI 背景移除",
      "商业使用许可",
      "优先队列",
    ],
    isPopular: true,
    ctaText: "立即订阅",
    ctaHref: "/pricing",
  },
  {
    id: 3,
    name: "企业版",
    price: "¥199",
    period: "/月",
    description: "适合团队和企业用户",
    features: [
      "5000 点数 / 月",
      "所有专业版功能",
      "API 接口访问",
      "团队协作空间",
      "优先技术支持",
      "SLA 服务保障",
      "自定义模型训练",
    ],
    isPopular: false,
    ctaText: "联系销售",
    ctaHref: "/pricing",
  },
];

/** 第六屏 FAQ 数据 */
const faqItems: FaqItem[] = [
  {
    key: "1",
    question: "Nano Banana 支持哪些图像尺寸？",
    answer:
      "支持从 512×512 到 2048×2048 的多种标准尺寸，包括 1:1、4:3、16:9、9:16 等常见比例。专业版和企业版用户还可使用自定义尺寸。",
  },
  {
    key: "2",
    question: "生成的图片可以商用吗？",
    answer:
      "专业版和企业版用户享有完整的商业使用许可，生成的所有图片均可用于商业项目，包括但不限于广告、产品包装、网站设计和社交媒体内容。",
  },
  {
    key: "3",
    question: "文生图和图生图有什么区别？",
    answer:
      "文生图是通过文字描述从零开始生成全新图片；图生图则是在已有图片的基础上，根据文字提示进行风格转换、内容修改或增强处理。两者可以结合使用，先用文生图创建基础图像，再用图生图进行精细调整。",
  },
  {
    key: "4",
    question: "免费版有使用限制吗？",
    answer:
      "免费版每日可使用 5 次图像生成，支持基础模型和标准分辨率输出。每日额度在北京时间 0:00 重置。升级到专业版可获得 1000 点数/月的大容量额度。",
  },
  {
    key: "5",
    question: "如何提升生成图片的质量？",
    answer:
      "建议使用详细具体的提示词，包含主体描述、风格关键词、光影氛围和画面构图等信息。例如，'一只橘猫坐在窗台上，柔和的午后阳光，电影感色调，浅景深' 比 '猫' 能产出更好的效果。",
  },
  {
    key: "6",
    question: "支持批量生成吗？",
    answer:
      "企业版支持通过 API 进行批量生成，可以在一次请求中提交多个生成任务。我们还提供 SDK 和详细的 API 文档，方便集成到你的工作流程中。",
  },
];

/** 画廊瀑布流断点 */
const masonryBreakpoints: Record<string, number> = {
  default: 4,
  1280: 4,
  1024: 3,
  768: 2,
  640: 1,
};

/* ============================
   动画与工具函数
   ============================ */

/** 数字格式化 */
function formatStatValue(
  value: number,
  suffix: string,
  decimals: number = 0
): string {
  const displayValue =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();

  return `${displayValue}${suffix}`;
}

/** 通用滚动显隐组件，统一处理首页滚动动画 */
function Reveal({ children, className, delay = 0, amount = 0.2 }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
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

/** 价格功能列表对勾图标 */
function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-green-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M5 13l4 4L19 7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

/* ============================
   页面主组件
   ============================ */

export default function IndexNewPage() {
  const router = useRouter();

  /** 画廊数据状态 */
  const [galleryImages, setGalleryImages] = useState<GalleryImageItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);

  /** 加载画廊数据 */
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await getGalleryList(1, 12);

        if (res.code === 200 && res.data?.list) {
          setGalleryImages(res.data.list);
        }
      } catch (error) {
        console.error("画廊数据加载失败:", error);
      } finally {
        setGalleryLoading(false);
      }
    };

    fetchGallery();
  }, []);

  return (
    <DefaultLayout fullWidth>
      <div className="min-h-screen overflow-x-hidden bg-[#030712]">
        {/* ============================================
            顶部导航
            ============================================ */}
        <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="pointer-events-auto flex items-center justify-between rounded-[1.75rem] border border-white/10 bg-[#08111f]/80 px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl sm:px-5 lg:px-6">
              <NextLink
                className="flex items-center gap-3 transition-opacity hover:opacity-90"
                href="/indexNew"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20">
                  <Logo size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-wide text-white">
                    Nano Banana
                  </p>
                  <p className="text-xs text-white/40">AI Image Production</p>
                </div>
              </NextLink>

              <nav className="hidden items-center gap-1 rounded-full border border-white/6 bg-white/[0.03] p-1 lg:flex">
                {landingNavItems.map((item) => (
                  <a
                    key={item.href}
                    className="rounded-full px-4 py-2 text-sm text-white/65 transition-colors duration-200 hover:bg-white/6 hover:text-white"
                    href={item.href}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                <Button
                  as={NextLink}
                  className="hidden border-white/15 bg-white/[0.03] text-white/75 hover:bg-white/6 sm:flex"
                  href="/gallery"
                  radius="full"
                  size="sm"
                  variant="bordered"
                >
                  画廊
                </Button>
                <Button
                  as={NextLink}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 font-semibold text-white shadow-lg shadow-blue-500/20"
                  href="/createNew"
                  radius="full"
                  size="sm"
                >
                  立即创作
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* ============================================
            第一屏 - Hero 网站介绍
            ============================================ */}
        <section className="hero-new-bg relative flex min-h-screen items-center overflow-hidden px-4 pt-24 sm:px-6 sm:pt-28">
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
                输入一句描述，即刻生成高质量图片。支持文生图和图生图，
                让创意工作者、设计师和品牌团队以更低成本、更快速度完成从灵感探索到正式出图的完整流程。
              </p>

              <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  as={NextLink}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 px-8 text-base font-semibold text-white shadow-lg shadow-blue-500/25"
                  href="/createNew"
                  radius="full"
                  size="lg"
                >
                  开始创作
                </Button>
                <Button
                  className="border-white/20 px-8 text-base text-white/80 hover:bg-white/5"
                  onPress={() => {
                    document
                      .getElementById("gallery")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  radius="full"
                  size="lg"
                  variant="bordered"
                >
                  浏览画廊
                </Button>
              </div>
            </Reveal>

            {/* 第一屏数字滚动区域 */}
            <Reveal className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3" delay={0.15}>
              <StatCounter label="活跃用户" suffix="K+" value={10} />
              <StatCounter label="生成图片" suffix="K+" value={500} />
              <StatCounter decimals={1} label="服务可用率" suffix="%" value={99.9} />
            </Reveal>
          </div>
        </section>

        {/* ============================================
            第二屏 - 应用场景对比轮播
            ============================================ */}
        <section className="w-full bg-[#050b16] px-4 py-20 md:py-28" id="showcase">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading
                description="拖动滑块查看处理前后的差异。Nano Banana 不只是生成图片，而是把修图、重绘、增强与风格化整合成一条更高效的视觉生产链路。"
                eyebrow="Use Cases"
                title="看看 AI 能做什么"
              />
            </Reveal>

            <Reveal delay={0.08}>
              <Swiper
                autoplay={{ delay: 6500, disableOnInteraction: false }}
                loop
                modules={[Autoplay, Pagination]}
                pagination={{
                  clickable: true,
                  el: ".compare-pagination",
                }}
                simulateTouch={false}
                slidesPerView={1}
                spaceBetween={40}
                speed={850}
              >
                {compareSlides.map((slide) => (
                  <SwiperSlide key={slide.id}>
                    <Card className="overflow-hidden border border-white/8 bg-white/[0.03] shadow-2xl shadow-black/25">
                      <CardBody className="grid gap-10 p-5 md:p-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
                        {/* 左侧对比区域 */}
                        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10">
                          <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
                            {slide.beforeLabel}
                          </div>
                          <div className="pointer-events-none absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
                            {slide.afterLabel}
                          </div>
                          <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/12 bg-black/45 px-3 py-1 text-xs text-white/70 backdrop-blur-sm">
                            拖动中线对比效果
                          </div>

                          <ReactCompareSlider
                            itemOne={
                              <ReactCompareSliderImage
                                alt={`${slide.title} - 处理前`}
                                src={slide.beforeImage}
                                style={{ objectFit: "cover" }}
                              />
                            }
                            itemTwo={
                              <ReactCompareSliderImage
                                alt={`${slide.title} - 处理后`}
                                src={slide.afterImage}
                                style={{ objectFit: "cover" }}
                              />
                            }
                            position={50}
                            style={{
                              height: "100%",
                              minHeight: "320px",
                              maxHeight: "500px",
                            }}
                          />
                        </div>

                        {/* 右侧文字区域 */}
                        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                          <Chip
                            className="mb-4 border border-blue-500/30 bg-blue-500/10 text-xs text-blue-300"
                            radius="full"
                            variant="flat"
                          >
                            {slide.tag}
                          </Chip>

                          <h3 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
                            {slide.title}
                          </h3>

                          <p className="mb-4 text-base leading-8 text-white/62">
                            {slide.description}
                          </p>

                          <p className="mb-6 text-sm leading-7 text-white/40">
                            {slide.detail}
                          </p>

                          <div className="mb-6 grid w-full gap-3">
                            {slide.bullets.map((bullet) => (
                              <div
                                key={bullet}
                                className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/72"
                              >
                                {bullet}
                              </div>
                            ))}
                          </div>

                          <Button
                            as={NextLink}
                            className="border-white/15 text-white/75 hover:bg-white/5"
                            href="/createNew"
                            radius="full"
                            size="md"
                            variant="bordered"
                          >
                            立即体验
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </SwiperSlide>
                ))}
              </Swiper>
            </Reveal>

            <div className="compare-pagination" />
          </div>
        </section>

        {/* ============================================
            第三屏 - 四大技术支柱（与画廊互换位置）
            ============================================ */}
        <section className="w-full border-y border-white/5 bg-[#030712] px-4 py-20 md:py-28" id="tech">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading
                description="Nano Banana 2 攻克了 AI 图像生成领域最棘手的难题。以下是专业人士信赖它进行生产工作的原因。"
                eyebrow="Core Technology"
                title="Nano Banana 2 的四大技术支柱"
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
                          className={pillar.reverse ? "order-2 lg:order-2" : "order-2 lg:order-1"}
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
                          className={pillar.reverse ? "order-1 lg:order-1" : "order-1 lg:order-2"}
                        >
                          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
                            <img
                              alt={pillar.title}
                              className="h-[280px] w-full object-cover md:h-[360px] lg:h-[420px]"
                              loading="lazy"
                              src={pillar.image}
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
        <section className="w-full bg-[#050b16] px-4 py-20 md:py-28" id="gallery">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading
                description="探索由 Nano Banana 生成的真实作品，从商业视觉、角色设定到广告海报与产品展示，快速了解平台在不同场景中的输出能力。"
                eyebrow="Gallery"
                title="AI 创作画廊"
              />
            </Reveal>

            {galleryLoading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner color="primary" size="lg" />
              </div>
            ) : galleryImages.length > 0 ? (
              <Reveal delay={0.06}>
                <Masonry
                  breakpointCols={masonryBreakpoints}
                  className="new-masonry-grid"
                  columnClassName="new-masonry-grid_column"
                >
                  {galleryImages.map((image, index) => (
                    <motion.div
                      key={image.id}
                      className="group mb-4 cursor-pointer"
                      initial={{ opacity: 0, y: 24 }}
                      onClick={() => router.push("/gallery")}
                      transition={{ duration: 0.45, delay: Math.min(index * 0.03, 0.24) }}
                      viewport={{ once: true, amount: 0.2 }}
                      whileInView={{ opacity: 1, y: 0 }}
                    >
                      <Card className="overflow-hidden border border-white/5 bg-white/5 transition-all duration-300 hover:border-white/15 hover:shadow-xl">
                        <CardBody className="p-0">
                          <div className="relative overflow-hidden">
                            <img
                              alt={image.prompt || "AI 生成图片"}
                              className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                              src={image.cos_url}
                            />
                            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              <p className="line-clamp-3 text-xs leading-6 text-white/90">
                                {image.prompt}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </motion.div>
                  ))}
                </Masonry>
              </Reveal>
            ) : (
              <div className="py-20 text-center text-white/40">
                <ImageIcon size={48} />
                <p className="mt-4">暂无画廊数据</p>
              </div>
            )}

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
        <section className="w-full border-y border-white/5 bg-[#030712] px-4 py-20 md:py-28" id="pricing">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading
                description="灵活的定价方案，满足个人创作者、设计团队与企业级视觉生产的不同需求。"
                eyebrow="Pricing"
                title="选择适合你的方案"
              />
            </Reveal>

            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
              {pricingPlans.map((plan, index) => (
                <Reveal key={plan.id} delay={index * 0.06}>
                  <Card
                    className={`relative border bg-white/[0.03] p-2 ${
                      plan.isPopular
                        ? "pricing-popular-glow scale-[1.03] border-blue-500/40 md:scale-105"
                        : "border-white/8"
                    }`}
                  >
                    <CardHeader className="flex-col items-start gap-2 px-6 pb-0 pt-6">
                      {plan.isPopular ? (
                        <Chip
                          className="border border-blue-500/30 bg-blue-500/10 text-xs text-blue-300"
                          radius="full"
                          size="sm"
                          variant="flat"
                        >
                          最受欢迎
                        </Chip>
                      ) : null}
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <p className="text-sm leading-7 text-white/50">
                        {plan.description}
                      </p>
                    </CardHeader>

                    <CardBody className="px-6 py-6">
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-white">
                          {plan.price}
                        </span>
                        <span className="ml-1 text-base text-white/40">
                          {plan.period}
                        </span>
                      </div>

                      <Divider className="bg-white/8" />

                      <ul className="mt-6 space-y-3">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2.5 text-sm leading-7 text-white/70"
                          >
                            <CheckIcon />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardBody>

                    <CardFooter className="px-6 pb-6 pt-0">
                      <Button
                        as={NextLink}
                        className={
                          plan.isPopular
                            ? "w-full bg-gradient-to-r from-blue-500 to-purple-500 font-semibold text-white shadow-lg shadow-blue-500/25"
                            : "w-full border-white/15 font-semibold text-white/80 hover:bg-white/5"
                        }
                        fullWidth
                        href={plan.ctaHref}
                        radius="full"
                        size="lg"
                        variant={plan.isPopular ? "solid" : "bordered"}
                      >
                        {plan.ctaText}
                      </Button>
                    </CardFooter>
                  </Card>
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
    </DefaultLayout>
  );
}
