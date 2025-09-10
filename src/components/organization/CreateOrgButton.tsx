import React from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Building2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface CreateOrgButtonProps {
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "sm" | "default" | "lg"
  className?: string
  showIcon?: boolean
  iconOnly?: boolean
  disabled?: boolean
  "aria-label"?: string
}

export const CreateOrgButton: React.FC<CreateOrgButtonProps> = ({
  variant = "default",
  size = "default",
  className,
  showIcon = true,
  iconOnly = false,
  disabled = false,
  "aria-label": ariaLabel,
}) => {
  const handleCreate = () => {
    if (disabled) return
    window.location.href = "/orgs/new"
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    // Handle Enter and Space key activation
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      e.stopPropagation()
      handleCreate()
    }

    // Handle Escape key to close any open dialogs
    if (e.key === "Escape") {
      e.preventDefault()
      // The dialog will handle its own escape key behavior
    }
  }

  const buttonContent = () => {
    if (iconOnly) {
      return showIcon ? <Plus className="w-4 h-4" /> : null
    }

    return (
      <>
        {showIcon && <Building2 className="w-4 h-4 mr-2" />}
        {"Create Organization"}
      </>
    )
  }

  const getAriaLabel = () => {
    if (ariaLabel) return ariaLabel
    if (iconOnly) return "Create new organization"
    return undefined
  }

  const buttonElement = (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "min-h-[44px] sm:min-h-[40px]",
        iconOnly && "aspect-square p-0",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      onClick={handleCreate}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={getAriaLabel()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      type="button"
    >
      {buttonContent()}
    </Button>
  )

  return (
    <>
      {iconOnly ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
            <TooltipContent>
              <p>Create new organization</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        buttonElement
      )}
    </>
  )
}
