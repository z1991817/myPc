import NextLink from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useCallback, useState } from "react";

interface CompareSlideItem {
  id: number;
  title: string;
  tag: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  beforeLabel: string;
  afterLabel: string;
}

const compareSlides: CompareSlideItem[] = [
  {
    id: 1,
    title: "疯狂动物城自拍",
    tag: "Portrait Workflow",
    description:
      "创作一张超逼真的自拍照片。请使用上传的图片作为人物参考——请勿修改、更改或调整上传图片中人物的任何面部特征、发型、服装或配饰。将《疯狂动物城》中的朱迪·霍普斯（迪士尼角色）添加到真人旁边。场景：一间昏暗拥挤的电影院。背景中巨大的银幕正在播放《疯狂动物城》的片段。采用电影灯光，营造温暖的氛围光。构图：自拍角度。图片 1 中的真人（请完全保留所有原始特征）正在与朱迪·霍普斯一起自拍。[在此描述姿势/动作]。两人都清晰对焦。采用超高清 8K 画质，超逼真的摄影风格，自然光与屏幕光晕混合，浅景深。重要提示：人物必须与上传的参考图片完全一致——发型、服装、配饰或面部细节均不得更改。唯一添加的元素应该是自然融入场景的《疯狂动物城》角色。",
    beforeImage:
      "https://mycloudzcq-1300106439.cos.ap-singapore.myqcloud.com/home/input1.jpg",
    afterImage:
      "https://mycloudzcq-1300106439.cos.ap-singapore.myqcloud.com/home/out1.jfif",
    beforeLabel: "原始照片",
    afterLabel: "创作后",
  },
  {
    id: 3,
    title: "风景增强与氛围重建",
    tag: "Landscape Upgrade",
    description:
      "面对光线平淡、层次不足的原始风景照，Nano Banana 2 可以自动识别天空、地貌、植被和远近景关系，重建更有电影感的氛围光与空间层次，让作品更像真正完成调色与后期的摄影成片。",
    beforeImage:
      "https://mycloudzcq-1300106439.cos.ap-singapore.myqcloud.com/home/input2.png",
    afterImage:
      "https://mycloudzcq-1300106439.cos.ap-singapore.myqcloud.com/home/out2.jfif",
    beforeLabel: "原始风景",
    afterLabel: "氛围增强后",
  },
  {
    id: 4,
    title: "老照片修复与记忆重现",
    tag: "Restoration",
    description:
      "Nano Banana 2 可识别泛黄、模糊、划痕和局部缺失等问题，通过 AI 修复与智能补全恢复人物轮廓、服装细节和画面清晰度，让珍贵的家庭记忆与历史影像重新焕发可用价值。",
    beforeImage:
      "https://mycloudzcq-1300106439.cos.ap-singapore.myqcloud.com/home/input3.webp",
    afterImage:
      "https://mycloudzcq-1300106439.cos.ap-singapore.myqcloud.com/home/out3.webp",
    beforeLabel: "旧照片",
    afterLabel: "修复后",
  },
];

export default function ShowcaseSwiperBlock() {
  const [loadedSlideIds, setLoadedSlideIds] = useState<Set<number>>(
    () => new Set([compareSlides[0]?.id]),
  );

  const markSlideAsLoaded = useCallback((index: number) => {
    const targetSlideId = compareSlides[index]?.id;

    if (!targetSlideId) {
      return;
    }

    setLoadedSlideIds((prev) => {
      if (prev.has(targetSlideId)) {
        return prev;
      }

      const next = new Set(prev).add(targetSlideId);

      return next;
    });
  }, []);

  return (
    <>
      <Swiper
        loop
        autoplay={{ delay: 886500, disableOnInteraction: false }}
        modules={[Autoplay, Pagination]}
        pagination={{
          clickable: true,
          el: ".compare-pagination",
        }}
        slidesPerView={1}
        spaceBetween={40}
        speed={850}
        onSlideChange={(swiper) => {
          markSlideAsLoaded(swiper.realIndex);
        }}
      >
        {compareSlides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <Card className="overflow-hidden border border-white/8 bg-white/[0.03] shadow-2xl shadow-black/25">
              <CardBody className="p-5 md:p-8">
                <div className="grid gap-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0a1324]">
                      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
                        {slide.beforeLabel}
                      </div>
                      {loadedSlideIds.has(slide.id) ? (
                        <Image
                          alt={`${slide.title} - 处理前`}
                          className="h-full w-full object-contain max-h-[400px] transition-opacity duration-300 opacity-100 md:max-h-[500px]"
                          decoding="async"
                          fetchPriority={index === 0 ? "high" : "auto"}
                          height={900}
                          loading={index === 0 ? "eager" : "lazy"}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          src={slide.beforeImage}
                          width={1400}
                        />
                      ) : (
                        <div className="h-[400px] w-full bg-gradient-to-br from-white/5 via-white/[0.03] to-transparent md:h-[500px]" />
                      )}
                    </div>

                    <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0a1324]">
                      <div className="pointer-events-none absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
                        {slide.afterLabel}
                      </div>
                      {loadedSlideIds.has(slide.id) ? (
                        <Image
                          alt={`${slide.title} - 处理后`}
                          className="h-full w-full object-contain max-h-[400px] transition-opacity duration-300 opacity-100 md:max-h-[500px]"
                          decoding="async"
                          fetchPriority={index === 0 ? "high" : "auto"}
                          height={900}
                          loading={index === 0 ? "eager" : "lazy"}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          src={slide.afterImage}
                          width={1400}
                        />
                      ) : (
                        <div className="h-[400px] w-full bg-gradient-to-br from-white/5 via-white/[0.03] to-transparent md:h-[500px]" />
                      )}
                    </div>
                  </div>

                  <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
                    <Chip
                      className="mb-4 border border-blue-500/30 bg-blue-500/10 text-xs text-blue-300"
                      radius="full"
                      variant="flat"
                    >
                      {slide.tag}
                    </Chip>

                    <h3 className="mb-4 line-clamp-1 text-2xl font-bold text-white sm:text-3xl">
                      {slide.title}
                    </h3>

                    <p className="mb-4 line-clamp-2 text-base leading-8 text-white/62">
                      {slide.description}
                    </p>
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
                </div>
              </CardBody>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="compare-pagination" />
    </>
  );
}
