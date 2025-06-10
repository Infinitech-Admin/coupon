"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Chart,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartConfiguration,
} from "chart.js";

Chart.register(
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface BarChartProps {
  className?: string;
}

interface SignupData {
  label: string;
  count: number;
}

const BarChart: React.FC<BarChartProps> = ({ className = "" }) => {
  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart<"bar"> | null>(null);
  const [signupData, setSignupData] = useState<SignupData[]>([]);

  useEffect(() => {
    // Fetch monthly signups data from API
    fetch("/api/monthly-signups")
      .then((res) => res.json())
      .then((data: SignupData[]) => {
        setSignupData(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!barChartRef.current || signupData.length === 0) return;

    const barCtx = barChartRef.current.getContext("2d");

    if (!barCtx) return;

    // Destroy previous chart instance to avoid duplicates
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const labels = signupData.map((d) => d.label);
    const counts = signupData.map((d) => d.count);

    const config: ChartConfiguration<"bar"> = {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Monthly Signups",
            data: counts,
            backgroundColor: "#2196F3",
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
            text: "Monthly Subscriber Signups",
          },
        },
      },
    };

    chartInstanceRef.current = new Chart(barCtx, config);

    // Cleanup on unmount
    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [signupData]);

  return (
    <div className={`w-full h-64 md:h-96 ${className}`}>
      <canvas ref={barChartRef} />
    </div>
  );
};

export default BarChart;
