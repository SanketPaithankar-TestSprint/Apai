import { BarChart3, Users, BookOpen, LogOut, LucideIcon } from "lucide-react"

export interface NavItem {
  label: string
  href?: string
  icon: LucideIcon
  action?: "logout"
}

export const navItems: NavItem[] = [
  {
    label: "Analytics",
    href: "/",
    icon: BarChart3,
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
  },
  {
    label: "Blogs",
    href: "/blogs",
    icon: BookOpen,
  },
  {
    label: "Logout",
    icon: LogOut,
    action: "logout",
  },
]
