export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee?: { id: string; firstName: string; lastName: string };
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approval?: Approval | null;
  createdAt: string;
  updatedAt: string;
}

export interface Approval {
  id: string;
  leaveRequestId: string;
  approverId: string;
  approver?: { id: string; firstName: string; lastName: string };
  action: 'approved' | 'rejected';
  comment: string | null;
  actionTimestamp: string;
  createdAt: string;
}

export interface CreateLeaveRequestDto {
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ApproveRejectDto {
  approverId: string;
  comment?: string;
}
