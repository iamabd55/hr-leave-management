using HRLeaveManagement.BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HRLeaveManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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