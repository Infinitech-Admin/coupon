"use client";

import { useState, useEffect, useCallback } from "react";
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

interface DepartmentStats {
  department: string;
  totalEmployees: number;
  totalCoupons: number;
  claimedCoupons: number;
  expiredCoupons: number;
  activeCoupons: number;
  claimRate: number;
  avgCouponsPerEmployee: number;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
  topPerformer: {
    name: string;
    claimRate: number;
  };
  monthlyData: Array<{
    month: string;
    generated: number;
    claimed: number;
    expired: number;
  }>;
}

interface DepartmentComparison {
  departments: DepartmentStats[];
  totalStats: {
    totalDepartments: number;
    bestPerforming: string;
    worstPerforming: string;
    averageClaimRate: number;
  };
}

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

export function DepartmentAnalytics() {
  const [data, setData] = useState<DepartmentComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const fetchDepartmentData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/api/analytics/departments`, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      // Mock data for demonstration
      setData({
        departments: [
          {
            department: "Engineering",
            totalEmployees: 45,
            totalCoupons: 450,
            claimedCoupons: 380,
            expiredCoupons: 50,
            activeCoupons: 20,
            claimRate: 84.4,
            avgCouponsPerEmployee: 10,
            trend: "up",
            trendPercentage: 12.5,
            topPerformer: { name: "John Doe", claimRate: 95.2 },
            monthlyData: [
              { month: "Jan", generated: 150, claimed: 125, expired: 20 },
              { month: "Feb", generated: 160, claimed: 140, expired: 15 },
              { month: "Mar", generated: 140, claimed: 115, expired: 15 },
            ],
          },
          {
            department: "Marketing",
            totalEmployees: 25,
            totalCoupons: 250,
            claimedCoupons: 180,
            expiredCoupons: 45,
            activeCoupons: 25,
            claimRate: 72.0,
            avgCouponsPerEmployee: 10,
            trend: "down",
            trendPercentage: -5.2,
            topPerformer: { name: "Jane Smith", claimRate: 88.9 },
            monthlyData: [
              { month: "Jan", generated: 85, claimed: 65, expired: 15 },
              { month: "Feb", generated: 90, claimed: 70, expired: 15 },
              { month: "Mar", generated: 75, claimed: 45, expired: 15 },
            ],
          },
          {
            department: "Sales",
            totalEmployees: 30,
            totalCoupons: 300,
            claimedCoupons: 240,
            expiredCoupons: 35,
            activeCoupons: 25,
            claimRate: 80.0,
            avgCouponsPerEmployee: 10,
            trend: "stable",
            trendPercentage: 1.2,
            topPerformer: { name: "Mike Johnson", claimRate: 92.1 },
            monthlyData: [
              { month: "Jan", generated: 100, claimed: 85, expired: 10 },
              { month: "Feb", generated: 105, claimed: 88, expired: 12 },
              { month: "Mar", generated: 95, claimed: 67, expired: 13 },
            ],
          },
          {
            department: "HR",
            totalEmployees: 12,
            totalCoupons: 120,
            claimedCoupons: 95,
            expiredCoupons: 15,
            activeCoupons: 10,
            claimRate: 79.2,
            avgCouponsPerEmployee: 10,
            trend: "up",
            trendPercentage: 8.3,
            topPerformer: { name: "Sarah Wilson", claimRate: 90.0 },
            monthlyData: [
              { month: "Jan", generated: 40, claimed: 32, expired: 5 },
              { month: "Feb", generated: 42, claimed: 35, expired: 5 },
              { month: "Mar", generated: 38, claimed: 28, expired: 5 },
            ],
          },
        ],
        totalStats: {
          totalDepartments: 4,
          bestPerforming: "Engineering",
          worstPerforming: "Marketing",
          averageClaimRate: 78.9,
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartmentData();
  }, [fetchDepartmentData]);

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

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin mr-2" />
        <span>Loading department analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Department Analytics</h2>
          <p className="text-muted-foreground">
            Compare coupon usage across departments
          </p>
        </div>
        <Button
          disabled={loading}
          variant="outline"
          onClick={fetchDepartmentData}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded">
          Using demo data: {error}
        </div>
      )}

      {/* Overview Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Departments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.totalStats.totalDepartments}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Best Performing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {data.totalStats.bestPerforming}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {data.totalStats.worstPerforming}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Average Claim Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.totalStats.averageClaimRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Department Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.departments.map((dept) => (
            <Card
              key={dept.department}
              className={`cursor-pointer transition-all ${
                selectedDepartments.includes(dept.department)
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "hover:shadow-md"
              }`}
              onClick={() => toggleDepartmentSelection(dept.department)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{dept.department}</CardTitle>
                    <CardDescription>
                      <Users className="h-4 w-4 inline mr-1" />
                      {dept.totalEmployees} employees
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        dept.trend === "up"
                          ? "default"
                          : dept.trend === "down"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {dept.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : dept.trend === "down" ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : (
                        <Target className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(dept.trendPercentage)}%
                    </Badge>
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
                    <div className="text-xs text-muted-foreground">Claimed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {dept.expiredCoupons}
                    </div>
                    <div className="text-xs text-muted-foreground">Expired</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {dept.activeCoupons}
                    </div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Top Performer
                  </div>
                  <div className="font-medium">{dept.topPerformer.name}</div>
                  <div className="text-sm text-green-600">
                    {Number(dept.topPerformer.claimRate).toFixed(1)}% claim rate
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      {data && (
        <Tabs className="mt-6" defaultValue="comparison">
          <TabsList>
            <TabsTrigger value="comparison">Department Comparison</TabsTrigger>
            <TabsTrigger value="distribution">Usage Distribution</TabsTrigger>
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          </TabsList>

          <TabsContent className="mt-4" value="comparison">
            <Card>
              <CardHeader>
                <CardTitle>Claim Rate Comparison</CardTitle>
                <CardDescription>
                  Compare claim rates across all departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer height={300} width="100%">
                  <BarChart data={getComparisonData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
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
                <CardTitle>Coupon Usage Distribution</CardTitle>
                <CardDescription>
                  Distribution of claimed coupons by department
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
                      label={({ name, percentage }) =>
                        `${name}: ${percentage.toFixed(1)}%`
                      }
                      labelLine={false}
                      outerRadius={80}
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
                      type="monotone"
                    />
                    <Line
                      dataKey="claimed"
                      name="Claimed"
                      stroke="#82ca9d"
                      type="monotone"
                    />
                    <Line
                      dataKey="expired"
                      name="Expired"
                      stroke="#ffc658"
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
