import request from "./request";

/**
 * 画廊图片项接口
 */
export interface GalleryImageItem {
  id: number;
  cos_url: string;
  thumbnail_url?: string;
  thumbnailUrl?: string;
  preview_url?: string;
  previewUrl?: string;
  prompt: string;
  width: number;
  height: number;
  generation_type: "text-to-image" | "image-to-image";
  model: string;
  size: string;
}

/**
 * 分页信息接口
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * 画廊列表响应接口
 */
export interface GalleryResponse {
  code: number;
  message: string;
  data: {
    list: GalleryImageItem[];
    pagination: Pagination;
  };
}

/**
 * 获取画廊列表
 * @param page 页码
 * @param pageSize 每页数量
 */
export const getGalleryList = async (
  page: number = 1,
  pageSize: number = 20,
): Promise<GalleryResponse> => {
  return request.get("/app/gallery", {
    params: { page, pageSize },
  });
};
