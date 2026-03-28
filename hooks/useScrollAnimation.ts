import { useEffect, useRef, useState } from "react";

/**
 * 滚动动画 Hook
 * 当元素进入视口时触发动画
 *
 * @param threshold - 触发动画的阈值 (0-1)，默认 0.1
 * @param triggerOnce - 是否只触发一次，默认 true
 * @returns ref 和 isVisible 状态
 */
export function useScrollAnimation(
  threshold: number = 0.1,
  triggerOnce: boolean = true,
) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // 如果只触发一次，则在触发后断开观察
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px", // 提前 50px 触发
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, triggerOnce]);

  return { ref, isVisible };
}
