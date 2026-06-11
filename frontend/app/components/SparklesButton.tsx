"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";

export default function SparklesButton({
  children,
  onClick,
  className = "",
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();

    for (let i = 0; i < 8; i++) {
      const sparkle = document.createElement("div");
      sparkle.innerHTML = `<svg viewBox="0 0 24 24" fill="none" class="w-4 h-4" style="color:#7EC850"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" fill="currentColor"/></svg>`;
      sparkle.className = "fixed pointer-events-none z-50";
      document.body.appendChild(sparkle);

      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2;

      gsap.set(sparkle, { x: startX, y: startY, scale: 0, opacity: 1 });

      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 60;

      gsap.to(sparkle, {
        x: startX + Math.cos(angle) * distance,
        y: startY + Math.sin(angle) * distance,
        scale: Math.random() * 1.5 + 0.5,
        opacity: 0,
        rotation: Math.random() * 180,
        duration: 0.6 + Math.random() * 0.4,
        ease: "power2.out",
        onComplete: () => sparkle.remove(),
      });
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      className={`relative overflow-hidden group ${className}`}
    >
      <span className="relative z-10 block">{children}</span>
    </button>
  );
}
