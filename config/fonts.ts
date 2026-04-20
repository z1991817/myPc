/**
 * 字体配置
 * 注意：原来使用 next/font/google（Inter + Fira_Code），在中国大陆 Google CDN 被屏蔽，
 * 导致字体加载超时（3~11秒），严重拖慢首屏。
 * 改为使用系统字体栈，彻底消除字体网络请求。
 */

// 用系统字体栈模拟 Inter / sans-serif
export const fontSans = {
  variable: "--font-sans",
  style: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif",
  },
};

// 用系统等宽字体栈模拟 Fira Code / monospace
export const fontMono = {
  variable: "--font-mono",
  style: {
    fontFamily:
      "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
  },
};
