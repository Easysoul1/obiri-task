import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Employees</h1>
        <a routerLink="/employees/new" class="btn btn-primary">+ New Employee</a>
      </div>

      <div *ngIf="loading" class="loading">Loading employees...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <table class="table" *ngIf="!loading && employees.length > 0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Position</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let emp of employees">
            <td>{{ emp.firstName }} {{ emp.lastName }}</td>
            <td>{{ emp.email }}</td>
            <td>{{ emp.position || '-' }}</td>
            <td>{{ emp.department?.name || 'Unassigned' }}</td>
            <td class="actions">
              <a [routerLink]="['/employees', emp.id]" class="btn btn-sm">View</a>
              <a [routerLink]="['/employees', emp.id, 'edit']" class="btn btn-sm btn-secondary">Edit</a>
              <button (click)="deleteEmployee(emp.id)" class="btn btn-sm btn-danger">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="!loading && employees.length === 0" class="empty">
        No employees found.
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
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
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  loading = true;
  error = '';

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getEmployees().subscribe({
      next: (data) => { this.employees = data; this.loading = false; },
      error: (err) => { this.error = 'Failed to load employees.'; this.loading = false; console.error(err); }
    });
  }

  deleteEmployee(id: string): void {
    if (!confirm('Delete this employee?')) return;
    this.employeeService.deleteEmployee(id).subscribe({
      next: () => this.loadEmployees(),
      error: (err) => { this.error = 'Failed to delete employee.'; console.error(err); }
    });
  }
}
