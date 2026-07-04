"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Check, X, Search, Loader2 } from "lucide-react";
import { leaveApplicationApi } from "@/lib/api";
import type { LeaveApplication } from "@/types/api";

type StatusFilter = "All" | "Pending" | "Approved" | "Rejected";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function daysBetween(start: string, end: string) {
  return (
    Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );
}

export default function ApprovalsPage() {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("Pending");
  const [search, setSearch] = useState("");

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await leaveApplicationApi.getAll();
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime()
      );
      setApplications(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id: number) => {
    setActionError(null);
    try {
      await leaveApplicationApi.approve(id);
      // Optimistic update
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Approved" } : a))
      );
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    setRejectLoading(true);
    setActionError(null);
    try {
      await leaveApplicationApi.reject(rejectTarget, rejectionReason);
      setApplications((prev) =>
        prev.map((a) =>
          a.id === rejectTarget
            ? { ...a, status: "Rejected", rejectionReason }
            : a
        )
      );
      setRejectTarget(null);
      setRejectionReason("");
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setRejectLoading(false);
    }
  };

  const filtered = applications.filter((a) => {
    const matchesStatus = filter === "All" || a.status === filter;
    const matchesSearch =
      !search ||
      a.employee?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.leaveType?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto w-full flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-semibold text-text-main">
          Leave Approvals
        </h1>
        <p className="text-text-muted mt-1">
          Review and manage pending leave requests from your team.
        </p>
      </div>

      {actionError && (
        <div className="mb-4 px-3 py-2.5 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by employee or leave type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex space-x-1 bg-slate-100 p-1 rounded-md">
            {(["All", "Pending", "Approved", "Rejected"] as StatusFilter[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                    filter === tab
                      ? "bg-white text-primary shadow-sm"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
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
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-text-muted py-8"
                    >
                      No applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium relative">
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${
                            a.status === "Approved"
                              ? "bg-secondary"
                              : a.status === "Rejected"
                              ? "bg-danger"
                              : "bg-primary"
                          }`}
                        />
                        {a.employee?.name ?? `Employee #${a.employeeId}`}
                      </TableCell>
                      <TableCell>
                        {a.leaveType?.name ?? `Type #${a.leaveTypeId}`}
                      </TableCell>
                      <TableCell>
                        {formatDate(a.startDate)}
                        {a.startDate !== a.endDate &&
                          ` – ${formatDate(a.endDate)}`}
                      </TableCell>
                      <TableCell>{daysBetween(a.startDate, a.endDate)}</TableCell>
                      <TableCell className="text-text-muted">
                        {formatDate(a.appliedOn)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={a.status.toLowerCase() as any}>
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {a.status === "Pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setRejectTarget(a.id)}
                            >
                              <X className="h-4 w-4 text-danger mr-1" /> Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(a.id)}
                            >
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectTarget !== null}
        onClose={() => {
          setRejectTarget(null);
          setRejectionReason("");
          setActionError(null);
        }}
        title="Reject Leave Request"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setRejectTarget(null)}
              disabled={rejectLoading}
            >
              Cancel
            </Button>
            <Button
              className="bg-danger hover:bg-red-800 text-white"
              onClick={handleRejectConfirm}
              disabled={rejectLoading || !rejectionReason.trim()}
            >
              {rejectLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Confirm Rejection
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Please provide a reason — the employee will be notified.
          </p>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-main">
              Rejection Reason <span className="text-danger">*</span>
            </label>
            <textarea
              className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
              placeholder="Enter reason…"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          {actionError && (
            <p className="text-sm text-danger">{actionError}</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
