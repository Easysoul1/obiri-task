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
    <div class="container page-enter">
      <a routerLink="/employees" class="back-link">← Back to Employees</a>
      <h1>{{ isEdit ? 'Edit Employee' : 'New Employee' }}</h1>

      <div *ngIf="error" class="state-msg error" style="margin-bottom:var(--space-lg);text-align:left;">{{ error }}</div>

      <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()" class="form-card">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input id="firstName" formControlName="firstName" type="text" class="form-control" placeholder="Alice">
            <div *ngIf="employeeForm.get('firstName')?.invalid && employeeForm.get('firstName')?.touched" class="validation">Required (min 2 chars)</div>
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input id="lastName" formControlName="lastName" type="text" class="form-control" placeholder="Johnson">
            <div *ngIf="employeeForm.get('lastName')?.invalid && employeeForm.get('lastName')?.touched" class="validation">Required (min 2 chars)</div>
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" formControlName="email" type="email" class="form-control" placeholder="alice@obiri.com">
          <div *ngIf="employeeForm.get('email')?.invalid && employeeForm.get('email')?.touched" class="validation">Valid email is required</div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="position">Position</label>
            <input id="position" formControlName="position" type="text" class="form-control" placeholder="Senior Developer">
          </div>
          <div class="form-group">
            <label for="salary">Salary</label>
            <input id="salary" formControlName="salary" type="number" class="form-control" placeholder="95000">
          </div>
        </div>

        <div class="form-group">
          <label for="departmentId">Department</label>
          <select id="departmentId" formControlName="departmentId" class="form-control">
            <option value="">— No Department —</option>
            <option *ngFor="let dept of departments" [value]="dept.id">{{ dept.name }}</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" [disabled]="employeeForm.invalid || submitting" class="btn btn-primary btn-lg">
            {{ submitting ? 'Saving…' : (isEdit ? 'Update Employee' : 'Create Employee') }}
          </button>
          <a routerLink="/employees" class="btn btn-secondary btn-lg">Cancel</a>
        </div>
      </form>
    </div>
  `
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
