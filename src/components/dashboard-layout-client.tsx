"use client"

import { ReactNode } from "react"

// Middleware handles auth, so we just render children
export function DashboardLayoutClient({ children }: { children: ReactNode }) {
  return <>{children}</>
}