using HRLeaveManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.BLL.Interfaces
{
    public interface ILeaveTypeService
    {
        Task<IEnumerable<LeaveType>> GetAllLeaveTypesAsync();
        Task<LeaveType> GetLeaveTypeByIdAsync(int id);
        Task AddLeaveTypeAsync(LeaveType leaveType);
    }
}
