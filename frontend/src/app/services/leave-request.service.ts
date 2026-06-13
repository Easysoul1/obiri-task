import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveRequest, CreateLeaveRequestDto, ApproveRejectDto } from '../models/leave-request.model';

@Injectable({ providedIn: 'root' })
export class LeaveRequestService {
  private apiUrl = 'http://localhost:3000/api/leave-requests';

  constructor(private http: HttpClient) {}

  getLeaveRequests(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(this.apiUrl);
  }

  getLeaveRequest(id: string): Observable<LeaveRequest> {
    return this.http.get<LeaveRequest>(`${this.apiUrl}/${id}`);
  }

  getStatus(id: string): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/${id}/status`);
  }

  createLeaveRequest(dto: CreateLeaveRequestDto): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(this.apiUrl, dto);
  }

  approveLeaveRequest(id: string, dto: ApproveRejectDto): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(`${this.apiUrl}/${id}/approve`, dto);
  }

  rejectLeaveRequest(id: string, dto: ApproveRejectDto): Observable<LeaveRequest> {
    return this.http.put<LeaveRequest>(`${this.apiUrl}/${id}/reject`, dto);
  }
}
