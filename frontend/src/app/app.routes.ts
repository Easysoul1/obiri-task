import { Routes } from '@angular/router';
import { DepartmentListComponent } from './departments/department-list/department-list.component';
import { DepartmentFormComponent } from './departments/department-form/department-form.component';
import { EmployeeListComponent } from './employees/employee-list/employee-list.component';
import { EmployeeFormComponent } from './employees/employee-form/employee-form.component';
import { LeaveRequestListComponent } from './leave-requests/leave-request-list/leave-request-list.component';
import { LeaveRequestFormComponent } from './leave-requests/leave-request-form/leave-request-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/departments', pathMatch: 'full' },
  { path: 'departments', component: DepartmentListComponent },
  { path: 'departments/new', component: DepartmentFormComponent },
  { path: 'departments/:id', component: DepartmentFormComponent },
  { path: 'departments/:id/edit', component: DepartmentFormComponent },
  { path: 'employees', component: EmployeeListComponent },
  { path: 'employees/new', component: EmployeeFormComponent },
  { path: 'employees/:id', component: EmployeeFormComponent },
  { path: 'employees/:id/edit', component: EmployeeFormComponent },
  { path: 'leave-requests', component: LeaveRequestListComponent },
  { path: 'leave-requests/new', component: LeaveRequestFormComponent },
  { path: 'leave-requests/:id', component: LeaveRequestListComponent },
];
