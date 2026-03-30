"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

type AuroraProps = {
  colorStops?: [string, string, string] | string[];
  blend?: number;
  amplitude?: number;
  speed?: number;
  className?: string;
};

const DEFAULT_STOPS = ["#3B82F6", "#8B5CF6", "#22D3EE"];

export default function Aurora({
  colorStops = DEFAULT_STOPS,
  blend = 0.5,
  amplitude = 1,
  speed = 1,
  className = "",
}: AuroraProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const blobRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    const distance = 60 * amplitude;
    const duration = Math.max(8 / Math.max(speed, 0.1), 2.5);
    const ctx = gsap.context(() => {
      blobRefs.current.forEach((blob, index) => {
        if (!blob) return;

        gsap.set(blob, {
          transformOrigin: "50% 50%",
        });

        gsap.to(blob, {
          duration: duration + index * 0.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          x: index % 2 === 0 ? distance : -distance * 0.8,
          y: index === 1 ? -distance * 0.7 : distance * 0.5,
          scale: 1 + 0.08 * amplitude,
          rotation: index === 2 ? 12 * amplitude : -10 * amplitude,
        });
      });
    }, root);

    return () => ctx.revert();
  }, [amplitude, speed]);

  const [first, second, third] = [
    colorStops[0] || DEFAULT_STOPS[0],
    colorStops[1] || DEFAULT_STOPS[1],
    colorStops[2] || DEFAULT_STOPS[2],
  ];

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{
        opacity: Math.min(Math.max(blend, 0.15), 1),
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_40%)]" />
      {[
        {
          color: first,
          className: "left-[-10%] top-[-8%] h-[34rem] w-[34rem]",
        },
        {
          color: second,
          className: "right-[-6%] top-[8%] h-[32rem] w-[32rem]",
        },
        {
          color: third,
          className: "bottom-[-16%] left-[24%] h-[30rem] w-[30rem]",
        },
      ].map((blob, index) => (
        <div
          key={blob.color + index}
          ref={(node) => {
            blobRefs.current[index] = node;
          }}
          className={`absolute rounded-full blur-[110px] md:blur-[140px] ${blob.className}`}
          style={{
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 68%)`,
            mixBlendMode: "screen",
            opacity: 0.78,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,0.08)_0%,rgba(3,7,18,0.24)_48%,rgba(3,7,18,0.56)_100%)]" />
    </div>
  );
}
