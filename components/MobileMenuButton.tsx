"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

export function MobileMenuButton() {
  const { openMobile, setOpenMobile } = useSidebar();

  return (
    <button
      onClick={() => setOpenMobile(!openMobile)}
      className="fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-700 text-white md:hidden"
      aria-label="Toggle sidebar"
      type="button"
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}
