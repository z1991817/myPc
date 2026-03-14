import request from "./request";

// 登录请求参数
export interface LoginParams {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  user?: any;
}

// 登录接口
export const login = (data: LoginParams): Promise<LoginResponse> => {
  return request.post("/app/login", data);
};
