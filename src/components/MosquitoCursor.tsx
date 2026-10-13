import React, { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
  opacity: number;
}

export const MosquitoCursor: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isClicking, setIsClicking] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const posRef = useRef({ x: -100, y: -100 });
  const targetPosRef = useRef({ x: -100, y: -100 });
  const angleRef = useRef<number>(0);
  const targetAngleRef = useRef<number>(0);
  const trailRef = useRef<Point[]>([]);
  const cursorElementRef = useRef<HTMLDivElement>(null);
  const trailContainerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if device supports fine pointer (mouse/trackpad) and not touch-only
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const isTouchOnly = window.matchMedia('(pointer: coarse)').matches && !hasFinePointer;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || isTouchOnly) {
      // Deactivate completely on touchscreens and mobile
      setIsEnabled(false);
      return;
    }

    setIsEnabled(true);
    document.body.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      const newX = e.clientX;
      const newY = e.clientY;

      const dx = newX - targetPosRef.current.x;
      const dy = newY - targetPosRef.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 3 && !prefersReducedMotion) {
        // Calculate angle towards movement direction (forward heading is up: +90deg offset)
        const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        targetAngleRef.current = angleDeg;

        // Add small subtle trail dot if moving at speed
        if (dist > 8 && trailRef.current.length < 4) {
          trailRef.current.push({ x: newX, y: newY, opacity: 0.45 });
        }
      }

      targetPosRef.current = { x: newX, y: newY };
    };


    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    // Check if target is an interactive element
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive = Boolean(
        target.closest('button, a, input, select, textarea, [role="button"], .interactive')
      );
      setIsHovering(isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    // High performance 60fps render loop with lerp smoothing
    const updateCursor = () => {
      const kPos = 0.35; // Position smoothing
      const kAngle = 0.22; // Angle smoothing

      posRef.current.x += (targetPosRef.current.x - posRef.current.x) * kPos;
      posRef.current.y += (targetPosRef.current.y - posRef.current.y) * kPos;

      // Handle angular interpolation wrapping correctly
      let dAngle = (targetAngleRef.current - angleRef.current) % 360;
      if (dAngle > 180) dAngle -= 360;
      if (dAngle < -180) dAngle += 360;
      angleRef.current += dAngle * kAngle;

      if (cursorElementRef.current) {
        const x = posRef.current.x;
        const y = posRef.current.y;
        const angle = angleRef.current;

        cursorElementRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${angle}deg)`;
      }

      // Decay trail points
      if (trailContainerRef.current) {
        trailRef.current = trailRef.current
          .map((pt) => ({ ...pt, opacity: pt.opacity - 0.04 }))
          .filter((pt) => pt.opacity > 0);

        const dots = trailRef.current
          .map(
            (pt) =>
              `<div style="position:fixed; left:${pt.x}px; top:${pt.y}px; width:3px; height:3px; background:rgba(52,211,153,${pt.opacity}); border-radius:50%; pointer-events:none; transform:translate(-50%,-50%);"></div>`
          )
          .join('');
        trailContainerRef.current.innerHTML = dots;
      }

      animFrameRef.current = requestAnimationFrame(updateCursor);
    };

    animFrameRef.current = requestAnimationFrame(updateCursor);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      {/* Subtle trail particle container */}
      <div ref={trailContainerRef} className="fixed inset-0 pointer-events-none z-[9998]" />

      {/* Main Mosquito Cursor */}
      <div
        ref={cursorElementRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform transition-opacity duration-150 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        <div
          className={`relative transition-transform duration-150 ${
            isHovering ? 'scale-125' : isClicking ? 'scale-90' : 'scale-100'
          }`}
        >
          {/* Subtle targeting ring on interactive hover */}
          {isHovering && (
            <div className="absolute -inset-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 animate-ping pointer-events-none" />
          )}

          {/* Precision SVG Mosquito Silhouette */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
          >
            {/* Needle / Proboscis */}
            <line
              x1="12"
              y1="1"
              x2="12"
              y2="5"
              stroke="#34d399"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Mosquito Head */}
            <circle cx="12" cy="6" r="1.3" fill="#6ee7b7" />

            {/* Thorax */}
            <ellipse cx="12" cy="9.2" rx="1.6" ry="2.2" fill="#34d399" />

            {/* Slender Abdomen */}
            <path
              d="M12 11.4 C11.3 13, 11.2 16.5, 12 19 C12.8 16.5, 12.7 13, 12 11.4 Z"
              fill="#10b981"
              stroke="#059669"
              strokeWidth="0.5"
            />

            {/* Left Wing (Translucent with delicate venation) */}
            <path
              d="M11 8 C6 4, 3 8, 10 11 Z"
              fill="rgba(167, 243, 208, 0.45)"
              stroke="#6ee7b7"
              strokeWidth="0.6"
            />

            {/* Right Wing */}
            <path
              d="M13 8 C18 4, 21 8, 14 11 Z"
              fill="rgba(167, 243, 208, 0.45)"
              stroke="#6ee7b7"
              strokeWidth="0.6"
            />

            {/* Slender Forelegs */}
            <path
              d="M11 7 L7 5 M13 7 L17 5"
              stroke="#64748b"
              strokeWidth="0.75"
              strokeLinecap="round"
            />

            {/* Slender Middle Legs */}
            <path
              d="M10.8 9.2 L5 9.5 M13.2 9.2 L19 9.5"
              stroke="#64748b"
              strokeWidth="0.75"
              strokeLinecap="round"
            />

            {/* Slender Long Hindlegs */}
            <path
              d="M11 11.5 L6 16 M13 11.5 L18 16"
              stroke="#64748b"
              strokeWidth="0.75"
              strokeLinecap="round"
            />

            {/* Center targeting micro-dot */}
            <circle cx="12" cy="6" r="0.6" fill="#ffffff" />
          </svg>
        </div>
      </div>
    </>
  );
};
