using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.Domain.Entities
{
    public class LeaveBalance
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public int LeaveTypeId { get; set; }
        public int TotalDays { get; set; }
        public int UsedDays { get; set; }
        public int RemainingDays => TotalDays - UsedDays; // calculated automatically

        // Navigation properties
        public Employee Employee { get; set; }
        public LeaveType LeaveType { get; set; }
    }
}
