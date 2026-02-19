"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { navItems } from "@/constants/navigation"
import { useSidebar } from "@/hooks/use-sidebar"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isOpen, closeSidebar } = useSidebar()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Close sidebar on route change (for mobile)
  // We can wrap Link clicks or use useEffect. Wrapping clicks is easier for now.
  const handleLinkClick = () => {
    // Simple heuristic: if we are on mobile (can check via window or just always close), close.
    // But we shouldn't close on desktop. To keep it simple without window listeners:
    // We relies on CSS to hide/show, but `isOpen` state controls visibility on mobile.
    // If we want "close on click" for mobile only, we can add a check or just always close 
    // and let desktop persist if we change logic. 
    // ACTUALLY: The context state is shared. If I close it, it collapses on desktop. 
    // This is a trade-off. Let's add a window width check or just leave it manual for now?
    // Better: In the overlay click, we close. 
    // For links: on mobile we want to close. On desktop we don't.
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      closeSidebar()
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-background border-r border-border transition-all duration-300
        ${isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0 md:w-20"}
      `}>
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 h-full overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href && (pathname === item.href || pathname.startsWith(item.href + "/"))
            const showLabel = isOpen // On mobile, if open=true, show. On desktop, if open=true, show.
            // But wait, if collapsed on desktop (isOpen=false), we want to show icons only.
            // My logic above: isOpen=false -> mobile: hidden (-translate-x-full), desktop: w-20.
            // So showLabel should be true if we are on mobile (since it's only visible when Open) OR if isOpen is true.
            // Actually, if it's w-20 on desktop (isOpen=false), we hide labels. MATCHES.
            // If it's hidden on mobile (isOpen=false), we don't see anything. MATCHES.
            // If it's open on mobile (isOpen=true), we see labels. MATCHES.

            // Handle logout action
            if (item.action === "logout") {
              return (
                <button
                  key={item.label}
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-none text-sm font-medium transition-colors ${isOpen ? "justify-start" : "justify-center"
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
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-none text-sm font-medium transition-colors justify-center ${isOpen ? "justify-start" : ""
                  } ${isActive
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
    </>
  )
}
