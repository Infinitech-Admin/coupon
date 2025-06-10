"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import {
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChartContainer } from "@/components/ui/chart";

interface UtilizationAnalysisProps {
  statistics: any;
}

export default function UtilizationAnalysis({
  statistics,
}: UtilizationAnalysisProps) {
  if (!statistics) return null;

  const utilizationData = [
    {
      name: "Current Usage",
      value: statistics.usage_rate,
      fill:
        statistics.usage_rate > 70
          ? "#10b981"
          : statistics.usage_rate > 50
            ? "#f59e0b"
            : "#ef4444",
    },
  ];

  const costAnalysis = {
    totalCost: statistics.total_coupons * 5, // Assuming $5 per coupon
    utilizedCost: statistics.claimed_coupons * 5,
    wastedCost: statistics.expired_coupons * 5,
  };

  const weekdayDistribution = [
    { day: "Monday", usage: 85, color: "#3b82f6" },
    { day: "Tuesday", usage: 72, color: "#10b981" },
    { day: "Wednesday", usage: 68, color: "#f59e0b" },
    { day: "Thursday", usage: 78, color: "#8b5cf6" },
    { day: "Friday", usage: 92, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      {/* Utilization Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Target vs Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Target: 80%</span>
                <span className="text-sm">
                  Actual: {statistics.usage_rate.toFixed(1)}%
                </span>
              </div>
              <Progress className="h-2" value={statistics.usage_rate} />
              <div className="flex items-center gap-1">
                {statistics.usage_rate >= 80 ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-yellow-500" />
                )}
                <span className="text-xs text-gray-600">
                  {statistics.usage_rate >= 80
                    ? "Target achieved"
                    : "Below target"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Avg. Claim Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3 days</div>
            <p className="text-xs text-gray-600">Before expiration</p>
            <Badge className="mt-2" variant="outline">
              Optimal: 1-3 days
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Efficiency Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(
                (statistics.usage_rate +
                  (100 -
                    (statistics.expired_coupons / statistics.total_coupons) *
                      100)) /
                  2,
              )}
            </div>
            <p className="text-xs text-gray-600">Out of 100</p>
            <Badge className="mt-2 bg-blue-600">
              {Math.round(
                (statistics.usage_rate +
                  (100 -
                    (statistics.expired_coupons / statistics.total_coupons) *
                      100)) /
                  2,
              ) > 75
                ? "Excellent"
                : "Good"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Cost Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${costAnalysis.utilizedCost.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">Value utilized</p>
            <p className="text-xs text-red-600 mt-1">
              ${costAnalysis.wastedCost.toLocaleString()} wasted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Utilization Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Overall Utilization
            </CardTitle>
            <CardDescription>Current system utilization rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ChartContainer
                config={{
                  usage: { label: "Usage Rate", color: "#3b82f6" },
                }}
              >
                <ResponsiveContainer height="100%" width="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    data={utilizationData}
                    innerRadius="60%"
                    outerRadius="90%"
                  >
                    <RadialBar
                      cornerRadius={10}
                      dataKey="value"
                      fill={utilizationData[0].fill}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="text-center mt-4">
              <div className="text-3xl font-bold">
                {statistics.usage_rate.toFixed(1)}%
              </div>
              <p className="text-gray-600">Current Utilization</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Weekday Usage Pattern
            </CardTitle>
            <CardDescription>
              Usage distribution across weekdays
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weekdayDistribution.map((day) => (
                <div key={day.day} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{day.day}</span>
                    <span className="text-sm text-gray-600">{day.usage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${day.usage}%`,
                        backgroundColor: day.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Analysis */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Cost Analysis</CardTitle>
          <CardDescription>
            Financial impact of coupon utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                ${costAnalysis.totalCost.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Total Investment</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                ${costAnalysis.utilizedCost.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Value Realized</p>
            </div>
            <div className="text-center p-6 bg-red-50 rounded-lg">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                ${costAnalysis.wastedCost.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Wasted Value</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Optimization Recommendations
          </CardTitle>
          <CardDescription>
            AI-powered suggestions to improve utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">
                Reminder System
              </h4>
              <p className="text-sm text-blue-700">
                Implement automated reminders 2 days before coupon expiration to
                reduce waste by an estimated 15%.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">
                Flexible Scheduling
              </h4>
              <p className="text-sm text-green-700">
                Allow weekend redemption for Friday coupons to increase
                utilization by 8-12%.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">
                Incentive Program
              </h4>
              <p className="text-sm text-purple-700">
                Reward employees with 90%+ usage rates to encourage consistent
                participation.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-2">
                Usage Analytics
              </h4>
              <p className="text-sm text-yellow-700">
                Share monthly usage reports with employees to increase awareness
                and participation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
