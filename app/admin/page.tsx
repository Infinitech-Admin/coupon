"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { User, RefreshCw, BarChart3, Building2, Zap } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { DynamicNotificationCenter } from "@/components/dynamic-notification-center";
import { DynamicDepartmentAnalytics } from "@/components/dynamic-department-analytics";

interface AnalyticsData {
  overview: {
    totalCoupons: number;
    claimedCoupons: number;
    expiredCoupons: number;
    activeCoupons: number;
    claimRate: number;
    expirationRate: number;
  };
  dailyStats: Array<{
    date: string;
    generated: number;
    claimed: number;
    expired: number;
  }>;
  employeeStats: Array<{
    id: number;
    name: string;
    department: string;
    email: string;
    totalCoupons: number;
    claimedCoupons: number;
    claimRate: number;
    lastClaimed: string | null;
  }>;
}

interface EmployeeStats {
  employee_id: number;
  first_name: string;
  last_name: string;
  department: string;
  email: string;
  total_coupons: number;
  total_claimed: number;
  total_unclaimed: number;
  last_claimed: string | null;
}

export default function Home() {
  // Analytics state and fetch
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [errorAnalytics, setErrorAnalytics] = useState<string | null>(null);
  const [refreshingAnalytics, setRefreshingAnalytics] = useState(false);

  // Employees state and fetch
  const [employees, setEmployees] = useState<EmployeeStats[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [errorEmployees, setErrorEmployees] = useState<string | null>(null);
  const [refreshingEmployees, setRefreshingEmployees] = useState(false);

  // Common UI state
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [liveMode, setLiveMode] = useState(true);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    setErrorAnalytics(null);
    try {
      const fromDate = selectedDateRange?.from
        ? selectedDateRange.from.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      const toDate = selectedDateRange?.to
        ? selectedDateRange.to.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      const params = new URLSearchParams({
        from: fromDate,
        to: toDate,
        live: liveMode.toString(),
      });
      if (selectedEmployee !== "all") {
        params.append("employee", selectedEmployee);
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(
        `${apiUrl}/api/analytics/live?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          mode: "cors",
        },
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API error: ${res.status} - ${errText}`);
      }

      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      setErrorAnalytics(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      setAnalytics(null);
    } finally {
      setLoadingAnalytics(false);
      setRefreshingAnalytics(false);
    }
  }, [selectedDateRange, selectedEmployee, liveMode]);

  // Fetch top performing employees
  const fetchTopEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    setErrorEmployees(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(
        `${apiUrl}/api/top-performing-employees?live=${liveMode}`,
        {
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        },
      );
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API error: ${res.status} - ${errText}`);
      }
      const data: EmployeeStats[] = await res.json();
      setEmployees(data);
    } catch (err) {
      setErrorEmployees(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
      setRefreshingEmployees(false);
    }
  }, [liveMode]);

  // Auto-refresh in live mode
  useEffect(() => {
    if (liveMode) {
      const interval = setInterval(() => {
        fetchAnalytics();
        fetchTopEmployees();
      }, 15000); // Refresh every 15 seconds in live mode

      return () => clearInterval(interval);
    }
  }, [liveMode, fetchAnalytics, fetchTopEmployees]);

  // Initial fetch and on dependency changes
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchTopEmployees();
  }, [fetchTopEmployees]);

  // Refresh handlers
  const refreshAnalyticsData = () => {
    setRefreshingAnalytics(true);
    fetchAnalytics();
  };

  const refreshEmployeesData = () => {
    setRefreshingEmployees(true);
    fetchTopEmployees();
  };

  // Formatters
  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return "Not claimed";

    let dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return "Invalid date";

    // Add 8 hours in milliseconds (8 * 60 * 60 * 1000)
    dateObj = new Date(dateObj.getTime() + 8 * 60 * 60 * 1000);

    return new Intl.DateTimeFormat("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(dateObj);
  };

  if (
    (loadingAnalytics && !analytics) ||
    (loadingEmployees && !employees.length)
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading live dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            Dynamic Meal Coupon Analytics
            {liveMode && (
              <Zap className="h-6 w-6 text-yellow-500 animate-pulse" />
            )}
          </h1>
          <p className="text-muted-foreground">
            Real-time tracking and analysis of coupon usage patterns
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <DynamicNotificationCenter />
          <Button
            onClick={() => setLiveMode(!liveMode)}
            variant={liveMode ? "default" : "outline"}
            size="sm"
          >
            <Zap
              className={`h-4 w-4 mr-2 ${liveMode ? "animate-pulse" : ""}`}
            />
            {liveMode ? "Live Mode" : "Static Mode"}
          </Button>
          <Button
            onClick={refreshAnalyticsData}
            disabled={refreshingAnalytics}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshingAnalytics ? "animate-spin" : ""}`}
            />
            Refresh Analytics
          </Button>
          <Button
            onClick={refreshEmployeesData}
            disabled={refreshingEmployees}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshingEmployees ? "animate-spin" : ""}`}
            />
            Refresh Employees
          </Button>
        </div>
      </div>

      {/* Error Messages */}
      {errorAnalytics && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          Error loading analytics: {errorAnalytics}
        </div>
      )}
      {errorEmployees && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          Error loading employees: {errorEmployees}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee Filter</CardTitle>
            <CardDescription>Filter by employee</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedEmployee}
              onValueChange={setSelectedEmployee}
              aria-label="Select employee"
            >
              <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900 min-h-[44px]">
                <div className="flex items-center gap-2">
                  <User  className="h-4 w-4 text-gray-500" />
                  <SelectValue placeholder="Select employee" />
                </div>
              </SelectTrigger>

              <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-[300px] overflow-y-auto text-gray-900">
                <SelectItem
                  value="all"
                  className="px-3 py-3 border-b border-gray-100 cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                >
                  All Employees
                </SelectItem>

                {employees.map((emp) => (
                  <SelectItem
                    key={emp.employee_id}
                    value={emp.employee_id.toString()}
                    className="px-3 py-3 border-b border-gray-100 cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center gap-2">
                        <User  className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">
                          {emp.first_name} {emp.last_name}
                        </span>
                        {liveMode && (
                          <div className="h-1 w-1 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Live Overview Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>Total Coupons</CardTitle>
              <CardDescription>Total coupons generated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {analytics.overview.totalCoupons}
              </div>
              {liveMode && (
                <div className="absolute top-2 right-2 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>Claimed Coupons</CardTitle>
              <CardDescription>Coupons claimed by employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {analytics.overview.claimedCoupons}
              </div>
              {liveMode && (
                <div className="absolute top-2 right-2 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>Expired Coupons</CardTitle>
              <CardDescription>Coupons that expired</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {analytics.overview.expiredCoupons}
              </div>
              {liveMode && (
                <div className="absolute top-2 right-2 h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
              )}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>Active Coupons</CardTitle>
              <CardDescription>Coupons still valid</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {analytics.overview.activeCoupons}
              </div>
              {liveMode && (
                <div className="absolute top-2 right-2 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Tabs with Live Indicators */}
      <Tabs defaultValue="daily" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily" aria-label="Daily stats tab">
            <BarChart3 className="h-4 w-4 mr-2" />
            Daily Stats
            {liveMode && (
              <div className="ml-2 h-1 w-1 bg-green-500 rounded-full animate-pulse" />
            )}
          </TabsTrigger>
          <TabsTrigger value="employees" aria-label="Employee stats tab">
            <User  className="h-4 w-4 mr-2" />
            Employee Stats
            {liveMode && (
              <div className="ml-2 h-1 w-1 bg-blue-500 rounded-full animate-pulse" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="departments"
            aria-label="Department analytics tab"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Live Departments
            {liveMode && (
              <div className="ml-2 h-1 w-1 bg-purple-500 rounded-full animate-pulse" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4">
          {analytics ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Daily Statistics
                  {liveMode && (
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </CardTitle>
                <CardDescription>
                  {liveMode
                    ? "Real-time daily coupon statistics"
                    : "Static daily coupon statistics"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={analytics.dailyStats}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="generated"
                      stackId="a"
                      fill="#4F46E5"
                      name="Generated"
                    />
                    <Bar
                      dataKey="claimed"
                      stackId="a"
                      fill="#10B981"
                      name="Claimed"
                    />
                    <Bar
                      dataKey="expired"
                      stackId="a"
                      fill="#EF4444"
                      name="Expired"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <p>No daily stats available</p>
          )}
        </TabsContent>

        <TabsContent value="employees" className="mt-4">
          {employees.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Employee Performance
                  {liveMode && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </CardTitle>
                <CardDescription>
                  {liveMode
                    ? "Live employee coupon usage statistics"
                    : "Employee coupon usage statistics"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-gray-200">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 px-3 py-2">
                          Employee
                        </th>
                        <th className="border border-gray-300 px-3 py-2">
                          Department
                        </th>
                        <th className="border border-gray-300 px-3 py-2">
                          Total Coupons
                        </th>
                        <th className="border border-gray-300 px -3 py-2">
                          Claimed
                        </th>
                        <th className="border border-gray-300 px-3 py-2">
                          Claim Rate
                        </th>
                        <th className="border border-gray-300 px-3 py-2">
                          Last Claimed
                        </th>
                        {liveMode && (
                          <th className="border border-gray-300 px-3 py-2">
                            Status
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr
                          key={emp.employee_id}
                          className="even:bg-gray-50 hover:bg-blue-50 transition-colors"
                        >
                          <td className="border border-gray-300 px-3 py-2">{`${emp.first_name} ${emp.last_name}`}</td>
                          <td className="border border-gray-300 px-3 py-2">
                            {emp.department}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {emp.total_coupons}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {emp.total_claimed}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span>
                                {(
                                  (emp.total_claimed / emp.total_coupons) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                              {liveMode && (
                                <div
                                  className={`h-2 w-2 rounded-full ${
                                    (emp.total_claimed / emp.total_coupons) *
                                      100 >
                                    80
                                      ? "bg-green-500"
                                      : (emp.total_claimed /
                                            emp.total_coupons) *
                                            100 >
                                          60
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                  } animate-pulse`}
                                />
                              )}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {formatDateTime(emp.last_claimed)}
                          </td>
                          {liveMode && (
                            <td className="border border-gray-300 px-3 py-2">
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-xs text-green-600">
                                  Live
                                </span>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <p>No employee data available</p>
          )}
        </TabsContent>

        <TabsContent value="departments" className="mt-4">
          <DynamicDepartmentAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}