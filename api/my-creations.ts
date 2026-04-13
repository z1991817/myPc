import request from "./request";

/**
 * 我的创作图片项接口
 */
export interface MyCreationItem {
  id: number;
  cos_url: string;
  preview_url?: string;
  previewUrl?: string;
  prompt: string;
  width: number;
  height: number;
  generation_type: "text-to-image" | "image-to-image";
  model: string;
  size: string;
  created_at: string;
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
 * 我的创作列表响应接口
 */
export interface MyCreationsResponse {
  code: number;
  message: string;
  data: {
    list: MyCreationItem[];
    pagination: Pagination;
  };
}

/**
 * 删除创作响应接口
 */
export interface DeleteCreationResponse {
  code: number;
  message: string;
}

/**
 * 获取我的创作列表
 * @param page 页码
 * @param pageSize 每页数量
 */
export const getMyCreations = async (
  page: number = 1,
  pageSize: number = 12,
): Promise<MyCreationsResponse> => {
  return request.get("/app/my-creations", {
    params: { page, pageSize },
  });
};

/**
 * 删除创作
 * @param id 创作ID
 */
export const deleteCreation = async (
  id: number,
): Promise<DeleteCreationResponse> => {
  return request.delete(`/app/my-creations/${id}`);
};
