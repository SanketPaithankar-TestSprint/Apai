"use client"

import { ReactNode } from "react"
import { useSidebar } from "@/hooks/use-sidebar"

export function DashboardContent({ children }: { children: ReactNode }) {
  const { isOpen } = useSidebar()

  return (
    <main className={`flex-1 p-4 md:p-8 transition-all duration-300 ${isOpen ? "md:ml-64" : "md:ml-20"
      }`}>
      {children}
    </main>
  )
}
