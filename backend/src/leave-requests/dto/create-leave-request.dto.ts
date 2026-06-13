import { IsString, IsUUID, IsDateString, MinLength, MaxLength } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsString()
  @IsUUID()
  employeeId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  reason: string;
}
