import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { LeaveRequest, LeaveStatus } from './leave-request.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { ApproveRejectDto } from './dto/approve-reject.dto';
import { Employee } from '../employees/employee.entity';
import { Approval, ApprovalAction } from '../approval/approval.entity';

@Injectable()
export class LeaveRequestService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Approval)
    private approvalRepository: Repository<Approval>,
  ) {}

  async create(dto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const employee = await this.employeeRepository.findOneBy({ id: dto.employeeId });
    if (!employee) {
      throw new NotFoundException(`Employee with ID "${dto.employeeId}" not found`);
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start >= end) {
      throw new BadRequestException('End date must be after start date');
    }

    if (start < new Date(new Date().toDateString())) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    const overlapping = await this.leaveRequestRepository.findOne({
      where: [
        {
          employeeId: dto.employeeId,
          startDate: LessThanOrEqual(end),
          endDate: MoreThanOrEqual(start),
          status: LeaveStatus.PENDING,
        },
        {
          employeeId: dto.employeeId,
          startDate: LessThanOrEqual(end),
          endDate: MoreThanOrEqual(start),
          status: LeaveStatus.APPROVED,
        },
      ],
    });

    if (overlapping) {
      throw new BadRequestException('Employee already has a leave request for this period');
    }

    const leaveRequest = this.leaveRequestRepository.create({
      employeeId: dto.employeeId,
      startDate: start,
      endDate: end,
      reason: dto.reason,
    });

    return this.leaveRequestRepository.save(leaveRequest);
  }

  async findAll(): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      relations: ['employee', 'approval', 'approval.approver'],
    });
  }

  async findOne(id: string): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id },
      relations: ['employee', 'approval', 'approval.approver'],
    });
    if (!leaveRequest) {
      throw new NotFoundException(`Leave request with ID "${id}" not found`);
    }
    return leaveRequest;
  }

  async getStatus(id: string): Promise<{ status: LeaveStatus }> {
    const leaveRequest = await this.findOne(id);
    return { status: leaveRequest.status };
  }

  async approve(id: string, dto: ApproveRejectDto): Promise<LeaveRequest> {
    return this.processApproval(id, dto, ApprovalAction.APPROVED);
  }

  async reject(id: string, dto: ApproveRejectDto): Promise<LeaveRequest> {
    return this.processApproval(id, dto, ApprovalAction.REJECTED);
  }

  private async processApproval(
    id: string,
    dto: ApproveRejectDto,
    action: ApprovalAction,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id);

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        `Leave request is already ${leaveRequest.status}`,
      );
    }

    const approver = await this.employeeRepository.findOneBy({ id: dto.approverId });
    if (!approver) {
      throw new NotFoundException(`Approver with ID "${dto.approverId}" not found`);
    }

    if (leaveRequest.employeeId === dto.approverId) {
      throw new BadRequestException('Employee cannot approve their own leave request');
    }

    const status = action === ApprovalAction.APPROVED ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;
    leaveRequest.status = status;

    const approval = this.approvalRepository.create({
      leaveRequestId: id,
      approverId: dto.approverId,
      action,
      comment: dto.comment ?? null,
      actionTimestamp: new Date(),
    });

    await this.approvalRepository.save(approval);
    leaveRequest.approval = approval;
    return this.leaveRequestRepository.save(leaveRequest);
  }
}
