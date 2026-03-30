"use client"

import { SearchX, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export function EmptyState({ 
  icon: Icon = SearchX, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-none bg-muted/5 animate-in fade-in zoom-in duration-300",
      className
    )}>
      <div className="w-16 h-16 rounded-none bg-muted flex items-center justify-center mb-4 border shadow-inner">
        <Icon className="w-8 h-8 text-muted-foreground/60" />
      </div>
      
      <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80 mb-1">
        {title}
      </h3>
      
      {description && (
        <p className="text-xs text-muted-foreground font-medium max-w-[280px] leading-relaxed mb-6">
          {description}
        </p>
      )}

      {action && (
        <Button 
          onClick={action.onClick}
          size="sm"
          className="h-9 rounded-none font-bold text-[10px] uppercase tracking-widest px-6 shadow-lg active:scale-95 transition-all"
        >
          {action.icon && <action.icon className="w-3.5 h-3.5 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  )
}
