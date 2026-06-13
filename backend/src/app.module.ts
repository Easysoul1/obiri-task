import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentModule } from './departments/department.module';
import { EmployeeModule } from './employees/employee.module';
import { LeaveRequestModule } from './leave-requests/leave-request.module';
import { Department } from './departments/department.entity';
import { Employee } from './employees/employee.entity';
import { LeaveRequest } from './leave-requests/leave-request.entity';
import { Approval } from './approval/approval.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_PATH || 'obiri.db',
      entities: [Department, Employee, LeaveRequest, Approval],
      synchronize: true,
      logging: process.env.DB_LOGGING === 'true',
    }),
    DepartmentModule,
    EmployeeModule,
    LeaveRequestModule,
  ],
})
export class AppModule {}
