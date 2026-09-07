import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 rounded-2xl active:scale-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-white/10 text-white shadow-lg border border-white/20 hover:bg-white/20 backdrop-blur-md",
      secondary: "bg-white/5 text-neutral-200 hover:bg-white/10 border border-white/10 backdrop-blur-md",
      outline: "bg-transparent text-neutral-300 hover:bg-white/10 border border-white/20",
      danger: "bg-rose-500/80 backdrop-blur-md text-white shadow-lg border border-rose-500/50 hover:bg-rose-500",
    };
    
    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
