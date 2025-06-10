import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
  Input,
} from "@heroui/react";
import axios from "axios";
import { toast } from "react-hot-toast";

interface Employee {
  id?: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
}

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onUpdated: (updatedEmployee: Employee) => void;
  refreshData: () => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  employee,
  onUpdated,
  refreshData,
}) => {
  const [formData, setFormData] = useState<Employee>({
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    department: "",
  });

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    }
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!employee?.id) return;

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employee/${employee.id}`,
        formData,
      );

      onUpdated(response.data);
      refreshData();
      toast.success("Employee updated successfully!");
      onClose();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        "Update failed. Please check the inputs.";
      toast.error(msg);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Update Employee</ModalHeader>
        <ModalBody>
          <Input
            name="employee_id"
            label="Employee ID"
            value={formData.employee_id}
            onChange={handleChange}
          />
          <Input
            name="first_name"
            label="First Name"
            value={formData.first_name}
            onChange={handleChange}
          />
          <Input
            name="last_name"
            label="Last Name"
            value={formData.last_name}
            onChange={handleChange}
          />
          <Input
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            name="department"
            label="Department"
            value={formData.department}
            onChange={handleChange}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSubmit}>
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateModal;
