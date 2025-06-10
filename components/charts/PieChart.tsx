"use client";
import type React from "react";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AlertCircle } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Enhanced color palette
const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
];

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-md">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-sm">
          <span className="font-semibold">{payload[0].value}</span> properties
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {payload[0].payload.percentage}% of total
        </p>
      </div>
    );
  }

  return null;
};

const PieChartComponent: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const [pieData, setPieData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/property-status`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch property status data");
        }

        const data = await response.json();

        // Calculate total for percentages
        const total = data.forSale + data.forRent + (data.pending || 0);

        // Enhanced data with percentages
        const enhancedData = [
          {
            name: "For Sale",
            value: data.forSale,
            percentage: ((data.forSale / total) * 100).toFixed(1),
          },
          {
            name: "For Rent",
            value: data.forRent,
            percentage: ((data.forRent / total) * 100).toFixed(1),
          },
        ];

        // Add pending properties if they exist
        if (data.pending) {
          enhancedData.push({
            name: "Pending",
            value: data.pending,
            percentage: ((data.pending / total) * 100).toFixed(1),
          });
        }

        setPieData(enhancedData);
      } catch (error) {
        console.error("Error fetching property status data:", error);
        setError("Failed to load property distribution data");

        // Set fallback data for development/preview
        setPieData([
          { name: "For Sale", value: 65, percentage: "65.0" },
          { name: "For Rent", value: 35, percentage: "35.0" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <Skeleton className={`w-full h-[300px] ${className}`} />;
  }

  if (error) {
    return (
      <Alert className={`${className}`} variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`w-full h-[300px] ${className}`}>
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            data={pieData}
            dataKey="value"
            innerRadius={60}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            labelLine={false}
            outerRadius={90}
            paddingAngle={2}
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            align="center"
            formatter={(value, entry, index) => (
              <span className="text-sm font-medium">{value}</span>
            )}
            layout="horizontal"
            verticalAlign="bottom"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;
