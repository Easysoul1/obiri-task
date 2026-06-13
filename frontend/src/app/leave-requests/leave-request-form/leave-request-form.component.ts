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
    <div class="container">
      <h1>New Leave Request</h1>
      <a routerLink="/leave-requests" class="back-link">&larr; Back to Leave Requests</a>

      <div *ngIf="error" class="error">{{ error }}</div>

      <form [formGroup]="leaveForm" (ngSubmit)="onSubmit()" class="form">
        <div class="form-group">
          <label for="employeeId">Employee</label>
          <select id="employeeId" formControlName="employeeId" class="form-control">
            <option value="">-- Select Employee --</option>
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
          <button type="submit" [disabled]="leaveForm.invalid || submitting" class="btn btn-primary">
            {{ submitting ? 'Submitting...' : 'Submit Leave Request' }}
          </button>
          <a routerLink="/leave-requests" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container { max-width: 700px; margin: 0 auto; padding: 2rem; }
    h1 { margin-bottom: 0.5rem; }
    .back-link { display: block; margin-bottom: 1.5rem; color: #2563eb; text-decoration: none; }
    .form-row { display: flex; gap: 1rem; }
    .form-row .form-group { flex: 1; }
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .form-control { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 1rem; box-sizing: border-box; }
    select.form-control { background: white; }
    .validation { color: #dc2626; font-size: 0.8rem; margin-top: 0.25rem; }
    .form-actions { display: flex; gap: 1rem; margin-top: 2rem; }
    .btn { padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer; border: none; font-size: 0.9rem; text-decoration: none; display: inline-block; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
    .btn-secondary { background: #6b7280; color: white; }
    .error { color: #dc2626; padding: 1rem; background: #fef2f2; border-radius: 4px; margin-bottom: 1rem; }
  `]
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
