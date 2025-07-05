import { useEffect, useRef, useState } from "react";

export default function VoiceWaveform({ active = true }) {
  const canvasRef = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 200, height: 60 });

  const animationRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;

        if (container) {
          setDimensions({
            width: Math.min(300, container.clientWidth),

            height: 60,
          });
        }
      }
    };

    updateDimensions();

    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let bars = [];

    const barCount = 20;

    // Initialize bars

    for (let i = 0; i < barCount; i++) {
      bars.push({
        height: Math.random() * 40 + 5,

        targetHeight: Math.random() * 40 + 5,

        speed: Math.random() * 0.1 + 0.05,
      });
    }

    const animate = () => {
      if (!active) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update bars

      bars = bars.map((bar) => {
        if (Math.random() < 0.05) {
          bar.targetHeight = Math.random() * 40 + 5;
        }

        bar.height += (bar.targetHeight - bar.height) * bar.speed;

        return bar;
      });

      const barWidth = canvas.width / barCount;

      const centerY = canvas.height / 2;

      ctx.fillStyle = "#3b82f6";

      // Draw bars

      bars.forEach((bar, index) => {
        const x = index * barWidth + barWidth * 0.1;

        const width = barWidth * 0.8;

        const height = bar.height;

        ctx.fillRect(x, centerY - height / 2, width, height);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Set canvas size

    canvas.width = dimensions.width;

    canvas.height = dimensions.height;

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, active]);

  if (!active) return null;

  return (
    <div className="w-full flex justify-center py-2">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="rounded-md"
      />
    </div>
  );
}
