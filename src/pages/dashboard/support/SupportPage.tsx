"use client"

import { useState } from "react"
import { 
  MessageCircle, 
  HelpCircle, 
  BookOpen, 
  Mail
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSearchParams } from "react-router-dom"
import { TicketsTab } from "./TicketsTab"
import { HelpArticlesTab } from "./HelpArticlesTab"
import { AdminSupportDashboard } from "@/components/support/chat/AdminSupportDashboard"
import { getCookie } from "@/lib/fetchWithAuth"

export default function SupportPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "tickets"

  const setActiveTab = (value: string) => {
    setSearchParams({ tab: value })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Support Hub</h1>
          <p className="text-muted-foreground">Manage your customer experience across all communication channels.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
            <TabsList className="h-14 p-1 w-full md:w-auto bg-muted/50 rounded-2xl gap-2 border border-border/50">
                <TabsTrigger 
                    value="tickets" 
                    className="h-full px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all"
                >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Support Tickets
                </TabsTrigger>
                <TabsTrigger 
                    value="enquiries" 
                    className="h-full px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all"
                >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Enquiries
                </TabsTrigger>
                <TabsTrigger 
                    value="articles" 
                    className="h-full px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all"
                >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Help Articles
                </TabsTrigger>
                <TabsTrigger 
                    value="livehelp" 
                    className="h-full px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all"
                >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Live Help
                </TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="tickets" className="animate-in slide-in-from-bottom-2 duration-300">
          <TicketsTab />
        </TabsContent>

        <TabsContent value="enquiries" className="animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Contact Enquiries</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
              Manage messages from your website's contact form and general customer enquiries.
            </p>
            <div className="bg-muted/30 p-8 rounded-xl border border-dashed border-border mb-8">
                <p className="italic text-muted-foreground">Contact enquiry integration coming soon...</p>
            </div>
            <div className="flex gap-4 justify-center">
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity">
                    Configure Form
                </button>
                <button className="px-6 py-3 border border-border rounded-xl font-bold hover:bg-muted transition-colors">
                    Export Archive
                </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="articles" className="animate-in slide-in-from-bottom-2 duration-300">
            <HelpArticlesTab />
        </TabsContent>

        <TabsContent value="livehelp" className="animate-in slide-in-from-bottom-2 duration-300">
            <div className="w-full">
                <AdminSupportDashboard
                    adminId="ADMIN_SYS_001"
                    token={getCookie("token") || ""}
                />
            </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
