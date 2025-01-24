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
      className="relative m-4 border-2 border-gray-300 rounded-full shadow-lg"
    >
      <Input
        disabled={disabled}
        type="text"
        placeholder="Ask for more"
        className="py-6 pl-4 pr-20 bg-white border-none rounded-full focus:ring-2 focus:ring-blue-500"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {/* For when we support attachments */}
      {/* <Button
        size="icon"
        variant="ghost"
        className="absolute text-gray-400 transform -translate-y-1/2 left-2 top-1/2 hover:text-gray-600"
      >
        <Paperclip className="w-5 h-5" />
      </Button> */}
      <Button
        type="submit"
        size="icon"
        className="absolute text-white transform -translate-y-1/2 bg-blue-500 rounded-full right-2 top-1/2 hover:bg-blue-600"
        disabled={disabled}
      >
        <ArrowUp className="w-5 h-5" />
      </Button>
    </form>
  )
}
