import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/router";

import { login, register } from "@/api/auth";
import { useUserStore } from "@/store/useUserStore";

/** LoginModal 组件 Props */
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** 表单模式 */
type FormMode = "login" | "register";

/**
 * 登录/注册弹窗组件
 * 支持登录和注册切换，使用 HeroUI Modal
 */
export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { setToken, setUser } = useUserStore();
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // 验证码倒计时
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 清除倒计时定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 重置表单状态
  const resetForm = () => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setEmail("");
    setEmailCode("");
    setError("");
    setIsLoading(false);
    // 清除倒计时
    setCountdown(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // 关闭弹窗并重置
  const handleClose = () => {
    resetForm();
    setMode("login");
    onClose();
  };

  // 切换模式
  const toggleMode = () => {
    resetForm();
    setMode((prev) => (prev === "login" ? "register" : "login"));
  };

  // 发送验证码
  const handleSendCode = useCallback(() => {
    if (!email || countdown > 0) return;

    // 简单邮箱格式校验
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("请输入有效的邮箱地址");

      return;
    }

    setError("");
    addToast({ title: "验证码已发送", color: "success" });
    // 开始 60 秒倒计时
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);

          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  }, [email, countdown]);

  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 注册时校验
    if (mode === "register") {
      if (password !== confirmPassword) {
        setError("两次输入的密码不一致");

        return;
      }
      if (!email || !emailCode) {
        setError("请填写邮箱和验证码");

        return;
      }
    }

    setIsLoading(true);

    try {
      const apiCall = mode === "login" ? login : register;
      const params =
        mode === "login"
          ? { username, password }
          : { username, password, email, code: emailCode };
      const res = await apiCall(params as any);

      setToken(res.data.token);
      setUser(
        res.data.user ?? {
          username,
          name: username,
        },
      );
      // 注册成功 toast 提示
      if (!isLogin) {
        addToast({ title: "注册成功", color: "success" });
      }
      handleClose();
      // 跳转首页
      router.push("/");
    } catch (err: any) {
      const defaultMsg =
        mode === "login"
          ? "登录失败，请检查用户名和密码"
          : "注册失败，请稍后重试";

      setError(err.response?.data?.message || defaultMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const isLogin = mode === "login";
  // 邮箱格式校验
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: "bg-[#0f1629] border border-white/10 text-white",
        header: "border-b border-white/10",
        closeButton: "text-white/60 hover:text-white hover:bg-white/10",
      }}
      isOpen={isOpen}
      placement="center"
      shouldBlockScroll={false}
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center">
          <h2 className="text-xl font-bold bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] bg-clip-text text-transparent">
            artImg Pro
          </h2>
          <p className="text-sm text-white/60 font-normal">
            {isLogin ? "登录您的账户" : "创建新账户"}
          </p>
        </ModalHeader>

        <ModalBody className="pb-6">
          {/* 新用户奖励横幅 - 仅注册时显示 */}
          {!isLogin && (
            <>
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 p-4">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-amber-500/30 blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-6 -ml-6 h-24 w-24 rounded-full bg-orange-500/20 blur-3xl" />
                <div className="relative flex items-center gap-3">
                  <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/40">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <rect height="4" rx="1" width="18" x="3" y="8" />
                      <path d="M12 8v13" />
                      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                    </svg>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900">
                      新用户奖励
                    </span>
                    <p className="text-sm font-bold text-white mt-1">
                      获得 20 免费点数
                    </p>
                  </div>
                </div>
              </div>
              <Divider className="bg-white/10" />
            </>
          )}

          {/* 表单 */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              isRequired
              autoComplete="username"
              classNames={{
                input: "text-white",
                label: "text-white/70",
                inputWrapper:
                  "border-white/20 hover:border-white/40 group-data-[focus=true]:border-[#4F46E5]",
              }}
              label="用户名"
              placeholder="请输入用户名"
              value={username}
              variant="bordered"
              onValueChange={setUsername}
            />

            <Input
              isRequired
              autoComplete={isLogin ? "current-password" : "new-password"}
              classNames={{
                input: "text-white",
                label: "text-white/70",
                inputWrapper:
                  "border-white/20 hover:border-white/40 group-data-[focus=true]:border-[#4F46E5]",
              }}
              label="密码"
              placeholder="请输入密码"
              type="password"
              value={password}
              variant="bordered"
              onValueChange={setPassword}
            />

            {/* 注册时显示确认密码 */}
            {!isLogin && (
              <Input
                isRequired
                autoComplete="new-password"
                classNames={{
                  input: "text-white",
                  label: "text-white/70",
                  inputWrapper:
                    "border-white/20 hover:border-white/40 group-data-[focus=true]:border-[#4F46E5]",
                }}
                label="确认密码"
                placeholder="请再次输入密码"
                type="password"
                value={confirmPassword}
                variant="bordered"
                onValueChange={setConfirmPassword}
              />
            )}

            {/* 注册时显示邮箱 */}
            {!isLogin && (
              <Input
                isRequired
                autoComplete="email"
                classNames={{
                  input: "text-white",
                  label: "text-white/70",
                  inputWrapper:
                    "border-white/20 hover:border-white/40 group-data-[focus=true]:border-[#4F46E5]",
                }}
                endContent={
                  <Button
                    className={`min-w-[90px] ${
                      isEmailValid && countdown === 0
                        ? "bg-primary text-white"
                        : "text-white/40 bg-transparent"
                    }`}
                    isDisabled={!isEmailValid || countdown > 0}
                    size="sm"
                    variant={
                      isEmailValid && countdown === 0 ? "solid" : "light"
                    }
                    onPress={handleSendCode}
                  >
                    {countdown > 0 ? `${countdown}s` : "发送验证码"}
                  </Button>
                }
                label="邮箱"
                placeholder="请输入邮箱地址"
                type="email"
                value={email}
                variant="bordered"
                onValueChange={setEmail}
              />
            )}

            {/* 注册时显示验证码 */}
            {!isLogin && (
              <Input
                isRequired
                classNames={{
                  input: "text-white",
                  label: "text-white/70",
                  inputWrapper:
                    "border-white/20 hover:border-white/40 group-data-[focus=true]:border-[#4F46E5]",
                }}
                label="验证码"
                placeholder="请输入验证码"
                value={emailCode}
                variant="bordered"
                onValueChange={setEmailCode}
              />
            )}

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <Button
              className="bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white font-semibold"
              isDisabled={
                !username ||
                !password ||
                (!isLogin && (!confirmPassword || !email || !emailCode))
              }
              isLoading={isLoading}
              size="lg"
              type="submit"
            >
              {isLogin ? "登录" : "注册"}
            </Button>
          </form>

          {/* 切换登录/注册 */}
          <div className="text-center text-sm text-white/60">
            {isLogin ? "还没有账户？" : "已有账户？"}
            <Link
              className="text-sm cursor-pointer ml-1"
              color="primary"
              onPress={toggleMode}
            >
              {isLogin ? "立即注册" : "返回登录"}
            </Link>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
