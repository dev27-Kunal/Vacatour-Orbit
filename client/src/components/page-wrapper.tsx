import React from "react";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 light",
      className
    )}>
      {children}
    </div>
  );
}