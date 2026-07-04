using HRLeaveManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.DAL.Interfaces
{
    public interface ILeaveBalanceRepository
    {
        Task<IEnumerable<LeaveBalance>> GetByEmployeeIdAsync(int employeeId);
        Task AddAsync(LeaveBalance leaveBalance);
        Task UpdateAsync(LeaveBalance leaveBalance);
    }
}
