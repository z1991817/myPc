import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardBody } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";
import { Spinner } from "@heroui/spinner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { motion } from "framer-motion";
import Masonry from "react-masonry-css";
import { useRouter } from "next/router";

import DefaultLayout from "@/layouts/default";
import { getGalleryList, GalleryImageItem } from "@/api/gallery";
import { CopyIcon } from "@/components/icons";
import Footer from "@/components/Footer";
import TopNavbar from "@/components/TopNavbar";

/**
 * 图片卡片组件 Props
 */
interface ImageCardProps {
  image: GalleryImageItem;
  onPreview: (image: GalleryImageItem) => void;
}

/**
 * 图片卡片组件 - 支持懒加载和悬停放大效果
 */
const ImageCard: React.FC<ImageCardProps> = ({ image, onPreview }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "50px" },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="mb-4 cursor-pointer"
      onClick={() => onPreview(image)}
    >
      <Card className="overflow-hidden group">
        <CardBody className="p-0">
          <div className="relative aspect-[3/4] overflow-hidden">
            {/* 加载骨架屏 */}
            {!isLoaded && (
              <Skeleton className="absolute inset-0 w-full h-full" />
            )}

            {/* 图片 - 懒加载 */}
            {isVisible && (
              <img
                alt={image.prompt}
                className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
                  isLoaded ? "opacity-100" : "opacity-0"
                }`}
                src={image.cos_url}
                onLoad={() => setIsLoaded(true)}
              />
            )}
          </div>

          {/* 提示词信息 */}
          <div className="p-3">
            <p className="text-sm text-default-600 line-clamp-1">
              {image.prompt}
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

/**
 * 画廊页面主组件
 */
export default function GalleryPage() {
  const router = useRouter();
  const [images, setImages] = useState<GalleryImageItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImageItem | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const loadingRef = useRef(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // 瀑布流断点配置
  const breakpointColumns = {
    default: 4,
    1280: 4,
    1024: 3,
    768: 2,
    640: 1,
  };

  /**
   * 复制提示词到剪贴板
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 可以添加 toast 提示
      alert("提示词已复制到剪贴板");
    } catch (error) {
      console.error("复制失败:", error);
    }
  };

  /**
   * 打开预览
   */
  const handlePreview = (image: GalleryImageItem) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  /**
   * 关闭预览
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  /**
   * 制作同款
   */
  const handleCreateSimilar = () => {
    // 使用 sessionStorage 隐式传参
    if (selectedImage) {
      sessionStorage.setItem(
        "createImageParams",
        JSON.stringify({
          prompt: selectedImage.prompt,
          model: selectedImage.model,
          size: selectedImage.size,
          imageUrl: selectedImage.cos_url,
          generationType: selectedImage.generation_type,
        }),
      );
      router.push("/createNew");
    }
  };

  /**
   * 引用图片
   */
  const handleReferenceImage = () => {
    // 只传递图片 URL，切换到图生图 tab
    if (selectedImage) {
      sessionStorage.setItem(
        "createImageParams",
        JSON.stringify({
          imageUrl: selectedImage.cos_url,
          generationType: "image-to-image",
        }),
      );
      router.push("/createNew");
    }
  };

  /**
   * 加载画廊数据
   */
  const loadGalleryData = useCallback(async (pageNum: number) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const response = await getGalleryList(pageNum, 20);

      if (response.code === 200) {
        const { list, pagination } = response.data;

        setImages((prev) => (pageNum === 1 ? list : [...prev, ...list]));
        setHasMore(pagination.page < pagination.totalPages);
      }
    } catch (error) {
      console.error("加载画廊数据失败:", error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  /**
   * 滚动加载处理（带防抖）
   */
  const handleScroll = useCallback(() => {
    if (loading || !hasMore || loadingRef.current) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    // 距离底部 300px 时触发加载
    if (scrollTop + clientHeight >= scrollHeight - 300) {
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  /**
   * 节流函数
   */
  const throttle = (func: Function, delay: number) => {
    let lastCall = 0;

    return (...args: any[]) => {
      const now = Date.now();

      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  };

  // 初始化加载
  useEffect(() => {
    loadGalleryData(1);
  }, [loadGalleryData]);

  // 监听页码变化
  useEffect(() => {
    if (page > 1) {
      loadGalleryData(page);
    }
  }, [page, loadGalleryData]);

  // 监听滚动事件（节流）
  useEffect(() => {
    const throttledScroll = throttle(handleScroll, 300);

    window.addEventListener("scroll", throttledScroll);

    return () => {
      window.removeEventListener("scroll", throttledScroll);
    };
  }, [handleScroll]);

  return (
    <DefaultLayout fullWidth hideFooter hideNavbar>
      <div className="min-h-dvh bg-[#030712] text-white">
        <TopNavbar />
        <div className="px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pt-32">
          <div className="max-w-[1280px] mx-auto">
        {/* 文字区域 */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="tracking-tight inline font-semibold from-[#FF1CF7] to-[#b249f8] text-[clamp(1rem,10vw,2rem)] sm:text-[clamp(1rem,10vw,3rem)] lg:text-5xl bg-clip-text text-transparent bg-linear-to-b">
            AI 艺术图库
          </h1>
          <p className="text-lg text-default-600 max-w-3xl mx-auto">
            探索令人惊叹的 AI
            生成图像，並发掘其背后的提示词。获取灵感，创造您自己的杰作。
          </p>
        </motion.div>

        {/* 瀑布流图片区域 */}
        {images.length > 0 && (
          <Masonry
            breakpointCols={breakpointColumns}
            className="flex -ml-4 w-auto"
            columnClassName="pl-4 bg-clip-padding"
          >
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onPreview={handlePreview}
              />
            ))}
          </Masonry>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        )}

        {/* 没有更多数据提示 */}
        {!hasMore && images.length > 0 && (
          <div className="text-center py-8 text-default-500">
            沒有更多图片了
          </div>
        )}

        {/* 空状态 */}
        {!loading && images.length === 0 && (
          <div className="text-center py-16 text-default-500">暂无图片数据</div>
        )}

        {/* 滚动观察器 */}
        <div ref={observerRef} className="h-1" />
          </div>
        </div>
        <Footer />
      </div>

      {/* 图片预览 Modal */}
      <Modal
        isOpen={isModalOpen}
        scrollBehavior="inside"
        shouldBlockScroll={false}
        size="5xl"
        onClose={handleCloseModal}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                图片详情
              </ModalHeader>
              <ModalBody>
                {selectedImage && (
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* 左侧图片 */}
                    <div className="flex-1 flex items-center justify-center bg-default-100 rounded-lg overflow-hidden">
                      <img
                        alt={selectedImage.prompt}
                        className="max-w-full max-h-[600px] object-contain"
                        src={selectedImage.cos_url}
                      />
                    </div>

                    {/* 右侧详情 */}
                    <div className="w-full md:w-[350px] flex flex-col gap-4">
                      {/* 提示词 */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-default-700">
                            提示词
                          </h3>
                          <button
                            className="p-1.5 rounded-lg hover:bg-default-200 transition-colors"
                            onClick={() =>
                              copyToClipboard(selectedImage.prompt)
                            }
                          >
                            <CopyIcon className="text-default-600" size={18} />
                          </button>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto p-3 bg-default-100 rounded-lg">
                          <p className="text-sm text-default-600 whitespace-pre-wrap">
                            {selectedImage.prompt}
                          </p>
                        </div>
                      </div>

                      <Divider />

                      {/* 类型 */}
                      <div>
                        <h3 className="text-sm font-semibold mb-2 text-default-700">
                          类型
                        </h3>
                        <p className="text-sm text-default-600">
                          {selectedImage.generation_type === "text-to-image"
                            ? "文字生成图片"
                            : "图片生成图片"}
                        </p>
                      </div>

                      {/* 模型 */}
                      <div>
                        <h3 className="text-sm font-semibold mb-2 text-default-700">
                          模型
                        </h3>
                        <p className="text-sm text-default-600">
                          {selectedImage.model}
                        </p>
                      </div>

                      {/* 尺寸 */}
                      <div>
                        <h3 className="text-sm font-semibold mb-2 text-default-700">
                          尺寸
                        </h3>
                        <p className="text-sm text-default-600">
                          {selectedImage.size}
                        </p>
                      </div>

                      <Divider />

                      {/* 操作按钮 */}
                      <div className="flex flex-col gap-3">
                        <Button
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary shadow hover:bg-primary/90 px-4 py-2 w-full h-12 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-medium"
                          onPress={handleCreateSimilar}
                        >
                          制作同款
                        </Button>
                        <Button
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-default-200 bg-background shadow-sm hover:bg-accent hover:text-accent-foreground px-4 py-2 w-full h-12 font-medium"
                          onPress={handleReferenceImage}
                        >
                          引用图片
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  关闭
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </DefaultLayout>
  );
}
