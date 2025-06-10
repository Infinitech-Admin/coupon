"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { CalendarDays, TrendingUp, Clock } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

interface CouponTrendsProps {
  statistics: any;
}

export default function CouponTrends({ statistics }: CouponTrendsProps) {
  if (!statistics) return null;

  const dailyData = statistics.daily_claims || [];
  const monthlyData = statistics.monthly_trends || [];

  return (
    <div className="space-y-6">
      {/* Daily Claims Trend */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            Daily Claims Trend
          </CardTitle>
          <CardDescription>Coupon claims over the past 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer
              config={{
                claims: { label: "Claims", color: "#3b82f6" },
              }}
            >
              <ResponsiveContainer height="100%" width="100%">
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey="claims"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    stroke="#3b82f6"
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Peak: {Math.max(...dailyData.map((d: any) => d.claims))} claims
              </Badge>
              <Badge variant="outline">
                Average:{" "}
                {Math.round(
                  dailyData.reduce((sum: number, d: any) => sum + d.claims, 0) /
                    dailyData.length,
                )}{" "}
                claims/day
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Monthly Generation vs Claims
            </CardTitle>
            <CardDescription>
              Comparison of generated vs claimed coupons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ChartContainer
                config={{
                  generated: { label: "Generated", color: "#3b82f6" },
                  claimed: { label: "Claimed", color: "#10b981" },
                }}
              >
                <ResponsiveContainer height="100%" width="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      dataKey="generated"
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      stroke="#3b82f6"
                      strokeWidth={3}
                      type="monotone"
                    />
                    <Line
                      dataKey="claimed"
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      stroke="#10b981"
                      strokeWidth={3}
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Claim Timing Analysis
            </CardTitle>
            <CardDescription>
              When employees typically claim their coupons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Same Day Claims</span>
                <Badge className="bg-blue-600">45%</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Advance Claims</span>
                <Badge className="bg-green-600">35%</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium">Last Minute Claims</span>
                <Badge className="bg-yellow-600">15%</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium">Expired Unclaimed</span>
                <Badge className="bg-red-600">5%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Insights */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Trend Insights
          </CardTitle>
          <CardDescription>Key patterns and observations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg">
              <h3 className="font-semibold mb-2">Peak Usage Days</h3>
              <p className="text-sm opacity-90">
                Monday & Friday show highest claim rates
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg">
              <h3 className="font-semibold mb-2">Best Performance</h3>
              <p className="text-sm opacity-90">
                85% usage rate achieved in March
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg">
              <h3 className="font-semibold mb-2">Growth Trend</h3>
              <p className="text-sm opacity-90">
                12% increase in monthly claims
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
