"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/admin/components/context/AuthContext";

export default function AdminHomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    router.replace(isAuthenticated ? "/admin/dashboard" : "/admin/login");
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="admin-loading-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
