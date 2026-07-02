using HRLeaveManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.BLL.Interfaces
{
    public interface ILeaveBalanceService
    {
        Task<IEnumerable<LeaveBalance>> GetBalanceByEmployeeIdAsync(int employeeId);
        Task InitializeBalanceForEmployeeAsync(int employeeId);
    }
}
