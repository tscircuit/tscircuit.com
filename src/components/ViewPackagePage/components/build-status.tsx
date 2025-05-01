import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BuildStep {
  id: string
  name: string
  status: "success" | "failed"
  message?: string
}

export interface BuildStatusProps {
  step: BuildStep
}

export const BuildStatus = ({ step }: BuildStatusProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const overallStatus = step.status === "success"
    ? "success"
    : "failed"

  return (
    <>
      <div
        onClick={() => setIsDialogOpen(true)}
        className={"flex items-center cursor-pointer"}
      >
        {overallStatus === "success" ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2 text-green-600 dark:text-[#8b949e]" />
            <span className="text-sm text-green-600 dark:text-[#8b949e]">
              {step.name}
            </span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 mr-2 text-red-600 dark:text-[#8b949e]" />
            <span className="text-sm text-red-600 dark:text-[#8b949e]">Build failing</span>
          </>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {overallStatus === "success" ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Build Status: Passing</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span>Build Status: Failing</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <div
                key={step.id}
                className={cn(
                    "flex items-start gap-3 rounded-md border p-3",
                    step.status === "success"
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-full p-1 mt-0.5",
                      step.status === "success"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600",
                    )}
                  >
                    {step.status === "success" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{step.name}</div>
                    {step.message && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {step.message}
                      </div>
                    )}
                  </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
