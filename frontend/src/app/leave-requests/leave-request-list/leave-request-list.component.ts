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
    <div class="container page-enter">
      <div class="page-header">
        <h1>Leave Requests</h1>
        <a routerLink="/leave-requests/new" class="btn btn-primary">+ New Leave Request</a>
      </div>

      <div *ngIf="loading" class="state-msg">Loading leave requests…</div>
      <div *ngIf="error" class="state-msg error">{{ error }}</div>

      <!-- Approve/Reject Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>{{ modalAction === 'approve' ? 'Approve' : 'Reject' }} Leave Request</h3>
          <div class="form-group">
            <label for="approver">Approver</label>
            <select id="approver" [(ngModel)]="modalApproverId" class="form-control">
              <option value="">— Select Approver —</option>
              <option *ngFor="let emp of employees" [value]="emp.id">{{ emp.firstName }} {{ emp.lastName }} ({{ emp.email }})</option>
            </select>
          </div>
          <div class="form-group">
            <label for="comment">Comment <span style="color:var(--color-ink-4);font-weight:400;">(optional)</span></label>
            <textarea id="comment" [(ngModel)]="modalComment" class="form-control" rows="3" placeholder="Add a comment…"></textarea>
          </div>
          <div *ngIf="modalError" style="color:var(--color-danger);font-size:var(--text-xs);margin-bottom:var(--space-sm);">{{ modalError }}</div>
          <div class="modal-actions">
            <button (click)="confirmAction()" class="btn" [class.btn-success]="modalAction === 'approve'" [class.btn-danger]="modalAction === 'reject'" [disabled]="!modalApproverId">
              {{ modalAction === 'approve' ? 'Approve' : 'Reject' }}
            </button>
            <button (click)="showModal = false" class="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>

      <div class="table-wrap" *ngIf="!loading && leaveRequests.length > 0">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Dates</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Approver</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let lr of leaveRequests">
              <td><strong>{{ lr.employee?.firstName }} {{ lr.employee?.lastName }}</strong></td>
              <td style="white-space:nowrap;font-size:var(--text-xs);">{{ lr.startDate | date:'MMM d' }} – {{ lr.endDate | date:'MMM d, y' }}</td>
              <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ lr.reason }}</td>
              <td>
                <span class="badge" [class.badge-pending]="lr.status === 'pending'" [class.badge-approved]="lr.status === 'approved'" [class.badge-rejected]="lr.status === 'rejected'">
                  {{ lr.status }}
                </span>
              </td>
              <td>{{ lr.approval?.approver?.firstName }} {{ lr.approval?.approver?.lastName || '—' }}</td>
              <td class="actions">
                <ng-container *ngIf="lr.status === 'pending'">
                  <button (click)="openModal(lr.id, 'approve')" class="btn btn-sm btn-success">Approve</button>
                  <button (click)="openModal(lr.id, 'reject')" class="btn btn-sm btn-danger">Reject</button>
                </ng-container>
                <span *ngIf="lr.status !== 'pending'" style="color:var(--color-ink-4);font-size:var(--text-xs);">Processed</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && leaveRequests.length === 0" class="state-msg">
        No leave requests yet. <a routerLink="/leave-requests/new" style="color:var(--color-accent);text-decoration:underline;">Submit one</a>.
      </div>
    </div>
  `
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
