import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequestService } from '../src/leave-requests/leave-request.service';
import { LeaveRequest, LeaveStatus } from '../src/leave-requests/leave-request.entity';
import { Employee } from '../src/employees/employee.entity';
import { Approval, ApprovalAction } from '../src/approval/approval.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('LeaveRequestService', () => {
  let service: LeaveRequestService;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 14);
  const futureEnd = new Date(futureDate);
  futureEnd.setDate(futureEnd.getDate() + 3);

  const createMockEmployee = (overrides: Partial<Employee> = {}): Employee => ({
    id: 'emp-1', firstName: 'Alice', lastName: 'Johnson',
    email: 'alice@obiri.com', phone: null, position: 'Developer',
    salary: 80000, departmentId: null, department: null,
    leaveRequests: [], approvals: [], createdAt: new Date(), updatedAt: new Date(),
    ...overrides,
  });

  const createMockLeaveRequest = (overrides: Partial<LeaveRequest> = {}): LeaveRequest => ({
    id: 'lr-1', employeeId: 'emp-1', employee: createMockEmployee(),
    startDate: futureDate, endDate: futureEnd,
    reason: 'Annual vacation', status: LeaveStatus.PENDING,
    approval: null, createdAt: new Date(), updatedAt: new Date(),
    ...overrides,
  });

  const createMockApproval = (overrides: Partial<Approval> = {}): Approval => ({
    id: 'app-1', leaveRequestId: 'lr-1', leaveRequest: createMockLeaveRequest(),
    approverId: 'emp-2', approver: createMockEmployee({ id: 'emp-2', firstName: 'Bob', email: 'bob@obiri.com' }),
    action: ApprovalAction.APPROVED, comment: 'Approved',
    actionTimestamp: new Date(), createdAt: new Date(),
    ...overrides,
  });

  const mockLrRepo = {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEmpRepo = {
    findOneBy: jest.fn(),
  };

  const mockAppRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveRequestService,
        { provide: getRepositoryToken(LeaveRequest), useValue: mockLrRepo },
        { provide: getRepositoryToken(Employee), useValue: mockEmpRepo },
        { provide: getRepositoryToken(Approval), useValue: mockAppRepo },
      ],
    }).compile();

    service = module.get<LeaveRequestService>(LeaveRequestService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a leave request', async () => {
      const emp = createMockEmployee();
      mockEmpRepo.findOneBy.mockResolvedValue(emp);
      mockLrRepo.findOne.mockResolvedValue(null);
      mockLrRepo.create.mockReturnValue(createMockLeaveRequest());
      mockLrRepo.save.mockResolvedValue(createMockLeaveRequest());

      const result = await service.create({
        employeeId: 'emp-1',
        startDate: futureDate.toISOString().split('T')[0],
        endDate: futureEnd.toISOString().split('T')[0],
        reason: 'Annual vacation',
      });
      expect(result.reason).toBe('Annual vacation');
    });

    it('should throw if employee not found', async () => {
      mockEmpRepo.findOneBy.mockResolvedValue(null);
      await expect(service.create({
        employeeId: 'bad-id', startDate: '2025-01-01',
        endDate: '2025-01-03', reason: 'Test leave',
      })).rejects.toThrow(NotFoundException);
    });

    it('should throw if end date <= start date', async () => {
      mockEmpRepo.findOneBy.mockResolvedValue(createMockEmployee());
      await expect(service.create({
        employeeId: 'emp-1',
        startDate: '2025-01-10', endDate: '2025-01-03',
        reason: 'Invalid date range',
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('getStatus', () => {
    it('should return the leave request status', async () => {
      mockLrRepo.findOne.mockResolvedValue(createMockLeaveRequest());
      const result = await service.getStatus('lr-1');
      expect(result.status).toBe(LeaveStatus.PENDING);
    });
  });

  describe('approve', () => {
    it('should approve a pending leave request', async () => {
      mockLrRepo.findOne.mockResolvedValue(createMockLeaveRequest());
      mockEmpRepo.findOneBy.mockResolvedValue(createMockEmployee({ id: 'emp-2', firstName: 'Bob', email: 'bob@obiri.com' }));
      mockAppRepo.create.mockReturnValue(createMockApproval());
      mockAppRepo.save.mockResolvedValue(createMockApproval());
      mockLrRepo.save.mockResolvedValue(createMockLeaveRequest({ status: LeaveStatus.APPROVED }));

      const result = await service.approve('lr-1', { approverId: 'emp-2', comment: 'Approved' });
      expect(result.status).toBe(LeaveStatus.APPROVED);
    });

    it('should throw if employee is own approver', async () => {
      mockLrRepo.findOne.mockResolvedValue(createMockLeaveRequest());
      mockEmpRepo.findOneBy.mockResolvedValue(createMockEmployee());
      await expect(service.approve('lr-1', { approverId: 'emp-1' }))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw if already processed', async () => {
      mockLrRepo.findOne.mockResolvedValue(createMockLeaveRequest({ status: LeaveStatus.APPROVED }));
      mockEmpRepo.findOneBy.mockResolvedValue(createMockEmployee({ id: 'emp-2' }));
      await expect(service.approve('lr-1', { approverId: 'emp-2' }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('should reject a pending leave request', async () => {
      mockLrRepo.findOne.mockResolvedValue(createMockLeaveRequest());
      mockEmpRepo.findOneBy.mockResolvedValue(createMockEmployee({ id: 'emp-2', firstName: 'Bob', email: 'bob@obiri.com' }));
      mockAppRepo.create.mockReturnValue(createMockApproval({ action: ApprovalAction.REJECTED }));
      mockAppRepo.save.mockResolvedValue(createMockApproval({ action: ApprovalAction.REJECTED }));
      mockLrRepo.save.mockResolvedValue(createMockLeaveRequest({ status: LeaveStatus.REJECTED }));

      const result = await service.reject('lr-1', { approverId: 'emp-2', comment: 'Not approved' });
      expect(result.status).toBe(LeaveStatus.REJECTED);
    });
  });
});
