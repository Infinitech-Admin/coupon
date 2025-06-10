"use client";

import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";

import { Card } from "@/components/ui/cards";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

interface HeatMapChartProps {
  className?: string;
}

export default function HeatMapChart({ className }: HeatMapChartProps) {
  // Mock data - in a real app, this would come from your API
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Generate mock data
  const generateData = () => {
    const data = [];

    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        // Generate more activity during business hours (9-17) and weekdays (1-5)
        const isBusinessHour = hour >= 9 && hour <= 17;
        const isWeekday = day >= 1 && day <= 5;

        let baseValue = 0;

        if (isBusinessHour && isWeekday) {
          baseValue = Math.floor(Math.random() * 15) + 10; // 10-25 for business hours on weekdays
        } else if (isBusinessHour) {
          baseValue = Math.floor(Math.random() * 10) + 5; // 5-15 for business hours on weekends
        } else if (isWeekday) {
          baseValue = Math.floor(Math.random() * 5) + 1; // 1-6 for non-business hours on weekdays
        } else {
          baseValue = Math.floor(Math.random() * 3); // 0-3 for non-business hours on weekends
        }

        data.push({
          x: hour,
          y: day,
          r: baseValue * 1.5, // Scale for better visualization
          value: baseValue,
        });
      }
    }

    return data;
  };

  const [data] = useState(generateData());

  const chartData = {
    datasets: [
      {
        label: "Property Viewing Activity",
        data: data,
        backgroundColor: (context: any) => {
          const value = context.raw.value;

          // Color gradient based on value
          if (value > 20) return "rgba(79, 70, 229, 0.9)"; // High activity
          if (value > 15) return "rgba(79, 70, 229, 0.7)";
          if (value > 10) return "rgba(79, 70, 229, 0.5)";
          if (value > 5) return "rgba(79, 70, 229, 0.3)";

          return "rgba(79, 70, 229, 0.1)"; // Low activity
        },
        borderColor: "rgba(79, 70, 229, 0.8)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: 0,
        max: 23,
        ticks: {
          stepSize: 1,
          callback: (value: number) => {
            return `${value}:00`;
          },
        },
        title: {
          display: true,
          text: "Hour of Day",
        },
      },
      y: {
        min: 0,
        max: 6,
        ticks: {
          stepSize: 1,
          callback: (value: number) => {
            return days[value];
          },
        },
        title: {
          display: true,
          text: "Day of Week",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${days[context.raw.y]}, ${context.raw.x}:00: ${context.raw.value} views`;
          },
        },
      },
      legend: {
        display: false,
      },
    },
  };

  return (
    <Card className={`p-4 ${className}`}>
      <Scatter data={chartData} options={options as any} />
    </Card>
  );
}
