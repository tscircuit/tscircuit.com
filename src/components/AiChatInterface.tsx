import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import ChatInput from "./ChatInput"
import { useAiApi } from "@/hooks/use-ai-api"
import { createCircuitBoard1Template } from "@tscircuit/prompt-benchmarks"
import { TextDelta } from "@anthropic-ai/sdk/resources/messages.mjs"
import { MagicWandIcon } from "@radix-ui/react-icons"
import { AiChatMessage } from "./AiChatMessage"
import { useLocation } from "wouter"
import { Edit2 } from "lucide-react"
import { SnippetLink } from "./SnippetLink"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useSignIn } from "@/hooks/use-sign-in"
import { extractCodefence } from "extract-codefence"
import { PrefetchPageLink } from "./PrefetchPageLink"
import { usePackage } from "@/hooks/use-package"

export default function AIChatInterface({
  code,
  hasUnsavedChanges,
  snippetId,
  onCodeChange,
  onStartStreaming,
  onStopStreaming,
  errorMessage,
  disabled,
}: {
  code: string
  disabled?: boolean
  hasUnsavedChanges: boolean
  snippetId?: string | null
  onCodeChange: (code: string) => void
  onStartStreaming: () => void
  onStopStreaming: () => void
  errorMessage: string | null
}) {
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const anthropic = useAiApi()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { data: snippet } = usePackage(snippetId!)
  const [currentCodeBlock, setCurrentCodeBlock] = useState<string | null>(null)
  const [location, navigate] = useLocation()
  const isStreamingRef = useRef(false)
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const signIn = useSignIn()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const addMessage = async (message: string) => {
    const newMessages = messages.concat([
      {
        sender: "user",
        content: message,
      },
      {
        sender: "bot",
        content: "",
        codeVersion: messages.filter((m) => m.sender === "bot").length,
      },
    ])
    setMessages(newMessages)
    setIsStreaming(true)
    onStartStreaming()

    try {
      const stream = await anthropic.messages.stream({
        model: "claude-3-sonnet-20240229",
        system: createCircuitBoard1Template({
          currentCode: code,
        }),
        messages: [
          // TODO: include previous messages
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 1000,
      })

      let accumulatedContent = ""
      let isInCodeBlock = false

      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta") {
          const chunkText = (chunk.delta as TextDelta).text
          accumulatedContent += chunkText

          if (chunkText.includes("```")) {
            isInCodeBlock = !isInCodeBlock
            if (isInCodeBlock) {
              setCurrentCodeBlock("")
            } else {
              const codeContent = extractCodefence(accumulatedContent)
              if (codeContent) {
                onCodeChange(codeContent)
              }
              setCurrentCodeBlock(null)
            }
          } else if (isInCodeBlock) {
            setCurrentCodeBlock((prev) => {
              const updatedCode = (prev || "") + chunkText
              onCodeChange(updatedCode)
              return updatedCode
            })
          }

          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages]
            updatedMessages[updatedMessages.length - 1].content =
              accumulatedContent
            return updatedMessages
          })
        }
      }
    } catch (error) {
      console.error("Error streaming response:", error)
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages]
        updatedMessages[updatedMessages.length - 1].content =
          "An error occurred while generating the response."
        return updatedMessages
      })
    } finally {
      setIsStreaming(false)
      onStopStreaming()
    }
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(
      window.location.search.split("?")[1],
    )
    const initialPrompt = searchParams.get("initial_prompt")

    if (initialPrompt && messages.length === 0 && !isStreamingRef.current) {
      isStreamingRef.current = true
      addMessage(initialPrompt)
    }
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] max-w-2xl mx-auto p-4 bg-gray-100">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {snippet && (
          <div className="flex pl-4 p-2 rounded items-center bg-white border border-gray-200 text-sm mb-4 shadow-sm">
            <SnippetLink snippet={snippet} />
            <div className="flex-grow" />
            <PrefetchPageLink href={`/editor?snippet_id=${snippet.snippet_id}`}>
              <Button
                size="sm"
                className="text-xs"
                variant="ghost"
                disabled={hasUnsavedChanges}
              >
                Open in Editor
                <Edit2 className="w-3 h-3 ml-2 opacity-60" />
              </Button>
            </PrefetchPageLink>
          </div>
        )}
        {messages.length === 0 && isLoggedIn && (
          <div className="text-gray-500 text-xl text-center pt-[30vh] flex flex-col items-center">
            <div>Submit a prompt to {snippet ? "edit!" : "get started!"}</div>
            <div className="mt-2">
              This is our legacy AI chat interface. For a better experience,
              please use{" "}
              <PrefetchPageLink href="https://chat.tscircuit.com">
                chat.tscircuit.com
              </PrefetchPageLink>
              .
            </div>
            <div className="text-6xl mt-4">↓</div>
          </div>
        )}
        {!isLoggedIn && (
          <div className="text-gray-500 text-xl text-center pt-[30vh] flex flex-col items-center">
            <div>
              Sign in use the AI chat or{" "}
              <PrefetchPageLink
                className="text-blue-500 underline"
                href="/quickstart"
              >
                use the regular editor
              </PrefetchPageLink>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => signIn()}>Sign In</Button>
              <Button onClick={() => signIn()} variant="outline">
                Sign Up
              </Button>
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <AiChatMessage key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      {code && errorMessage && !isStreaming && (
        <div className="flex justify-end mr-6">
          <Button
            onClick={() => {
              addMessage(`Fix this error: ${errorMessage}`)
            }}
            disabled={!isLoggedIn}
            className="mb-2 bg-green-50 hover:bg-green-100"
            variant="outline"
          >
            <MagicWandIcon className="w-4 h-4 mr-2" />
            <span className="font-bold">Fix Error with AI</span>
            <span className="italic font-normal ml-2">
              "{errorMessage.slice(0, 26)}..."
            </span>
          </Button>
        </div>
      )}
      <ChatInput
        onSubmit={async (message: string) => {
          addMessage(message)
        }}
        disabled={isStreaming || !isLoggedIn}
      />
    </div>
  )
}
