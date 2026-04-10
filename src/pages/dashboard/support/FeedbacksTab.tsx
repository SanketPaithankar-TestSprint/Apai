"use client"

import { useState, useEffect } from "react"
import { feedbackService } from "@/services/feedback-service"
import { Feedback } from "@/types/feedback"
import { 
  Loader2, 
  MessageSquare, 
  Star, 
  Globe, 
  Smartphone, 
  Monitor, 
  Info, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar,
  Layers,
  ExternalLink,
  Store
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/EmptyState"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import { API_ENDPOINTS } from "@/constants/api"
import { cn } from "@/lib/utils"

export function FeedbacksTab() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true)
        const responseData = await feedbackService.getFeedbacks()
        const items = Array.isArray(responseData) 
          ? responseData 
          : (responseData as any).data || (responseData as any).feedbacks || (responseData as any).content || []
          
        setFeedbacks(items)
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch feedbacks:", err)
        setError(err.message || "Failed to load feedbacks")
      } finally {
        setLoading(false)
      }
    }

    fetchFeedbacks()
  }, [])

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-500"
    if (rating >= 3) return "text-amber-500"
    return "text-red-500"
  }

  const getDeviceIcon = (device?: string) => {
    switch (device?.toUpperCase()) {
      case "MOBILE": return Smartphone
      case "TABLET": return Smartphone
      case "DESKTOP": return Monitor
      default: return Monitor
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
          Synchronizing Feedback Data...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState 
        icon={Info}
        title="Access Restricted"
        description={error.includes("Forbidden") || error.includes("403") 
          ? "You don't have the SUPER_ADMIN permissions required to view feedbacks." 
          : "We encountered an error while trying to retrieve feedback submissions."}
        className="py-24"
      />
    )
  }

  if (feedbacks.length === 0) {
    return (
      <EmptyState 
        icon={MessageSquare}
        title="No Feedback Yet"
        description="User feedback submissions will appear here once they start coming in."
        className="py-24"
      />
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feedbacks.map((item) => (
          <FeedbackCard 
            key={item.feedbackId} 
            item={item} 
            getDeviceIcon={getDeviceIcon} 
            getRatingColor={getRatingColor} 
          />
        ))}
      </div>
    </div>
  )
}

function FeedbackCard({ item, getDeviceIcon, getRatingColor }: { 
  item: Feedback, 
  getDeviceIcon: (d?: string) => any,
  getRatingColor: (r: number) => string 
}) {
  const DeviceIcon = getDeviceIcon(item.device)
  const ratingColor = getRatingColor(item.rating)

  return (
    <div className="group bg-card border-2 border-primary/10 hover:border-primary transition-all duration-300 flex flex-col shadow-sm hover:shadow-md">
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-none bg-primary/10 flex items-center justify-center border border-primary/20">
              <Star className={cn("w-4 h-4 fill-current", ratingColor)} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tight">{item.name || "Anonymous"}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{item.email || "No email"}</p>
            </div>
          </div>
          <Badge variant="secondary" className="rounded-none font-bold text-[9px] uppercase bg-primary/5 text-primary">
            {item.rating}/5
          </Badge>
        </div>

        <div className="bg-muted p-3 rounded-none border border-primary/5 mb-4 flex-1">
          <p className="text-xs font-bold leading-relaxed line-clamp-4">"{item.message}"</p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-primary/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" title={item.device}>
              <DeviceIcon className="w-3 h-3 text-muted-foreground" />
              <span className="text-[9px] font-black text-muted-foreground uppercase">{item.device}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-muted-foreground" />
              <span className="text-[9px] font-black text-muted-foreground uppercase truncate max-w-[60px]">{item.browser}</span>
            </div>
          </div>
          
          <FeedbackDetailModal item={item} ratingColor={ratingColor} />
        </div>
      </div>
    </div>
  )
}

