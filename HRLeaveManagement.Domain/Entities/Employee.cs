using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.Domain.Entities
{
    public class Employee
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Department { get; set; }
        public DateTime JoiningDate { get; set; }
        public string Role { get; set; } // "Admin" or "Employee"

        // Navigation properties
        public ICollection<LeaveApplication> LeaveApplications { get; set; }
        public ICollection<LeaveBalance> LeaveBalances { get; set; }
    }
}
