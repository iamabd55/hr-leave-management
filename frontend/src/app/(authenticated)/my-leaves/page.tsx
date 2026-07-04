"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Search, Download, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { employeeApi, leaveApplicationApi } from "@/lib/api";
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
      (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1
  );
}

function statusStripColor(status: string) {
  if (status === "Approved") return "bg-secondary";
  if (status === "Rejected") return "bg-danger";
  return "bg-primary";
}

export default function MyLeavesPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [unlinked, setUnlinked] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await employeeApi.getMe();
        const data = await leaveApplicationApi.getByEmployee(me.id);
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime()
        );
        setLeaves(sorted);
      } catch (e: any) {
        console.error(e);
        if (e.message?.includes("not linked")) {
          setUnlinked(true);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = leaves.filter((l) => {
    const matchesStatus = filter === "All" || l.status === filter;
    const matchesSearch =
      !search ||
      l.leaveType?.name?.toLowerCase().includes(search.toLowerCase()) ||
      formatDate(l.startDate).toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (unlinked) {
    return (
      <div className="p-6 lg:p-8 max-w-[1440px] mx-auto w-full flex flex-col h-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-text-main">
              My Leave History
            </h1>
          </div>
        </div>
        <Card className="bg-red-50 border-red-200">
          <div className="p-6 text-red-800">
            <h2 className="text-lg font-semibold mb-2">Account Not Linked</h2>
            <p>Your login account is not linked to an employee record. You cannot view leave history.</p>
            <p className="mt-2 text-sm">Please contact your HR administrator to link your account.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto w-full flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-text-main">
            My Leave History
          </h1>
          <p className="text-text-muted mt-1">
            View and track all your past and upcoming leave requests.
          </p>
        </div>
        <Button variant="secondary">
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-white">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by type or date…"
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
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-text-muted py-8"
                    >
                      No leave requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium relative">
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${statusStripColor(l.status)}`}
                        />
                        {l.leaveType?.name ?? `Type #${l.leaveTypeId}`}
                      </TableCell>
                      <TableCell>{formatDate(l.startDate)}</TableCell>
                      <TableCell>{formatDate(l.endDate)}</TableCell>
                      <TableCell>
                        {daysBetween(l.startDate, l.endDate)} Day
                        {daysBetween(l.startDate, l.endDate) !== 1 ? "s" : ""}
                      </TableCell>
                      <TableCell className="text-text-muted">
                        {formatDate(l.appliedOn)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={l.status.toLowerCase() as any}>
                          {l.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
