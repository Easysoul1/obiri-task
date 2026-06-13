import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveRequestService } from '../../services/leave-request.service';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-leave-request-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container page-enter">
      <a routerLink="/leave-requests" class="back-link">← Back to Leave Requests</a>
      <h1>New Leave Request</h1>

      <div *ngIf="error" class="state-msg error" style="margin-bottom:var(--space-lg);text-align:left;">{{ error }}</div>

      <form [formGroup]="leaveForm" (ngSubmit)="onSubmit()" class="form-card">
        <div class="form-group">
          <label for="employeeId">Employee</label>
          <select id="employeeId" formControlName="employeeId" class="form-control">
            <option value="">— Select Employee —</option>
            <option *ngFor="let emp of employees" [value]="emp.id">{{ emp.firstName }} {{ emp.lastName }} ({{ emp.position || emp.email }})</option>
          </select>
          <div *ngIf="leaveForm.get('employeeId')?.invalid && leaveForm.get('employeeId')?.touched" class="validation">Employee is required</div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="startDate">Start Date</label>
            <input id="startDate" formControlName="startDate" type="date" class="form-control">
            <div *ngIf="leaveForm.get('startDate')?.invalid && leaveForm.get('startDate')?.touched" class="validation">Start date is required</div>
          </div>
          <div class="form-group">
            <label for="endDate">End Date</label>
            <input id="endDate" formControlName="endDate" type="date" class="form-control">
            <div *ngIf="leaveForm.get('endDate')?.invalid && leaveForm.get('endDate')?.touched" class="validation">End date is required</div>
          </div>
        </div>

        <div class="form-group">
          <label for="reason">Reason</label>
          <textarea id="reason" formControlName="reason" class="form-control" rows="4" placeholder="Explain the reason for leave"></textarea>
          <div *ngIf="leaveForm.get('reason')?.invalid && leaveForm.get('reason')?.touched" class="validation">Reason is required (min 10 characters)</div>
        </div>

        <div class="form-actions">
          <button type="submit" [disabled]="leaveForm.invalid || submitting" class="btn btn-primary btn-lg">
            {{ submitting ? 'Submitting…' : 'Submit Leave Request' }}
          </button>
          <a routerLink="/leave-requests" class="btn btn-secondary btn-lg">Cancel</a>
        </div>
      </form>
    </div>
  `
})
export class LeaveRequestFormComponent implements OnInit {
  leaveForm: FormGroup;
  employees: Employee[] = [];
  submitting = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private leaveRequestService: LeaveRequestService,
    private employeeService: EmployeeService,
    private router: Router
  ) {
    this.leaveForm = this.fb.group({
      employeeId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => this.employees = data,
      error: () => this.error = 'Failed to load employees.'
    });
  }

  onSubmit(): void {
    if (this.leaveForm.invalid) return;
    this.submitting = true;
    this.error = '';

    this.leaveRequestService.createLeaveRequest(this.leaveForm.value).subscribe({
      next: () => this.router.navigate(['/leave-requests']),
      error: (err) => {
        this.error = err.error?.message || 'Failed to submit leave request.';
        this.submitting = false;
      }
    });
  }
}
