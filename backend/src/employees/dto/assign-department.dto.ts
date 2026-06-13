import { IsString, IsUUID } from 'class-validator';

export class AssignDepartmentDto {
  @IsString()
  @IsUUID()
  departmentId: string;
}
