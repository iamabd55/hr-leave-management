"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  employeeApi,
  leaveTypeApi,
  leaveBalanceApi,
  leaveApplicationApi,
} from "@/lib/api";
import type { LeaveType, LeaveBalance } from "@/types/api";

export default function ApplyLeavePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [unlinked, setUnlinked] = useState(false);

  const [leaveTypeId, setLeaveTypeId] = useState<number>(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [me, types] = await Promise.all([
          employeeApi.getMe(),
          leaveTypeApi.getAll(),
        ]);
        setEmployeeId(me.id);
        setLeaveTypes(types);
        if (types.length > 0) setLeaveTypeId(types[0].id);

        const bals = await leaveBalanceApi.getByEmployee(me.id);
        setBalances(bals);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !leaveTypeId || !startDate || !endDate) return;
    setError(null);
    setSubmitting(true);
    try {
      await leaveApplicationApi.apply({
        employeeId,
        leaveTypeId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        reason,
      });
      setSuccess(true);
      setTimeout(() => router.push("/my-leaves"), 1500);
    } catch (err: any) {
      setError(err.message ?? "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1000px] mx-auto w-full">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-semibold text-text-muted hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-heading font-semibold text-text-main">
          Apply for Leave
        </h1>
        <p className="text-text-muted mt-1">
          Submit a new time-off request. It will be sent to your manager for
          approval.
        </p>
      </div>

      {unlinked ? (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 text-red-800">
            <h2 className="text-lg font-semibold mb-2">Account Not Linked</h2>
            <p>Your login account is not linked to an employee record. You cannot apply for leave.</p>
            <p className="mt-2 text-sm">Please contact your HR administrator to link your account.</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex items-center gap-2 text-text-muted py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Form ────────────────────────────────── */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 lg:p-8">
                {success ? (
                  <div className="py-8 text-center">
                    <div className="text-secondary text-4xl mb-3">✓</div>
                    <p className="font-semibold text-text-main">
                      Leave request submitted!
                    </p>
                    <p className="text-sm text-text-muted mt-1">
                      Redirecting to My Leaves…
                    </p>
                  </div>
                ) : (
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-text-main">
                        Leave Type
                      </label>
                      <select
                        className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                        value={leaveTypeId}
                        onChange={(e) =>
                          setLeaveTypeId(Number(e.target.value))
                        }
                        required
                      >
                        {leaveTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} (max {t.maxDays} days)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Input
                        label="Start Date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                      <Input
                        label="End Date"
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-text-main">
                        Reason
                      </label>
                      <textarea
                        className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
                        placeholder="Please provide a reason for your leave request…"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2">
                        {error}
                      </p>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                      <Button variant="ghost" type="button" onClick={() => router.back()}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting…
                          </>
                        ) : (
                          "Submit Request"
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Balance Sidebar ──────────────────────── */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Balances</CardTitle>
              </CardHeader>
              <CardContent>
                {balances.length === 0 ? (
                  <p className="text-sm text-text-muted">No balance data.</p>
                ) : (
                  <div className="space-y-4">
                    {balances.map((b) => {
                      const pct =
                        b.totalDays > 0
                          ? Math.round((b.remainingDays / b.totalDays) * 100)
                          : 0;
                      return (
                        <div key={b.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-text-muted">
                              {b.leaveType.name}
                            </span>
                            <span className="font-semibold text-text-main">
                              {b.remainingDays} / {b.totalDays}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-secondary rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
