using HRLeaveManagement.DAL.Data;
using HRLeaveManagement.DAL.Interfaces;
using HRLeaveManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.DAL.Repositories
{
    public class LeaveBalanceRepository : ILeaveBalanceRepository
    {
        private readonly AppDbContext _context;

        public LeaveBalanceRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<LeaveBalance>> GetByEmployeeIdAsync(int employeeId)
        {
            return await _context.LeaveBalances
                .Include(lb => lb.LeaveType)
                .Where(lb => lb.EmployeeId == employeeId)
                .ToListAsync();
        }

        public async Task AddAsync(LeaveBalance leaveBalance)
        {
            await _context.LeaveBalances.AddAsync(leaveBalance);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(LeaveBalance leaveBalance)
        {
            _context.LeaveBalances.Update(leaveBalance);
            await _context.SaveChangesAsync();
        }
    }
}
