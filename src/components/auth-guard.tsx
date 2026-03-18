"use client"

import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { getCookie } from "@/lib/fetchWithAuth"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = getCookie("token")
    
    // If no token exists in the browser cookies, force them to login!
    if (!token) {
      navigate("/login", { replace: true, state: { from: location.pathname } })
    } else {
      setIsAuthenticated(true)
    }
  }, [navigate, location.pathname])

  // While checking the token or redirecting, don't show the secret dashboard!
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
