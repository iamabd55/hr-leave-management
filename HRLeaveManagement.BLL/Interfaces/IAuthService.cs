using HRLeaveManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.BLL.Interfaces
{
    public interface IAuthService
    {
        Task<User> RegisterAsync(string name, string email, string password, string role, int? employeeId);
        Task<string> LoginAsync(string email, string password);
    }

}
