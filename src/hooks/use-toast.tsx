import toastLibrary, { Toaster, type Toast } from "react-hot-toast"
import React from "react"

export interface ToasterToast {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive"
  duration?: number
}

export function ToastContent({
  title,
  description,
  variant,
  t,
}: ToasterToast & { t: Toast }) {
  return (
    <div
      className={`rounded-md border p-4 shadow-lg transition-all ${
        t.visible
          ? "animate-in fade-in slide-in-from-top-full"
          : "animate-out fade-out slide-out-to-right-full"
      } ${
        variant === "destructive"
          ? "border-red-500 bg-red-500 text-slate-50"
          : "border-slate-200 bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50"
      }`}
    >
      {title && <div className="text-sm font-semibold">{title}</div>}
      {description && <div className="text-sm opacity-90">{description}</div>}
    </div>
  )
}

const toast = ({
  duration,
  description,
  variant = "default",
  title,
}: ToasterToast) => {
  if (description) {
    return toastLibrary.custom(
      (t) => (
        <ToastContent
          title={title}
          description={description}
          variant={variant}
          t={t}
        />
      ),
      { duration },
    )
  }

  if (variant === "destructive") {
    return toastLibrary.error(<>{title}</>, { duration })
  }

  return toastLibrary(<>{title}</>, { duration })
}

function useToast() {
  return {
    toast,
    dismiss: toastLibrary.dismiss,
    toastLibrary,
  }
}

export { useToast, toast, Toaster }

export function useNotImplementedToast() {
  const { toast } = useToast()
  return (feature: string) => {
    toast({
      title: "Not Implemented",
      description: (
        <div>
          The {feature} feature is not implemented yet. Help us out!{" "}
          <a
            className="text-blue-500 hover:underline font-semibold"
            href="https://github.com/tscircuit/tscircuit.com"
          >
            Check out our Github
          </a>
        </div>
      ),
    })
  }
}
