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
    <div class="container page-enter">
      <a routerLink="/departments" class="back-link">← Back to Departments</a>
      <h1>{{ isEdit ? 'Edit Department' : 'New Department' }}</h1>

      <div *ngIf="error" class="state-msg error" style="margin-bottom:var(--space-lg);text-align:left;">{{ error }}</div>

      <form [formGroup]="departmentForm" (ngSubmit)="onSubmit()" class="form-card">
        <div class="form-group">
          <label for="name">Department Name</label>
          <input id="name" formControlName="name" type="text" class="form-control" placeholder="e.g., Engineering">
          <div *ngIf="departmentForm.get('name')?.invalid && departmentForm.get('name')?.touched" class="validation">
            Name is required (min 2 characters)
          </div>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" formControlName="description" class="form-control" rows="3" placeholder="Department description (optional)"></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" [disabled]="departmentForm.invalid || submitting" class="btn btn-primary btn-lg">
            {{ submitting ? 'Saving…' : (isEdit ? 'Update Department' : 'Create Department') }}
          </button>
          <a routerLink="/departments" class="btn btn-secondary btn-lg">Cancel</a>
        </div>
      </form>
    </div>
  `
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
