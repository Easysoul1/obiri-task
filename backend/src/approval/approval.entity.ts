import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn, OneToOne
} from 'typeorm';
import { LeaveRequest } from '../leave-requests/leave-request.entity';
import { Employee } from '../employees/employee.entity';

export enum ApprovalAction {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('approvals')
export class Approval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'leave_request_id', type: 'varchar' })
  leaveRequestId: string;

  @OneToOne(() => LeaveRequest, (leaveRequest) => leaveRequest.approval, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'leave_request_id' })
  leaveRequest: LeaveRequest;

  @Column({ name: 'approver_id', type: 'varchar' })
  approverId: string;

  @ManyToOne(() => Employee, (employee) => employee.approvals, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'approver_id' })
  approver: Employee;

  @Column({
    type: 'varchar',
  })
  action: ApprovalAction;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ name: 'action_timestamp', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  actionTimestamp: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