function FeedbackDetailModal({ item, ratingColor }: { item: Feedback, ratingColor: string }) {
  const [userData, setUserData] = useState<any>(null)
  const [isUserLoading, setIsUserLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen && item.userId && !userData) {
      const fetchUserDetails = async () => {
        setIsUserLoading(true)
        try {
          const response = await fetchWithAuth(`${API_ENDPOINTS.ADMIN_USERS}/${item.userId}`)
          if (response.ok) {
            const data = await response.json()
            setUserData(data)
          } else {
            console.warn("Failed to fetch user with direct ID, trying search...")
            // Fallback: list users and find by ID if single fetch fails
            const listResponse = await fetchWithAuth(API_ENDPOINTS.ADMIN_USERS)
            if (listResponse.ok) {
              const all = await listResponse.json()
              const list = all.content || all
              const found = list.find((u: any) => u.userId === item.userId || u.id === item.userId)
              setUserData(found)
            }
          }
        } catch (error) {
          console.error("User fetch error:", error)
        } finally {
          setIsUserLoading(false)
        }
      }
      fetchUserDetails()
    }
  }, [isOpen, item.userId, userData])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 rounded-none hover:bg-primary hover:text-white transition-colors">
          <Info className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] rounded-none border-2 border-primary p-0 overflow-hidden bg-background">
        <div className="flex h-full max-h-[90vh]">
          {/* Left Side: Submission Info */}
          <div className="flex-1 flex flex-col min-w-0">
            <DialogHeader className="p-6 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="font-black uppercase tracking-[0.1em] text-xl mb-1">Feedback Report</DialogTitle>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Ref: FEEDBACK-{item.feedbackId}</p>
                </div>
                <Badge className={cn("rounded-none px-3 py-1 text-xs font-black border-none", ratingColor.replace('text', 'bg').replace('-500', '-100') + " " + ratingColor)}>
                  {item.rating}/5 RATING
                </Badge>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> Submission Content
                </label>
                <div className="p-4 bg-primary/5 border-2 border-primary/10 font-bold text-sm leading-relaxed italic">
                  "{item.message}"
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Category
                  </label>
                  <p className="font-black text-sm uppercase text-primary bg-primary/5 px-3 py-2 border border-primary/20 inline-block w-full">
                    {item.category || "GENERAL"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Timestamp
                  </label>
                  <p className="font-bold text-sm px-3 py-2 bg-muted border border-border inline-block w-full">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Environment Telemetry</label>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between p-3 bg-muted/40 border border-border/50 text-xs">
                    <span className="text-muted-foreground uppercase font-bold flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5" /> Browser Agent
                    </span>
                    <span className="font-black uppercase">{item.browser}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/40 border border-border/50 text-xs">
                    <span className="text-muted-foreground uppercase font-bold flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5" /> Hardware Device
                    </span>
                    <span className="font-black uppercase">{item.device}</span>
                  </div>
                  <div className="flex flex-col gap-2 p-3 bg-muted/40 border border-border/50 text-xs">
                    <span className="text-muted-foreground uppercase font-bold flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5" /> Origin URL
                    </span>
                    <span className="bg-background p-2 border border-border text-[10px] font-mono break-all">{item.pageUrl}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: User Profile */}
          <div className="w-[300px] border-l border-primary/20 bg-muted/20 flex flex-col">
            <div className="p-6 border-b bg-primary/5">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Requester Profile</h3>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-none bg-primary flex items-center justify-center mb-3 shadow-lg transform rotate-3">
                  <User className="w-8 h-8 text-white -rotate-3" />
                </div>
                <p className="font-black text-sm uppercase tracking-tight truncate w-full">{item.name || "Anonymous User"}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground font-bold">
                  <Shield className="w-3 h-3 text-primary" />
                  {userData?.userType || "ACCOUNT_OWNER"}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5 flex-1 overflow-y-auto">
              {isUserLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Fetching CRM Data...</p>
                </div>
              ) : userData ? (
                <>
                  <Section label="Contact Matrix">
                    <InfoItem icon={Mail} label="Email Address" value={userData.email || item.email} isEmail />
                    <InfoItem icon={Phone} label="Contact Phone" value={userData.phone || "Not recorded"} />
                  </Section>

                  <Section label="Business Context">
                    <InfoItem icon={Store} label="Company Name" value={userData.businessName || "No Business Data"} />
                    <InfoItem icon={Layers} label="Active Plan" value={userData.subscriptionPlan || "FREE"} highlighted />
                  </Section>

                  <Section label="Account Lifecycle">
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-background p-2 border border-border">
                        <p className="text-muted-foreground uppercase font-bold mb-0.5">Status</p>
                        <p className="font-black text-primary">{userData.subscriptionStatus || "ACTIVE"}</p>
                      </div>
                      <div className="bg-background p-2 border border-border">
                        <p className="text-muted-foreground uppercase font-bold mb-0.5">Joined</p>
                        <p className="font-black">{userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "—"}</p>
                      </div>
                    </div>
                  </Section>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                  <User className="w-10 h-10 mb-2 text-muted-foreground/30" />
                  <p className="text-[10px] font-bold uppercase tracking-wider">No profile data linked to this ID</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Section({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest border-b border-border pb-1">{label}</p>
      {children}
    </div>
  )
}

function InfoItem({ icon: Icon, label, value, isEmail, highlighted }: { 
  icon: any, label: string, value: string, isEmail?: boolean, highlighted?: boolean 
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[8px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 ml-1">
        <Icon className="w-2.5 h-2.5" /> {label}
      </p>
      <p className={cn(
        "text-[10px] p-2 bg-background border border-border truncate font-bold",
        highlighted ? "text-primary border-primary/20 bg-primary/5" : "text-foreground",
        isEmail && "lowercase"
      )}>
        {value}
      </p>
    </div>
  )
}
