// ─────────────────────────────────────────────────────────────
// API Types — mirrors the .NET backend entities exactly
// ─────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Employee";
  employeeId: number | null;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  joiningDate: string; // ISO date string
  role: string;
}

export interface LeaveType {
  id: number;
  name: string;
  maxDays: number;
}

export interface LeaveBalance {
  id: number;
  employeeId: number;
  leaveTypeId: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  leaveType: LeaveType;
}

export interface LeaveApplication {
  id: number;
  employeeId: number;
  leaveTypeId: number;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  rejectionReason?: string | null;
  appliedOn: string; // ISO date string
  employee?: Employee;
  leaveType?: LeaveType;
}

// DTOs for POST bodies
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: "Admin" | "Employee";
  employeeId?: number | null;
}

export interface RegisteredUser {
  id: number;
  name: string;
  email: string;
  role: string;
  employeeId: number | null;
}
