import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models/department.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <h1>{{ isEdit ? 'Edit Employee' : 'New Employee' }}</h1>
      <a routerLink="/employees" class="back-link">&larr; Back to Employees</a>

      <div *ngIf="error" class="error">{{ error }}</div>

      <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()" class="form">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input id="firstName" formControlName="firstName" type="text" class="form-control">
            <div *ngIf="employeeForm.get('firstName')?.invalid && employeeForm.get('firstName')?.touched" class="validation">Required (min 2 chars)</div>
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input id="lastName" formControlName="lastName" type="text" class="form-control">
            <div *ngIf="employeeForm.get('lastName')?.invalid && employeeForm.get('lastName')?.touched" class="validation">Required (min 2 chars)</div>
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" formControlName="email" type="email" class="form-control">
          <div *ngIf="employeeForm.get('email')?.invalid && employeeForm.get('email')?.touched" class="validation">Valid email is required</div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="position">Position</label>
            <input id="position" formControlName="position" type="text" class="form-control">
          </div>
          <div class="form-group">
            <label for="salary">Salary</label>
            <input id="salary" formControlName="salary" type="number" class="form-control">
          </div>
        </div>

        <div class="form-group">
          <label for="departmentId">Department</label>
          <select id="departmentId" formControlName="departmentId" class="form-control">
            <option value="">-- No Department --</option>
            <option *ngFor="let dept of departments" [value]="dept.id">{{ dept.name }}</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" [disabled]="employeeForm.invalid || submitting" class="btn btn-primary">
            {{ submitting ? 'Saving...' : (isEdit ? 'Update Employee' : 'Create Employee') }}
          </button>
          <a routerLink="/employees" class="btn btn-secondary">Cancel</a>
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
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isEdit = false;
  employeeId = '';
  submitting = false;
  error = '';
  departments: Department[] = [];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      position: ['', Validators.maxLength(100)],
      salary: [null],
      departmentId: ['']
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.employeeId = id;
      this.loadEmployee();
    }
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe({
      next: (data) => this.departments = data
    });
  }

  loadEmployee(): void {
    this.employeeService.getEmployee(this.employeeId).subscribe({
      next: (emp) => {
        this.employeeForm.patchValue({
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          position: emp.position || '',
          salary: emp.salary,
          departmentId: emp.departmentId || ''
        });
      },
      error: () => this.error = 'Failed to load employee.'
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) return;
    this.submitting = true;
    const dto = { ...this.employeeForm.value };
    if (!dto.departmentId) delete dto.departmentId;
    if (!dto.salary) dto.salary = null;
    if (!dto.position) delete dto.position;

    const request = this.isEdit
      ? this.employeeService.updateEmployee(this.employeeId, dto)
      : this.employeeService.createEmployee(dto);

    request.subscribe({
      next: () => this.router.navigate(['/employees']),
      error: (err) => { this.error = err.error?.message || 'Failed to save employee.'; this.submitting = false; }
    });
  }
}
