import { Button } from "@/components/ui/button"
import { Check, CircleCheckBig, Cpu, GitFork, Square } from "lucide-react"
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
  const shouldUseWebworkerForRun = useGlobalStore(
    (s) => s.should_use_webworker_for_run,
  )
  const setShouldUseWebworkerForRun = useGlobalStore(
    (s) => s.setShouldUseWebworkerForRun,
  )
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
    currentCode: code,
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
    <nav className="items-center justify-between w-screen px-2 py-3 text-sm bg-white border-t border-b border-gray-200 lg:flex dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700">
      <div className="items-center my-2 lg:flex ">
        <div className="flex items-center space-x-1">
          {snippet && (
            <>
              <SnippetLink snippet={snippet} />
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 ml-2"
                onClick={() => openRenameDialog()}
              >
                <Pencil className="w-3 h-3 text-gray-700 dark:text-gray-300" />
              </Button>
              <Link href={`/${snippet.name}`}>
                <Button variant="ghost" size="icon" className="w-6 h-6">
                  <OpenInNewWindowIcon className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                </Button>
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {!isLoggedIn && (
            <div className="px-2 py-1 text-xs text-orange-700 bg-orange-100 opacity-70 dark:bg-orange-900 dark:text-orange-300">
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
                <Save className="w-3 h-3 mr-1" />
                Save
              </>
            ) : (
              <>
                <GitFork className="w-3 h-3 mr-1" />
                Fork
              </>
            )}
          </Button>
          {isSaving && (
            <div className="animate-fadeIn bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center dark:bg-blue-900 dark:text-blue-300">
              <svg
                className="w-3 h-3 mr-2 text-blue-600 animate-spin dark:text-blue-400"
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
            <div className="animate-fadeIn bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
              {snippet ? "unsaved changes" : "unsaved"}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end -space-x-1">
        <div className="flex items-center mx-2 space-x-1">
          {snippet && <TypeBadge type={snippetType ?? snippet.snippet_type} />}
          <Button
            variant="ghost"
            size="sm"
            disabled={hasUnsavedChanges || isSaving || !snippet}
            onClick={() => navigate(`/ai?snippet_id=${snippet!.snippet_id}`)}
          >
            <Sparkles className="w-3 h-3 mr-1" />
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
            className="hidden px-2 text-xs md:flex"
            onClick={() => {
              const url = encodeTextToUrlHash(code, snippetType)
              navigator.clipboard.writeText(url)
              alert("URL copied to clipboard!")
            }}
          >
            <Share className="w-3 h-3 mr-1" />
            Copy URL
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hidden px-2 text-xs md:flex"
            onClick={() =>
              setShouldUseWebworkerForRun(!shouldUseWebworkerForRun)
            }
          >
            {shouldUseWebworkerForRun ? (
              <CircleCheckBig className="w-3 h-3 mr-1" />
            ) : (
              <Square className="w-3 h-3 mr-1" />
            )}
            Webworker (Beta)
          </Button>
          {/* <Button
            variant="ghost"
            size="sm"
            className="hidden px-2 text-xs md:flex"
          >
            <Eye className="w-3 h-3 mr-1" />
            Public
          </Button> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="text-xs"
                onClick={() => openCreateOrderDialog()}
              >
                <Package className="w-3 h-3 mr-2" />
                Submit Order
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs"
                onClick={() => openFilesDialog()}
              >
                <File className="w-3 h-3 mr-2" />
                View Files
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs"
                onClick={() => openupdateDescriptionDialog()}
              >
                <FilePenLine className="w-3 h-3 mr-2" />
                Edit Description
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs"
                onClick={() => openViewTsFilesDialog()}
              >
                <File className="w-3 h-3 mr-2" />
                [Debug] View TS Files
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  className="text-xs"
                  disabled={isChangingType || hasUnsavedChanges}
                >
                  <Edit2 className="w-3 h-3 mr-2" />
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
                <Trash2 className="w-3 h-3 mr-2" />
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
              <Sidebar className="w-3 h-3" />
            ) : (
              <EyeIcon className="w-3 h-3" />
            )}
          </Button>
        </div>
        <div className="flex items-center ">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button className="md:hidden" variant="secondary" size="sm">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem className="text-xs">
                <Download className="w-3 h-3 mr-1" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs">
                <Share className="w-3 h-3 mr-1" />
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs">
                <Eye className="w-3 h-3 mr-1" />
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
                <CodeIcon className="w-3 h-3 mr-1" />
                Show Code
              </div>
            ) : (
              <div className="flex items-center">
                <EyeIcon className="w-3 h-3 mr-1" />
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
