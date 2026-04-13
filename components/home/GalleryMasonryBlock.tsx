import type { GalleryImageItem } from "@/api/gallery";

import Image from "next/image";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Masonry from "react-masonry-css";
import { Card, CardBody } from "@heroui/card";
import { Image as ImageLucide } from "lucide-react";

interface GalleryMasonryBlockProps {
  galleryLoading: boolean;
  galleryImages: GalleryImageItem[];
}

const masonryBreakpoints: Record<string, number> = {
  default: 4,
  1280: 4,
  1024: 3,
  768: 2,
  640: 1,
};

const mobileGalleryPreviewCount = 4;

const gallerySkeletonHeights = [
  "h-[280px]",
  "h-[360px]",
  "h-[320px]",
  "h-[420px]",
  "h-[300px]",
  "h-[380px]",
  "h-[340px]",
  "h-[400px]",
];

export default function GalleryMasonryBlock({
  galleryLoading,
  galleryImages,
}: GalleryMasonryBlockProps) {
  const router = useRouter();

  if (galleryLoading) {
    return (
      <Masonry
        breakpointCols={masonryBreakpoints}
        className="new-masonry-grid"
        columnClassName="new-masonry-grid_column"
      >
        {gallerySkeletonHeights.map((heightClass, index) => (
          <div
            key={`gallery-skeleton-${index}`}
            className={`${index >= mobileGalleryPreviewCount ? "hidden md:block " : ""}mb-4`}
          >
            <Card className="overflow-hidden border border-white/5 bg-white/5">
              <CardBody className="p-0">
                <div
                  className={`relative ${heightClass} overflow-hidden bg-white/[0.03]`}
                >
                  <div className="absolute inset-0 animate-pulse bg-[linear-gradient(135deg,rgba(59,130,246,0.12),rgba(168,85,247,0.12),rgba(255,255,255,0.04))]" />
                </div>
                <div className="space-y-2 p-4">
                  <div className="h-3 w-5/6 animate-pulse rounded-full bg-white/10" />
                  <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/6" />
                </div>
              </CardBody>
            </Card>
          </div>
        ))}
      </Masonry>
    );
  }

  if (galleryImages.length > 0) {
    return (
      <Masonry
        breakpointCols={masonryBreakpoints}
        className="new-masonry-grid"
        columnClassName="new-masonry-grid_column"
      >
        {galleryImages.map((image, index) => (
          <motion.div
            key={image.id}
            className={`${index >= mobileGalleryPreviewCount ? "hidden md:block " : ""}group mb-4 cursor-pointer`}
            initial={{ opacity: 0, y: 24 }}
            transition={{
              duration: 0.45,
              delay: Math.min(index * 0.03, 0.24),
            }}
            viewport={{ once: true, amount: 0.2 }}
            whileInView={{ opacity: 1, y: 0 }}
            onClick={() => router.push("/gallery")}
          >
            <Card className="overflow-hidden border border-white/5 bg-white/5 transition-all duration-300 hover:border-white/15 hover:shadow-xl">
              <CardBody className="p-0">
                <div className="relative overflow-hidden">
                  {/*
                    首页画廊列表使用预览图优先，提升首屏加载速度；
                    若后端未返回预览图，则回退 cos_url。
                  */}
                  <Image
                    unoptimized
                    alt={image.prompt || "AI 生成图片"}
                    className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    height={image.height || 1024}
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    src={image.preview_url || image.previewUrl || image.cos_url}
                    width={image.width || 1024}
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
    );
  }

  return (
    <div className="py-20 text-center text-white/40">
      <ImageLucide className="mx-auto" size={48} />
      <p className="mt-4">暂无画廊数据</p>
    </div>
  );
}
