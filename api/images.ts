import { fetchEventSource } from "@microsoft/fetch-event-source";

import { getApiBaseURL, normalizeApiPath } from "@/lib/api-base-url";

// 图片接口类型定义
export interface ImageItem {
  id: string;
  url: string;
  title: string;
  width: number;
  height: number;
}

export interface ImagesResponse {
  data: ImageItem[];
  total: number;
  page: number;
  pageSize: number;
}

// 图片上传响应类型
export interface UploadImageResponse {
  code: number;
  message: string;
  data: {
    url: string;
  };
}

// 文本生成图片响应类型
export interface TextToImageResponse {
  code: number;
  data: {
    id: string;
    object: string;
    created: number;
    model: string;
    session_id?: string; // 会话 ID
    choices: Array<{
      index: number;
      message: {
        role: string;
        content: string;
      };
      finish_reason: string;
    }>;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

// 新的图片生成响应类型（根据mock数据）
export interface GenerateImageResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    taskId?: string;
    thirdPartyUrl: string;
    thirdPartyResponse: {
      created: number;
      data: Array<{
        revised_prompt: string;
        url: string;
      }>;
      usage: {
        total_tokens: number;
        input_tokens: number;
        output_tokens: number;
        input_tokens_details: {
          text_tokens: number;
        };
      };
    };
    upload: {
      taskId: string;
      status: string;
      queryPath: string;
      ssePath?: string;
    };
  };
}

import request from "./request";

const FIXED_BILLING_MODEL_KEY = "gpt_image_to_image_points";
const GPT_IMAGE_1_5_TEXT_TO_IMAGE_MODEL = "gpt-image/1.5-text-to-image";
const GPT_IMAGE_1_5_IMAGE_TO_IMAGE_MODEL = "gpt-image/1.5-image-to-image";
const GPT_IMAGE_2_TEXT_TO_IMAGE_MODEL = "gpt-image-2-text-to-image";
const GPT_IMAGE_2_IMAGE_TO_IMAGE_MODEL = "gpt-image-2-image-to-image";

interface GptImageModelConfig {
  textToImageModel: string;
  imageToImageModel: string;
}

const normalizeModelToken = (value?: string): string =>
  (value || "").trim().toLowerCase().replace(/[\s_]+/g, "-");

const resolveGptImageModelConfig = (
  modelValue?: string,
): GptImageModelConfig => {
  const normalizedModel = normalizeModelToken(modelValue);

  if (
    normalizedModel.includes("gpt-image-2") ||
    normalizedModel.includes("gpt-image2")
  ) {
    return {
      textToImageModel: GPT_IMAGE_2_TEXT_TO_IMAGE_MODEL,
      imageToImageModel: GPT_IMAGE_2_IMAGE_TO_IMAGE_MODEL,
    };
  }

  return {
    textToImageModel: GPT_IMAGE_1_5_TEXT_TO_IMAGE_MODEL,
    imageToImageModel: GPT_IMAGE_1_5_IMAGE_TO_IMAGE_MODEL,
  };
};

const buildApiRequestUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const baseURL = getApiBaseURL().replace(/\/+$/, "");
  const normalizedPath = normalizeApiPath(path);

  if (baseURL.endsWith("/app") && normalizedPath.startsWith("/app/")) {
    return `${baseURL}${normalizedPath.slice(4)}`;
  }

  return `${baseURL}${normalizedPath}`;
};

// 模型列表类型
export interface ModelSkuItem {
  id?: number | string;
  name?: string;
  sku_name?: string;
  sku_code?: string;
  image_size?: string;
  resolution?: string;
  consume_points: number;
}

export interface ModelItem {
  id: number;
  name: string;
  model_key: string;
  manufacturer: string;
  description: string;
  aspect_ratio?: string;
  aspect_ratios?: string[];
  status: number;
  consume_points: number;
  skus?: ModelSkuItem[];
  created_at: string;
  updated_at: string;
}

export interface ModelsResponse {
  code: number;
  message: string;
  data: {
    total: number;
    list: ModelItem[];
  };
}

// 获取模型列表
export const getModels = async (): Promise<ModelsResponse> => {
  return request.get("/app/models");
};

// 获取图片列表
export const getImages = async (
  page: number = 1,
  pageSize: number = 30,
): Promise<ImagesResponse> => {
  return request.get("/app/images", { params: { page, pageSize } });
};

// 上传图片
export const uploadImage = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData();

  formData.append("file", file);

  return request.post("/app/images/upload", formData);
};

// 文本生成图片
export const textToImage = async (
  prompt: string,
  imageUrl?: string,
  sessionId?: string,
): Promise<TextToImageResponse> => {
  return request.post("/app/textToimageNew", {
    prompt,
    stream: false,
    imageUrl: imageUrl || undefined,
    session_id: sessionId || undefined,
  });
};

// 新的图片生成接口（调用真实后端接口）
export interface GenerateImagePayload {
  prompt: string;
  size: string;
  skuCode: string;
  modelValue?: string;
}

