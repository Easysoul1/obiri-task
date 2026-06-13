import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AssignDepartmentDto } from './dto/assign-department.dto';
import { Department } from '../departments/department.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const existing = await this.employeeRepository.findOneBy({ email: dto.email });
    if (existing) {
      throw new ConflictException(`Employee with email "${dto.email}" already exists`);
    }
    if (dto.departmentId) {
      const dept = await this.departmentRepository.findOneBy({ id: dto.departmentId });
      if (!dept) {
        throw new NotFoundException(`Department with ID "${dto.departmentId}" not found`);
      }
    }
    const employee = this.employeeRepository.create(dto);
    return this.employeeRepository.save(employee);
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({ relations: ['department', 'leaveRequests'] });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['department', 'leaveRequests'],
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID "${id}" not found`);
    }
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);
    if (dto.email && dto.email !== employee.email) {
      const existing = await this.employeeRepository.findOneBy({ email: dto.email });
      if (existing) {
        throw new ConflictException(`Employee with email "${dto.email}" already exists`);
      }
    }
    if (dto.departmentId) {
      const dept = await this.departmentRepository.findOneBy({ id: dto.departmentId });
      if (!dept) {
        throw new NotFoundException(`Department with ID "${dto.departmentId}" not found`);
      }
    }
    Object.assign(employee, dto);
    return this.employeeRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    await this.employeeRepository.remove(employee);
  }

  async assignDepartment(id: string, dto: AssignDepartmentDto): Promise<Employee> {
    const employee = await this.findOne(id);
    const dept = await this.departmentRepository.findOneBy({ id: dto.departmentId });
    if (!dept) {
      throw new NotFoundException(`Department with ID "${dto.departmentId}" not found`);
    }
    employee.departmentId = dto.departmentId;
    employee.department = dept;
    return this.employeeRepository.save(employee);
  }
}
