import {
  ChevronDown,
  Copy,
  Download,
  Edit2,
  Eye,
  Maximize2,
  Package,
  Share,
  Share2,
  Sidebar,
  SidebarClose,
  Save,
  EyeIcon,
  CodeIcon,
  Menu,
  Sparkles,
} from "lucide-react"
import { Link, useLocation } from "wouter"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRunTsx } from "@/hooks/use-run-tsx"
import { OpenInNewWindowIcon } from "@radix-ui/react-icons"
import { encodeTextToUrlHash } from "@/lib/encodeTextToUrlHash"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { DownloadButtonAndMenu } from "./DownloadButtonAndMenu"
import { TypeBadge } from "./TypeBadge"
import { SnippetLink } from "./SnippetLink"
import { useGlobalStore } from "@/hooks/use-global-store"

export default function EditorNav({
  circuitJson,
  snippet,
  code,
  hasUnsavedChanges,
  onTogglePreview,
  previewOpen,
  onSave,
  snippetType,
  isSaving,
}: {
  snippet?: Snippet | null
  circuitJson: any
  code: string
  snippetType?: string
  hasUnsavedChanges: boolean
  previewOpen: boolean
  onTogglePreview: () => void
  isSaving: boolean
  onSave: () => void
}) {
  const [, navigate] = useLocation()
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  return (
    <nav className="flex items-center justify-between px-2 py-3 border-b border-gray-200 bg-white text-sm border-t">
      <div className="flex items-center space-x-1">
        {snippet && (
          <>
            <SnippetLink snippet={snippet} />
            <Link href={`/${snippet.name}`}>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                <OpenInNewWindowIcon className="h-3 w-3 text-gray-700" />
              </Button>
            </Link>
          </>
        )}
        {!isLoggedIn && (
          <div className="bg-orange-100 text-orange-700 py-1 px-2 text-xs opacity-70">
            Not logged in, can't save
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className={"h-6 px-2 text-xs"}
          disabled={!isLoggedIn}
          onClick={onSave}
        >
          <Save className="mr-1 h-3 w-3" />
          Save
        </Button>
        {isSaving && (
          <div className="animate-fadeIn bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
            <svg
              className="animate-spin h-3 w-3 mr-2 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Saving...
          </div>
        )}
        {hasUnsavedChanges && !isSaving && isLoggedIn && (
          <div className="animate-fadeIn bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
            unsaved changes
          </div>
        )}
      </div>
      <div className="flex items-center space-x-1">
        {snippet && <TypeBadge type={snippetType ?? snippet.snippet_type} />}
        <Button
          variant="ghost"
          size="sm"
          disabled={hasUnsavedChanges || isSaving || !snippet}
          onClick={() => navigate(`/ai?snippet_id=${snippet!.snippet_id}`)}
        >
          <Sparkles className="mr-1 h-3 w-3" />
          Edit with AI
        </Button>
        <DownloadButtonAndMenu
          snippetUnscopedName={snippet?.unscoped_name}
          circuitJson={circuitJson}
          className="hidden md:flex"
        />
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:flex px-2 text-xs"
          onClick={() => {
            const url = encodeTextToUrlHash(code)
            navigator.clipboard.writeText(url)
            alert("URL copied to clipboard!")
          }}
        >
          <Share className="mr-1 h-3 w-3" />
          Copy URL
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:flex px-2 text-xs"
        >
          <Eye className="mr-1 h-3 w-3" />
          Public
        </Button>{" "}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "hidden md:flex",
            !previewOpen
              ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
              : "",
          )}
          onClick={() => onTogglePreview()}
        >
          {previewOpen ? (
            <Sidebar className="h-3 w-3" />
          ) : (
            <EyeIcon className="h-3 w-3" />
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button className="md:hidden" variant="secondary" size="sm">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="text-xs">
              <Download className="mr-1 h-3 w-3" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs">
              <Share className="mr-1 h-3 w-3" />
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs">
              <Eye className="mr-1 h-3 w-3" />
              Public
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => onTogglePreview()}
        >
          {previewOpen ? (
            <div className="flex items-center">
              <CodeIcon className="h-3 w-3 mr-1" />
              Show Code
            </div>
          ) : (
            <div className="flex items-center">
              <EyeIcon className="h-3 w-3 mr-1" />
              Show Preview
            </div>
          )}
        </Button>
      </div>
    </nav>
  )
}
