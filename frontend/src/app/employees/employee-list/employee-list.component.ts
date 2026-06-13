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
    <div class="container page-enter">
      <div class="page-header">
        <h1>Employees</h1>
        <a routerLink="/employees/new" class="btn btn-primary">+ New Employee</a>
      </div>

      <div *ngIf="loading" class="state-msg">Loading employees…</div>
      <div *ngIf="error" class="state-msg error">{{ error }}</div>

      <div class="table-wrap" *ngIf="!loading && employees.length > 0">
        <table>
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
              <td><strong>{{ emp.firstName }} {{ emp.lastName }}</strong></td>
              <td><a href="mailto:{{ emp.email }}" style="color:var(--color-accent);text-decoration:none;">{{ emp.email }}</a></td>
              <td>{{ emp.position || '—' }}</td>
              <td>{{ emp.department?.name || 'Unassigned' }}</td>
              <td class="actions">
                <a [routerLink]="['/employees', emp.id]" class="btn btn-sm btn-secondary">View</a>
                <a [routerLink]="['/employees', emp.id, 'edit']" class="btn btn-sm btn-secondary">Edit</a>
                <button (click)="deleteEmployee(emp.id)" class="btn btn-sm btn-danger">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && employees.length === 0" class="state-msg">
        No employees yet. <a routerLink="/employees/new" style="color:var(--color-accent);text-decoration:underline;">Add your first employee</a>.
      </div>
    </div>
  `
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
