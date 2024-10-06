import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Globe,
  Code,
  Sun,
  Battery,
  Cpu,
  Grid,
  LayoutGrid,
  Bot,
} from "lucide-react"
import { useState } from "react"
import { useLocation } from "wouter"

export function CreateNewSnippetHero() {
  const [inputValue, setInputValue] = useState("")
  const [, navigate] = useLocation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      navigate(`/ai?initial_prompt=${encodeURIComponent(inputValue)}`)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    navigate(`/ai?initial_prompt=${encodeURIComponent(prompt)}`)
  }

  return (
    <Card className="mb-6 bg-blue-50 rounded-sm">
      <CardHeader>
        <CardTitle className="text-blue-600 flex items-center gap-2">
          <span className="text-2xl">
            <Bot size={24} />
          </span>{" "}
          Create a circuit using AI, type anything below!
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <form onSubmit={handleSubmit} className="mb-4">
          <Input
            placeholder="Create a 3x3 usb keyboard with a dial"
            className="w-full bg-white"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </form>
        <div className="flex justify-between">
          <Button
            variant="ghost"
            className="flex items-center gap-2 opacity-70 hover:bg-white hover:opacity-100"
            onClick={() => handleQuickPrompt("Battery-powered flashlight")}
          >
            <Battery size={20} />
            <span>Battery-powered flashlight</span>
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-2 opacity-70 hover:bg-white hover:opacity-100"
            onClick={() => handleQuickPrompt("Motor driver module")}
          >
            <Cpu size={20} />
            <span>Motor driver module</span>
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-2 opacity-70 hover:bg-white hover:opacity-100"
            onClick={() => handleQuickPrompt("NA555 Timer Chip")}
          >
            <LayoutGrid size={20} />
            <span>NA555 Timer Chip</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
