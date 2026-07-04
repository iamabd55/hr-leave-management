using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.Domain.Entities
{
    public class LeaveType
    {
        public int Id { get; set; }
        public string Name { get; set; } // Annual, Sick, Casual
        public int MaxDays { get; set; }

        // Navigation properties
        public ICollection<LeaveApplication>? LeaveApplications { get; set; }
        public ICollection<LeaveBalance>? LeaveBalances { get; set; }
    }
}
