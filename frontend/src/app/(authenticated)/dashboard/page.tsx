"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { employeeApi, leaveBalanceApi, leaveApplicationApi } from "@/lib/api";
import type { LeaveBalance, LeaveApplication } from "@/types/api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusColor(status: string) {
  if (status === "Approved") return "bg-secondary";
  if (status === "Rejected") return "bg-danger";
  return "bg-primary";
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [recentLeaves, setRecentLeaves] = useState<LeaveApplication[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [employeeName, setEmployeeName] = useState<string | null>(null);
  const [unlinked, setUnlinked] = useState(false);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        if (isAdmin) {
          // Admin: fetch all leave applications for summary
          const all = await leaveApplicationApi.getAll();
          const pending = all.filter((l) => l.status === "Pending");
          setPendingCount(pending.length);
          setRecentLeaves(all.slice(0, 5));
        } else {
          // Employee: fetch own employee record, then balances + leave history
          const me = await employeeApi.getMe();
          setEmployeeName(me.name);

          const [bals, leaves] = await Promise.all([
            leaveBalanceApi.getByEmployee(me.id),
            leaveApplicationApi.getByEmployee(me.id),
          ]);
          setBalances(bals);
          setRecentLeaves(
            [...leaves].sort(
              (a, b) =>
                new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime()
            ).slice(0, 5)
          );
        }
      } catch (err: any) {
        console.error("Dashboard load error:", err);
        if (err.message?.includes("not linked")) {
          setUnlinked(true);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, isAdmin]);

  const greeting = isAdmin ? user?.name : (employeeName ?? user?.name);

  if (unlinked) {
    return (
      <div className="p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
        <h1 className="text-3xl font-heading font-semibold text-text-main mb-8">Dashboard</h1>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 text-red-800">
            <h2 className="text-lg font-semibold mb-2">Account Not Linked</h2>
            <p>Your login account is not linked to an employee record. You cannot view leave balances or apply for leave.</p>
            <p className="mt-2 text-sm">Please contact your HR administrator to link your account.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-text-main">
            Dashboard
          </h1>
          <p className="text-text-muted mt-1">
            Welcome back, {greeting ?? "…"}. Here is your leave summary.
          </p>
        </div>
        {!isAdmin && (
          <Link href="/apply-leave">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Apply for Leave
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-text-muted py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading dashboard…
        </div>
      ) : isAdmin ? (
        /* ── Admin view ────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-text-muted text-sm font-semibold mb-2">
                Pending Approvals
              </div>
              <div className="text-4xl font-heading font-bold text-text-main">
                {pendingCount}
              </div>
              <p className="text-xs text-text-muted mt-2">Awaiting your review</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* ── Employee leave balance cards ────────── */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {balances.map((b) => {

            const pct = b.totalDays > 0
              ? Math.round((b.remainingDays / b.totalDays) * 100)
              : 0;
            return (
              <Card key={b.id}>
                <CardContent className="pt-6">
                  <div className="text-text-muted text-sm font-semibold mb-2">
                    {b.leaveType.name}
                  </div>
                  <div className="text-4xl font-heading font-bold text-text-main mb-4">
                    {b.remainingDays}{" "}
                    <span className="text-lg text-text-muted font-normal">
                      / {b.totalDays} Days
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-text-muted text-right">
                    {b.remainingDays} days remaining
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Recent Leave Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {isAdmin ? "Recent Applications (All Employees)" : "My Recent Requests"}
          </CardTitle>
          <Link href={isAdmin ? "/approvals" : "/my-leaves"}>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && <TableHead>Employee</TableHead>}
              <TableHead>Type</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentLeaves.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 5 : 4}
                  className="text-center text-text-muted py-8"
                >
                  No leave requests found.
                </TableCell>
              </TableRow>
            ) : (
              recentLeaves.map((leave) => {
                const days =
                  Math.round(
                    (new Date(leave.endDate).getTime() -
                      new Date(leave.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  ) + 1;
                return (
                  <TableRow key={leave.id}>
                    {isAdmin && (
                      <TableCell className="font-medium">
                        {leave.employee?.name ?? `Employee #${leave.employeeId}`}
                      </TableCell>
                    )}
                    <TableCell className="font-medium relative">
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 ${statusColor(leave.status)}`}
                      />
                      {leave.leaveType?.name ?? `Type #${leave.leaveTypeId}`}
                    </TableCell>
                    <TableCell>
                      {formatDate(leave.startDate)}
                      {leave.startDate !== leave.endDate &&
                        ` – ${formatDate(leave.endDate)}`}
                    </TableCell>
                    <TableCell>{days}</TableCell>
                    <TableCell>
                      <Badge variant={leave.status.toLowerCase() as any}>
                        {leave.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
