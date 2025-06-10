import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
} from "@heroui/react";
import axios from "axios";
import toast from "react-hot-toast";

interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
}

interface DeleteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onDeleted: (employeeId: string) => void;
}

const DeleteEmployeeModal: React.FC<DeleteEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
  onDeleted,
}) => {
  const [formData, setFormData] = useState<Employee | null>(null);

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    }
  }, [employee]);

  const handleDelete = async () => {
    if (!formData) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employee/${formData.employee_id}`,
      );

      toast.success("Employee deleted successfully!");
      onDeleted(formData.employee_id);
      onClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Delete failed:", error);
      toast.error("Failed to delete employee. Please try again.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Delete Employee</ModalHeader>
        <ModalBody>
          {formData ? (
            <>
              <p>
                Are you sure you want to delete employee{" "}
                <strong>
                  {formData.first_name} {formData.last_name}
                </strong>
                ?
              </p>
              <p>This action cannot be undone.</p>
            </>
          ) : (
            <p>Loading employee details...</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleDelete}>
            Confirm Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteEmployeeModal;
