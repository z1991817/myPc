import { Link } from "@heroui/link";

import { Head } from "./head";

import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
  fullWidth = false,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Head />
      <Navbar />
      <main
        className={
          fullWidth
            ? "w-full flex-grow px-0 pt-5"
            : "container mx-auto max-w-7xl flex-grow px-6 pt-16"
        }
      >
        {children}
      </main>
      <footer className="bg-[#0a0a0a] pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand Info */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-[#3b82f6] to-[#a855f7] rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  artImg Pro
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                世界上最先进的 AI
                图像处理平台。赋能创作者超越像素的视野。
              </p>
            </div>

            {/* Links Group 1 */}
            <div>
              <h5 className="text-white font-bold mb-6">产品</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                <li>
                  <Link
                    className="hover:text-[#3b82f6] transition-colors"
                    href="#"
                  >
                    AI 放大
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-[#3b82f6] transition-colors"
                    href="#"
                  >
                    背景移除
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-[#3b82f6] transition-colors"
                    href="#"
                  >
                    降噪处理
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-[#3b82f6] transition-colors"
                    href="#"
                  >
                    价格
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links Group 2 */}
            <div>
              <h5 className="text-white font-bold mb-6">公司</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                <li>
                  <Link
                    className="hover:text-[#3b82f6] transition-colors"
                    href="#"
                  >
                    关于我们
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-[#3b82f6] transition-colors"
                    href="#"
                  >
                    招聘
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-[#3b82f6] transition-colors"
                    href="#"
                  >
                    博客
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-[#3b82f6] transition-colors"
                    href="#"
                  >
                    服务条款
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h5 className="text-white font-bold mb-6">订阅通讯</h5>
              <p className="text-slate-500 text-sm mb-4">
                获取最新的 AI 更新和创意技巧。
              </p>
              <div className="flex gap-2 mb-8">
                <input
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-[#3b82f6] text-white"
                  placeholder="邮箱地址"
                  type="email"
                />
                <button className="bg-[#3b82f6] px-4 py-2 rounded-lg text-white text-sm font-bold hover:bg-[#2563eb] transition-colors">
                  订阅
                </button>
              </div>
              {/* Social Icons */}
              <div className="flex gap-4">
                <Link
                  className="text-slate-500 hover:text-white transition-colors"
                  href="#"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </Link>
                <Link
                  className="text-slate-500 hover:text-white transition-colors"
                  href="#"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 text-center text-slate-600 text-xs">
            <p>© 2024 artImg Pro Technologies Inc. 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
