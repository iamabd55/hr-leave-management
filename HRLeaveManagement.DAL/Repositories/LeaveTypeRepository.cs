using HRLeaveManagement.DAL.Data;
using HRLeaveManagement.DAL.Interfaces;
using HRLeaveManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.DAL.Repositories
{
    public class LeaveTypeRepository : ILeaveTypeRepository
    {
        private readonly AppDbContext _context;

        public LeaveTypeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<LeaveType>> GetAllAsync()
        {
            return await _context.LeaveTypes.ToListAsync();
        }

        public async Task<LeaveType> GetByIdAsync(int id)
        {
            return await _context.LeaveTypes.FindAsync(id);
        }

        public async Task AddAsync(LeaveType leaveType)
        {
            await _context.LeaveTypes.AddAsync(leaveType);
            await _context.SaveChangesAsync();
        }
    }
}
