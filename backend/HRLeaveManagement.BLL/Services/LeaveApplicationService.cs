using HRLeaveManagement.BLL.Interfaces;
using HRLeaveManagement.DAL.Interfaces;
using HRLeaveManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.BLL.Services
{
    public class LeaveApplicationService : ILeaveApplicationService
    {
        private readonly ILeaveApplicationRepository _leaveApplicationRepository;
        private readonly ILeaveBalanceRepository _leaveBalanceRepository;

        public LeaveApplicationService(
            ILeaveApplicationRepository leaveApplicationRepository,
            ILeaveBalanceRepository leaveBalanceRepository)
        {
            _leaveApplicationRepository = leaveApplicationRepository;
            _leaveBalanceRepository = leaveBalanceRepository;
        }

        public async Task<IEnumerable<LeaveApplication>> GetAllAsync()
        {
            return await _leaveApplicationRepository.GetAllAsync();
        }

        public async Task<LeaveApplication> GetByIdAsync(int id)
        {
            var leave = await _leaveApplicationRepository.GetByIdAsync(id);
            if (leave == null)
                throw new Exception($"Leave application with ID {id} not found");
            return leave;
        }

        public async Task<IEnumerable<LeaveApplication>> GetByEmployeeIdAsync(int employeeId)
        {
            return await _leaveApplicationRepository.GetByEmployeeIdAsync(employeeId);
        }

        public async Task ApplyLeaveAsync(LeaveApplication leaveApplication)
        {
            // Business rule 1: start date cannot be in the past
            if (leaveApplication.StartDate < DateTime.Today)
                throw new Exception("Start date cannot be in the past");

            // Business rule 2: end date must be after start date
            if (leaveApplication.EndDate < leaveApplication.StartDate)
                throw new Exception("End date must be after start date");

            // Business rule 3: check leave balance
            var balances = await _leaveBalanceRepository
                .GetByEmployeeIdAsync(leaveApplication.EmployeeId);

            var balance = balances.FirstOrDefault(b =>
                b.LeaveTypeId == leaveApplication.LeaveTypeId);

            if (balance == null)
                throw new Exception("No leave balance found for this leave type");

            int requestedDays = (leaveApplication.EndDate - leaveApplication.StartDate).Days + 1;

            if (balance.RemainingDays < requestedDays)
                throw new Exception($"Insufficient leave balance. You have {balance.RemainingDays} days remaining");

            // Business rule 4: no overlapping leaves
            var existingLeaves = await _leaveApplicationRepository
                .GetByEmployeeIdAsync(leaveApplication.EmployeeId);

            bool hasOverlap = existingLeaves.Any(l =>
                l.Status != "Rejected" &&
                leaveApplication.StartDate <= l.EndDate &&
                leaveApplication.EndDate >= l.StartDate);

            if (hasOverlap)
                throw new Exception("You already have a leave application for these dates");

            // Set default values
            leaveApplication.Status = "Pending";
            leaveApplication.AppliedOn = DateTime.Now;

            await _leaveApplicationRepository.AddAsync(leaveApplication);
        }

        public async Task ApproveLeaveAsync(int id)
        {
            var leave = await _leaveApplicationRepository.GetByIdAsync(id);
            if (leave == null)
                throw new Exception("Leave application not found");

            // Business rule: only pending leaves can be approved
            if (leave.Status != "Pending")
                throw new Exception("Only pending leave applications can be approved");

            // Update leave balance
            var balances = await _leaveBalanceRepository
                .GetByEmployeeIdAsync(leave.EmployeeId);

            var balance = balances.FirstOrDefault(b =>
                b.LeaveTypeId == leave.LeaveTypeId);

            if (balance != null)
            {
                int days = (leave.EndDate - leave.StartDate).Days + 1;
                balance.UsedDays += days;
                await _leaveBalanceRepository.UpdateAsync(balance);
            }

            leave.Status = "Approved";
            await _leaveApplicationRepository.UpdateAsync(leave);
        }

        public async Task RejectLeaveAsync(int id, string rejectionReason)
        {
            var leave = await _leaveApplicationRepository.GetByIdAsync(id);
            if (leave == null)
                throw new Exception("Leave application not found");

            // Business rule: only pending leaves can be rejected
            if (leave.Status != "Pending")
                throw new Exception("Only pending leave applications can be rejected");

            leave.Status = "Rejected";
            leave.RejectionReason = rejectionReason;
            await _leaveApplicationRepository.UpdateAsync(leave);
        }
    }
}
