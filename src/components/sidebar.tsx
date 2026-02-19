"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { navItems } from "@/constants/navigation"
import { useSidebar } from "@/hooks/use-sidebar"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen } = useSidebar()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <aside className={`border-r border-border bg-background h-screen flex flex-col fixed left-0 top-16 z-40 transition-all duration-300 ${
      isOpen ? "w-64" : "w-20"
    }`}>
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href && (pathname === item.href || pathname.startsWith(item.href + "/"))

          // Handle logout action
          if (item.action === "logout") {
            return (
              <button
                key={item.label}
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-none text-sm font-medium transition-colors ${
                  isOpen ? "justify-start" : "justify-center"
                } text-destructive hover:bg-destructive/10`}
                title={!isOpen ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span>{item.label}</span>}
              </button>
            )
          }

          // Handle regular links
          return (
            <Link
              key={item.href}
              href={item.href || "/"}
              className={`flex items-center gap-3 px-4 py-3 rounded-none text-sm font-medium transition-colors justify-center ${
                isOpen ? "justify-start" : ""
              } ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
              title={!isOpen ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border text-xs text-muted-foreground text-center">
        {isOpen && (
          <p>&copy; 2026</p>
        )}
      </div>
    </aside>
  )
}
