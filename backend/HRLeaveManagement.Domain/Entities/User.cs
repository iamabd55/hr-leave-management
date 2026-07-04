using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string Role { get; set; } // "Admin" or "Employee"


        // Optional link — set when Role == "Employee", null for Admins
        public int? EmployeeId { get; set; }
        public Employee? Employee { get; set; }
    }
}
