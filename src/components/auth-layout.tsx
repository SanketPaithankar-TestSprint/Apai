import Image from "next/image"
import { ReactNode } from "react"
import apaiLogo from "@/assets/apai.png"

interface AuthLayoutProps {
  children: ReactNode
  title: string
  description: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Logo Section */}
      <div className="mb-12 flex flex-col items-center">
        <Image
          src={apaiLogo}
          alt="APAI Logo"
          width={64}
          height={64}
          className="mb-3"
          priority
        />
      </div>

      {/* Form Container */}
      <div className="w-full max-w-xs sm:max-w-sm border border-border rounded-none p-6 sm:p-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        </div>

        {children}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-muted-foreground">
        <p>APAI Admin Panel &copy; 2026</p>
      </div>
    </div>
  )
}
