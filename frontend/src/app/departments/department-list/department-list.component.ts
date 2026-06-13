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
    <div class="container page-enter">
      <div class="page-header">
        <h1>Departments</h1>
        <a routerLink="/departments/new" class="btn btn-primary">+ New Department</a>
      </div>

      <div *ngIf="loading" class="state-msg">Loading departments…</div>
      <div *ngIf="error" class="state-msg error">{{ error }}</div>

      <div class="table-wrap" *ngIf="!loading && departments.length > 0">
        <table>
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
              <td><strong>{{ dept.name }}</strong></td>
              <td>{{ dept.description || '—' }}</td>
              <td>{{ dept.employees?.length || 0 }}</td>
              <td class="actions">
                <a [routerLink]="['/departments', dept.id]" class="btn btn-sm btn-secondary">View</a>
                <a [routerLink]="['/departments', dept.id, 'edit']" class="btn btn-sm btn-secondary">Edit</a>
                <button (click)="deleteDepartment(dept.id)" class="btn btn-sm btn-danger">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && departments.length === 0" class="state-msg">
        No departments yet. <a routerLink="/departments/new" style="color:var(--color-accent);text-decoration:underline;">Create your first department</a>.
      </div>
    </div>
  `
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
