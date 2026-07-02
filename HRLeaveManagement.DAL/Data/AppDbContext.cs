using System;
using System.Collections.Generic;
using System.Text;
using HRLeaveManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
namespace HRLeaveManagement.DAL.Data
{
    public class AppDbContext: DbContext
    {
        // Constructor - receives options from Program.cs
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<LeaveType> LeaveTypes { get; set; }
        public DbSet<LeaveApplication> LeaveApplications { get; set; }
        public DbSet<LeaveBalance> LeaveBalances { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)  
        {
            base.OnModelCreating(modelBuilder); 

            // Seed default Leave Types
            modelBuilder.Entity<LeaveType>().HasData(
                new LeaveType { Id = 1, Name = "Annual", MaxDays = 15 },
                new LeaveType { Id = 2, Name = "Sick", MaxDays = 10 },
                new LeaveType { Id = 3, Name = "Casual", MaxDays = 7 }
            );
            modelBuilder.Entity<User>()
            .HasOne(u => u.Employee)
            .WithOne()
            .HasForeignKey<User>(u => u.EmployeeId)
            .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
