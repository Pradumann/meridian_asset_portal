"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { textColors } from "@/values/colors"

interface TitleTextProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const TitleText = React.forwardRef<HTMLHeadingElement, TitleTextProps>(
  ({ className, as: Component = 'h2', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "text-3xl font-bold",
          className
        )}
        style={{ color: textColors.titleTextColor }}
        {...props}
      />
    )
  }
)
TitleText.displayName = "TitleText"

interface NormalTextProps {
  className?: string
  children: React.ReactNode
  as?: 'p' | 'span' | 'label'
  htmlFor?: string
}

const NormalText = React.forwardRef<any, NormalTextProps>(
  ({ className, as: Component = 'p', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "text-sm",
          className
        )}
        style={{ color: textColors.normalTextColor }}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
NormalText.displayName = "NormalText"

interface HighlightedTextProps {
  className?: string
  children: React.ReactNode
  as?: 'p' | 'span' | 'label'
}

const HighlightedText = React.forwardRef<any, HighlightedTextProps>(
  ({ className, as: Component = 'span', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "text-sm",
          className
        )}
        style={{ color: textColors.highlightedTextColor }}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
HighlightedText.displayName = "HighlightedText"

export { TitleText, NormalText, HighlightedText }
