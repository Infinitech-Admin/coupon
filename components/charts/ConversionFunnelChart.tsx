"use client";

import { useEffect, useState } from "react";
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

interface ConversionFunnelChartProps {
  className?: string;
}

interface StageData {
  name: string;
  count: number;
  color: string;
}

interface ConversionRatesResponse {
  inquiryToAppointment: number;
  inquiries?: number;
  appointments?: number;
}

export default function ConversionFunnelChart({
  className,
}: ConversionFunnelChartProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ stages: StageData[] }>({
    stages: [
      {
        name: "Website Visitors",
        count: 1000,
        color: "rgba(79, 70, 229, 0.8)",
      },
      { name: "Property Views", count: 650, color: "rgba(99, 102, 241, 0.8)" },
      { name: "Inquiries", count: 320, color: "rgba(129, 140, 248, 0.8)" },
      { name: "Appointments", count: 180, color: "rgba(165, 180, 252, 0.8)" },
    ],
  });
  const [conversionRates, setConversionRates] = useState<any[]>([]);

  useEffect(() => {
    // Calculate initial conversion rates from the default data
    const initialRates = data.stages
      .map((stage, index) => {
        if (index === 0) return null;
        const prevStage = data.stages[index - 1];
        const rate =
          prevStage.count > 0
            ? ((stage.count / prevStage.count) * 100).toFixed(1)
            : "0.0";

        return {
          from: prevStage.name,
          to: stage.name,
          rate: `${rate}%`,
          rawCount: `${stage.count}/${prevStage.count}`,
        };
      })
      .filter(Boolean);

    setConversionRates(initialRates);

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Use the Next.js API route we created to proxy the request to Laravel
        const response = await fetch("/api/conversion-rates");

        if (!response.ok) {
          const errorText = await response.text();

          console.error("API Error Response:", errorText);
          throw new Error(
            `API error: ${response.status} ${response.statusText}`,
          );
        }

        const responseData: ConversionRatesResponse = await response.json();

        console.log("API Response:", responseData);

        // Get actual counts from the API response
        const inquiries = responseData.inquiries || 0;
        const appointments = responseData.appointments || 0;

        // Get the conversion rate directly from the API
        // Make sure it's treated as a number
        const inquiryToAppointment =
          Number.parseFloat(responseData.inquiryToAppointment as any) || 0;

        console.log("Parsed values:", {
          inquiries,
          appointments,
          inquiryToAppointment,
        });

        // Only update the chart if we have valid data
        if (inquiries > 0) {
          // Calculate other funnel stages based on the actual data
          const visitors = Math.round(inquiries * (100 / 32)); // Assuming ~32% of visitors make inquiries
          const propertyViews = Math.round(visitors * 0.65); // Assuming ~65% of visitors view properties

          // Create the stages array with actual data from the API
          const stagesData: StageData[] = [
            {
              name: "Website Visitors",
              count: visitors,
              color: "rgba(79, 70, 229, 0.8)",
            },
            {
              name: "Property Views",
              count: propertyViews,
              color: "rgba(99, 102, 241, 0.8)",
            },
            {
              name: "Inquiries",
              count: inquiries,
              color: "rgba(129, 140, 248, 0.8)",
            },
            {
              name: "Appointments",
              count: appointments,
              color: "rgba(165, 180, 252, 0.8)",
            },
          ];

          setData({ stages: stagesData });

          // Calculate conversion rates between each stage using actual data
          const rates = stagesData
            .map((stage, index) => {
              if (index === 0) return null;
              const prevStage = stagesData[index - 1];

              // For the specific conversion from inquiries to appointments,
              // use the value from the API if available
              let rate: string;

              if (
                stage.name === "Appointments" &&
                prevStage.name === "Inquiries" &&
                inquiryToAppointment > 0
              ) {
                rate = inquiryToAppointment.toFixed(1);
                console.log("Using API conversion rate:", rate);
              } else {
                // Otherwise calculate it
                rate =
                  prevStage.count > 0
                    ? ((stage.count / prevStage.count) * 100).toFixed(1)
                    : "0.0";
              }

              return {
                from: prevStage.name,
                to: stage.name,
                rate: `${rate}%`,
                rawCount: `${stage.count}/${prevStage.count}`,
              };
            })
            .filter(Boolean);

          setConversionRates(rates);
        }
      } catch (err) {
        console.error("Error fetching conversion data:", err);
        setError(
          "Failed to load conversion data from API. Using default data instead.",
        );
        // We'll keep using the default data that was set in useState
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: data.stages.map((stage) => stage.name),
    datasets: [
      {
        label: "Count",
        data: data.stages.map((stage) => stage.count),
        backgroundColor: data.stages.map((stage) => stage.color),
        borderColor: data.stages.map((stage) =>
          stage.color.replace("0.8", "1"),
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count",
        },
      },
      y: {
        title: {
          display: true,
          text: "Stage",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const index = context.dataIndex;
            const prevValue = index > 0 ? data.stages[index - 1].count : null;

            let label = `Count: ${value}`;

            if (prevValue !== null) {
              const conversionRate =
                prevValue > 0 ? ((value / prevValue) * 100).toFixed(1) : "0.0";

              label += ` | Conversion: ${conversionRate}%`;
            }

            return label;
          },
        },
      },
    },
  };

  return (
    <div
      className={`${className} w-full px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden`}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
        </div>
      )}

      {/* Error state - now shows as a small banner instead of replacing the chart */}
      {error && !isLoading && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          <p>{error}</p>
        </div>
      )}

      {/* Chart Container */}
      {!isLoading && data.stages.length > 0 && (
        <div className="w-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
          <Bar data={chartData} options={options} />
        </div>
      )}

      {/* Conversion Cards */}
      {!isLoading && conversionRates.length > 0 && (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {conversionRates.map((conversion, index) => (
            <Card
              key={index}
              className="w-full p-5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-lg shadow-md"
            >
              <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">
                {conversion.from} → {conversion.to}
              </div>
              <div className="text-2xl font-bold text-indigo-800 dark:text-indigo-200 break-words">
                {conversion.rate}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {conversion.rawCount}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Bottom Padding to prevent overflow cutoff */}
      <div className="h-12" />
    </div>
  );
}
