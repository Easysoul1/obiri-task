export interface Department {
  id: string;
  name: string;
  description: string | null;
  employees?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  description?: string;
}
