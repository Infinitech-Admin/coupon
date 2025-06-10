"use client";

import { useState, useEffect, useRef } from "react";

import { Card } from "@/components/ui/cards";

interface PropertyHeatMapProps {
  className?: string;
}

// Fix the TypeScript error by adding a proper interface for properties
interface Property {
  x: number;
  y: number;
  type: string;
}

export default function PropertyHeatMap({ className }: PropertyHeatMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement;

      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Draw map (simplified for demo)
    const drawMap = () => {
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw simplified map background
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw some roads
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 2;

      // Horizontal roads
      for (let i = 1; i < 5; i++) {
        const y = (canvas.height / 5) * i;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Vertical roads
      for (let i = 1; i < 5; i++) {
        const x = (canvas.width / 5) * i;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Generate property clusters
      const clusters = [
        { x: canvas.width * 0.2, y: canvas.height * 0.2, count: 15 },
        { x: canvas.width * 0.8, y: canvas.height * 0.3, count: 25 },
        { x: canvas.width * 0.5, y: canvas.height * 0.5, count: 40 },
        { x: canvas.width * 0.3, y: canvas.height * 0.7, count: 20 },
        { x: canvas.width * 0.7, y: canvas.height * 0.8, count: 30 },
      ];

      // Draw heat map
      clusters.forEach((cluster) => {
        const gradient = ctx.createRadialGradient(
          cluster.x,
          cluster.y,
          5,
          cluster.x,
          cluster.y,
          50 + cluster.count,
        );

        gradient.addColorStop(0, "rgba(79, 70, 229, 0.8)");
        gradient.addColorStop(0.5, "rgba(79, 70, 229, 0.4)");
        gradient.addColorStop(1, "rgba(79, 70, 229, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cluster.x, cluster.y, 50 + cluster.count, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw property markers
      const properties: Property[] = [];

      // Generate properties around clusters
      clusters.forEach((cluster) => {
        for (let i = 0; i < cluster.count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 40 + 10;

          properties.push({
            x: cluster.x + Math.cos(angle) * distance,
            y: cluster.y + Math.sin(angle) * distance,
            type: Math.random() > 0.7 ? "commercial" : "residential",
          });
        }
      });

      // Draw property markers
      properties.forEach((property) => {
        ctx.fillStyle = property.type === "commercial" ? "#9333ea" : "#4f46e5";
        ctx.beginPath();
        ctx.arc(property.x, property.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Add legend
      ctx.fillStyle = "#1f2937";
      ctx.font = "12px sans-serif";
      ctx.fillText("Property Density", 20, 20);

      // Legend gradient
      const legendGradient = ctx.createLinearGradient(20, 40, 120, 40);

      legendGradient.addColorStop(0, "rgba(79, 70, 229, 0.8)");
      legendGradient.addColorStop(0.5, "rgba(79, 70, 229, 0.4)");
      legendGradient.addColorStop(1, "rgba(79, 70, 229, 0.1)");

      ctx.fillStyle = legendGradient;
      ctx.fillRect(20, 30, 100, 10);

      ctx.fillStyle = "#1f2937";
      ctx.fillText("Low", 20, 55);
      ctx.fillText("High", 100, 55);

      // Property type legend
      ctx.fillStyle = "#4f46e5";
      ctx.beginPath();
      ctx.arc(20, 75, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1f2937";
      ctx.fillText("Residential", 30, 80);

      ctx.fillStyle = "#9333ea";
      ctx.beginPath();
      ctx.arc(20, 95, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1f2937";
      ctx.fillText("Commercial", 30, 100);
    };

    drawMap();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isLoading]);

  return (
    <Card className={`p-4 ${className} relative`}>
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : null}
      <canvas ref={canvasRef} className="w-full h-full" />
    </Card>
  );
}
