
import { cn } from "@/lib/utils";
import React from "react";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "dark" | "light" | "primary";
  intensity?: "low" | "medium" | "high";
}

export function GlassPanel({
  children,
  className,
  variant = "light",
  intensity = "medium",
  ...props
}: GlassPanelProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "dark":
        return "bg-black/10 border-white/10 text-white";
      case "light":
        return "bg-white/10 border-white/20";
      case "primary":
        return "bg-primary/10 border-primary/20";
      default:
        return "bg-white/10 border-white/20";
    }
  };

  const getIntensityStyles = () => {
    switch (intensity) {
      case "low":
        return "backdrop-blur-sm";
      case "medium":
        return "backdrop-blur-md";
      case "high":
        return "backdrop-blur-lg";
      default:
        return "backdrop-blur-md";
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border shadow-sm transition-all",
        getVariantStyles(),
        getIntensityStyles(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
