import type { ModelItem } from "@/api/images";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import NextHead from "next/head";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { Select, SelectItem } from "@heroui/select";
import { Card } from "@heroui/card";
import { Switch } from "@heroui/switch";
import { addToast } from "@heroui/toast";
import {
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import {
  Download as DownloadIcon,
  Image as ImageIcon,
  Info as InfoIcon,
  Palette as PaletteIcon,
  Pencil as EditIcon,
  RefreshCw as RotateCwIcon,
  Sparkles as SparklesIcon,
} from "lucide-react";

import {
  generateImage,
  uploadImage,
  imageToImage,
  bananaCreateImage,
  bananaQueryImage,
  bananaSubscribeTask,
  getModels,
} from "@/api/images";
import LoginModal from "@/components/LoginModal";
import TopNavbar from "@/components/TopNavbar";
import Footer from "@/components/Footer";
import { Head } from "@/layouts/head";
import { useUserStore } from "@/store/useUserStore";
import { refreshCurrentUser } from "@/api/auth";
import { normalizeImageURL } from "@/lib/image-base-url";

/**
 * 从markdown内容中提取图片URL
 * @param content markdown格式的内容
 * @returns 提取的图片URL数组
 */
const extractImageUrls = (content: string): string[] => {
  // 匹配markdown图片格式: ![alt](url)
  const imageRegex = /!\[.*?\]\((https?:\/\/[^\)]+)\)/g;
  const urls: string[] = [];
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }

  return urls;
};

/**
 * 图片尺寸选项类型
 */
interface AspectRatioOption {
  key: string;
  label: string;
  ratio: string;
  value: string;
}

/**
 * GPT 模型比例 → 实际分辨率映射
 */
const GPT_RESOLUTION_MAP: Record<string, string> = {
  "1:1": "1024x1024",
  "9:16": "1024x1792",
  "16:9": "1792x1024",
};

/**
 * 根据 manufacturer 获取模型图标路径
 */
const getModelIcon = (manufacturer: string): string => {
  const lower = manufacturer.toLowerCase();

  if (lower.includes("openai") || lower.includes("gpt")) {
    return "/image/gpt.svg";
  }

  return "/image/banana.svg";
};

/**
 * 将 API 返回的 aspect_ratios 字符串数组转为选项数组
 * GPT 模型比例值使用分辨率，Banana 模型直接使用比例字符串
 */
const buildAspectRatioOptions = (
  aspectRatios: string[],
  isGPT: boolean,
): AspectRatioOption[] => {
  return aspectRatios.map((ratio) => ({
    key: ratio,
    label: ratio,
    ratio,
    value: isGPT ? (GPT_RESOLUTION_MAP[ratio] ?? ratio) : ratio,
  }));
};

/**
 * Tab类型定义
 */
type TabType = "text-to-image" | "image-to-image";

/**
 * 生成的图片类型
 */
interface GeneratedImage {
  id: string;
  url: string;
  sourceUrl?: string;
  prompt: string;
  isLoaded: boolean;
}

const IMAGE_PRECONNECT_HOST = "https://claude.artimg.top";
const BANANA_TASK_STORAGE_KEY = "banana-create-task";
const BANANA_SSE_FALLBACK_DELAY_MS = 5000;
const BANANA_POLL_INTERVAL_MS = 3000;
const IMAGE_TASK_POLL_INTERVAL_MS = 2000;
const IMAGE_TASK_POLL_MAX_TIMES = 90;

type BananaTaskStatus =
  | "pending"
  | "running"
  | "retrying"
  | "success"
  | "failed";

interface BananaTaskMeta {
  taskId: string;
  queryPath: string;
  ssePath?: string;
}

interface BananaTaskPayload {
  taskId?: string;
  status?: string;
  cosUrl?: string;
  previewUrl?: string;
  message?: string;
}

interface BananaTaskStoragePayload extends BananaTaskMeta {
  prompt: string;
}

interface ImageTaskStatusResponse {
  message?: string;
  data?: {
    status?: string;
    cosUrl?: string;
    previewUrl?: string;
  };
}

const BANANA_TERMINAL_STATUS = new Set<BananaTaskStatus>(["success", "failed"]);

const BANANA_STATUS_LABEL_MAP: Record<BananaTaskStatus, string> = {
  pending: "排队中",
  running: "生成中",
  retrying: "重试中",
  success: "已完成",
  failed: "失败",
};

/**
 * SSE 和轮询只认固定状态集，未知状态统一视为 running。
 */
