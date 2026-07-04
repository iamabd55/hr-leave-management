"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/Sidebar";
import { useAuth } from "@/lib/auth";
import { clearToken } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  // Redirect to login if not authenticated (handles expired/missing token)
  useEffect(() => {
    if (!isLoading && !user) {
      clearToken();
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-full min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 md:pl-[260px]">{children}</main>
    </div>
  );
}
