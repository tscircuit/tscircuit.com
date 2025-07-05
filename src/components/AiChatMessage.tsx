import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BotIcon, ChevronDown, Eye, RotateCcw } from "lucide-react"

export interface AiChatMessage {
  sender: "user" | "bot"
  content: string
  codeVersion?: number
}

export const AiChatMessage = ({ message }: { message: AiChatMessage }) => {
  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?(?:```|$))/g)
    return parts.map((part, index) => {
      if (part.startsWith("```")) {
        const isComplete = part.endsWith("```")
        return (
          <div
            key={index}
            className="bg-gray-100 rounded-md p-2 my-2 text-sm font-mono"
          >
            {isComplete
              ? `Code Version ${message.codeVersion ?? "??"}`
              : "generating..."}
          </div>
        )
      }
      return (
        <p key={index} className="text-xs font-mono whitespace-pre-wrap">
          {part}
        </p>
      )
    })
  }

  return (
    <div
      className={`flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          message.sender === "user" ? "bg-blue-100" : "bg-white"
        }`}
      >
        {message.sender === "bot" && (
          <div className="flex items-center mb-2">
            <Avatar className="w-7 h-7 mr-2 flex items-center justify-center bg-black">
              <BotIcon className="text-white px-1" />
            </Avatar>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                >
                  version {message.codeVersion}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="text-xs bg-white flex">
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Revert to v{message.codeVersion}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs bg-white flex">
                  <Eye className="mr-1 h-3 w-3" />
                  View v{message.codeVersion}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {renderContent(message.content)}
      </div>
    </div>
  )
}
