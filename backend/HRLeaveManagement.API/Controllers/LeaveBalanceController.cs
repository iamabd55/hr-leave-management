using HRLeaveManagement.BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HRLeaveManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LeaveBalanceController : ControllerBase
    {
        private readonly ILeaveBalanceService _leaveBalanceService;

        public LeaveBalanceController(ILeaveBalanceService leaveBalanceService)
        {
            _leaveBalanceService = leaveBalanceService;
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<IActionResult> GetByEmployeeId(int employeeId)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var myEmployeeId = User.FindFirst("EmployeeId")?.Value;

            // Employees can only view their own balance; Admins can view anyone's
            if (role != "Admin" && myEmployeeId != employeeId.ToString())
                return Forbid();

            try
            {
                var balances = await _leaveBalanceService.GetBalanceByEmployeeIdAsync(employeeId);
                return Ok(balances);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}