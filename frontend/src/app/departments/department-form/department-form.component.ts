import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartmentService } from '../../services/department.service';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <h1>{{ isEdit ? 'Edit Department' : 'New Department' }}</h1>
      <a routerLink="/departments" class="back-link">&larr; Back to Departments</a>

      <div *ngIf="error" class="error">{{ error }}</div>

      <form [formGroup]="departmentForm" (ngSubmit)="onSubmit()" class="form">
        <div class="form-group">
          <label for="name">Department Name</label>
          <input id="name" formControlName="name" type="text" class="form-control" placeholder="e.g., Engineering">
          <div *ngIf="departmentForm.get('name')?.invalid && departmentForm.get('name')?.touched" class="validation">
            Name is required (min 2 characters)
          </div>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" formControlName="description" class="form-control" rows="3" placeholder="Department description"></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" [disabled]="departmentForm.invalid || submitting" class="btn btn-primary">
            {{ submitting ? 'Saving...' : (isEdit ? 'Update Department' : 'Create Department') }}
          </button>
          <a routerLink="/departments" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container { max-width: 600px; margin: 0 auto; padding: 2rem; }
    h1 { margin-bottom: 0.5rem; }
    .back-link { display: block; margin-bottom: 1.5rem; color: #2563eb; text-decoration: none; }
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .form-control { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 1rem; box-sizing: border-box; }
    .validation { color: #dc2626; font-size: 0.8rem; margin-top: 0.25rem; }
    .form-actions { display: flex; gap: 1rem; margin-top: 2rem; }
    .btn { padding: 0.5rem 1.5rem; border-radius: 4px; cursor: pointer; border: none; font-size: 0.9rem; text-decoration: none; display: inline-block; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
    .btn-secondary { background: #6b7280; color: white; }
    .error { color: #dc2626; padding: 1rem; background: #fef2f2; border-radius: 4px; margin-bottom: 1rem; }
  `]
})
export class DepartmentFormComponent implements OnInit {
  departmentForm: FormGroup;
  isEdit = false;
  departmentId = '';
  submitting = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.departmentId = id;
      this.loadDepartment();
    }
  }

  loadDepartment(): void {
    this.departmentService.getDepartment(this.departmentId).subscribe({
      next: (dept) => {
        this.departmentForm.patchValue({
          name: dept.name,
          description: dept.description || ''
        });
      },
      error: (err) => {
        this.error = 'Failed to load department details.';
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) return;
    this.submitting = true;
    this.error = '';

    const dto = this.departmentForm.value;

    const request = this.isEdit
      ? this.departmentService.updateDepartment(this.departmentId, dto)
      : this.departmentService.createDepartment(dto);

    request.subscribe({
      next: () => this.router.navigate(['/departments']),
      error: (err) => {
        this.error = err.error?.message || 'Failed to save department.';
        this.submitting = false;
      }
    });
  }
}
