using HRLeaveManagement.BLL.Interfaces;
using HRLeaveManagement.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRLeaveManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]

    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeeController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var employees = await _employeeService.GetAllEmployeesAsync();
                return Ok(employees);
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
                var employee = await _employeeService.GetEmployeeByIdAsync(id);
                return Ok(employee);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] Employee employee)
        {
            try
            {
                await _employeeService.AddEmployeeAsync(employee);
                return Ok("Employee added successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Employee employee)
        {
            try
            {
                employee.Id = id;
                await _employeeService.UpdateEmployeeAsync(employee);
                return Ok("Employee updated successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _employeeService.DeleteEmployeeAsync(id);
                return Ok("Employee deleted successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("me")]
        [Authorize] // overrides the class-level Admin-only restriction for this one action
        public async Task<IActionResult> GetMe()
        {
            var employeeIdClaim = User.FindFirst("EmployeeId")?.Value;

            if (string.IsNullOrEmpty(employeeIdClaim))
                return BadRequest("This account is not linked to an employee record");

            try
            {
                var employee = await _employeeService.GetEmployeeByIdAsync(int.Parse(employeeIdClaim));
                return Ok(employee);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}