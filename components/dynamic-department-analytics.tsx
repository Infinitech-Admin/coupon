"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  RefreshCw,
  Clock,
  Wifi,
  WifiOff,
  AlertCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useDynamicAnalytics } from "@/hooks/use-dynamic-analytics";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C7C",
];

export function DynamicDepartmentAnalytics() {
  const {
    data,
    loading,
    error,
    lastUpdated,
    refreshData,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    getDepartmentTrend,
    getTopPerformingDepartment,
    getLowPerformingDepartments,
  } = useDynamicAnalytics();

  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(30000); // 30 seconds

  // Handle real-time toggle
  useEffect(() => {
    if (realTimeEnabled) {
      startRealTimeUpdates(updateInterval);
    } else {
      stopRealTimeUpdates();
    }
  }, [
    realTimeEnabled,
    updateInterval,
    startRealTimeUpdates,
    stopRealTimeUpdates,
  ]);

  const toggleDepartmentSelection = (department: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((d) => d !== department)
        : [...prev, department],
    );
  };

  const getComparisonData = () => {
    if (!data) return [];

    return data.departments.map((dept) => ({
      department: dept.department,
      claimRate: dept.claimRate,
      totalCoupons: dept.totalCoupons,
      claimedCoupons: dept.claimedCoupons,
      employees: dept.totalEmployees,
      trend: dept.trendPercentage,
    }));
  };

  const getPieChartData = () => {
    if (!data) return [];

    return data.departments.map((dept) => ({
      name: dept.department,
      value: dept.claimedCoupons,
      percentage: dept.claimRate,
    }));
  };

  const getSelectedDepartmentData = () => {
    if (!data || selectedDepartments.length === 0) return [];

    return data.departments
      .filter((dept) => selectedDepartments.includes(dept.department))
      .map((dept) => dept.monthlyData)
      .reduce(
        (acc, monthlyData) => {
          monthlyData.forEach((month, index) => {
            if (!acc[index]) {
              acc[index] = {
                month: month.month,
                generated: 0,
                claimed: 0,
                expired: 0,
              };
            }
            acc[index].generated += month.generated;
            acc[index].claimed += month.claimed;
            acc[index].expired += month.expired;
          });

          return acc;
        },
        [] as Array<{
          month: string;
          generated: number;
          claimed: number;
          expired: number;
        }>,
      );
  };

  const topPerformer = getTopPerformingDepartment();
  const lowPerformers = getLowPerformingDepartments(75);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin mr-2" />
        <span>Loading live department analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-time Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Live Department Analytics</h2>
          <p className="text-muted-foreground">
            Real-time coupon usage across departments
          </p>
          {lastUpdated && (
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {realTimeEnabled ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">Paused</span>
              </div>
            )}
            <Switch
              checked={realTimeEnabled}
              id="real-time"
              onCheckedChange={setRealTimeEnabled}
            />
            <label className="text-sm" htmlFor="real-time">
              Real-time updates
            </label>
          </div>

          <Button
            disabled={loading}
            size="sm"
            variant="outline"
            onClick={refreshData}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>Connection issue: {error}. Showing cached data.</span>
        </div>
      )}

      {/* Real-time Alerts */}
      {lowPerformers.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Departments Need Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowPerformers.map((dept) => (
                <Badge
                  key={dept.department}
                  className="border-orange-400 text-orange-800"
                  variant="outline"
                >
                  {dept.department}: {dept.claimRate.toFixed(1)}%
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Overview Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Departments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.totalStats.totalDepartments}
              </div>
              <div className="absolute top-2 right-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Best Performing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {data.totalStats.bestPerforming}
              </div>
              {topPerformer && (
                <div className="text-xs text-muted-foreground">
                  {topPerformer.claimRate.toFixed(1)}% claim rate
                </div>
              )}
              <div className="absolute top-2 right-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {data.totalStats.worstPerforming}
              </div>
              <div className="text-xs text-muted-foreground">
                {lowPerformers.length} dept
                {lowPerformers.length !== 1 ? "s" : ""} below 75%
              </div>
              <div className="absolute top-2 right-2">
                <TrendingDown className="h-4 w-4 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Average Claim Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.totalStats.averageClaimRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {data.totalStats.totalEmployees} total employees
              </div>
              <div className="absolute top-2 right-2">
                <Target className="h-4 w-4 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interactive Department Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.departments.map((dept) => {
            const trend = getDepartmentTrend(dept.department);

            return (
              <Card
                key={dept.department}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedDepartments.includes(dept.department)
                    ? "ring-2 ring-blue-500 bg-blue-50 shadow-md"
                    : "hover:shadow-md hover:scale-[1.02]"
                }`}
                onClick={() => toggleDepartmentSelection(dept.department)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {dept.department}
                        {realTimeEnabled && (
                          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </CardTitle>
                      <CardDescription>
                        <Users className="h-4 w-4 inline mr-1" />
                        {dept.totalEmployees} employees
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {trend && (
                        <Badge
                          className="animate-pulse"
                          variant={
                            trend.trend === "up"
                              ? "default"
                              : trend.trend === "down"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {trend.trend === "up" ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : trend.trend === "down" ? (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          ) : (
                            <Target className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(trend.percentage)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Claim Rate</span>
                      <span className="font-medium">
                        {dept.claimRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress className="h-2" value={dept.claimRate} />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {dept.claimedCoupons}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Claimed
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {dept.expiredCoupons}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Expired
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {dept.activeCoupons}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Active
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Top Performer
                    </div>
                    <div className="font-medium">{dept.topPerformer.name}</div>
                    <div className="text-sm text-green-600">
                      {Number(dept.topPerformer.claimRate).toFixed(1)}% claim
                      rate
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Updated: {new Date(dept.lastUpdated).toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dynamic Charts */}
      {data && (
        <Tabs className="mt-6" defaultValue="comparison">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="comparison">Live Comparison</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="selected">
              Selected ({selectedDepartments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent className="mt-4" value="comparison">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Real-time Claim Rate Comparison
                  {realTimeEnabled && (
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </CardTitle>
                <CardDescription>
                  Live comparison of claim rates across all departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer height={300} width="100%">
                  <BarChart data={getComparisonData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value}${name === "claimRate" ? "%" : ""}`,
                        name === "claimRate" ? "Claim Rate" : name,
                      ]}
                    />
                    <Bar
                      dataKey="claimRate"
                      fill="#3B82F6"
                      name="Claim Rate %"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent className="mt-4" value="distribution">
            <Card>
              <CardHeader>
                <CardTitle>Live Usage Distribution</CardTitle>
                <CardDescription>
                  Real-time distribution of claimed coupons by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer height={300} width="100%">
                  <PieChart>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={getPieChartData()}
                      dataKey="value"
                      fill="#8884d8"
                      label={({ name, value }) => (value > 0 ? name : null)} // Show name only if value is greater than 0
                      labelLine={false}
                      outerRadius={90} // Increased outer radius for more space
                    >
                      {getPieChartData().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent className="mt-4" value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>
                  Track coupon generation and claiming trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer height={300} width="100%">
                  <LineChart data={data.departments[0]?.monthlyData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      dataKey="generated"
                      name="Generated"
                      stroke="#8884d8"
                      strokeWidth={2}
                      type="monotone"
                    />
                    <Line
                      dataKey="claimed"
                      name="Claimed"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      type="monotone"
                    />
                    <Line
                      dataKey="expired"
                      name="Expired"
                      stroke="#ffc658"
                      strokeWidth={2}
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent className="mt-4" value="selected">
            {selectedDepartments.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Departments Comparison</CardTitle>
                  <CardDescription>
                    Comparing {selectedDepartments.join(", ")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer height={300} width="100%">
                    <LineChart data={getSelectedDepartmentData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        dataKey="generated"
                        name="Generated"
                        stroke="#8884d8"
                        strokeWidth={2}
                        type="monotone"
                      />
                      <Line
                        dataKey="claimed"
                        name="Claimed"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        type="monotone"
                      />
                      <Line
                        dataKey="expired"
                        name="Expired"
                        stroke="#ffc658"
                        strokeWidth={2}
                        type="monotone"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Select departments to compare their trends
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click on department cards above to select them
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
