"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "hsl(var(--popover))",
          "--normal-text": "hsl(var(--popover-foreground))",
          "--normal-border": "hsl(var(--border))",
          "--success-bg": "hsl(var(--success) / 0.1)",
          "--success-text": "hsl(var(--success))",
          "--error-bg": "hsl(var(--destructive) / 0.1)",
          "--error-text": "hsl(var(--destructive))",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };
