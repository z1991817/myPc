import React from "react";
import NextLink from "next/link";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { Logo, TwitterIcon, GithubIcon, DiscordIcon } from "@/components/icons";

/**
 * 底部 Footer 组件
 * 统一的页脚，包含品牌信息、导航链接、订阅表单和社交媒体链接
 */
const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-[#030712] px-4 pb-10 pt-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="col-span-1">
            <NextLink className="mb-6 inline-flex items-center gap-3" href="/">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20">
                <Logo size={22} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                ArtImg Pro
              </span>
            </NextLink>
            <p className="text-sm leading-7 text-slate-400">
              面向创意团队的 AI
              图像工作台，帮助你更快完成提案视觉、商品主图和角色概念图。
            </p>
          </div>

          <div>
            <h5 className="mb-6 font-bold text-white">产品</h5>
            <ul className="space-y-4 text-sm text-slate-400">
              <li>
                <Link
                  as={NextLink}
                  className="text-slate-400 transition-colors hover:text-blue-400"
                  href="/createNew"
                >
                  文字生图
                </Link>
              </li>
              <li>
                <Link
                  as={NextLink}
                  className="text-slate-400 transition-colors hover:text-blue-400"
                  href="/createNew"
                >
                  风格重绘
                </Link>
              </li>
              <li>
                <Link
                  as={NextLink}
                  className="text-slate-400 transition-colors hover:text-blue-400"
                  href="/gallery"
                >
                  创作画廊
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-400 transition-colors hover:text-blue-400"
                  href="#pricing"
                >
                  定价方案
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-6 font-bold text-white">公司</h5>
            <ul className="space-y-4 text-sm text-slate-400">
              <li>
                <Link
                  className="text-slate-400 transition-colors hover:text-blue-400"
                  href="#"
                >
                  关于我们
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-400 transition-colors hover:text-blue-400"
                  href="#"
                >
                  博客
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-400 transition-colors hover:text-blue-400"
                  href="#"
                >
                  服务条款
                </Link>
              </li>
              <li>
                <Link
                  className="text-slate-400 transition-colors hover:text-blue-400"
                  href="#"
                >
                  隐私政策
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-6 font-bold text-white">订阅更新</h5>
            <p className="mb-4 text-sm leading-7 text-slate-400">
              获取最新的 AI 功能更新和创意工作流内容。
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                classNames={{
                  inputWrapper:
                    "border border-white/10 bg-white/5 shadow-none data-[hover=true]:border-white/20 group-data-[focus=true]:border-blue-500",
                  input: "text-sm text-white placeholder:text-slate-500",
                }}
                placeholder="邮箱地址"
                type="email"
              />
              <Button className="bg-blue-500 px-5 font-semibold text-white hover:bg-blue-600">
                订阅
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <Link
                isExternal
                aria-label="Twitter"
                className="text-slate-500 transition-colors hover:text-white"
                href="https://twitter.com"
              >
                <TwitterIcon size={20} />
              </Link>
              <Link
                isExternal
                aria-label="GitHub"
                className="text-slate-500 transition-colors hover:text-white"
                href="https://github.com"
              >
                <GithubIcon size={20} />
              </Link>
              <Link
                isExternal
                aria-label="Discord"
                className="text-slate-500 transition-colors hover:text-white"
                href="https://discord.com"
              >
                <DiscordIcon size={20} />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center text-xs text-slate-600">
          <p>© 2026 ArtImg Pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
