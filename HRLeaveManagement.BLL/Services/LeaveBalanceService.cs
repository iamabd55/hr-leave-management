using HRLeaveManagement.BLL.Interfaces;
using HRLeaveManagement.DAL.Interfaces;
using HRLeaveManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.BLL.Services
{
    public class LeaveBalanceService : ILeaveBalanceService
    {
        private readonly ILeaveBalanceRepository _leaveBalanceRepository;
        private readonly ILeaveTypeRepository _leaveTypeRepository;

        public LeaveBalanceService(
            ILeaveBalanceRepository leaveBalanceRepository,
            ILeaveTypeRepository leaveTypeRepository)
        {
            _leaveBalanceRepository = leaveBalanceRepository;
            _leaveTypeRepository = leaveTypeRepository;
        }

        public async Task<IEnumerable<LeaveBalance>> GetBalanceByEmployeeIdAsync(int employeeId)
        {
            return await _leaveBalanceRepository.GetByEmployeeIdAsync(employeeId);
        }

        public async Task InitializeBalanceForEmployeeAsync(int employeeId)
        {
            // When a new employee is added, automatically create leave balances
            // for all leave types
            var leaveTypes = await _leaveTypeRepository.GetAllAsync();

            foreach (var leaveType in leaveTypes)
            {
                var balance = new LeaveBalance
                {
                    EmployeeId = employeeId,
                    LeaveTypeId = leaveType.Id,
                    TotalDays = leaveType.MaxDays,
                    UsedDays = 0
                };
                await _leaveBalanceRepository.AddAsync(balance);
            }
        }
    }
}
