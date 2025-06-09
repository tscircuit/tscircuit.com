"use client"
import toastLibrary, { Toaster } from "react-hot-toast"
import React from "react"

export interface ToasterToast {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive"
  duration?: number
}

function ToastContent({ title, description, variant }: ToasterToast) {
  return (
    <div
      className={`rounded-md border p-4 shadow-lg bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50 ${
        variant === "destructive" ? "border-red-500" : "border-slate-200"
      }`}
    >
      {title && <div className="text-sm font-semibold">{title}</div>}
      {description && <div className="text-sm opacity-90">{description}</div>}
    </div>
  )
}

const toast = ({ duration, ...props }: ToasterToast) =>
  toastLibrary.custom(() => <ToastContent {...props} />, { duration })

function useToast() {
  return {
    toast,
    dismiss: toastLibrary.dismiss,
  }
}

export { useToast, toast, Toaster }
