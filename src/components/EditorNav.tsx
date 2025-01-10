import { Button } from "@/components/ui/button"
import { GitFork } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useGlobalStore } from "@/hooks/use-global-store"
import { encodeTextToUrlHash } from "@/lib/encodeTextToUrlHash"
import { cn } from "@/lib/utils"
import { OpenInNewWindowIcon } from "@radix-ui/react-icons"
import { AnyCircuitElement } from "circuit-json"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import {
  ChevronDown,
  CodeIcon,
  Download,
  Edit2,
  Eye,
  EyeIcon,
  File,
  FilePenLine,
  MoreVertical,
  Package,
  Pencil,
  Save,
  Share,
  Sidebar,
  Sparkles,
  Trash2,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "react-query"
import { Link, useLocation } from "wouter"
import { useAxios } from "../hooks/use-axios"
import { useToast } from "../hooks/use-toast"
import { useConfirmDeleteSnippetDialog } from "./dialogs/confirm-delete-snippet-dialog"
import { useCreateOrderDialog } from "./dialogs/create-order-dialog"
import { useFilesDialog } from "./dialogs/files-dialog"
import { useViewTsFilesDialog } from "./dialogs/view-ts-files-dialog"
import { useRenameSnippetDialog } from "./dialogs/rename-snippet-dialog"
import { DownloadButtonAndMenu } from "./DownloadButtonAndMenu"
import { SnippetLink } from "./SnippetLink"
import { TypeBadge } from "./TypeBadge"
import { useUpdateDescriptionDialog } from "./dialogs/edit-description-dialog"
import { useForkSnippetMutation } from "@/hooks/useForkSnippetMutation"

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
  canSave,
}: {
  snippet?: Snippet | null
  circuitJson?: AnyCircuitElement[] | null
  code: string
  snippetType?: string
  hasUnsavedChanges: boolean
  previewOpen: boolean
  onTogglePreview: () => void
  isSaving: boolean
  onSave: () => void
  canSave: boolean
}) {
  const [, navigate] = useLocation()
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const session = useGlobalStore((s) => s.session)
  const { Dialog: RenameDialog, openDialog: openRenameDialog } =
    useRenameSnippetDialog()
  const {
    Dialog: UpdateDescriptionDialog,
    openDialog: openupdateDescriptionDialog,
  } = useUpdateDescriptionDialog()
  const { Dialog: DeleteDialog, openDialog: openDeleteDialog } =
    useConfirmDeleteSnippetDialog()
  const { Dialog: CreateOrderDialog, openDialog: openCreateOrderDialog } =
    useCreateOrderDialog()
  const { Dialog: FilesDialog, openDialog: openFilesDialog } = useFilesDialog()
  const { Dialog: ViewTsFilesDialog, openDialog: openViewTsFilesDialog } =
    useViewTsFilesDialog()

  const [isChangingType, setIsChangingType] = useState(false)
  const [currentType, setCurrentType] = useState(
    snippetType ?? snippet?.snippet_type,
  )
  const axios = useAxios()
  const { toast } = useToast()
  const qc = useQueryClient()

  const { mutate: forkSnippet, isLoading: isForking } = useForkSnippetMutation({
    snippet: snippet!,
    currentCode: code, // Pass the current code from props
    onSuccess: (forkedSnippet) => {
      navigate("/editor?snippet_id=" + forkedSnippet.snippet_id)
      setTimeout(() => {
        window.location.reload() //reload the page
      }, 2000)
    },
  })

  // Update currentType when snippet or snippetType changes
  useEffect(() => {
    setCurrentType(snippetType ?? snippet?.snippet_type)
  }, [snippetType, snippet?.snippet_type])

  const handleTypeChange = async (newType: string) => {
    if (!snippet || newType === currentType) return

    try {
      setIsChangingType(true)

      const response = await axios.post("/snippets/update", {
        snippet_id: snippet.snippet_id,
        snippet_type: newType,
      })

      if (response.status === 200) {
        setCurrentType(newType)
        toast({
          title: "Snippet type changed",
          description: `Successfully changed type to "${newType}"`,
        })

        // Invalidate queries to refetch data
        await Promise.all([
          qc.invalidateQueries({ queryKey: ["snippets"] }),
          qc.invalidateQueries({ queryKey: ["snippets", snippet.snippet_id] }),
        ])

        // Reload the page to ensure all components reflect the new type
        // window.location.reload()
      } else {
        throw new Error("Failed to update snippet type")
      }
    } catch (error: any) {
      console.error("Error changing snippet type:", error)
      toast({
        title: "Error",
        description:
          error.response?.data?.error?.message ||
          "Failed to change the snippet type. Please try again.",
        variant: "destructive",
      })
      // Reset to previous type on error
      setCurrentType(snippet.snippet_type)
    } finally {
      setIsChangingType(false)
    }
  }

  const canSaveSnippet =
    !snippet || snippet.owner_name === session?.github_username

  return (
    <nav className="lg:flex w-screen items-center justify-between px-2 py-3 border-b border-gray-200 bg-white text-sm border-t">
      <div className="lg:flex items-center my-2 ">
        <div className="flex items-center space-x-1">
          {snippet && (
            <>
              <SnippetLink snippet={snippet} />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-2"
                onClick={() => openRenameDialog()}
              >
                <Pencil className="h-3 w-3 text-gray-700" />
              </Button>
              <Link href={`/${snippet.name}`}>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <OpenInNewWindowIcon className="h-3 w-3 text-gray-700" />
                </Button>
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {!isLoggedIn && (
            <div className="bg-orange-100 text-orange-700 py-1 px-2 text-xs opacity-70">
              Not logged in, can't save
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className={"ml-1 h-6 px-2 text-xs save-button"}
            disabled={!isLoggedIn}
            onClick={canSaveSnippet ? onSave : () => forkSnippet()}
          >
            {canSaveSnippet ? (
              <>
                <Save className="mr-1 h-3 w-3" />
                Save
              </>
            ) : (
              <>
                <GitFork className="mr-1 h-3 w-3" />
                Fork
              </>
            )}
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
              {snippet ? "unsaved changes" : "unsaved"}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end -space-x-1">
        <div className="flex mx-2 items-center space-x-1">
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
              const url = encodeTextToUrlHash(code, snippetType)
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
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="text-xs"
                onClick={() => openCreateOrderDialog()}
              >
                <Package className="mr-2 h-3 w-3" />
                Submit Order
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs"
                onClick={() => openFilesDialog()}
              >
                <File className="mr-2 h-3 w-3" />
                View Files
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs"
                onClick={() => openupdateDescriptionDialog()}
              >
                <FilePenLine className="mr-2 h-3 w-3" />
                Edit Description
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs"
                onClick={() => openViewTsFilesDialog()}
              >
                <File className="mr-2 h-3 w-3" />
                [Debug] View TS Files
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  className="text-xs"
                  disabled={isChangingType || hasUnsavedChanges}
                >
                  <Edit2 className="mr-2 h-3 w-3" />
                  {isChangingType ? "Changing..." : "Change Type"}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    className="text-xs"
                    disabled={currentType === "board" || isChangingType}
                    onClick={() => handleTypeChange("board")}
                  >
                    Board {currentType === "board" && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-xs"
                    disabled={currentType === "package" || isChangingType}
                    onClick={() => handleTypeChange("package")}
                  >
                    Module {currentType === "package" && "✓"}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem
                className="text-xs text-red-600"
                onClick={() => openDeleteDialog()}
              >
                <Trash2 className="mr-2 h-3 w-3" />
                Delete Snippet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        </div>
        <div className="flex items-center ">
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
      </div>
      <UpdateDescriptionDialog
        snippetId={snippet?.snippet_id ?? ""}
        currentDescription={snippet?.description ?? ""}
      />
      <RenameDialog
        snippetId={snippet?.snippet_id ?? ""}
        currentName={snippet?.unscoped_name ?? ""}
      />
      <DeleteDialog
        snippetId={snippet?.snippet_id ?? ""}
        snippetName={snippet?.unscoped_name ?? ""}
      />
      <CreateOrderDialog />
      <FilesDialog snippetId={snippet?.snippet_id ?? ""} />
      <ViewTsFilesDialog />
    </nav>
  )
}
