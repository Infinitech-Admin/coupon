"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  User,
  Search,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/cards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// Import your existing components
import EmployeeForm from "@/app/admin/employee/EmployeeForm";
import { format } from "date-fns";

interface EmployeeType {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
}

export default function EmployeePage() {
  const [employees, setEmployees] = useState<EmployeeType[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeType[]>([]);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<EmployeeType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteEmployee, setDeleteEmployee] = useState<EmployeeType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch employees
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employees`);
      const data = await response.json();

      if (response.ok) {
        setEmployees(data);
        setTotalItems(data.length);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch employees. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Failed to fetch employees. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(
      (employee) =>
        employee.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        employee.last_name?.toLowerCase().includes(search.toLowerCase()) ||
        employee.email?.toLowerCase().includes(search.toLowerCase()) ||
        employee.department?.toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredEmployees(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1);
  }, [search, employees]);

  const handleEmployeeFormSubmit = async (formData: FormData, isEdit = false) => {
    setIsLoading(true);
    try {
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${editEmployee?.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/employees`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        toast({
          title: isEdit ? "Success" : "Success",
          description: isEdit
            ? "Employee updated successfully!"
            : "Employee added successfully!",
        });
        isEdit ? setIsEditModalOpen(false) : setIsAddModalOpen(false);
        setEditEmployee(null);
        fetchEmployees();

        // Refresh window after successful submit
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: isEdit
            ? "Failed to update employee. Please try again."
            : "Failed to add employee. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting employee:", error);
      toast({
        title: "Error",
        description: isEdit
          ? "Failed to update employee. Please try again."
          : "Failed to add employee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete employee handler
  const handleDeleteEmployee = async () => {
    if (!deleteEmployee) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${deleteEmployee.id}`,
        {
          method: "DELETE",
        },
      );
      if (response.ok) {
        toast({
          title: "Success",
          description: "Employee deleted successfully!",
        });
        setIsDeleteDialogOpen(false);
        setDeleteEmployee(null);
        fetchEmployees();

        // Refresh window after successful delete
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete employee. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error",
        description: "Failed to delete employee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(totalItems / 5); // Assuming pageSize is 5
  const startIndex = (currentPage - 1) * 5; // Assuming pageSize is 5
  const endIndex = Math.min(startIndex + 5, totalItems); // Assuming pageSize is 5
  const currentItems = filteredEmployees.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }

      if (startPage > 2) {
        pages.push(-1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push(-2);
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <User  className="h-6 w-6 text-slate-700" />
            Employee Management
          </CardTitle>
          <CardDescription>
            Add and manage employees in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search by name, email, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full md:w-[300px]"
              />
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2 w-full md:w-auto"
            >
              <PlusCircle className="h-4 w-4" />
              Add Employee
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-slate-500">
              Loading employees...
            </div>
          ) : currentItems.length === 0 ? (
            <Alert variant="destructive" className="mt-10">
              <AlertDescription>No employees found.</AlertDescription>
            </Alert>
          ) : (
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Employee ID</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-center w-[140px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.employee_id}</TableCell>
                    <TableCell>{employee.first_name}</TableCell>
                    <TableCell>{employee.last_name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditEmployee(employee);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        Update
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setDeleteEmployee(employee);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>

              <div className="flex gap-1">
                {getPageNumbers().map((pageNum, idx) =>
                  pageNum < 0 ? (
                    <span key={idx} className="px-2 select-none">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={idx}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  ),
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new employee to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <EmployeeForm
              onSubmit={handleEmployeeFormSubmit}
              onClose={() => setIsAddModalOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setEditEmployee(null);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information below.
            </DialogDescription>
          </DialogHeader>
          {editEmployee && (
            <EmployeeForm
              defaultValues={editEmployee} // use defaultValues instead of employee
              onSubmit={(formData) => handleEmployeeFormSubmit(formData, true)}
              onClose={() => {
                setIsEditModalOpen(false);
                setEditEmployee(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete employee{" "}
              <strong>
                {deleteEmployee?.first_name} {deleteEmployee?.last_name}
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEmployee}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
