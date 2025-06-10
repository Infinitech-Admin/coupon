"use client"

import type React from "react"
import { usePathname } from "next/navigation"

import { Toaster } from "react-hot-toast"
import { AdminSidebar } from "@/components/AdminSidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/admin/login"

  if (isLoginPage) {
    return (
      <>
        <main>{children}</main>
        <Toaster position="top-right" />
      </>
    )
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-border mx-2" />
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
      </SidebarInset>
      <Toaster position="top-right" />
    </SidebarProvider>
  )
}
