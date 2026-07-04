using HRLeaveManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.DAL.Interfaces
{
    public interface ILeaveApplicationRepository
    {
        Task<IEnumerable<LeaveApplication>> GetAllAsync();
        Task<LeaveApplication> GetByIdAsync(int id);
        Task<IEnumerable<LeaveApplication>> GetByEmployeeIdAsync(int employeeId);
        Task AddAsync(LeaveApplication leaveApplication);
        Task UpdateAsync(LeaveApplication leaveApplication);
    }
}
