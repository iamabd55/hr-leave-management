"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  History,
  CheckSquare,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { clearToken } from "@/lib/api";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, adminOnly: false, employeeOnly: false },
  { name: "Apply for Leave", href: "/apply-leave", icon: FileText, adminOnly: false, employeeOnly: true },
  { name: "My Leaves", href: "/my-leaves", icon: History, adminOnly: false, employeeOnly: true },
  { name: "Approvals", href: "/approvals", icon: CheckSquare, adminOnly: true, employeeOnly: false },
  { name: "Employees", href: "/employees", icon: Users, adminOnly: true, employeeOnly: false },
  { name: "Leave Types", href: "/leave-types", icon: FileText, adminOnly: true, employeeOnly: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (isAdmin && item.employeeOnly) return false;
    if (!isAdmin && item.adminOnly) return false;
    return true;
  });

  return (
    <aside className="fixed inset-y-0 left-0 w-[260px] bg-primary text-blue-100 flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <h1 className="text-xl font-heading font-semibold text-white">
          HR Connect
        </h1>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
        {visibleItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors relative ${
                isActive
                  ? "bg-white/10 text-white font-medium"
                  : "hover:bg-white/5 hover:text-white"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-secondary rounded-r-full" />
              )}
              <Icon className="h-5 w-5 stroke-[1.5]" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white truncate max-w-[160px]">
              {user?.name ?? "Loading…"}
            </div>
            <div className="text-xs text-blue-300 mt-0.5">{user?.role ?? ""}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-md text-blue-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
