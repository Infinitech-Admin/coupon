"use client";

import type React from "react";
import type { Employee } from "../types/coupon";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Calendar, Users, Ticket, Plus, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/cards";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const CouponGenerator: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchEmployees();
    // Set current month and year as default
    const now = new Date();

    setSelectedMonth((now.getMonth() + 1).toString());
    setSelectedYear(now.getFullYear().toString());
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employees`,
      );

      setEmployees(response.data);
    } catch (error) {
      toast.error("Failed to fetch employees");
      console.error(error);
    }
  };

  const generateCoupons = async () => {
    if (!selectedEmployee || !selectedMonth || !selectedYear) {
      toast.error("Please select employee, month, and year");

      return;
    }

    setIsGenerating(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/coupons/generate`,
        {
          employee_id: Number.parseInt(selectedEmployee),
          month: Number.parseInt(selectedMonth),
          year: Number.parseInt(selectedYear),
        },
      );

      toast.success(`Generated ${response.data.count} coupons successfully!`);
      // Clear selection after successful generation
      setSelectedEmployee("");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to generate coupons";

      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateForAllEmployees = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Please select month and year");

      return;
    }

    setIsGenerating(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/coupons/generate-all`,
        {
          month: Number.parseInt(selectedMonth),
          year: Number.parseInt(selectedYear),
        },
      );

      toast.success(
        `Generated coupons for all employees! Total: ${response.data.total_coupons}`,
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to generate coupons for all employees";

      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);

  const getSelectedEmployeeName = () => {
    const employee = employees.find(
      (e) => e.id.toString() === selectedEmployee,
    );

    return employee ? `${employee.first_name} ${employee.last_name}` : "";
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Generate Monthly Coupons
        </CardTitle>
        <CardDescription>
          Generate 22 weekday meal coupons for employees (Monday to Friday only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Selection Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              className="text-sm font-medium text-gray-700"
              htmlFor="month"
            >
              Month
            </Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                {months.map((month) => (
                  <SelectItem
                    key={month.value}
                    className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer px-3 py-2"
                    value={month.value}
                  >
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700" htmlFor="year">
              Year
            </Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                {years.map((year) => (
                  <SelectItem
                    key={year}
                    className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer px-3 py-2"
                    value={year.toString()}
                  >
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Employee Selection */}
        <div className="space-y-2">
          <Label
            className="text-sm font-medium text-gray-700"
            htmlFor="employee"
          >
            Select Employee
          </Label>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900 min-h-[44px]">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Choose an employee to generate coupons for" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-[300px] overflow-y-auto">
              {employees.map((employee) => (
                <SelectItem
                  key={employee.id}
                  className="text-gray-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer px-3 py-3 border-b border-gray-100 last:border-b-0"
                  value={employee.id.toString()}
                >
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 ml-6">
                      ID: {employee.employee_id} • {employee.department}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Selection Display */}
        {selectedEmployee && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                Selected Employee:
              </span>
              <span className="text-blue-800">{getSelectedEmployeeName()}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Individual Employee Generation */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Generate for Selected Employee
            </Label>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isGenerating || !selectedEmployee}
              size="lg"
              onClick={generateCoupons}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isGenerating
                ? "Generating..."
                : "Generate Coupons for Selected Employee"}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          {/* All Employees Generation */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Generate for All Employees
            </Label>
            <Button
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isGenerating}
              size="lg"
              variant="outline"
              onClick={generateForAllEmployees}
            >
              <Users className="h-4 w-4 mr-2" />
              {isGenerating
                ? "Generating..."
                : "Generate Coupons for All Employees"}
            </Button>
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-green-900">
                Generation Details
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>
                  • Generates exactly 22 coupons per employee for weekdays only
                </li>
                <li>• Each coupon includes a unique scannable barcode</li>
                <li>• Workday codes are automatically generated</li>
                <li>• Existing coupons for the same month will be skipped</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Current Selection Summary */}
        {(selectedMonth || selectedYear) && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Current Selection:
            </h4>
            <div className="text-sm text-gray-700 space-y-1">
              {selectedMonth && selectedYear && (
                <p>
                  <strong className="text-gray-900">Period:</strong>{" "}
                  {months.find((m) => m.value === selectedMonth)?.label}{" "}
                  {selectedYear}
                </p>
              )}
              {selectedEmployee && (
                <p>
                  <strong className="text-gray-900">Employee:</strong>{" "}
                  {getSelectedEmployeeName()} (
                  {
                    employees.find((e) => e.id.toString() === selectedEmployee)
                      ?.employee_id
                  }
                  )
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CouponGenerator;
