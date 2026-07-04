using HRLeaveManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.DAL.Interfaces
{
    public interface ILeaveTypeRepository
    {
        Task<IEnumerable<LeaveType>> GetAllAsync();
        Task<LeaveType> GetByIdAsync(int id);
        Task AddAsync(LeaveType leaveType);
        Task UpdateAsync(LeaveType leaveType);
        Task DeleteAsync(int id);
    }
}
