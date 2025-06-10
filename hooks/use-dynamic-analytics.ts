"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface DynamicDepartmentStats {
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
    employee_id: number;
  };
  monthlyData: Array<{
    month: string;
    generated: number;
    claimed: number;
    expired: number;
  }>;
  lastUpdated: string;
}

export interface DynamicDepartmentComparison {
  departments: DynamicDepartmentStats[];
  totalStats: {
    totalDepartments: number;
    bestPerforming: string;
    worstPerforming: string;
    averageClaimRate: number;
    totalEmployees: number;
    totalCoupons: number;
  };
  lastUpdated: string;
}

export function useDynamicAnalytics() {
  const [data, setData] = useState<DynamicDepartmentComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchDepartmentData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(
        `${apiUrl}/api/analytics/departments-dynamic`,
        {
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch department data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Real-time data fetching
  const startRealTimeUpdates = useCallback(
    (intervalMs = 30000) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        fetchDepartmentData(false); // Don't show loading for background updates
      }, intervalMs);
    },
    [fetchDepartmentData],
  );

  const stopRealTimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  // Initialize data and start real-time updates
  useEffect(() => {
    fetchDepartmentData();
    startRealTimeUpdates();

    return () => {
      stopRealTimeUpdates();
    };
  }, [fetchDepartmentData, startRealTimeUpdates, stopRealTimeUpdates]);

  // Listen for visibility changes to pause/resume updates
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopRealTimeUpdates();
      } else {
        startRealTimeUpdates();
        fetchDepartmentData(false); // Refresh data when tab becomes visible
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startRealTimeUpdates, stopRealTimeUpdates, fetchDepartmentData]);

  const refreshData = useCallback(() => {
    fetchDepartmentData(true);
  }, [fetchDepartmentData]);

  const getDepartmentTrend = useCallback(
    (department: string) => {
      if (!data) return null;
      const dept = data.departments.find((d) => d.department === department);
      return dept
        ? {
            trend: dept.trend,
            percentage: dept.trendPercentage,
            direction:
              dept.trend === "up" ? "↗️" : dept.trend === "down" ? "↘️" : "➡️",
          }
        : null;
    },
    [data],
  );

  const getTopPerformingDepartment = useCallback(() => {
    if (!data || data.departments.length === 0) return null;
    return data.departments.reduce((prev, current) =>
      prev.claimRate > current.claimRate ? prev : current,
    );
  }, [data]);

  const getLowPerformingDepartments = useCallback(
    (threshold = 70) => {
      if (!data) return [];
      return data.departments.filter((dept) => dept.claimRate < threshold);
    },
    [data],
  );

  return {
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
  };
}
