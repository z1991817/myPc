import { useState } from "react";
import { useRouter } from "next/router";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";

import { login, refreshCurrentUser } from "@/api/auth";
import { useUserStore } from "@/store/useUserStore";

/**
 * 登录页面组件
 * 提供用户名和密码登录功能
 */
export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser } = useUserStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 处理登录提交
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await login({ username, password });

      setToken(res.data.token);
      setUser(
        res.data.user ?? {
          username,
          name: username,
        },
      );
      await refreshCurrentUser({
        silent: true,
        clearOnUnauthorized: false,
      });
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "登录失败，请检查用户名和密码");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="flex flex-col gap-1 px-8 pt-8 pb-4">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            artImg Pro
          </h1>
          <p className="text-sm text-gray-500 text-center mt-2">
            AI 图片处理工具
          </p>
        </CardHeader>

        <Divider />

        <CardBody className="px-8 py-6">
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <Input
              isRequired
              autoComplete="username"
              label="用户名"
              placeholder="请输入用户名"
              value={username}
              variant="bordered"
              onValueChange={setUsername}
            />

            <Input
              isRequired
              autoComplete="current-password"
              label="密码"
              placeholder="请输入密码"
              type="password"
              value={password}
              variant="bordered"
              onValueChange={setPassword}
            />

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              className="mt-2"
              color="primary"
              isDisabled={!username || !password}
              isLoading={isLoading}
              size="lg"
              type="submit"
            >
              登录
            </Button>
          </form>
        </CardBody>

        <CardFooter className="flex justify-center px-8 pb-8 pt-2">
          <p className="text-xs text-gray-500">
            © 2026 artImg Pro. 简单易用的图片处理工具
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
