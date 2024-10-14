import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, ArrowUp } from "lucide-react"
import { useState, FormEvent } from "react"

interface ChatInputProps {
  onSubmit: (message: string) => void
  disabled: boolean
}

export default function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onSubmit(inputValue)
      setInputValue("")
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative shadow-lg border-2 border-gray-300 rounded-full m-4"
    >
      <Input
        disabled={disabled}
        type="text"
        placeholder="Ask for more"
        className="pr-20 pl-4 py-6 bg-white rounded-full border-none focus:ring-2 focus:ring-blue-500"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {/* For when we support attachments */}
      {/* <Button
        size="icon"
        variant="ghost"
        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <Paperclip className="h-5 w-5" />
      </Button> */}
      <Button
        type="submit"
        size="icon"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
        disabled={disabled}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </form>
  )
}
