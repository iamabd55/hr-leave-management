using HRLeaveManagement.BLL.Interfaces;
using HRLeaveManagement.DAL.Interfaces;
using HRLeaveManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace HRLeaveManagement.BLL.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly ILeaveBalanceService _leaveBalanceService;
        public EmployeeService(IEmployeeRepository employeeRepository, ILeaveBalanceService leaveBalanceService)
        {
            _employeeRepository = employeeRepository;
            _leaveBalanceService = leaveBalanceService;
        }

        public async Task<IEnumerable<Employee>> GetAllEmployeesAsync()
        {
            return await _employeeRepository.GetAllAsync();
        }

        public async Task<Employee> GetEmployeeByIdAsync(int id)
        {
            var employee = await _employeeRepository.GetByIdAsync(id);
            if (employee == null)
                throw new Exception($"Employee with ID {id} not found");
            return employee;
        }

        public async Task AddEmployeeAsync(Employee employee)
        {
            // Business rule: email must be unique
            var existing = await _employeeRepository.GetAllAsync();
            if (existing.Any(e => e.Email == employee.Email))
                throw new Exception("An employee with this email already exists");

            // Set joining date automatically
            employee.JoiningDate = DateTime.Now;

            // Save employee first
            await _employeeRepository.AddAsync(employee);

            // Initialize leave balance for all leave types automatically
            await _leaveBalanceService.InitializeBalanceForEmployeeAsync(employee.Id);
        }

        public async Task UpdateEmployeeAsync(Employee employee)
        {
            // Check if employee exists first
            var existing = await _employeeRepository.GetByIdAsync(employee.Id);
            if (existing == null)
                throw new Exception($"Employee with ID {employee.Id} not found");

            // Update only the fields that should change
            existing.Name = employee.Name;
            existing.Department = employee.Department;
            existing.Role = employee.Role;
            // Note: we don't update Email or JoiningDate

            await _employeeRepository.UpdateAsync(existing);
        }

        public async Task DeleteEmployeeAsync(int id)
        {
            var existing = await _employeeRepository.GetByIdAsync(id);
            if (existing == null)
                throw new Exception($"Employee with ID {id} not found");

            await _employeeRepository.DeleteAsync(id);
        }
    }
}
