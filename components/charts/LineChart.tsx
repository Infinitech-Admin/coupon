"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Chart,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartConfiguration,
} from "chart.js";

Chart.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface LineChartProps {
  className?: string;
}

interface InquiryData {
  label: string;
  count: number;
}

const LineChart: React.FC<LineChartProps> = ({ className = "" }) => {
  const lineChartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart<"line"> | null>(null);
  const [inquiryData, setInquiryData] = useState<InquiryData[]>([]);

  useEffect(() => {
    // Fetch monthly inquiries data from Laravel route
    fetch("/api/monthly-inquiries")
      .then((res) => res.json())
      .then((data: InquiryData[]) => {
        setInquiryData(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!lineChartRef.current || inquiryData.length === 0) return;

    const ctx = lineChartRef.current.getContext("2d");

    if (!ctx) return;

    // Destroy previous chart instance if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const labels = inquiryData.map((item) => item.label);
    const counts = inquiryData.map((item) => item.count);

    const config: ChartConfiguration<"line"> = {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Monthly Inquiries",
            data: counts,
            borderColor: "#4CAF50",
            backgroundColor: "rgba(76, 175, 80, 0.2)",
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Monthly User Inquiries",
          },
        },
      },
    };

    chartInstanceRef.current = new Chart(ctx, config);

    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [inquiryData]);

  return (
    <div className={`w-full h-64 md:h-96 ${className}`}>
      <canvas ref={lineChartRef} />
    </div>
  );
};

export default LineChart;
