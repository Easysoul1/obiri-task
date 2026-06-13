import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LeaveRequestService } from '../../services/leave-request.service';
import { EmployeeService } from '../../services/employee.service';
import { LeaveRequest, LeaveStatus } from '../../models/leave-request.model';
import { Employee } from '../../models/employee.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-leave-request-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Leave Requests</h1>
        <a routerLink="/leave-requests/new" class="btn btn-primary">+ New Leave Request</a>
      </div>

      <div *ngIf="loading" class="loading">Loading leave requests...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <!-- Approve/Reject Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>{{ modalAction === 'approve' ? 'Approve' : 'Reject' }} Leave Request</h3>
          <div class="form-group">
            <label for="approver">Approver</label>
            <select id="approver" [(ngModel)]="modalApproverId" class="form-control">
              <option value="">-- Select Approver --</option>
              <option *ngFor="let emp of employees" [value]="emp.id">{{ emp.firstName }} {{ emp.lastName }} ({{ emp.email }})</option>
            </select>
          </div>
          <div class="form-group">
            <label for="comment">Comment</label>
            <textarea id="comment" [(ngModel)]="modalComment" class="form-control" rows="3" placeholder="Optional comment"></textarea>
          </div>
          <div class="modal-actions">
            <button (click)="confirmAction()" class="btn" [class.btn-success]="modalAction === 'approve'" [class.btn-danger]="modalAction === 'reject'" [disabled]="!modalApproverId">
              {{ modalAction === 'approve' ? 'Approve' : 'Reject' }}
            </button>
            <button (click)="showModal = false" class="btn btn-secondary">Cancel</button>
          </div>
          <div *ngIf="modalError" class="error" style="margin-top: 0.5rem;">{{ modalError }}</div>
        </div>
      </div>

      <table class="table" *ngIf="!loading && leaveRequests.length > 0">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Approver</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let lr of leaveRequests">
            <td>{{ lr.employee?.firstName }} {{ lr.employee?.lastName }}</td>
            <td>{{ lr.startDate | date }}</td>
            <td>{{ lr.endDate | date }}</td>
            <td class="reason-cell">{{ lr.reason }}</td>
            <td>
              <span class="status-badge" [class.pending]="lr.status === 'pending'" [class.approved]="lr.status === 'approved'" [class.rejected]="lr.status === 'rejected'">
                {{ lr.status }}
              </span>
            </td>
            <td>{{ lr.approval?.approver?.firstName }} {{ lr.approval?.approver?.lastName || '-' }}</td>
            <td class="actions">
              <a *ngIf="lr.status === 'pending'" [routerLink]="['/leave-requests', lr.id]" class="btn btn-sm">View</a>
              <button *ngIf="lr.status === 'pending'" (click)="openModal(lr.id, 'approve')" class="btn btn-sm btn-success">Approve</button>
              <button *ngIf="lr.status === 'pending'" (click)="openModal(lr.id, 'reject')" class="btn btn-sm btn-danger">Reject</button>
              <span *ngIf="lr.status !== 'pending'" class="text-muted">Processed</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="!loading && leaveRequests.length === 0" class="empty">No leave requests found.</div>
    </div>
  `,
  styles: [`
    .container { max-width: 1100px; margin: 0 auto; padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { margin: 0; }
    .btn { display: inline-block; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; border: none; font-size: 0.9rem; text-decoration: none; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-success { background: #16a34a; color: white; }
    .btn-danger { background: #dc2626; color: white; }
    .btn-secondary { background: #6b7280; color: white; }
    .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .table th { background: #f9fafb; font-weight: 600; }
    .actions { display: flex; gap: 0.25rem; }
    .reason-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .status-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .status-badge.pending { background: #fef3c7; color: #92400e; }
    .status-badge.approved { background: #dcfce7; color: #166534; }
    .status-badge.rejected { background: #fce4ec; color: #b71c1c; }
    .loading, .error, .empty { padding: 2rem; text-align: center; color: #6b7280; }
    .error { color: #dc2626; }
    .text-muted { color: #9ca3af; font-size: 0.8rem; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; padding: 2rem; border-radius: 8px; max-width: 500px; width: 100%; }
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.25rem; font-weight: 500; }
    .form-control { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box; }
    .modal-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
  `]
})
export class LeaveRequestListComponent implements OnInit {
  leaveRequests: LeaveRequest[] = [];
  employees: Employee[] = [];
  loading = true;
  error = '';
  showModal = false;
  modalAction: 'approve' | 'reject' = 'approve';
  modalLeaveRequestId = '';
  modalApproverId = '';
  modalComment = '';
  modalError = '';

  constructor(
    private leaveRequestService: LeaveRequestService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadLeaveRequests();
    this.loadEmployees();
  }

  loadLeaveRequests(): void {
    this.loading = true;
    this.leaveRequestService.getLeaveRequests().subscribe({
      next: (data) => { this.leaveRequests = data; this.loading = false; },
      error: () => { this.error = 'Failed to load leave requests.'; this.loading = false; }
    });
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => this.employees = data
    });
  }

  openModal(leaveRequestId: string, action: 'approve' | 'reject'): void {
    this.modalLeaveRequestId = leaveRequestId;
    this.modalAction = action;
    this.modalApproverId = '';
    this.modalComment = '';
    this.modalError = '';
    this.showModal = true;
  }

  confirmAction(): void {
    if (!this.modalApproverId) { this.modalError = 'Please select an approver.'; return; }
    const dto = { approverId: this.modalApproverId, comment: this.modalComment || undefined };

    const request = this.modalAction === 'approve'
      ? this.leaveRequestService.approveLeaveRequest(this.modalLeaveRequestId, dto)
      : this.leaveRequestService.rejectLeaveRequest(this.modalLeaveRequestId, dto);

    request.subscribe({
      next: () => { this.showModal = false; this.loadLeaveRequests(); },
      error: (err) => { this.modalError = err.error?.message || 'Action failed.'; }
    });
  }
}
