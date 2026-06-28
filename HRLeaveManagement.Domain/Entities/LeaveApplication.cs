using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.Domain.Entities
{
    public class LeaveApplication
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public int LeaveTypeId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; } // Pending, Approved, Rejected
        public string? RejectionReason { get; set; }
        public DateTime AppliedOn { get; set; }

        // Navigation properties
        public Employee Employee { get; set; }
        public LeaveType LeaveType { get; set; }
    }
}
