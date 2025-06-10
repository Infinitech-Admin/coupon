"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Building2, Home, Scan, Ticket, BarChart3, LogOut, Sun, Moon } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isMobile, setOpenMobile } = useSidebar()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.replace("/admin/login")
    } else {
      setIsAuthenticated(true)
    }

    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme)
      updateDocumentTheme(savedTheme)
    } else {
      setTheme("light")
      updateDocumentTheme("light")
    }
  }, [router])

  function updateDocumentTheme(theme: "light" | "dark") {
    if (typeof window !== "undefined") {
      const root = document.documentElement
      if (theme === "dark") {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    updateDocumentTheme(newTheme)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas" className="border-r-0">
      <div className="flex h-full w-full flex-col bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white">
        <SidebarHeader className="h-[100px] border-b border-blue-600/20 flex items-center justify-center px-4">
          <div className="flex items-center justify-center gap-2 px-6 py-5">
            <div className="bg-white p-1.5 rounded-full">
              <img alt="Logo" className="h-12 w-auto" src="/aftershift.png" />
            </div>
            <span className="text-xl font-bold tracking-wide text-white">Admin</span>
          </div>
        </SidebarHeader>

        <SidebarContent className="scrollbar-hide">
          {/* Main */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-blue-100">Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="text-blue-50 hover:bg-blue-600/30 data-[active=true]:bg-blue-600/50"
                    isActive={pathname === "/admin"}
                    onClick={handleNavClick}
                  >
                    <Link href="/admin">
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Employee */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-blue-100">Employee</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="text-blue-50 hover:bg-blue-600/30 data-[active=true]:bg-blue-600/50"
                    isActive={pathname === "/admin/employee"}
                    onClick={handleNavClick}
                  >
                    <Link href="/admin/employee">
                      <Building2 className="h-4 w-4" />
                      <span>Employee</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Meal Coupons */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-blue-100">Meal Coupons</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="text-blue-50 hover:bg-blue-600/30 data-[active=true]:bg-blue-600/50"
                    isActive={pathname === "/admin/coupons/scanner"}
                    onClick={handleNavClick}
                  >
                    <Link href="/admin/coupons/scanner">
                      <Scan className="h-4 w-4" />
                      <span>Scan Coupons</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="text-blue-50 hover:bg-blue-600/30 data-[active=true]:bg-blue-600/50"
                    isActive={pathname === "/admin/coupons/generate"}
                    onClick={handleNavClick}
                  >
                    <Link href="/admin/coupons/generate">
                      <Ticket className="h-4 w-4" />
                      <span>Generate Coupons</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="text-blue-50 hover:bg-blue-600/30 data-[active=true]:bg-blue-600/50"
                    isActive={pathname === "/admin/coupons/dashboard"}
                    onClick={handleNavClick}
                  >
                    <Link href="/admin/coupons/dashboard">
                      <BarChart3 className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-blue-600/20 p-4">
          <div className="flex items-center gap-3 w-full">
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium text-white truncate">Admin-Aftershift</span>
              <span className="text-xs text-blue-200 truncate">admin@aftershift.com</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                className="text-blue-200 hover:bg-blue-600/30 hover:text-white"
                size="icon"
                variant="ghost"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>

              <Button
                className="text-blue-200 hover:bg-blue-600/30 hover:text-white"
                size="icon"
                variant="ghost"
                onClick={() => {
                  localStorage.removeItem("adminToken")
                  router.push("/admin/login")
                }}
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SidebarFooter>
      </div>
      <SidebarRail />
    </Sidebar>
  )
}
