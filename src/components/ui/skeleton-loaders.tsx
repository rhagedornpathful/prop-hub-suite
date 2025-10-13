import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

export const MessageListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-4 p-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const ConversationDetailSkeleton = () => (
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="border-b p-4 flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
    
    {/* Messages */}
    <div className="flex-1 p-4 space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "flex gap-2 animate-fade-in",
            i % 2 === 0 ? "justify-start" : "justify-end"
          )}
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
          <div className={cn("space-y-1", i % 2 === 0 ? "max-w-[70%]" : "max-w-[70%]")}>
            <Skeleton className={cn("h-16 rounded-lg", i % 2 === 0 ? "w-64" : "w-48")} />
            <Skeleton className="h-3 w-20" />
          </div>
          {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
        </div>
      ))}
    </div>
    
    {/* Compose */}
    <div className="border-t p-4">
      <Skeleton className="h-20 w-full rounded-lg" />
    </div>
  </div>
);

export const AnalyticsSkeleton = () => (
  <div className="space-y-6 p-6 animate-fade-in">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
    
    {/* Charts */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
  </div>
);

export const SettingsSkeleton = () => (
  <div className="space-y-6 p-6 animate-fade-in">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    ))}
  </div>
);
