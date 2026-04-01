import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardBody } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import { Button } from "@heroui/button";
import { useRouter } from "next/router";

import DefaultLayout from "@/layouts/default";
import {
  getMyCreations,
  deleteCreation,
  MyCreationItem,
} from "@/api/my-creations";
import {
  CopyIcon,
  DownloadIcon,
  EditIcon,
  DeleteIcon,
} from "@/components/icons";
import Footer from "@/components/Footer";
import TopNavbar from "@/components/TopNavbar";
import { useUserStore } from "@/store/useUserStore";

/** 按钮通用样式 */
const btnClass =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs";

/**
 * 创作卡片 Props
 */
interface CreationCardProps {
  item: MyCreationItem;
  onDelete: (id: number) => void;
}

/**
 * 创作卡片组件 - 支持懒加载和悬停放大效果
 */
const CreationCard: React.FC<CreationCardProps> = ({ item, onDelete }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  /* 懒加载：IntersectionObserver */
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

  /** 格式化日期 */
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  /** 生成类型中文映射 */
  const typeLabel =
    item.generation_type === "text-to-image" ? "文生图" : "图生图";

  /** 复制提示词 - 防止重复点击 */
  const handleCopy = async () => {
    if (isCopying) return;
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(item.prompt);
      addToast({ title: "复制成功", color: "success" });
    } catch {
      addToast({ title: "复制失败", color: "danger" });
    } finally {
      setTimeout(() => setIsCopying(false), 1000);
    }
  };

  /** 下载图片 - 节流防抖防止重复点击 */
  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const res = await fetch(item.cos_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `creation-${item.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast({ title: "下载成功", color: "success" });
    } catch {
      addToast({ title: "下载失败", color: "danger" });
    } finally {
      setTimeout(() => setIsDownloading(false), 2000);
    }
  };

  /** 继续编辑 - 与 gallery 制作同款逻辑一致，使用 sessionStorage 隐式传参 */
  const handleEdit = () => {
    sessionStorage.setItem(
      "createImageParams",
      JSON.stringify({
        prompt: item.prompt,
        model: item.model,
        size: item.size,
        imageUrl: item.cos_url,
        generationType: item.generation_type,
      }),
    );
    router.push("/createNew");
  };

  /** 删除 - 弹出确认框 */
  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  /** 确认删除 */
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCreation(item.id);
      onDelete(item.id);
      addToast({ title: "删除成功", color: "success" });
    } catch {
      addToast({ title: "删除失败", color: "danger" });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div ref={cardRef}>
      <Card className="overflow-hidden">
        <CardBody className="p-0 overflow-hidden">
          {/* 图片区域 438x438 */}
          <div className="relative aspect-square w-full overflow-hidden">
            {!isLoaded && (
              <Skeleton className="absolute inset-0 w-full h-full" />
            )}
            {isVisible && (
              <img
                alt={item.prompt}
                className={`w-full h-full object-cover transition-transform duration-300 hover:scale-110 ${
                  isLoaded ? "opacity-100" : "opacity-0"
                }`}
                src={item.cos_url}
                onLoad={() => setIsLoaded(true)}
              />
            )}
          </div>

          {/* 卡片信息区域 */}
          <div className="p-4 space-y-3">
            {/* 时间 */}
            <p className="text-sm text-default-500">
              {formatDate(item.created_at)}
            </p>

            {/* 模型名称 | 类型 | 尺寸 */}
            <div className="flex items-center gap-2 text-sm text-default-600">
              <span>{item.model}</span>
              <span>·</span>
              <span>{typeLabel}</span>
              <span>·</span>
              <span>{item.size}</span>
            </div>

            {/* 提示词 - 单行溢出省略 */}
            <p
              className="text-sm text-default-400 line-clamp-1"
              title={item.prompt}
            >
              {item.prompt}
            </p>

            {/* 按钮区域 2x2 */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                className={`${btnClass} cursor-pointer active:scale-95 transition-transform`}
                disabled={isCopying}
                onClick={handleCopy}
              >
                <CopyIcon size={16} />
                {isCopying ? "已复制" : "复制提示"}
              </button>
              <button
                className={`${btnClass} cursor-pointer active:scale-95 transition-transform`}
                disabled={isDownloading}
                onClick={handleDownload}
              >
                <DownloadIcon size={16} />
                {isDownloading ? "下载中..." : "下载"}
              </button>
              <button
                className={`${btnClass} cursor-pointer active:scale-95 transition-transform`}
                onClick={handleEdit}
              >
                <EditIcon size={16} />
                继续编辑
              </button>
              <button
                className={`${btnClass} cursor-pointer active:scale-95 transition-transform`}
                onClick={handleDelete}
              >
                <DeleteIcon size={16} />
                删除
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 删除确认弹窗 - 自定义覆盖层，避免 Modal 锁定滚动导致页面跳顶 */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-xl bg-content1 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">确认删除</h3>
            <p className="mt-3 text-sm text-default-600">
              确定要删除这条创作记录吗？此操作不可撤销。
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="light"
                onPress={() => setIsDeleteModalOpen(false)}
              >
                取消
              </Button>
              <Button
                color="danger"
                isLoading={isDeleting}
                onPress={confirmDelete}
              >
                确认删除
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 我的创作页面
 */
export default function MyCreationsPage() {
  const [list, setList] = useState<MyCreationItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showBackTop, setShowBackTop] = useState(false);
  const loadingRef = useRef(false);
  const router = useRouter();

  /** 加载数据 */
  const fetchData = useCallback(async (pageNum: number) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await getMyCreations(pageNum, 12);

      if (res.code === 200 || res.code === 0) {
        setList((prev) =>
          pageNum === 1 ? res.data.list : [...prev, ...res.data.list],
        );
        setTotalPages(res.data.pagination.totalPages);
        setPage(pageNum);
      }
    } catch {
      addToast({ title: "加载失败", color: "danger" });
    } finally {
      setLoading(false);
      setInitialLoading(false);
      loadingRef.current = false;
    }
  }, []);

  /* 初始加载 - 等待 token hydration */
  useEffect(() => {
    let cancelled = false;

    const init = () => {
      if (cancelled) return;
      const t = useUserStore.getState().token;

      if (!t) {
        router.replace("/login");

        return;
      }
      fetchData(1);
    };

    // 如果已经 hydrate 完成，直接执行
    if (useUserStore.persist.hasHydrated()) {
      init();
    } else {
      // 否则等待 hydration 完成
      const unsub = useUserStore.persist.onFinishHydration(() => {
        init();
        unsub();
      });

      return () => {
        cancelled = true;
        unsub();
      };
    }

    return () => {
      cancelled = true;
    };
  }, [fetchData, router]);

  /* 滚动加载更多 */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        const { scrollTop, scrollHeight, clientHeight } =
          document.documentElement;

        if (
          scrollHeight - scrollTop - clientHeight < 200 &&
          !loadingRef.current &&
          page < totalPages
        ) {
          fetchData(page + 1);
        }
      }, 200);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timer) clearTimeout(timer);
    };
  }, [page, totalPages, fetchData]);

  /* 监听滚动 - 控制返回顶部按钮显隐 */
  useEffect(() => {
    const handleBackTopScroll = () => {
      setShowBackTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleBackTopScroll);

    return () => window.removeEventListener("scroll", handleBackTopScroll);
  }, []);

  /** 返回顶部 */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** 删除回调 */
  const handleDelete = (id: number) => {
    setList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <DefaultLayout fullWidth hideFooter hideNavbar>
      <div className="min-h-dvh bg-[#030712] text-white">
        <TopNavbar />
        <div className="px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-7xl">
            {/* 标题区 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">我的创作</h1>
              <p className="mt-2 text-white">
                管理和檢視您所有已生成的影片和圖片
              </p>
            </div>

            {/* 初始加载 */}
            {initialLoading ? (
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : list.length === 0 ? (
              <div className="flex justify-center py-20 text-default-500">
                暂无创作记录
              </div>
            ) : (
              <>
                {/* 卡片网格 - 一行三个 */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {list.map((item) => (
                    <CreationCard
                      key={item.id}
                      item={item}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>

                {/* 加载更多指示器 */}
                {loading && (
                  <div className="flex justify-center py-8">
                    <Spinner size="md" />
                  </div>
                )}

                {/* 已加载全部 */}
                {page >= totalPages && !loading && list.length > 0 && (
                  <div className="py-8 text-center text-sm text-default-500">
                    已加载全部创作
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <Footer />
      </div>

      {/* 返回顶部按钮 */}
      {showBackTop && (
        <button
          className="fixed right-8 bottom-8 z-40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-default-100 shadow-lg transition-all active:scale-95 hover:bg-default-200"
          onClick={scrollToTop}
        >
          <svg
            className="h-5 w-5 text-default-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M5 15l7-7 7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </DefaultLayout>
  );
}