const normalizeBananaStatus = (status?: string): BananaTaskStatus => {
  const normalizedStatus = status?.toLowerCase();

  if (
    normalizedStatus === "pending" ||
    normalizedStatus === "running" ||
    normalizedStatus === "retrying" ||
    normalizedStatus === "success" ||
    normalizedStatus === "failed"
  ) {
    return normalizedStatus;
  }

  if (
    normalizedStatus === "fail" ||
    normalizedStatus === "error" ||
    normalizedStatus === "cancelled"
  ) {
    return "failed";
  }

  return "running";
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const readBananaTaskMetaFromCreateResponse = (
  response: unknown,
): BananaTaskMeta | null => {
  if (!isRecord(response)) {
    return null;
  }

  const responseData = response.data;
  const responseResult = response.result;
  if (isRecord(responseData) && isRecord(responseData.upload)) {
    const taskId =
      readString(responseData.taskId) ||
      readString(responseData.task_id) ||
      readString(responseData.id);
    const queryPath =
      readString(responseData.upload.queryPath) ||
      readString(responseData.upload.query_path);
    const ssePath =
      readString(responseData.upload.ssePath) ||
      readString(responseData.upload.sse_path) ||
      readString(responseData.upload.eventPath);

    if (taskId && queryPath) {
      return { taskId, queryPath, ssePath };
    }
  }

  const candidates: unknown[] = [
    isRecord(responseData) ? responseData.upload : undefined,
    response.upload,
    isRecord(responseData) && isRecord(responseData.data)
      ? responseData.data.upload
      : undefined,
    isRecord(responseResult) ? responseResult.upload : undefined,
    responseData,
    responseResult,
    response,
  ];

  for (const candidate of candidates) {
    if (!isRecord(candidate)) {
      continue;
    }

    const taskId =
      readString(candidate.taskId) ||
      readString(candidate.task_id) ||
      readString(candidate.id);
    const queryPath =
      readString(candidate.queryPath) ||
      readString(candidate.query_path) ||
      readString(candidate.path) ||
      (taskId ? `/app/text-to-image/tasks/${taskId}` : undefined);
    const ssePath =
      readString(candidate.ssePath) ||
      readString(candidate.sse_path) ||
      readString(candidate.eventPath);

    if (!taskId || !queryPath) {
      continue;
    }

    return {
      taskId,
      queryPath,
      ssePath,
    };
  }

  return null;
};

const createTaskFailedError = (message: string): Error => {
  const failedError = new Error(message) as Error & { isTaskFailed?: boolean };

  failedError.isTaskFailed = true;

  return failedError;
};

const isTaskFailedError = (error: unknown): boolean =>
  Boolean((error as { isTaskFailed?: boolean })?.isTaskFailed);

const createSseTimeoutError = (): Error => {
  const timeoutError = new Error("SSE 连接超时") as Error & {
    isSseTimeout?: boolean;
  };

  timeoutError.isSseTimeout = true;

  return timeoutError;
};

const isSseTimeoutError = (error: unknown): boolean =>
  Boolean((error as { isSseTimeout?: boolean })?.isSseTimeout);

/**
 * CreateNew 页面组件
 * GPT Image 1.5 生成器页面
 */
const CreateNew: React.FC = () => {
  const token = useUserStore((state) => state.token);
  const [hydrated, setHydrated] = useState(false);
  const {
    isOpen: isLoginOpen,
    onOpen: onLoginOpen,
    onClose: onLoginClose,
  } = useDisclosure();
  // 状态管理
  const [activeTab, setActiveTab] = useState<TabType>("text-to-image");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("1:1");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  // selectedModel 存储 model_key（来自 API）
  const [selectedModel, setSelectedModel] = useState("");
  const [models, setModels] = useState<ModelItem[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [loadingPlaceholders, setLoadingPlaceholders] = useState<number>(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useImageUrl, setUseImageUrl] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [urlImages, setUrlImages] = useState<string[]>([]);
  const [bananaTaskStatus, setBananaTaskStatus] =
    useState<BananaTaskStatus | null>(null);
  const [bananaTaskId, setBananaTaskId] = useState<string | null>(null);
  const bananaTaskTransportRef = useRef<(() => void) | null>(null);
  const bananaTaskRunIdRef = useRef(0);
  const isMountedRef = useRef(true);

  // 当前选中的模型对象
  const selectedModelData = useMemo(
    () => models.find((m) => m.model_key === selectedModel) ?? null,
    [models, selectedModel],
  );

  // 是否为 GPT（OpenAI）模型
  const isGPTModel = useMemo(() => {
    if (!selectedModelData) return false;
    const mfr = selectedModelData.manufacturer.toLowerCase();

    return mfr.includes("openai") || mfr.includes("gpt");
  }, [selectedModelData]);

  // 根据选中模型的 aspect_ratios 动态生成比例选项
  const ASPECT_RATIOS = useMemo(() => {
    if (!selectedModelData) return [];

    return buildAspectRatioOptions(selectedModelData.aspect_ratios, isGPTModel);
  }, [selectedModelData, isGPTModel]);
  const currentModelName = selectedModelData?.name ?? "当前模型";

  // 切换模型时重置比例为第一个选项
  useEffect(() => {
    if (ASPECT_RATIOS.length > 0) {
      setSelectedAspectRatio(ASPECT_RATIOS[0].key);
    }
  }, [selectedModel]);

  // 拉取模型列表
  useEffect(() => {
    getModels()
      .then((res) => {
        if (res.code === 200 && res.data.list.length > 0) {
          setModels(res.data.list);
          setSelectedModel(res.data.list[0].model_key);
        }
      })
      .catch((err) => {
        console.error("获取模型列表失败:", err);
      });
  }, []);

  // 计算提示词字符数
  useEffect(() => {
    setHydrated(useUserStore.persist.hasHydrated());
    const unsubscribe = useUserStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (bananaTaskTransportRef.current) {
        bananaTaskTransportRef.current();
        bananaTaskTransportRef.current = null;
      }
    };
  }, []);

  const promptLength = useMemo(() => prompt.length, [prompt]);
  const bananaStatusLabel = bananaTaskStatus
    ? BANANA_STATUS_LABEL_MAP[bananaTaskStatus]
    : null;

  const syncUserProfile = () => {
    void refreshCurrentUser({ silent: true });
  };

  /**
   * 预热图片请求，减少展示前的等待时间
   */
  const preloadImage = (imageUrl: string) => {
    if (typeof window === "undefined" || !imageUrl) return;
    const preloadedImage = new window.Image();

    preloadedImage.decoding = "async";
    preloadedImage.src = imageUrl;
  };

  // 验证表单是否可提交
  const canGenerate = useMemo(() => {
    return prompt.trim().length > 0 && !isGenerating;
  }, [prompt, isGenerating]);

  /**
   * 从 sessionStorage 中获取隐式传参数据并回显
   */
  useEffect(() => {
    const paramsStr = sessionStorage.getItem("createImageParams");

    if (paramsStr) {
      try {
        const params = JSON.parse(paramsStr);

        // 回显 prompt
        if (params.prompt) {
          setPrompt(params.prompt);
        }

        // 回显 model
        if (params.model) {
          // 将 gallery 的 model 映射到 createNew 的 model
          const modelMap: Record<string, string> = {
            "GPT Image": "gpt-image-1.5",
            "Flux Pro": "flux-pro",
            "Recraft V3": "recraft-v3",
          };
          const mappedModel = modelMap[params.model] || "gpt-image-1.5";

          setSelectedModel(mappedModel);
        }

        // 回显 size（转换为比例格式）
        if (params.size) {
          const [width, height] = params.size.split("x").map(Number);

          if (width && height) {
            // 根据尺寸设置比例
            if (width === height) setSelectedAspectRatio("1:1");
            else if (width === 1024 && height === 1792)
              setSelectedAspectRatio("2:3");
            else if (width === 1792 && height === 1024)
              setSelectedAspectRatio("3:2");
          }
        }

        // 根据 generationType 切换 tab
        if (params.generationType === "image-to-image") {
          setActiveTab("image-to-image");
          // 如果有参考图片 URL，设置到图生图模式
          if (params.imageUrl) {
            setUseImageUrl(true);
            setImageUrls([params.imageUrl]);
            setUrlImages([params.imageUrl]);
          }
        } else {
          // text-to-image 保持默认的文生图 tab
          setActiveTab("text-to-image");
        }

        // 清除 sessionStorage 中的参数
        sessionStorage.removeItem("createImageParams");
      } catch (error) {
        console.error("解析参数失败:", error);
      }
    }
  }, []);

  /**
   * 处理图片加载完成
   */
  const handleImageLoad = (imageId: string) => {
    setGeneratedImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, isLoaded: true } : img,
      ),
    );
  };

  /**
   * 轮询图片任务状态，直到返回最终 cosUrl
   */
  const waitForImageTask = async (
    taskId: string,
    queryStatus: () => Promise<ImageTaskStatusResponse>,
  ): Promise<{ cosUrl: string; previewUrl?: string }> => {
    for (let attempt = 0; attempt < IMAGE_TASK_POLL_MAX_TIMES; attempt += 1) {
      const statusResponse = await queryStatus();
      const status = statusResponse.data?.status?.toLowerCase();

      if (status === "success") {
        const finalCosUrl = statusResponse.data?.cosUrl;

        if (finalCosUrl) {
          return {
            cosUrl: finalCosUrl,
            previewUrl: statusResponse.data?.previewUrl,
          };
        }

        throw new Error("任务已完成，但未返回图片地址");
      }

      if (
        status === "failed" ||
        status === "fail" ||
        status === "error" ||
        status === "cancelled"
      ) {
        throw new Error(statusResponse.message || "生成失败，请重试");
      }

      if (attempt < IMAGE_TASK_POLL_MAX_TIMES - 1) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, IMAGE_TASK_POLL_INTERVAL_MS);
        });
      }
    }

    throw new Error(`生成超时，请稍后重试（任务ID: ${taskId}）`);
  };

  const createIdempotencyKey = () => {
    if (
      typeof window !== "undefined" &&
      typeof window.crypto?.randomUUID === "function"
    ) {
      return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const stopBananaTaskTransport = (invalidateRunId: boolean = false) => {
    if (bananaTaskTransportRef.current) {
      bananaTaskTransportRef.current();
      bananaTaskTransportRef.current = null;
    }

    if (invalidateRunId) {
      bananaTaskRunIdRef.current += 1;
    }
  };

  const saveBananaTaskToStorage = (payload: BananaTaskStoragePayload): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(BANANA_TASK_STORAGE_KEY, JSON.stringify(payload));
  };

  const clearBananaTaskFromStorage = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(BANANA_TASK_STORAGE_KEY);
  };

  const readBananaTaskFromStorage = (): BananaTaskStoragePayload | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(BANANA_TASK_STORAGE_KEY);

    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);

      if (!isRecord(parsed)) {
        return null;
      }

      const taskId = readString(parsed.taskId);
      const queryPath = readString(parsed.queryPath);
      const ssePath = readString(parsed.ssePath);
      const taskPrompt = readString(parsed.prompt) ?? "";

      if (!taskId || !queryPath) {
        return null;
      }

      return {
        taskId,
        queryPath,
        ssePath,
        prompt: taskPrompt,
      };
    } catch (error) {
      console.error("解析本地任务缓存失败:", error);

      return null;
    }
  };

  const extractBananaTaskPayload = (raw: unknown): BananaTaskPayload | null => {
    if (!isRecord(raw)) return null;

    const source = isRecord(raw.data) ? raw.data : raw;
    const taskId = readString(source.taskId);
    const status = readString(source.status);
    const previewUrl = readString(source.previewUrl);
    const cosUrl = readString(source.cosUrl);
    const message = readString(source.message) ?? readString(raw.message);

    if (!taskId && !status && !previewUrl && !cosUrl && !message) {
      return null;
    }

    return {
      taskId,
      status,
      previewUrl,
      cosUrl,
      message,
    };
  };

  const isAbortError = (error: unknown) => {
    if (error instanceof DOMException && error.name === "AbortError") {
      return true;
    }

    return error instanceof Error && error.name === "AbortError";
  };

  const createErrorFromUnknown = (
    error: unknown,
    fallbackMessage: string,
  ): Error => {
    if (error instanceof Error) {
      return error;
    }

    return new Error(fallbackMessage);
  };

  const applyBananaSuccessResult = (
    taskPayload: BananaTaskPayload,
    sourcePrompt: string,
    runId: number,
  ) => {
    const normalizedPreviewUrl = taskPayload.previewUrl
      ? normalizeImageURL(taskPayload.previewUrl)
      : undefined;
    const normalizedCosUrl = taskPayload.cosUrl
      ? normalizeImageURL(taskPayload.cosUrl)
      : undefined;
    const displayUrl = normalizedPreviewUrl || normalizedCosUrl;
    const finalSourceUrl = normalizedCosUrl || displayUrl;

    if (!displayUrl || !finalSourceUrl) {
      throw new Error("任务已完成，但未返回图片地址");
    }

    const imageId = `${Date.now()}-0`;

    preloadImage(displayUrl);
    preloadImage(finalSourceUrl);

    setGeneratedImages([
      {
        id: imageId,
        url: displayUrl,
        sourceUrl: finalSourceUrl,
        prompt: sourcePrompt,
        isLoaded: false,
      },
    ]);

    // success 先展示 preview，再在后台加载并替换为 cos。
    if (
      normalizedPreviewUrl &&
      normalizedCosUrl &&
      normalizedPreviewUrl !== normalizedCosUrl &&
      typeof window !== "undefined"
    ) {
      const highQualityImage = new window.Image();

      highQualityImage.decoding = "async";
      highQualityImage.src = normalizedCosUrl;
      highQualityImage.onload = () => {
        if (!isMountedRef.current || bananaTaskRunIdRef.current !== runId) {
          return;
        }

        setGeneratedImages((prev) =>
          prev.map((item) =>
            item.id === imageId
              ? { ...item, url: normalizedCosUrl, sourceUrl: normalizedCosUrl }
              : item,
          ),
        );
      };
    }

    syncUserProfile();

    addToast({
      title: "生成成功",
      description: "图片已生成完成",
      color: "success",
    });
  };

  const subscribeTask = (
    ssePath: string,
    userToken: string,
    onEvent: (eventName: string, data: unknown) => void,
  ) => {
    return bananaSubscribeTask(ssePath, userToken, onEvent);
  };

  const waitBananaTaskBySSE = async (
    taskMeta: BananaTaskMeta,
    userToken: string,
    runId: number,
  ): Promise<BananaTaskPayload> => {
    const ssePath = taskMeta.ssePath;

    if (!ssePath) {
      throw new Error("缺少 SSE 地址");
    }

    return new Promise<BananaTaskPayload>((resolve, reject) => {
      let settled = false;
      let hasFirstEvent = false;
      let timeoutId: number | null = null;

      const finishResolve = (taskPayload: BananaTaskPayload) => {
        if (settled) return;
        settled = true;
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
          timeoutId = null;
        }
        resolve(taskPayload);
      };
      const finishReject = (error: Error) => {
        if (settled) return;
        settled = true;
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
          timeoutId = null;
        }
        reject(error);
      };

      timeoutId = window.setTimeout(() => {
        if (settled || hasFirstEvent) return;
        finishReject(createSseTimeoutError());
      }, BANANA_SSE_FALLBACK_DELAY_MS);

      const { stop, promise } = subscribeTask(
        ssePath,
        userToken,
        (eventName, rawData) => {
          if (bananaTaskRunIdRef.current !== runId) return;
          const taskPayload = extractBananaTaskPayload(rawData);

          if (!taskPayload) return;

          hasFirstEvent = true;
          const normalizedEvent = eventName?.toLowerCase();
          const status =
            normalizedEvent === "task_success"
              ? "success"
              : normalizedEvent === "task_failed"
                ? "failed"
                : normalizedEvent === "ping"
                  ? "running"
                  : normalizeBananaStatus(taskPayload.status);

          setBananaTaskStatus(status);

          if (!BANANA_TERMINAL_STATUS.has(status)) {
            return;
          }

          stop();

          if (status === "failed") {
            const errorMessage = taskPayload.message || "生成失败，请重试";

            finishReject(createTaskFailedError(errorMessage));

            return;
          }

          finishResolve(taskPayload);
        },
      );

      bananaTaskTransportRef.current = stop;

      promise
        .then(() => {
          if (settled) return;
          finishReject(new Error("SSE 连接已关闭"));
        })
        .catch((error: unknown) => {
          if (settled) return;
          finishReject(
            createErrorFromUnknown(error, "SSE 连接失败，准备降级轮询"),
          );
        });
    });
  };

  const waitBananaTaskByPolling = async (
    taskMeta: BananaTaskMeta,
    runId: number,
  ): Promise<BananaTaskPayload> => {
    return new Promise<BananaTaskPayload>((resolve, reject) => {
      let settled = false;
      let inFlight = false;
      let timerId: number | null = null;

      const stop = () => {
        if (timerId !== null) {
          window.clearInterval(timerId);
          timerId = null;
        }
      };
      const finishResolve = (taskPayload: BananaTaskPayload) => {
        if (settled) return;
        settled = true;
        stop();
        resolve(taskPayload);
      };
      const finishReject = (error: Error) => {
        if (settled) return;
        settled = true;
        stop();
        reject(error);
      };
      const pollOnce = async () => {
        if (settled || inFlight || bananaTaskRunIdRef.current !== runId) {
          return;
        }
        inFlight = true;

        try {
          const response = await bananaQueryImage(taskMeta.queryPath);
          const taskPayload = extractBananaTaskPayload(response);

          if (!taskPayload) {
            throw new Error("轮询返回数据格式错误");
          }

          const status = normalizeBananaStatus(taskPayload.status);

          setBananaTaskStatus(status);

          if (!BANANA_TERMINAL_STATUS.has(status)) {
            return;
          }

          if (status === "failed") {
            const errorMessage = taskPayload.message || "生成失败，请重试";

            finishReject(new Error(errorMessage));

            return;
          }

          finishResolve(taskPayload);
        } catch (error: unknown) {
          finishReject(createErrorFromUnknown(error, "轮询任务失败"));
        } finally {
          inFlight = false;
        }
      };

      bananaTaskTransportRef.current = stop;
      timerId = window.setInterval(() => {
        void pollOnce();
      }, BANANA_POLL_INTERVAL_MS);
      void pollOnce();
    });
  };

  const runBananaTaskFlow = async (
    taskMeta: BananaTaskMeta,
    sourcePrompt: string,
    options?: {
      skipPersist?: boolean;
      initialStatus?: string;
    },
  ) => {
    stopBananaTaskTransport(true);
    const runId = bananaTaskRunIdRef.current;

    setBananaTaskId(taskMeta.taskId);
    setBananaTaskStatus(
      options?.initialStatus
        ? normalizeBananaStatus(options.initialStatus)
        : "pending",
    );

    if (!options?.skipPersist) {
      saveBananaTaskToStorage({
        ...taskMeta,
        prompt: sourcePrompt,
      });
    }

    if (!token) {
      throw new Error("登录状态已失效，请重新登录");
    }

    try {
      let taskResult: BananaTaskPayload;

      if (taskMeta.ssePath) {
        try {
          taskResult = await waitBananaTaskBySSE(taskMeta, token, runId);
        } catch (sseError: unknown) {
          if (bananaTaskRunIdRef.current !== runId) return;
          if (isAbortError(sseError)) return;
          if (isTaskFailedError(sseError)) {
            throw sseError;
          }

          if (!isSseTimeoutError(sseError)) {
            await new Promise<void>((resolve) => {
              window.setTimeout(resolve, BANANA_SSE_FALLBACK_DELAY_MS);
            });
          }

          taskResult = await waitBananaTaskByPolling(taskMeta, runId);
        }
      } else {
        taskResult = await waitBananaTaskByPolling(taskMeta, runId);
      }

      if (bananaTaskRunIdRef.current !== runId) return;

      clearBananaTaskFromStorage();
      setBananaTaskStatus("success");
      applyBananaSuccessResult(taskResult, sourcePrompt, runId);
      setPrompt("");
    } catch (error: unknown) {
      if (bananaTaskRunIdRef.current !== runId) return;
      if (isAbortError(error)) return;

      clearBananaTaskFromStorage();
      setBananaTaskStatus("failed");

      throw createErrorFromUnknown(error, "任务执行失败");
    } finally {
      if (bananaTaskRunIdRef.current === runId) {
        stopBananaTaskTransport(false);
      }
    }
  };

  useEffect(() => {
    if (!hydrated || !token) return;

    const persistedTask = readBananaTaskFromStorage();

    if (!persistedTask) return;

    const resumeTask = async () => {
      setGeneratedImages([]);
      setPreviewImage(null);
      setIsGenerating(true);
      setLoadingPlaceholders(1);

      try {
        const latestResponse = await bananaQueryImage(persistedTask.queryPath);
        const latestTask = latestResponse.data;
        const normalizedStatus = normalizeBananaStatus(latestTask?.status);

        if (normalizedStatus === "success") {
          clearBananaTaskFromStorage();
          setBananaTaskStatus("success");
          setBananaTaskId(persistedTask.taskId);
          applyBananaSuccessResult(latestTask, persistedTask.prompt, 0);

          return;
        }

        if (normalizedStatus === "failed") {
          clearBananaTaskFromStorage();
          setBananaTaskStatus("failed");
          throw new Error(latestResponse.message || "历史任务已失败");
        }

        await runBananaTaskFlow(
          {
            taskId: persistedTask.taskId,
            queryPath: persistedTask.queryPath,
            ssePath: persistedTask.ssePath,
          },
          persistedTask.prompt,
          {
            skipPersist: true,
            initialStatus: latestTask?.status,
          },
        );
      } catch (error: unknown) {
        const finalError = createErrorFromUnknown(error, "恢复任务失败");

        console.error("恢复 Banana 任务失败:", finalError);

        if (!isMountedRef.current) return;
        if (
          (error as { response?: { status?: number } })?.response?.status ===
            401 ||
          (error as { response?: { status?: number } })?.response?.status ===
            409
        ) {
          return;
        }

        setErrorMessage(finalError.message);
        setIsErrorModalOpen(true);
      } finally {
        if (!isMountedRef.current) return;
        setIsGenerating(false);
        setLoadingPlaceholders(0);
      }
    };

    void resumeTask();
  }, [hydrated, token]);

  /**
   * 处理生成图像
   */
  const handleGenerate = async () => {
    if (!canGenerate) return;
    if (!hydrated) return;
    if (hydrated && !token) {
      onLoginOpen();

      return;
    }

    setGeneratedImages([]);
    setPreviewImage(null);
    setIsGenerating(true);
    setLoadingPlaceholders(1);
    setBananaTaskStatus(null);
    setBananaTaskId(null);
    stopBananaTaskTransport(true);
    clearBananaTaskFromStorage();

    try {
      const selectedRatio = ASPECT_RATIOS.find(
        (ratio) => ratio.key === selectedAspectRatio,
      );
      const sizeValue = selectedRatio?.value || "1024x1024";

      // 判断是文生图还是图生图
      if (activeTab === "image-to-image") {
        // 获取图片URL数组
        const inputImageUrls = useImageUrl
          ? urlImages.filter((u) => u)
          : uploadedImages;

        if (inputImageUrls.length === 0) {
          setErrorMessage("请先上传参考图片或输入图片链接");
          setIsErrorModalOpen(true);

          return;
        }

        // 判断是否为 Nano Banana 系列模型（图生图模式）
        const isNanoBanana = !isGPTModel;

        if (isNanoBanana) {
          // Nano Banana 系列：提交仅创建任务，再用 SSE + 轮询跟踪状态
          const modelValue = selectedModel;
          const idempotencyKey = createIdempotencyKey();

          const response = await bananaCreateImage(
            modelValue,
            prompt,
            selectedAspectRatio,
            "image-to-image",
            idempotencyKey,
            inputImageUrls,
          );

          const taskMeta = readBananaTaskMetaFromCreateResponse(response);

          if (!taskMeta) {
            if ((response as { code?: number })?.code === 202) {
              addToast({
                title: "任务已受理",
                description: "正在等待任务状态回传",
                color: "primary",
              });

              return;
            }

            setErrorMessage(response.message || "任务创建失败，请重试");
            setIsErrorModalOpen(true);

            return;
          }

          await runBananaTaskFlow(taskMeta, prompt);
        } else {
          // 非 Nano Banana 模型：调用图生图接口后，按 taskId 轮询任务结果
          const response = await imageToImage(
            prompt,
            inputImageUrls,
            sizeValue,
          );

          const taskMeta = readBananaTaskMetaFromCreateResponse(response);

          if (taskMeta) {
            await runBananaTaskFlow(taskMeta, prompt);

            return;
          }

          if (!response.success) {
            setErrorMessage(response.message || "生成失败，请重试");
            setIsErrorModalOpen(true);

            return;
          }

          // 兜底旧返回结构：从 markdown 中提取图片 URL
          if (
            !response.data?.thirdPartyResponse?.choices?.[0]?.message?.content
          ) {
            console.error("返回数据结构异常:", response);
            setErrorMessage(response.message || "返回数据格式错误，请重试");
            setIsErrorModalOpen(true);

            return;
          }

          const content =
            response.data.thirdPartyResponse.choices[0].message.content;
          const extractedImageUrls = extractImageUrls(content);

          if (extractedImageUrls.length === 0) {
            setErrorMessage("未能从返回数据中提取到图片URL");
            setIsErrorModalOpen(true);

            return;
          }

          const newImages: GeneratedImage[] = extractedImageUrls.map(
            (url, index) => ({
              id: `${Date.now()}-${index}`,
              url: url,
              sourceUrl: url,
              prompt: prompt,
              isLoaded: false,
            }),
          );

          setGeneratedImages(newImages);
          syncUserProfile();

          addToast({
            title: "生成成功",
            description: "图片已生成完成",
            color: "success",
          });

          setPrompt("");
        }
      } else {
        // 判断是否为 Nano Banana 系列模型
        const isNanoBanana = !isGPTModel;

        if (isNanoBanana) {
          // Nano Banana 系列：提交仅创建任务，再用 SSE + 轮询跟踪状态
          const idempotencyKey = createIdempotencyKey();
          const response = await bananaCreateImage(
            selectedModel,
            prompt,
            selectedAspectRatio,
            "text-to-image",
            idempotencyKey,
          );

          const taskMeta = readBananaTaskMetaFromCreateResponse(response);

          if (!taskMeta) {
            if ((response as { code?: number })?.code === 202) {
              addToast({
                title: "任务已受理",
                description: "正在等待任务状态回传",
                color: "primary",
              });

              return;
            }

            setErrorMessage(response.message || "任务创建失败，请重试");
            setIsErrorModalOpen(true);

            return;
          }

          await runBananaTaskFlow(taskMeta, prompt);
        } else {
          // 非 Nano Banana 模型：调用文生图接口后，按 taskId 轮询任务结果
          const response = await generateImage(prompt, sizeValue);

          const taskMeta = readBananaTaskMetaFromCreateResponse(response);

          if (taskMeta) {
            await runBananaTaskFlow(taskMeta, prompt);

            return;
          }

          if (!response.success) {
            setErrorMessage(response.message || "生成失败，请重试");
            setIsErrorModalOpen(true);

            return;
          }

          // 兜底旧返回结构：直接读取 thirdPartyResponse.data
          if (!response.data?.thirdPartyResponse?.data) {
            setErrorMessage(response.message || "返回数据格式错误，请重试");
            setIsErrorModalOpen(true);

            return;
          }

          const newImages: GeneratedImage[] =
            response.data.thirdPartyResponse.data.map((item, index) => ({
              id: `${Date.now()}-${index}`,
              url: item.url,
              sourceUrl: item.url,
              prompt: item.revised_prompt,
              isLoaded: false,
            }));

          setGeneratedImages(newImages);
          syncUserProfile();

          // 显示成功提示
          addToast({
            title: "生成成功",
            description: "图片已生成完成",
            color: "success",
          });

          // 清空提示词
          setPrompt("");
        }
      }
    } catch (error: any) {
      console.error("生成失败:", error);

      // 401 和 409 都由全局交互处理，这里不再重复弹页面级错误模态框
      if (error?.response?.status === 401 || error?.response?.status === 409) {
        return;
      }

      const errorMsg =
        error instanceof Error ? error.message : "生成图片失败，请重试";

      setErrorMessage(errorMsg);
      setIsErrorModalOpen(true);
    } finally {
      setIsGenerating(false);
      setLoadingPlaceholders(0);
    }
  };

  /**
   * 处理图片上传
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const remainingSlots = 10 - uploadedImages.length;

    if (remainingSlots === 0) {
      setErrorMessage("最多只能上传10张图片");
      setIsErrorModalOpen(true);

      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    const invalidFiles = filesToProcess.filter(
      (file) => !file.type.startsWith("image/"),
    );

    if (invalidFiles.length > 0) {
      setErrorMessage("请只上传图片文件");
      setIsErrorModalOpen(true);

      return;
    }

    setIsUploading(true);

    // 上传每个文件到服务器
    for (const file of filesToProcess) {
      try {
        const response = await uploadImage(file);

        if (response.code === 200 && response.data.url) {
          const normalizedUploadedUrl = normalizeImageURL(response.data.url);

          setUploadedImages((prev) => [...prev, normalizedUploadedUrl]);
        }
      } catch (error) {
        console.error("上传失败:", error);
        setErrorMessage("图片上传失败，请重试");
        setIsErrorModalOpen(true);
      }
    }

    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * 移除指定图片
   */
  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * 添加URL输入框
   */
  const handleAddUrlInput = () => {
    if (imageUrls.length < 10) {
      setImageUrls((prev) => [...prev, ""]);
    }
  };

  /**
   * 更新URL输入
   */
  const handleUrlChange = (index: number, value: string) => {
    setImageUrls((prev) => prev.map((url, i) => (i === index ? value : url)));
    if (value.trim()) {
      const newUrlImages = [...urlImages];

      newUrlImages[index] = value;
      setUrlImages(newUrlImages);
    }
  };

  /**
   * 删除URL输入框
   */
  const handleRemoveUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setUrlImages((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * 下载图片到本地
   */
  const handleDownloadImage = async (imageUrl: string, imageId: string) => {
    try {
      // 获取图片数据
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;

      // 设置文件名（使用时间戳和ID）
      const timestamp = new Date().getTime();
      const fileName = `gpt-image-${timestamp}-${imageId}.png`;

      link.download = fileName;

      // 触发下载
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setErrorMessage("下载图片失败，请重试");
      setIsErrorModalOpen(true);
    }
  };

  /**
   * 将已生成图片对应的提示词回填到输入框，便于继续修改
   */
  const handleReusePrompt = (imagePrompt: string) => {
    setPrompt(imagePrompt);
  };

  return (
    <div className="min-h-screen bg-[#030712]">
      <NextHead>
        <link crossOrigin="" href={IMAGE_PRECONNECT_HOST} rel="preconnect" />
        <link href="//claude.artimg.top" rel="dns-prefetch" />
      </NextHead>
      <Head />
      {/* 顶部导航 */}
      <TopNavbar />

      {/* 主内容区域 - 添加顶部间距以避免被固定导航遮挡 */}
      <div className="px-4 pt-32 pb-6 sm:pt-36 lg:pt-40 lg:pb-12">
        {/* 主容器 - 宽度限制为1280px */}
        <main className="max-w-[1280px] mx-auto">
          {/* 页面头部 */}
          <header className="text-center mb-8 lg:mb-16">
            <h1 className="text-3xl lg:text-5xl font-bold mb-4 lg:mb-6 text-white">
              创意工作室
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto leading-relaxed text-base lg:text-lg">
              将您的想象力转化为令人惊艳的视觉效果。从多种AI模型中选择，包括Seedream、Nano
              Banana和Nano Banana
              Pro，通过简单的文字描述生成专业品质的图像。您的一站式AI艺术生成创意工作室。
            </p>
          </header>

          {/* 内容网格 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* 左侧设置面板 */}
            <section className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
              <Card className="p-6">
                {/* 面板头部 */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Image 生成器</h2>
                </div>

                {/* 标签切换 - 使用HeroUI Tabs组件 */}
                <Tabs
                  fullWidth
                  className="mb-6"
                  selectedKey={activeTab}
                  size="md"
                  onSelectionChange={(key) => setActiveTab(key as TabType)}
                >
                  <Tab
                    key="text-to-image"
                    title={
                      <div className="flex items-center gap-2">
                        <EditIcon className="w-4 h-4" />
                        <span>文字转图片</span>
                      </div>
                    }
                  />
                  <Tab
                    key="image-to-image"
                    title={
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>图片转图片</span>
                      </div>
                    }
                  />
                </Tabs>

                {/* 模型选择 - 使用HeroUI Select组件 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    {activeTab === "text-to-image"
                      ? "Text to Image Model"
                      : "Image to Image Model"}
                  </label>
                  <Select
                    aria-label={
                      activeTab === "text-to-image"
                        ? "选择文生图模型"
                        : "选择图生图模型"
                    }
                    className="w-full"
                    classNames={{
                      trigger: "min-h-[72px] py-3",
                    }}
                    placeholder="选择模型"
                    popoverProps={{
                      shouldBlockScroll: false,
                    }}
                    renderValue={(items) => {
                      const item = items[0];
                      const model = models.find(
                        (m) => m.model_key === item.key,
                      );

                      if (!model) return null;

                      return (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-default-200 rounded flex items-center justify-center flex-shrink-0">
                            <Image
                              alt={model.name}
                              className="w-6 h-6"
                              height={24}
                              src={getModelIcon(model.manufacturer)}
                              width={24}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">
                                {model.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-default-500 mt-0.5">
                              {model.description}
                            </div>
                          </div>
                        </div>
                      );
                    }}
                    selectedKeys={selectedModel ? [selectedModel] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string;

                      setSelectedModel(key);
                    }}
                  >
                    {models.map((model) => (
                      <SelectItem key={model.model_key} textValue={model.name}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-default-200 rounded flex items-center justify-center flex-shrink-0">
                            <Image
                              alt={model.name}
                              className="w-5 h-5"
                              height={20}
                              src={getModelIcon(model.manufacturer)}
                              width={20}
                            />
                          </div>
                          <span className="font-medium">{model.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* 图片上传区域 - 仅在图生图模式下显示 */}
                {activeTab === "image-to-image" && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label
                        className="block text-sm font-medium"
                        htmlFor="image-upload"
                      >
                        上传参考图片 (
                        {useImageUrl
                          ? urlImages.filter((u) => u).length
                          : uploadedImages.length}
                        /10)
                      </label>
                      <Switch
                        classNames={{
                          base: "inline-flex flex-row-reverse items-center gap-2",
                          wrapper: "h-5 w-9",
                          thumb: "w-3 h-3",
                        }}
                        isSelected={useImageUrl}
                        size="sm"
                        onValueChange={setUseImageUrl}
                      >
                        <span className="text-xs text-default-500">
                          使用图片链接
                        </span>
                      </Switch>
                    </div>

                    {!useImageUrl ? (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {uploadedImages.map((img, index) => (
                          <div
                            key={index}
                            className="relative rounded-lg overflow-hidden aspect-square"
                          >
                            {/* 这里需要展示任意外链/上传地址，保留原生 img。 */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt={`上传的图片 ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              src={img}
                            />
                            <Button
                              className="absolute top-1 right-1 min-w-6 h-6 p-0 bg-black/50 text-white text-lg"
                              size="sm"
                              onPress={() => handleRemoveImage(index)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                        {uploadedImages.length < 10 && (
                          <label
                            className={`border-2 border-dashed border-default-300 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                            htmlFor="image-upload"
                          >
                            {isUploading ? (
                              <>
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs text-default-500 mt-1">
                                  上传中...
                                </span>
                              </>
                            ) : (
                              <>
                                <ImageIcon className="w-6 h-6 text-default-400" />
                                <span className="text-xs text-default-500 mt-1">
                                  上传
                                </span>
                              </>
                            )}
                            <input
                              ref={fileInputRef}
                              multiple
                              accept="image/*"
                              className="hidden"
                              disabled={isUploading}
                              id="image-upload"
                              type="file"
                              onChange={handleImageUpload}
                            />
                          </label>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-xs text-default-500 w-20">
                              图片 URL #{index + 1}
                            </span>
                            <input
                              className="flex-1 bg-default-100 border border-default-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
                              placeholder="https://example.com/image.jpg"
                              type="text"
                              value={url}
                              onChange={(e) =>
                                handleUrlChange(index, e.target.value)
                              }
                            />
                            <Button
                              className="min-w-8 h-7 p-0 text-lg"
                              color="danger"
                              size="sm"
                              variant="light"
                              onPress={() => handleRemoveUrl(index)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                        {imageUrls.length < 10 && (
                          <button
                            className="w-full border-2 border-dashed border-default-300 rounded-lg py-2 text-sm text-default-500 hover:border-primary hover:text-primary transition-colors"
                            type="button"
                            onClick={handleAddUrlInput}
                          >
                            + 添加图片 URL
                          </button>
                        )}
                        {urlImages.filter((u) => u).length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mt-4">
                            {urlImages
                              .filter((u) => u)
                              .map((url, index) => (
                                <div
                                  key={index}
                                  className="relative rounded-lg overflow-hidden aspect-square bg-default-100"
                                >
                                  {/* 这里是用户输入的任意 URL 预览，保留原生 img。 */}
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    alt={`URL图片 ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    src={url}
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                  <Button
                                    className="absolute top-1 right-1 min-w-6 h-6 p-0 bg-black/50 text-white text-lg"
                                    size="sm"
                                    onPress={() => {
                                      const actualIndex = urlImages.findIndex(
                                        (u, i) => u === url && i === index,
                                      );

                                      if (actualIndex !== -1) {
                                        handleRemoveUrl(actualIndex);
                                      }
                                    }}
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 提示词输入区域 - 使用HeroUI Textarea组件 */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      AI图像提示词*
                      <InfoIcon className="w-3.5 h-3.5 text-default-400" />
                    </label>
                  </div>
                  <textarea
                    className="w-full bg-default-100 border-2 border-default-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary transition-colors"
                    placeholder="描述你想要生成的图像..."
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-default-500">
                      {promptLength} / 4000
                    </span>
                  </div>
                </div>

                {/* 图片尺寸选择 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">
                    图片比例
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ASPECT_RATIOS.map((ratio) => {
                      // 根据比例动态计算预览形状尺寸
                      const [w, h] = ratio.ratio.split(":").map(Number);
                      const maxSize = 36;
                      const scale = maxSize / Math.max(w, h);
                      const shapeW = Math.round(w * scale);
                      const shapeH = Math.round(h * scale);

                      return (
                        <button
                          key={ratio.key}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                            selectedAspectRatio === ratio.key
                              ? "border-primary bg-primary/10"
                              : "border-default-200 bg-default-100 hover:border-primary/50"
                          }`}
                          type="button"
                          onClick={() => setSelectedAspectRatio(ratio.key)}
                        >
                          <div
                            className={`mb-2 rounded border-2 ${
                              selectedAspectRatio === ratio.key
                                ? "border-primary bg-primary/20"
                                : "border-default-300 bg-default-200"
                            }`}
                            style={{
                              width: `${shapeW}px`,
                              height: `${shapeH}px`,
                            }}
                          />
                          <span
                            className={`text-xs font-medium ${
                              selectedAspectRatio === ratio.key
                                ? "text-primary"
                                : "text-default-600"
                            }`}
                          >
                            {ratio.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 生成按钮 - 使用HeroUI Button组件 */}
                <Button
                  className="w-full font-semibold bg-gradient-to-r from-primary to-secondary"
                  color="primary"
                  isDisabled={!canGenerate || !hydrated}
                  isLoading={isGenerating}
                  size="lg"
                  startContent={!isGenerating && <SparklesIcon size={20} />}
                  onPress={handleGenerate}
                >
                  {isGenerating
                    ? bananaTaskStatus === "pending"
                      ? "创建任务中..."
                      : bananaStatusLabel
                        ? `任务${bananaStatusLabel}...`
                        : "创作中..."
                    : "创建任务"}
                  {!isGenerating && (
                    <span className="text-xs opacity-80 ml-1">
                      (消耗 {selectedModelData?.consume_points ?? "-"} 币)
                    </span>
                  )}
                </Button>
              </Card>
            </section>

            {/* 右侧历史记录面板 */}
            <section className="lg:col-span-7 xl:col-span-8">
              <Card className="p-4 lg:p-6">
                {/* 历史记录头部 */}
                <div className="flex justify-between items-center mb-4 lg:mb-6">
                  {/* <h2 className="text-lg font-semibold">生成历史</h2> */}
                </div>
                {/* 图片网格 */}
                <div className="w-full h-[400px] lg:h-[600px] rounded-2xl lg:rounded-3xl border border-default-200/30 bg-muted/10 backdrop-blur-sm overflow-hidden relative flex flex-col shadow-2xl">
                  <div className="w-full h-full bg-muted/30 flex items-center justify-center p-3 lg:p-4">
                    {/* 加载中的骨架屏 - 带闪烁动画 */}
                    {loadingPlaceholders > 0 &&
                      Array.from({ length: loadingPlaceholders }).map(
                        (_, index) => (
                          <div
                            key={`loading-${index}`}
                            className="w-full h-full flex items-center justify-center rounded-2xl overflow-hidden"
                          >
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 animate-pulse flex items-center justify-center">
                              <div className="text-center px-8">
                                {/* 星星闪烁动画 */}
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                  {/* 中心大星星 */}
                                  <SparklesIcon
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse"
                                    size={48}
                                  />
                                  {/* 周围小星星 - 上 */}
                                  <SparklesIcon
                                    className="absolute top-0 left-1/2 -translate-x-1/2 text-secondary animate-ping"
                                    size={20}
                                    style={{ animationDuration: "1.5s" }}
                                  />
                                  {/* 周围小星星 - 右 */}
                                  <SparklesIcon
                                    className="absolute top-1/2 right-0 -translate-y-1/2 text-primary animate-ping"
                                    size={20}
                                    style={{ animationDuration: "2s" }}
                                  />
                                  {/* 周围小星星 - 下 */}
                                  <SparklesIcon
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 text-secondary animate-ping"
                                    size={20}
                                    style={{ animationDuration: "1.8s" }}
                                  />
                                  {/* 周围小星星 - 左 */}
                                  <SparklesIcon
                                    className="absolute top-1/2 left-0 -translate-y-1/2 text-primary animate-ping"
                                    size={20}
                                    style={{ animationDuration: "2.2s" }}
                                  />
                                </div>
                                <p className="text-base font-semibold text-foreground mb-2">
                                  {`正在使用 ${currentModelName} 创作您的图像`}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {bananaStatusLabel
                                    ? `任务状态：${bananaStatusLabel}`
                                    : "这通常需要 1-3 分钟，具体取决于图像复杂度"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ),
                      )}

                    {/* 已生成的图片 */}
                    {generatedImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="w-full h-full flex flex-col items-center justify-center gap-3 lg:gap-6"
                      >
                        {/* 图片容器 */}
                        <button
                          aria-label="预览生成图片"
                          className="w-full max-w-[600px] min-h-[350px] lg:min-h-[500px] max-h-[350px] cursor-pointer relative overflow-hidden rounded-xl lg:rounded-2xl flex items-center justify-center border-0 bg-transparent p-0"
                          type="button"
                          onClick={() =>
                            setPreviewImage(image.sourceUrl || image.url)
                          }
                        >
                          {!image.isLoaded && (
                            <div className="absolute inset-0 z-10 rounded-xl lg:rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 animate-pulse flex items-center justify-center">
                              <div className="text-center px-8">
                                {/* 星星闪烁动画 */}
                                <div className="relative w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4">
                                  {/* 中心大星星 */}
                                  <SparklesIcon
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse"
                                    size={32}
                                  />
                                  {/* 周围小星星 - 上 */}
                                  <SparklesIcon
                                    className="absolute top-0 left-1/2 -translate-x-1/2 text-secondary animate-ping"
                                    size={14}
                                    style={{ animationDuration: "1.5s" }}
                                  />
                                  {/* 周围小星星 - 右 */}
                                  <SparklesIcon
                                    className="absolute top-1/2 right-0 -translate-y-1/2 text-primary animate-ping"
                                    size={14}
                                    style={{ animationDuration: "2s" }}
                                  />
                                  {/* 周围小星星 - 下 */}
                                  <SparklesIcon
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 text-secondary animate-ping"
                                    size={14}
                                    style={{ animationDuration: "1.8s" }}
                                  />
                                  {/* 周围小星星 - 左 */}
                                  <SparklesIcon
                                    className="absolute top-1/2 left-0 -translate-y-1/2 text-primary animate-ping"
                                    size={14}
                                    style={{ animationDuration: "2.2s" }}
                                  />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  图片加载中...
                                </p>
                              </div>
                            </div>
                          )}
                          {/* 生成结果可能来自任意第三方链接，保留原生 img。 */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={image.prompt}
                            className={`max-w-full max-h-full object-contain transition-all duration-500 hover:scale-105 ${
                              image.isLoaded ? "opacity-100" : "opacity-0"
                            }`}
                            decoding="async"
                            {...({
                              fetchpriority: index === 0 ? "high" : "auto",
                            } as Record<string, string>)}
                            loading={index === 0 ? "eager" : "lazy"}
                            src={image.url}
                            onLoad={() => handleImageLoad(image.id)}
                          />
                        </button>

                        {/* 操作按钮组 */}
                        <div className="w-full max-w-[600px] grid grid-cols-2 gap-2 lg:gap-3">
                          {/* 下载图片按钮 */}
                          <Button
                            className="bg-default-100 text-foreground border border-default-200"
                            size="md"
                            startContent={
                              <DownloadIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                            }
                            variant="flat"
                            onPress={() =>
                              handleDownloadImage(
                                image.sourceUrl || image.url,
                                image.id,
                              )
                            }
                          >
                            下载图片
                          </Button>

                          {/* 重新生成按钮 */}
                          <Button
                            className="bg-gradient-to-r from-primary to-secondary text-white"
                            size="md"
                            startContent={
                              <RotateCwIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                            }
                            onPress={() => handleReusePrompt(image.prompt)}
                          >
                            继续修改
                          </Button>
                        </div>
                      </div>
                    ))}
                    {/* 空状态提示 */}
                    {generatedImages.length === 0 &&
                      loadingPlaceholders === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <PaletteIcon className="h-10 w-10 lg:h-12 lg:w-12 text-primary" />
                          </div>
                          <div className="text-2xl font-bold text-foreground mb-2">
                            准备好创作
                          </div>
                          <p className="text-muted-foreground max-w-md">
                            输入提示词开始创作精美图像
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </Card>
            </section>
          </div>
        </main>

        {/* 图片预览模态框 */}
        {previewImage && (
          <div
            aria-label="图片预览"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm border-0 cursor-default"
            role="dialog"
            onClick={() => setPreviewImage(null)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setPreviewImage(null);
            }}
          >
            <button
              aria-label="关闭预览"
              className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-2xl text-white/90 transition hover:bg-white/10 hover:text-white border border-white/20"
              type="button"
              onClick={() => setPreviewImage(null)}
            >
              ×
            </button>
            <div
              className="relative max-h-[90vh] max-w-[90vw]"
              role="button"
              tabIndex={0}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                }
              }}
            >
              {/* 预览弹层沿用原生 img，避免对外链图片施加 next/image 限制。 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="预览图片"
                className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
                src={previewImage}
              />
            </div>
          </div>
        )}

        {/* 错误提示模态框 */}
        <Modal
          isOpen={isErrorModalOpen}
          shouldBlockScroll={false}
          onClose={() => setIsErrorModalOpen(false)}
        >
          <ModalContent>
            <ModalHeader>提示</ModalHeader>
            <ModalBody>
              <p>{errorMessage}</p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                onPress={() => setIsErrorModalOpen(false)}
              >
                确定
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <LoginModal
          isOpen={isLoginOpen}
          redirectTo={null}
          onClose={onLoginClose}
        />
      </div>

      {/* 底部 Footer */}
      <Footer />
    </div>
  );
};

export default CreateNew;
