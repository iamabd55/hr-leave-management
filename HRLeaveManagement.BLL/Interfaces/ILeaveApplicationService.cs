using HRLeaveManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.BLL.Interfaces
{
    public interface ILeaveApplicationService
    {
        Task<IEnumerable<LeaveApplication>> GetAllAsync();
        Task<LeaveApplication> GetByIdAsync(int id);
        Task<IEnumerable<LeaveApplication>> GetByEmployeeIdAsync(int employeeId);
        Task ApplyLeaveAsync(LeaveApplication leaveApplication);
        Task ApproveLeaveAsync(int id);
        Task RejectLeaveAsync(int id, string rejectionReason);
    }
}
