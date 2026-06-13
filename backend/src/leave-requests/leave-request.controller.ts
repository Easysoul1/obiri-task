import {
  Controller, Get, Post, Put,
  Body, Param, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { LeaveRequestService } from './leave-request.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { ApproveRejectDto } from './dto/approve-reject.dto';
import { LeaveRequest } from './leave-request.entity';

@Controller('api/leave-requests')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    return this.leaveRequestService.create(dto);
  }

  @Get()
  findAll(): Promise<LeaveRequest[]> {
    return this.leaveRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<LeaveRequest> {
    return this.leaveRequestService.findOne(id);
  }

  @Get(':id/status')
  getStatus(@Param('id', ParseUUIDPipe) id: string): Promise<{ status: string }> {
    return this.leaveRequestService.getStatus(id);
  }

  @Put(':id/approve')
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveRejectDto,
  ): Promise<LeaveRequest> {
    return this.leaveRequestService.approve(id, dto);
  }

  @Put(':id/reject')
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveRejectDto,
  ): Promise<LeaveRequest> {
    return this.leaveRequestService.reject(id, dto);
  }
}
