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
import { Search, Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { leaveTypeApi } from "@/lib/api";
import type { LeaveType } from "@/types/api";

export default function LeaveTypesPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Modals state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form states
  const [newLeaveType, setNewLeaveType] = useState({ name: "", maxDays: 0 });
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);

  const loadLeaveTypes = async () => {
    try {
      setLoading(true);
      const data = await leaveTypeApi.getAll();
      setLeaveTypes(data);
    } catch (e: any) {
      setGlobalError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  // Handlers
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionLoading(true);
    try {
      await leaveTypeApi.add({
        name: newLeaveType.name,
        maxDays: Number(newLeaveType.maxDays),
      });
      setAddOpen(false);
      setNewLeaveType({ name: "", maxDays: 0 });
      await loadLeaveTypes();
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeaveType) return;
    setActionError(null);
    setActionLoading(true);
    try {
      await leaveTypeApi.update(editingLeaveType.id, {
        name: editingLeaveType.name,
        maxDays: Number(editingLeaveType.maxDays),
      });
      setEditOpen(false);
      setEditingLeaveType(null);
      await loadLeaveTypes();
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this leave type? This might affect employees who have balances assigned to this type.")) return;
    try {
      await leaveTypeApi.delete(id);
      setLeaveTypes((prev) => prev.filter((lt) => lt.id !== id));
    } catch (e: any) {
      setGlobalError(e.message);
    }
  };

  const filteredLeaveTypes = leaveTypes.filter(
    (lt) => !search || lt.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto w-full flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-text-main">
            Leave Types
          </h1>
          <p className="text-text-muted mt-1">
            Manage the categories of time-off and their maximum allowances.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Leave Type
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
              placeholder="Search by name…"
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
                  <TableHead>Leave Type Name</TableHead>
                  <TableHead>Max Default Days</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaveTypes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-text-muted py-8"
                    >
                      No leave types found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeaveTypes.map((lt) => (
                    <TableRow key={lt.id}>
                      <TableCell className="font-medium">{lt.name}</TableCell>
                      <TableCell>{lt.maxDays} days</TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingLeaveType(lt);
                            setEditOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4 text-text-muted hover:text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(lt.id)}
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

      {/* ── Add Leave Type Modal ── */}
      <Modal
        isOpen={addOpen}
        onClose={() => {
          setAddOpen(false);
          setActionError(null);
          setNewLeaveType({ name: "", maxDays: 0 });
        }}
        title="Add Leave Type"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button form="add-leavetype-form" type="submit" disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Create
            </Button>
          </>
        }
      >
        <form id="add-leavetype-form" className="space-y-4" onSubmit={handleAdd}>
          <Input
            label="Name"
            placeholder="e.g. Sabbatical Leave"
            value={newLeaveType.name}
            onChange={(e) => setNewLeaveType({ ...newLeaveType, name: e.target.value })}
            required
          />
          <Input
            label="Default Max Days"
            type="number"
            min={0}
            placeholder="30"
            value={newLeaveType.maxDays}
            onChange={(e) => setNewLeaveType({ ...newLeaveType, maxDays: parseInt(e.target.value) || 0 })}
            required
          />
          {actionError && (
            <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {actionError}
            </p>
          )}
        </form>
      </Modal>

      {/* ── Edit Leave Type Modal ── */}
      <Modal
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          setActionError(null);
          setEditingLeaveType(null);
        }}
        title="Edit Leave Type"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button form="edit-leavetype-form" type="submit" disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Save Changes
            </Button>
          </>
        }
      >
        <form id="edit-leavetype-form" className="space-y-4" onSubmit={handleEdit}>
          <Input
            label="Name"
            placeholder="e.g. Sabbatical Leave"
            value={editingLeaveType?.name || ""}
            onChange={(e) =>
              setEditingLeaveType((prev) => prev ? { ...prev, name: e.target.value } : null)
            }
            required
          />
          <Input
            label="Default Max Days"
            type="number"
            min={0}
            placeholder="30"
            value={editingLeaveType?.maxDays || 0}
            onChange={(e) =>
              setEditingLeaveType((prev) => prev ? { ...prev, maxDays: parseInt(e.target.value) || 0 } : null)
            }
            required
          />
          {actionError && (
            <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {actionError}
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
}
