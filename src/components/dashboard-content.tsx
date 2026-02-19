"use client"

import { ReactNode } from "react"
import { useSidebar } from "@/hooks/use-sidebar"

export function DashboardContent({ children }: { children: ReactNode }) {
  const { isOpen } = useSidebar()

  return (
    <main className={`flex-1 p-8 transition-all duration-300 ${
      isOpen ? "ml-64" : "ml-20"
    }`}>
      {children}
    </main>
  )
}
