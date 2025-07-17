// ClickableText.tsx
import type React from "react"

interface ClickableTextProps {
  text: string
  onClick: () => void
}

export const ClickableText: React.FC<ClickableTextProps> = ({
  text,
  onClick,
}) => {
  return (
    <span
      className="cursor-pointer underline text-blue-300 mx-2"
      onClick={onClick}
    >
      {text}
    </span>
  )
}
