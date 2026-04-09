"use client";

import type { CSSProperties } from "react";

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
  const distance = 60 * amplitude;
  const duration = Math.max(8 / Math.max(speed, 0.1), 2.5);

  const [first, second, third] = [
    colorStops[0] || DEFAULT_STOPS[0],
    colorStops[1] || DEFAULT_STOPS[1],
    colorStops[2] || DEFAULT_STOPS[2],
  ];

  const blobs = [
    {
      color: first,
      className: "left-[-10%] top-[-8%] h-[34rem] w-[34rem]",
      distanceX: distance,
      distanceY: distance * 0.5,
      scale: 1 + 0.08 * amplitude,
      rotation: -10 * amplitude,
      animationName: "auroraFloatA",
    },
    {
      color: second,
      className: "right-[-6%] top-[8%] h-[32rem] w-[32rem]",
      distanceX: -distance * 0.8,
      distanceY: -distance * 0.7,
      scale: 1 + 0.08 * amplitude,
      rotation: -10 * amplitude,
      animationName: "auroraFloatB",
    },
    {
      color: third,
      className: "bottom-[-16%] left-[24%] h-[30rem] w-[30rem]",
      distanceX: distance,
      distanceY: distance * 0.5,
      scale: 1 + 0.08 * amplitude,
      rotation: 12 * amplitude,
      animationName: "auroraFloatC",
    },
  ];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{
        opacity: Math.min(Math.max(blend, 0.15), 1),
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_40%)]" />
      {blobs.map((blob, index) => (
        <div
          key={blob.color + index}
          className={`aurora-blob absolute rounded-full blur-[110px] md:blur-[140px] ${blob.className}`}
          style={
            {
              "--aurora-distance-x": `${blob.distanceX}px`,
              "--aurora-distance-y": `${blob.distanceY}px`,
              "--aurora-scale": `${blob.scale}`,
              "--aurora-rotate": `${blob.rotation}deg`,
              animation: `${blob.animationName} ${duration + index * 0.8}s ease-in-out ${index * 0.2}s infinite alternate`,
              background: `radial-gradient(circle, ${blob.color} 0%, transparent 68%)`,
              mixBlendMode: "screen",
              opacity: 0.78,
            } as CSSProperties
          }
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,0.08)_0%,rgba(3,7,18,0.24)_48%,rgba(3,7,18,0.56)_100%)]" />
      <style jsx>{`
        @keyframes auroraFloatA {
          from {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
          }
          to {
            transform: translate3d(
                var(--aurora-distance-x),
                var(--aurora-distance-y),
                0
              )
              scale(var(--aurora-scale)) rotate(var(--aurora-rotate));
          }
        }

        @keyframes auroraFloatB {
          from {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
          }
          to {
            transform: translate3d(
                var(--aurora-distance-x),
                var(--aurora-distance-y),
                0
              )
              scale(var(--aurora-scale)) rotate(var(--aurora-rotate));
          }
        }

        @keyframes auroraFloatC {
          from {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
          }
          to {
            transform: translate3d(
                var(--aurora-distance-x),
                var(--aurora-distance-y),
                0
              )
              scale(var(--aurora-scale)) rotate(var(--aurora-rotate));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .aurora-blob {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
