"use client"

import { useState, useEffect } from "react"
import { 
  HelpCircle, 
  BookOpen, 
  Phone
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSearchParams } from "react-router-dom"
import { TicketsTab } from "./TicketsTabNew"
import { HelpArticlesTab } from "./HelpArticlesTab"
import { CallRequestsTab } from "./CallRequestsTab"
import { getCookie } from "@/lib/fetchWithAuth"
import { callRequestService } from "@/services/call-request-service"

export default function SupportPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "tickets"
  const [hasPendingCalls, setHasPendingCalls] = useState(false)

  const setActiveTab = (value: string) => {
    setSearchParams({ tab: value })
  }

  useEffect(() => {
    const checkPendingCalls = async () => {
      try {
        const responseData = await callRequestService.getCallRequests()
        // Handle potential nested data structure
        const requests = Array.isArray(responseData) 
          ? responseData 
          : (responseData as any).data || (responseData as any).requests || []
          
        if (Array.isArray(requests)) {
          const hasPending = requests.some(r => 
            r.status === 'SCHEDULED' || 
            r.status === 'IN_PROGRESS'
          )
          setHasPendingCalls(hasPending)
        }
      } catch (error) {
        console.error("Failed to check pending calls:", error)
      }
    }
    checkPendingCalls()
  }, [])

  return (
    <div className="space-y-4 animate-in fade-in duration-500 -mt-2">
      {/* Compact Header Integrated with Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-1 border-b-2 border-black mb-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Support Hub</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
          <TabsList className="h-9 p-0 bg-transparent rounded-none gap-0 border-2 border-primary/20">
            <TabsTrigger 
              value="tickets" 
              className="h-full px-6 rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all text-[10px] font-bold uppercase tracking-widest border-r-2 border-primary/20 last:border-r-0"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-2" />
              Tickets
            </TabsTrigger>
            <TabsTrigger 
              value="articles" 
              className="h-full px-6 rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all text-[10px] font-bold uppercase tracking-widest border-r-2 border-primary/20 last:border-r-0"
            >
              <BookOpen className="w-3.5 h-3.5 mr-2" />
              Articles
            </TabsTrigger>
            <TabsTrigger 
              value="call-requests" 
              className="h-full px-6 rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all text-[10px] font-bold uppercase tracking-widest border-r-2 border-primary/20 last:border-r-0 relative"
            >
              <Phone className="w-3.5 h-3.5 mr-2" />
              Call Requests
              {hasPendingCalls && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background animate-pulse" />
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="pt-2">
        <Tabs value={activeTab} className="space-y-0">
          <TabsContent value="tickets" className="mt-0 focus-visible:outline-none animate-in slide-in-from-bottom-2 duration-300">
            <TicketsTab 
              adminId={getCookie("adminId") || "ADMIN_SYS_001"} 
              token={getCookie("token") || ""} 
            />
          </TabsContent>

          <TabsContent value="articles" className="mt-0 focus-visible:outline-none animate-in slide-in-from-bottom-2 duration-300">
            <HelpArticlesTab />
          </TabsContent>

          <TabsContent value="call-requests" className="mt-0 focus-visible:outline-none animate-in slide-in-from-bottom-2 duration-300">
            <CallRequestsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
