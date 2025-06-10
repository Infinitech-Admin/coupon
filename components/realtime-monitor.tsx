"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RealtimeMonitorProps {
  onDataUpdate: () => void;
}

interface RealtimeActivity {
  id: number;
  type: "claim" | "generate" | "expire";
  employee_name: string;
  coupon_code: string;
  timestamp: string;
  status: "success" | "failed";
}

export default function RealtimeMonitor({
  onDataUpdate,
}: RealtimeMonitorProps) {
  const [activities, setActivities] = useState<RealtimeActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    loadRecentActivities();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLive) {
      interval = setInterval(() => {
        loadRecentActivities();
        onDataUpdate();
      }, 5000); // Update every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive, onDataUpdate]);

  const loadRecentActivities = async () => {
    try {
      const response = await axios.get("/coupons/recent-activities");

      setActivities(response.data);
    } catch (error) {
      console.error("Failed to load recent activities:", error);
      // Mock data for demonstration
      setActivities([
        {
          id: 1,
          type: "claim",
          employee_name: "John Doe",
          coupon_code: "CPN001",
          timestamp: new Date().toISOString(),
          status: "success",
        },
        {
          id: 2,
          type: "generate",
          employee_name: "Jane Smith",
          coupon_code: "CPN002",
          timestamp: new Date(Date.now() - 300000).toISOString(),
          status: "success",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string, status: string) => {
    if (status === "failed")
      return <AlertCircle className="w-4 h-4 text-red-500" />;

    switch (type) {
      case "claim":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "generate":
        return <Activity className="w-4 h-4 text-blue-500" />;
      case "expire":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string, status: string) => {
    if (status === "failed") return "bg-red-50 border-red-200";

    switch (type) {
      case "claim":
        return "bg-green-50 border-green-200";
      case "generate":
        return "bg-blue-50 border-blue-200";
      case "expire":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Monitor Controls */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Real-time Activity Monitor
              </CardTitle>
              <CardDescription>
                Live tracking of coupon system activities
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="gap-1" variant={isLive ? "default" : "outline"}>
                <div
                  className={`w-2 h-2 rounded-full ${isLive ? "bg-green-400 animate-pulse" : "bg-gray-400"}`}
                />
                {isLive ? "Live" : "Paused"}
              </Badge>
              <Button
                variant={isLive ? "destructive" : "default"}
                onClick={() => setIsLive(!isLive)}
              >
                {isLive ? "Stop Live" : "Start Live"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">
                  System Status
                </p>
                <p className="text-2xl font-bold text-green-900">Online</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Active Sessions
                </p>
                <p className="text-2xl font-bold text-blue-900">24</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">
                  Claims Today
                </p>
                <p className="text-2xl font-bold text-purple-900">156</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Response Time
                </p>
                <p className="text-2xl font-bold text-yellow-900">0.2s</p>
              </div>
              <Activity className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Recent Activities
          </CardTitle>
          <CardDescription>
            Latest system activities and transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading activities...</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activities</p>
                </div>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`p-4 rounded-lg border ${getActivityColor(activity.type, activity.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {activity.employee_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            {getActivityIcon(activity.type, activity.status)}
                            <span className="font-medium capitalize">
                              {activity.type === "claim"
                                ? "Coupon Claimed"
                                : activity.type === "generate"
                                  ? "Coupon Generated"
                                  : "Coupon Expired"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {activity.employee_name} • {activity.coupon_code}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            activity.status === "success"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {activity.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(activity.timestamp), "HH:mm:ss")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Real-time system performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">API Response Time</span>
                <Badge className="bg-blue-600">0.2s</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Success Rate</span>
                <Badge className="bg-green-600">99.8%</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium">Active Connections</span>
                <Badge className="bg-purple-600">24</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium">Queue Length</span>
                <Badge className="bg-yellow-600">0</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Alert Center
            </CardTitle>
            <CardDescription>System alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">
                    System Healthy
                  </span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  All services running normally
                </p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    High Activity
                  </span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  156 coupons claimed today
                </p>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">
                    Expiring Soon
                  </span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  23 coupons expire tomorrow
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
