import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models/department.model';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Departments</h1>
        <a routerLink="/departments/new" class="btn btn-primary">+ New Department</a>
      </div>

      <div *ngIf="loading" class="loading">Loading departments...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <table class="table" *ngIf="!loading && departments.length > 0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Employees</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let dept of departments">
            <td>{{ dept.name }}</td>
            <td>{{ dept.description || '-' }}</td>
            <td>{{ dept.employees?.length || 0 }}</td>
            <td class="actions">
              <a [routerLink]="['/departments', dept.id]" class="btn btn-sm">View</a>
              <a [routerLink]="['/departments', dept.id, 'edit']" class="btn btn-sm btn-secondary">Edit</a>
              <button (click)="deleteDepartment(dept.id)" class="btn btn-sm btn-danger">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="!loading && departments.length === 0" class="empty">
        No departments found. Create your first department!
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 900px; margin: 0 auto; padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { margin: 0; }
    .btn { display: inline-block; padding: 0.5rem 1rem; border-radius: 4px; text-decoration: none; cursor: pointer; border: none; font-size: 0.9rem; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-secondary { background: #6b7280; color: white; }
    .btn-danger { background: #dc2626; color: white; }
    .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .table th { background: #f9fafb; font-weight: 600; }
    .actions { display: flex; gap: 0.5rem; }
    .loading, .error, .empty { padding: 2rem; text-align: center; color: #6b7280; }
    .error { color: #dc2626; }
  `]
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  loading = true;
  error = '';

  constructor(private departmentService: DepartmentService) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.error = '';
    this.departmentService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load departments. Is the server running?';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteDepartment(id: string): void {
    if (!confirm('Are you sure you want to delete this department?')) return;
    this.departmentService.deleteDepartment(id).subscribe({
      next: () => this.loadDepartments(),
      error: (err) => {
        this.error = 'Failed to delete department. It may have employees assigned.';
        console.error(err);
      }
    });
  }
}
