import React from "react"
import { Code2, Braces, BookOpen, File } from "lucide-react"
import { cn } from "@/lib/utils"

export const getFileIconComponent = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
      return (props: any) => (
        <Code2 {...props} className={cn("text-blue-500", props.className)} />
      )
    case "json":
      return (props: any) => (
        <Braces {...props} className={cn("text-yellow-500", props.className)} />
      )
    case "md":
      return (props: any) => (
        <BookOpen {...props} className={cn("text-gray-500", props.className)} />
      )
    default:
      return (props: any) => (
        <File {...props} className={cn("text-gray-500", props.className)} />
      )
  }
}

export const getFileIcon = (filename: string, className?: string) => {
  const IconComponent = getFileIconComponent(filename)
  return <IconComponent className={className} />
}
