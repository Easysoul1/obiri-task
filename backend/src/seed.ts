import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DepartmentService } from './departments/department.service';
import { EmployeeService } from './employees/employee.service';
import { LeaveRequestService } from './leave-requests/leave-request.service';


async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const departmentService = app.get(DepartmentService);
  const employeeService = app.get(EmployeeService);
  const leaveRequestService = app.get(LeaveRequestService);

  const engineering = await departmentService.create({ name: 'Engineering', description: 'Software engineering department' });
  const hr = await departmentService.create({ name: 'Human Resources', description: 'HR department' });
  const sales = await departmentService.create({ name: 'Sales', description: 'Sales and marketing department' });

  console.log('Departments seeded:', engineering.name, hr.name, sales.name);

  const alice = await employeeService.create({
    firstName: 'Alice', lastName: 'Johnson', email: 'alice@obiri.com',
    position: 'Senior Developer', salary: 95000, departmentId: engineering.id
  });

  const bob = await employeeService.create({
    firstName: 'Bob', lastName: 'Smith', email: 'bob@obiri.com',
    position: 'HR Manager', salary: 85000, departmentId: hr.id
  });

  const charlie = await employeeService.create({
    firstName: 'Charlie', lastName: 'Brown', email: 'charlie@obiri.com',
    position: 'Sales Lead', salary: 80000, departmentId: sales.id
  });

  console.log('Employees seeded:', alice.firstName, bob.firstName, charlie.firstName);

  const futureStart = new Date();
  futureStart.setDate(futureStart.getDate() + 14);
  const futureEnd = new Date(futureStart);
  futureEnd.setDate(futureEnd.getDate() + 3);

  const leaveReq1 = await leaveRequestService.create({
    employeeId: alice.id,
    startDate: futureStart.toISOString().split('T')[0],
    endDate: futureEnd.toISOString().split('T')[0],
    reason: 'Annual vacation',
  });

  console.log('Leave request seeded for:', alice.firstName);

  await leaveRequestService.approve(leaveReq1.id, {
    approverId: bob.id,
    comment: 'Approved. Enjoy your vacation!',
  });

  console.log('Leave request approved by:', bob.firstName);

  const futureStart2 = new Date();
  futureStart2.setDate(futureStart2.getDate() + 30);
  const futureEnd2 = new Date(futureStart2);
  futureEnd2.setDate(futureEnd2.getDate() + 2);

  const leaveReq2 = await leaveRequestService.create({
    employeeId: charlie.id,
    startDate: futureStart2.toISOString().split('T')[0],
    endDate: futureEnd2.toISOString().split('T')[0],
    reason: 'Personal leave',
  });

  console.log('Leave request seeded for:', charlie.firstName);

  await app.close();
  console.log('Seed completed successfully!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
