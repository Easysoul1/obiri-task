export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  position: string | null;
  salary: number | null;
  departmentId: string | null;
  department?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  salary?: number;
  departmentId?: string;
}

export interface UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  salary?: number;
  departmentId?: string;
}

export interface AssignDepartmentDto {
  departmentId: string;
}
