// components/DotGrid.tsx
import { useRef, useEffect } from "react";

interface DotGridProps {
  dotColor?: string;
  gap?: number;
  dotSize?: number;
  glowRadius?: number;
}

export default function DotGrid({
  dotColor = "#7c3aed",
  gap = 28,
  dotSize = 1.5,
  glowRadius = 200,
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let W = 0, H = 0;

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const parent = canvas.parentElement;

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    parent?.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const cols = Math.ceil(W / gap);
      const rows = Math.ceil(H / gap);

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x = c * gap;
          const y = r * gap;
          const dx = x - mouse.current.x;
          const dy = y - mouse.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const intensity = Math.max(0, 1 - dist / glowRadius);
          const alpha = 0.1 + intensity * 0.7;
          const size = dotSize + intensity * 2;

          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle =
            dotColor + Math.floor(alpha * 255).toString(16).padStart(2, "0");
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      parent?.removeEventListener("mousemove", onMove);
    };
  }, [dotColor, gap, dotSize, glowRadius]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}