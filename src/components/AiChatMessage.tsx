import { BotIcon, ChevronDown, Eye, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
            className="p-2 my-2 font-mono text-sm bg-gray-100 rounded-md dark:bg-gray-800 dark:text-gray-100"
          >
            {isComplete
              ? `Code Version ${message.codeVersion ?? "??"}`
              : "generating..."}
          </div>
        )
      }
      return (
        <p
          key={index}
          className="font-mono text-xs whitespace-pre-wrap dark:text-gray-300"
        >
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
          message.sender === "user"
            ? "bg-blue-100 dark:bg-blue-900"
            : "bg-white dark:bg-gray-900"
        }`}
      >
        {message.sender === "bot" && (
          <div className="flex items-center mb-2">
            <Avatar className="flex items-center justify-center mr-2 bg-black w-7 h-7">
              <BotIcon className="px-1 text-white" />
            </Avatar>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                >
                  version {message.codeVersion}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="flex text-xs bg-white dark:bg-gray-800">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Revert to v{message.codeVersion}
                </DropdownMenuItem>
                <DropdownMenuItem className="flex text-xs bg-white dark:bg-gray-800">
                  <Eye className="w-3 h-3 mr-1" />
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
