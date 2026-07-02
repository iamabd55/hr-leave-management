using HRLeaveManagement.BLL.Interfaces;
using HRLeaveManagement.DAL.Interfaces;
using HRLeaveManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.BLL.Services
{
    public class LeaveTypeService : ILeaveTypeService
    {
        private readonly ILeaveTypeRepository _leaveTypeRepository;

        public LeaveTypeService(ILeaveTypeRepository leaveTypeRepository)
        {
            _leaveTypeRepository = leaveTypeRepository;
        }

        public async Task<IEnumerable<LeaveType>> GetAllLeaveTypesAsync()
        {
            return await _leaveTypeRepository.GetAllAsync();
        }

        public async Task<LeaveType> GetLeaveTypeByIdAsync(int id)
        {
            var leaveType = await _leaveTypeRepository.GetByIdAsync(id);
            if (leaveType == null)
                throw new Exception($"Leave type with ID {id} not found");
            return leaveType;
        }

        public async Task AddLeaveTypeAsync(LeaveType leaveType)
        {
            await _leaveTypeRepository.AddAsync(leaveType);
        }
    }
}
