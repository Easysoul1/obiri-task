import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class ApproveRejectDto {
  @IsString()
  @IsUUID()
  approverId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
