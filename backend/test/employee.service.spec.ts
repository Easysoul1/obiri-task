import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeService } from '../src/employees/employee.service';
import { Employee } from '../src/employees/employee.entity';
import { Department } from '../src/departments/department.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let empRepo: Repository<Employee>;
  let deptRepo: Repository<Department>;

  const mockDept: Department = {
    id: 'dept-1', name: 'Engineering', description: null,
    employees: [], createdAt: new Date(), updatedAt: new Date(),
  };

  const mockEmployee: Employee = {
    id: 'emp-1', firstName: 'Alice', lastName: 'Johnson',
    email: 'alice@obiri.com', phone: null, position: 'Developer',
    salary: 80000, departmentId: null, department: null,
    leaveRequests: [], approvals: [], createdAt: new Date(), updatedAt: new Date(),
  };

  const mockEmpRepo = {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockDeptRepo = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        { provide: getRepositoryToken(Employee), useValue: mockEmpRepo },
        { provide: getRepositoryToken(Department), useValue: mockDeptRepo },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    empRepo = module.get<Repository<Employee>>(getRepositoryToken(Employee));
    deptRepo = module.get<Repository<Department>>(getRepositoryToken(Department));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an employee', async () => {
      mockEmpRepo.findOneBy.mockResolvedValue(null);
      mockEmpRepo.create.mockReturnValue(mockEmployee);
      mockEmpRepo.save.mockResolvedValue(mockEmployee);

      const result = await service.create({
        firstName: 'Alice', lastName: 'Johnson',
        email: 'alice@obiri.com', position: 'Developer', salary: 80000,
      });
      expect(result.email).toBe('alice@obiri.com');
    });

    it('should throw ConflictException on duplicate email', async () => {
      mockEmpRepo.findOneBy.mockResolvedValue(mockEmployee);
      await expect(service.create({
        firstName: 'Bob', lastName: 'Smith', email: 'alice@obiri.com',
      })).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if department does not exist', async () => {
      mockEmpRepo.findOneBy.mockResolvedValue(null);
      mockDeptRepo.findOneBy.mockResolvedValue(null);
      await expect(service.create({
        firstName: 'Test', lastName: 'User', email: 'test@obiri.com',
        departmentId: 'nonexistent',
      })).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return an employee', async () => {
      mockEmpRepo.findOne.mockResolvedValue(mockEmployee);
      const result = await service.findOne('emp-1');
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException', async () => {
      mockEmpRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignDepartment', () => {
    it('should assign employee to department', async () => {
      mockEmpRepo.findOne.mockResolvedValue(mockEmployee);
      mockDeptRepo.findOneBy.mockResolvedValue(mockDept);
      mockEmpRepo.save.mockResolvedValue({ ...mockEmployee, departmentId: 'dept-1', department: mockDept });

      const result = await service.assignDepartment('emp-1', { departmentId: 'dept-1' });
      expect(result.departmentId).toBe('dept-1');
    });

    it('should throw NotFoundException for bad department', async () => {
      mockEmpRepo.findOne.mockResolvedValue(mockEmployee);
      mockDeptRepo.findOneBy.mockResolvedValue(null);
      await expect(service.assignDepartment('emp-1', { departmentId: 'bad' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an employee', async () => {
      mockEmpRepo.findOne.mockResolvedValue(mockEmployee);
      mockEmpRepo.remove.mockResolvedValue(mockEmployee);
      await expect(service.remove('emp-1')).resolves.toBeUndefined();
    });
  });
});
