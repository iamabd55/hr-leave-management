using HRLeaveManagement.BLL.Interfaces;
using HRLeaveManagement.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HRLeaveManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaveTypeController : ControllerBase
    {
        private readonly ILeaveTypeService _leaveTypeService;

        public LeaveTypeController(ILeaveTypeService leaveTypeService)
        {
            _leaveTypeService = leaveTypeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var leaveTypes = await _leaveTypeService.GetAllLeaveTypesAsync();
                return Ok(leaveTypes);
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
                var leaveType = await _leaveTypeService.GetLeaveTypeByIdAsync(id);
                return Ok(leaveType);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] LeaveType leaveType)
        {
            try
            {
                await _leaveTypeService.AddLeaveTypeAsync(leaveType);
                return Ok("Leave type added successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}