import request from "./request";
import { useUserStore, type UserProfile } from "@/store/useUserStore";

// 登录请求参数
export interface LoginParams {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    token: string;
    user?: UserProfile;
  };
}

// 登录接口
export const login = (data: LoginParams): Promise<LoginResponse> => {
  return request.post("/app/login", data);
};

// 注册请求参数
export interface RegisterParams {
  username: string;
  password: string;
  email: string;
  code: string;
}

// 注册接口
export const register = (data: RegisterParams): Promise<LoginResponse> => {
  return request.post("/app/register", data);
};

// 发送邮箱验证码
export const sendEmailCode = (email: string): Promise<void> => {
  return request.post("/app/send-code", { email });
};

export interface MeResponse {
  success: boolean;
  code: number;
  message?: string;
  data: UserProfile;
}

export const getMe = (): Promise<MeResponse> => {
  return request.get("/app/me");
};

export const refreshCurrentUser = async (
  options: {
    silent?: boolean;
    clearOnUnauthorized?: boolean;
  } = {},
): Promise<UserProfile | null> => {
  const { token, setUser, clearUser } = useUserStore.getState();

  if (!token) {
    return null;
  }

  try {
    const res = await getMe();

    if (res.success && res.code === 200 && res.data) {
      setUser(res.data);

      return res.data;
    }

    return null;
  } catch (error: any) {
    if (options.clearOnUnauthorized !== false && error?.response?.status === 401) {
      clearUser();
    }

    return null;
  }
};
