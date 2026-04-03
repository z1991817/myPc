import request from "./request";

/**
 * 测试接口响应类型
 */
export interface TestApiResponse {
  code?: number;
  message?: string;
  data?: unknown;
  [key: string]: unknown;
}

/**
 * 调用测试接口
 * @param timeout 请求超时时间，默认 10 分钟
 */
export const getTestApi = async (
  timeout: number = 600000,
): Promise<TestApiResponse> => {
  return request.get("/app/testApi", {
    timeout,
  });
};
