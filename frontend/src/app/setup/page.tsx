"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";

function SetupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email") ?? "";
  const name = searchParams.get("name") ?? "";
  const role = (searchParams.get("role") ?? "Employee") as "Admin" | "Employee";
  const employeeIdStr = searchParams.get("id");
  const employeeId = employeeIdStr ? parseInt(employeeIdStr, 10) : null;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await authApi.register({
        name,
        email,
        password,
        role,
        employeeId,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to set up account.");
    } finally {
      setLoading(false);
    }
  };

  if (!email || !name || !employeeId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-danger">Invalid Link</h2>
        <p className="text-text-muted mt-2">
          This setup link is missing required parameters. Please ask your administrator to generate a new link.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-secondary text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-text-main mb-2">Account Created!</h2>
        <p className="text-text-muted">
          Your login credentials have been set up successfully. Redirecting you to login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-slate-50 p-4 rounded-md border border-border mb-6">
        <p className="text-sm text-text-muted mb-1">Setting up account for:</p>
        <p className="font-semibold text-text-main">{name}</p>
        <p className="text-sm font-medium text-text-main">{email}</p>
      </div>

      <Input
        label="Choose a Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      {error && (
        <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Complete Setup
      </Button>
    </form>
  );
}

export default function SetupAccountPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary tracking-tight">
            HR Connect
          </h1>
          <p className="text-text-muted mt-2 text-lg">Welcome aboard.</p>
        </div>

        <Card className="shadow-lg border-none">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-text-main mb-6">
              Account Setup
            </h2>
            <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>}>
              <SetupForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
