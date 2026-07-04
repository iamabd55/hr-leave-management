"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";
import { CheckCircle2, Clock, Zap, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("networkerror") || msg.toLowerCase().includes("econnrefused")) {
        setError("Cannot reach the server. Make sure the backend is running on port 5209.");
      } else {
        // Show the backend's actual message (e.g. "Invalid email or password")
        setError(msg || "An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[560px] bg-surface">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <h2 className="text-3xl font-heading font-bold text-text-main">
              HR Connect
            </h2>
            <p className="mt-2 text-text-muted">
              Sign in to manage your corporate leave requests
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              id="email"
              label="Work Email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Signing in…" : "Log in"}
            </Button>
          </form>
        </div>
      </div>

      {/* Right — Branding */}
      <div className="hidden lg:flex relative w-0 flex-1 bg-primary flex-col">
        <div className="absolute top-8 left-8">
          <span className="text-xl font-heading font-bold text-white">
            HR Connect
          </span>
        </div>

        <div className="flex flex-col justify-center h-full p-12 lg:p-24">
          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-white mb-12">
            Leave management, simplified.
          </h1>

          <div className="space-y-8 text-blue-100">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2.5 rounded-lg shrink-0">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <p className="text-lg">Applying for leave in seconds</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2.5 rounded-lg shrink-0">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <p className="text-lg">Tracking your balance at a glance</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2.5 rounded-lg shrink-0">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <p className="text-lg">Faster approvals without back-and-forth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
