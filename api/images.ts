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
    };
  };
}

import request from "./request";

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
export const generateImage = async (
  prompt: string,
  size: string,
): Promise<GenerateImageResponse> => {
  return request.post("/app/text-to-image", { prompt, size });
};

// 图生图接口
export const imageToImage = async (
  prompt: string,
  imageUrl: string[],
  size?: string,
): Promise<GenerateImageResponse> => {
  return request.post("/app/image-to-image", { prompt, imageUrl, size });
};
