using HRLeaveManagement.DAL.Data;
using HRLeaveManagement.DAL.Interfaces;
using HRLeaveManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.DAL.Repositories
{
    public class LeaveApplicationRepository : ILeaveApplicationRepository
    {
        private readonly AppDbContext _context;

        public LeaveApplicationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<LeaveApplication>> GetAllAsync()
        {
            return await _context.LeaveApplications
                .Include(l => l.Employee)
                .Include(l => l.LeaveType)
                .ToListAsync();
        }

        public async Task<LeaveApplication> GetByIdAsync(int id)
        {
            return await _context.LeaveApplications
                .Include(l => l.Employee)
                .Include(l => l.LeaveType)
                .FirstOrDefaultAsync(l => l.Id == id);
        }

        public async Task<IEnumerable<LeaveApplication>> GetByEmployeeIdAsync(int employeeId)
        {
            return await _context.LeaveApplications
                .Include(l => l.LeaveType)
                .Where(l => l.EmployeeId == employeeId)
                .ToListAsync();
        }

        public async Task AddAsync(LeaveApplication leaveApplication)
        {
            await _context.LeaveApplications.AddAsync(leaveApplication);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(LeaveApplication leaveApplication)
        {
            _context.LeaveApplications.Update(leaveApplication);
            await _context.SaveChangesAsync();
        }
    }
}
