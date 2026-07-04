"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Search, Plus, Trash2, UserPlus, Loader2 } from "lucide-react";
import { employeeApi, authApi } from "@/lib/api";
import type { Employee } from "@/types/api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Add Employee modal
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [newEmp, setNewEmp] = useState({
    name: "",
    email: "",
    department: "",
    joiningDate: "",
    role: "Employee",
  });


  const loadEmployees = async () => {
    try {
      const data = await employeeApi.getAll();
      setEmployees(data);
    } catch (e: any) {
      setGlobalError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEmployees(); }, []);

  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);
    setInviteLink(null);
    try {
      // 1. Create Employee Record
      await employeeApi.add({
        name: newEmp.name,
        email: newEmp.email,
        department: newEmp.department,
        joiningDate: new Date(newEmp.joiningDate).toISOString(),
        role: newEmp.role,
      });

      // 2. Retrieve Generated EmployeeId
      const createdEmp = await employeeApi.getByEmail(newEmp.email);
      if (!createdEmp) throw new Error("Employee created but could not retrieve ID for linking.");

      // 3. Generate Invite Link
      const link = `${window.location.origin}/setup?email=${encodeURIComponent(newEmp.email)}&name=${encodeURIComponent(newEmp.name)}&role=${encodeURIComponent(newEmp.role)}&id=${createdEmp.id}`;
      setInviteLink(link);
      
      await loadEmployees();
    } catch (e: any) {
      setAddError(e.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleCloseAddModal = () => {
    setAddOpen(false);
    setAddError(null);
    setInviteLink(null);
    setNewEmp({ name: "", email: "", department: "", joiningDate: "", role: "Employee" });
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      await employeeApi.delete(id);
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (e: any) {
      setGlobalError(e.message);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      !search ||
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto w-full flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-text-main">
            Employee Management
          </h1>
          <p className="text-text-muted mt-1">
            Manage employee records and onboard new hires.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Onboard Employee
          </Button>
        </div>
      </div>

      {globalError && (
        <div className="mb-4 px-3 py-2.5 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
          {globalError}
        </div>
      )}

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center bg-white">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, or department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center gap-2 text-text-muted py-12 justify-center">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-text-muted py-8"
                    >
                      No employees found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell className="text-text-muted">{emp.email}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.role}</TableCell>
                      <TableCell>{formatDate(emp.joiningDate)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEmployee(emp.id)}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* ── Onboard Employee Modal ── */}
      <Modal
        isOpen={addOpen}
        onClose={handleCloseAddModal}
        title={inviteLink ? "Onboarding Complete" : "Onboard New Employee"}
        footer={
          inviteLink ? (
            <Button onClick={handleCloseAddModal}>Done</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={handleCloseAddModal} disabled={addLoading}>
                Cancel
              </Button>
              <Button form="add-employee-form" type="submit" disabled={addLoading}>
                {addLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Create Employee
              </Button>
            </>
          )
        }
      >
        {inviteLink ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-full w-12 h-12 mx-auto mb-2">
              <UserPlus className="h-6 w-6" />
            </div>
            <p className="text-center text-text-main font-semibold">
              Employee record created!
            </p>
            <p className="text-sm text-text-muted text-center mb-4">
              Share the following setup link with the employee via chat or email. They will use it to set their password and finish creating their account.
            </p>
            <div className="p-3 bg-slate-50 border border-border rounded-md break-all">
              <a href={inviteLink} className="text-primary hover:underline text-sm font-medium">
                {inviteLink}
              </a>
            </div>
            <Button 
              variant="secondary" 
              className="w-full mt-2"
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
                alert("Link copied to clipboard!");
              }}
            >
              Copy Link
            </Button>
          </div>
        ) : (
          <form id="add-employee-form" className="space-y-5" onSubmit={handleAddEmployee}>
            <p className="text-sm text-text-muted -mt-2">
              This will create their HR profile and generate an invitation link for them to set up their login account.
            </p>
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              value={newEmp.name}
              onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="jane.doe@company.com"
              value={newEmp.email}
              onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
              required
            />
            <Input
              label="Department"
              placeholder="Engineering"
              value={newEmp.department}
              onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
              required
            />
            <Input
              label="Joining Date"
              type="date"
              value={newEmp.joiningDate}
              onChange={(e) => setNewEmp({ ...newEmp, joiningDate: e.target.value })}
              required
            />
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text-main">Role</label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                value={newEmp.role}
                onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
              >
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            {addError && (
              <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {addError}
              </p>
            )}
          </form>
        )}
      </Modal>
    </div>
  );
}