export const generateImage = async (
  payload: GenerateImagePayload,
): Promise<GenerateImageResponse> => {
  const { modelValue, ...requestPayload } = payload;
  const modelConfig = resolveGptImageModelConfig(modelValue);

  return request.post("/app/text-to-image", {
    ...requestPayload,
    model: modelConfig.textToImageModel,
    billingModelKey: FIXED_BILLING_MODEL_KEY,
  });
};

// 图生图响应类型（新格式）
export interface ImageToImageResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    recordId: number;
    sessionId: string;
    thirdPartyUrl: string;
    thirdPartyResponse: {
      id: string;
      object: string;
      created: number;
      model: string;
      choices: Array<{
        index: number;
        message: {
          role: string;
          content: string; // markdown格式的内容，包含图片URL
        };
        finish_reason: string;
      }>;
      usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
        prompt_tokens_details?: {
          text_tokens: number;
        };
        completion_tokens_details?: {
          content_tokens: number;
        };
      };
    };
    upload: {
      taskId: string;
      status: string;
      queryPath: string;
      ssePath?: string;
    };
  };
}

// 图生图接口
export interface ImageToImagePayload extends GenerateImagePayload {
  imageUrl: string[];
}

export const imageToImage = async (
  payload: ImageToImagePayload,
): Promise<ImageToImageResponse> => {
  const { modelValue, ...requestPayload } = payload;
  const modelConfig = resolveGptImageModelConfig(modelValue);

  return request.post("/app/image-to-image", {
    ...requestPayload,
    model: modelConfig.imageToImageModel,
    billingModelKey: FIXED_BILLING_MODEL_KEY,
  });
};

// Banana 系列图片生成响应类型
export interface BananaCreateImageResponse {
  code?: number;
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    upload: {
      taskId: string;
      status: string;
      queryPath: string;
      ssePath?: string;
    };
    cosUrl?: string;
    thirdPartyResponse: object;
  };
}

// Banana 任务状态查询响应类型
export interface BananaQueryImageResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    taskId: string;
    status: string;
    cosUrl?: string;
    previewUrl?: string;
  };
}

// text-to-image 任务状态查询响应类型
export interface TextToImageTaskResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    taskId: string;
    status: string;
    cosUrl?: string;
    previewUrl?: string;
  };
}

/**
 * Nano Banana 系列图片生成接口
 * @param model 模型 value（如 gemini-3.1-flash-image-preview）
 * @param prompt 提示词
 * @param aspectRatio 图片比例（如 "1:1"、"16:9"）
 * @param imageSize 当前选中的 SKU 值（如 1K、2K）
 * @param type 生成类型：text-to-image 或 image-to-image
 * @param imageUrls 参考图片URL数组（仅 image-to-image 时需要）
 * @param skuId 选中 SKU 的 ID（有选中 SKU 时传）
 */
export const bananaCreateImage = async (
  model: string,
  prompt: string,
  aspectRatio: string,
  imageSize: string,
  type: "text-to-image" | "image-to-image",
  idempotencyKey: string,
  imageUrls?: string[],
  skuId?: number | string,
): Promise<BananaCreateImageResponse> => {
  return request.post("/app/banana-CreateImage", {
    model,
    prompt,
    aspectRatio,
    imageSize,
    type,
    idempotencyKey,
    ...(imageUrls && imageUrls.length > 0 ? { imageUrls } : {}),
    ...(skuId !== undefined && skuId !== null && `${skuId}`.trim()
      ? { skuId }
      : {}),
  });
};

/**
 * Banana 任务状态查询接口
 * @param queryPath 创建接口返回的 data.upload.queryPath
 */
export const bananaQueryImage = async (
  queryPath: string,
): Promise<BananaQueryImageResponse> => {
  return request.get(queryPath);
};

/**
 * Banana 任务 SSE 订阅接口
 * @param ssePath 创建接口返回的 data.upload.ssePath
 * @param token 登录令牌
 * @param onEvent SSE 回调
 */
export const bananaSubscribeTask = (
  ssePath: string,
  token: string,
  onEvent: (eventName: string, data: unknown) => void,
) => {
  const controller = new AbortController();
  const promise = fetchEventSource(buildApiRequestUrl(ssePath), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal: controller.signal,
    openWhenHidden: true,
    onmessage(event) {
      if (!event.data) return;
      const eventName = event.event || "task_status";

      try {
        const parsedData = JSON.parse(event.data);

        onEvent(eventName, parsedData);
      } catch (error) {
        console.error("解析 SSE 数据失败:", error);
      }
    },
    onerror(error) {
      throw error;
    },
  });

  return {
    stop: () => controller.abort(),
    promise,
  };
};

/**
 * text-to-image 任务状态查询接口
 * @param taskId 创建接口返回的 data.upload.taskId
 */
export const queryTextToImageTask = async (
  taskId: string,
): Promise<TextToImageTaskResponse> => {
  return request.get(`/app/text-to-image/tasks/${taskId}`);
};
