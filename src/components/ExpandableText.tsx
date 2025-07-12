import { useState } from "react"

interface ExpandableTextProps {
  text: string
  maxChars?: number
}

const ExpandableText = ({ text, maxChars = 30 }: ExpandableTextProps) => {
  const [expanded, setExpanded] = useState(false)

  if (text.length <= maxChars) {
    return <span>{text}</span>
  }

  return (
    <span>
      {expanded ? text : `${text.slice(0, maxChars)}...`}
      <button
        className="text-blue-600 underline ml-1"
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </span>
  )
}

export default ExpandableText
