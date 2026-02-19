"use client"

import Image from "next/image"
import { Menu } from "lucide-react"
import apaiLogo from "@/assets/apai.png"
import { useSidebar } from "@/hooks/use-sidebar"

export function Header() {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-background flex items-center px-6 z-50 gap-4">
      {/* Collapse Button */}
      <button
        onClick={toggleSidebar}
        className="p-2 hover:bg-accent rounded-none transition-colors flex-shrink-0"
        aria-label="Collapse/expand sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo */}
      <Image
        src={apaiLogo}
        alt="APAI Logo"
        width={56}
        height={56}
        className="flex-shrink-0"
      />
    </header>
  )
}
