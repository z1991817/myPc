export type TechPillarIconKey = "sparkles" | "palette" | "maximize2" | "zap";

export interface TechPillarData {
  id: number;
  title: string;
  description: string;
  bullets: string[];
  image: string;
  reverse: boolean;
  icon: TechPillarIconKey;
}

export interface PricingPlanData {
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

export interface FaqItemData {
  key: string;
  question: string;
  answer: string;
}

export const techPillarsData: TechPillarData[] = [
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
    icon: "sparkles",
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
    icon: "palette",
  },
  {
    id: 3,
    title: "多图智能融合",
    description:
      "上传最多 14 张参考图，Nano Banana 2 智能融合主体、风格和构图。轻松创建分镜、产品系列图和一致性角色序列。",
    bullets: ["支持最多 14 张参考图", "跨图像语义对齐", "分镜与序列化生成"],
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    reverse: false,
    icon: "maximize2",
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
    icon: "zap",
  },
];

export const pricingPlansData: PricingPlanData[] = [
  {
    id: 1,
    name: "尝鲜破冰包",
    price: "¥9.9",
    period: "",
    description: "一杯瑞幸的钱，告别找图烦恼",
    features: [
      "获得 1,000 积分",
      "约可生成 20 张 Banana2 顶级图像",
      "或 50 张基础图像",
      "无水印下载",
    ],
    isPopular: false,
    ctaText: "立即尝鲜",
    ctaHref: "/checkout",
  },
  {
    id: 2,
    name: "专业创作者包",
    price: "¥39.9",
    period: "",
    description: "单张神图低至 0.44 元，实现配图自由",
    features: [
      "获得 4,500 积分（额外赠送 500 分！）",
      "约可生成 90 张 Banana2 顶级图像",
      "优先排队出图特权",
      "无水印下载",
      "商业使用许可",
    ],
    isPopular: true,
    ctaText: "获取最高性价比",
    ctaHref: "/checkout",
  },
  {
    id: 3,
    name: "创世合伙人卡",
    price: "¥99",
    period: "",
    description: "一次投资，锁定早期红利",
    features: [
      "一次性获得 15,000 积分",
      "优先排队出图特权",
      "无水印下载",
      "商业使用许可",
      "优先技术支持",
    ],
    isPopular: false,
    ctaText: "立即购买",
    ctaHref: "/checkout",
  },
];

export const faqItemsData: FaqItemData[] = [
  {
    key: "1",
    question: "Nano Banana 支持哪些图像尺寸？",
    answer:
      "支持从 512×512 到 2048×2048 的多种标准尺寸，包括 1:1、4:3、16:9、9:16 等常见比例。",
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
    key: "5",
    question: "如何提升生成图片的质量？",
    answer:
      "建议使用详细具体的提示词，包含主体描述、风格关键词、光影氛围和画面构图等信息。例如，'一只橘猫坐在窗台上，柔和的午后阳光，电影感色调，浅景深' 比 '猫' 能产出更好的效果。",
  },
];
