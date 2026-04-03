import React from "react";
import NextLink from "next/link";
import { Link } from "@heroui/link";

/**
 * 底部 Footer 组件
 * 统一的页脚，包含品牌信息、导航链接和联系方式
 */
const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-[#030712] px-4 pb-10 pt-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="col-span-1">
            <NextLink className="mb-6 inline-flex items-center gap-3" href="/">
              <div className="flex ">
                <img
                  alt="ArtImg logo candidate"
                  className="h-11 w-11 rounded-2xl"
                  src="/image/artimg-icon.svg"
                />
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
                  图片生图
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
            <h5 className="mb-6 font-bold text-white">联系客服</h5>
            <ul className="space-y-4 text-sm text-slate-400">
              <li>QQ:377584613</li>
            </ul>
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
