using HRLeaveManagement.BLL.Interfaces;
using HRLeaveManagement.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HRLeaveManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LeaveApplicationController : ControllerBase
    {
        private readonly ILeaveApplicationService _leaveApplicationService;

        public LeaveApplicationController(ILeaveApplicationService leaveApplicationService)
        {
            _leaveApplicationService = leaveApplicationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var leaves = await _leaveApplicationService.GetAllAsync();
                return Ok(leaves);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var leave = await _leaveApplicationService.GetByIdAsync(id);
                return Ok(leave);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<IActionResult> GetByEmployeeId(int employeeId)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var myEmployeeId = User.FindFirst("EmployeeId")?.Value;

            if (role != "Admin" && myEmployeeId != employeeId.ToString())
                return Forbid();

            try
            {
                var leaves = await _leaveApplicationService.GetByEmployeeIdAsync(employeeId);
                return Ok(leaves);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Apply([FromBody] LeaveApplication leaveApplication)
        {
            try
            {
                await _leaveApplicationService.ApplyLeaveAsync(leaveApplication);
                return Ok("Leave application submitted successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Approve(int id)
        {
            try
            {
                await _leaveApplicationService.ApproveLeaveAsync(id);
                return Ok("Leave approved successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Reject(int id, [FromBody] string rejectionReason)
        {
            try
            {
                await _leaveApplicationService.RejectLeaveAsync(id, rejectionReason);
                return Ok("Leave rejected successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}