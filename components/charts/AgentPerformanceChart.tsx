"use client";

import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import { Card } from "@/components/ui/cards";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface AgentPerformanceChartProps {
  className?: string;
}

export default function AgentPerformanceChart({
  className,
}: AgentPerformanceChartProps) {
  // Mock data - in a real app, this would come from your API
  const [data] = useState({
    agents: [
      { name: "Jane Smith", sales: 24, appointments: 36 },
      { name: "John Doe", sales: 18, appointments: 29 },
      { name: "Alice Johnson", sales: 15, appointments: 22 },
      { name: "Robert Brown", sales: 12, appointments: 19 },
      { name: "Emily Davis", sales: 10, appointments: 17 },
    ],
  });

  const chartData = {
    labels: data.agents.map((agent) => agent.name),
    datasets: [
      {
        label: "Sales",
        data: data.agents.map((agent) => agent.sales),
        backgroundColor: "rgba(79, 70, 229, 0.8)",
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 1,
      },
      {
        label: "Appointments",
        data: data.agents.map((agent) => agent.appointments),
        backgroundColor: "rgba(147, 51, 234, 0.5)",
        borderColor: "rgba(147, 51, 234, 0.8)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count",
        },
      },
      x: {
        title: {
          display: true,
          text: "Agent",
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
        text: "Agent Performance",
      },
    },
  };

  return (
    <Card className={`p-4 ${className}`}>
      <Bar data={chartData} options={options} />
    </Card>
  );
}
