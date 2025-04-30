import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BuildStep {
  id: string
  name: string
  status: "success" | "failed"
  message?: string
}

export interface BuildStatusProps {
  steps: BuildStep[]
}

const defaultSteps: BuildStep[] = [
  {
    id: "package_transpilation",
    name: "Package Transpilation",
    status: "success",
  },
  {
    id: "circuit_json_build",
    name: "Circuit JSON Build",
    status: "success",
  },
]

export const BuildStatus = ({ steps = defaultSteps }: BuildStatusProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const overallStatus = steps.every((step) => step.status === "success")
    ? "success"
    : "failed"

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        variant="outline"
        size="sm"
        className={cn(
          "gap-2 font-medium transition-all",
          overallStatus === "success"
            ? "hover:bg-green-50 text-green-600 hover:text-green-700"
            : "hover:bg-red-50 text-red-600 hover:text-red-700",
        )}
      >
        {overallStatus === "success" ? (
          <>
            <CheckCircle className="h-4 w-4" />
            Build passing
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4" />
            Build failing
          </>
        )}
      </Button>

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
            <div className="text-sm font-medium">Build Steps</div>

            <div className="space-y-3">
              {steps.map((step) => (
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
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
