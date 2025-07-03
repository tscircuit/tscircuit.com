import { Button } from "@/components/ui/button"
import { GitFork, Star } from "lucide-react"
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
import { encodeFsMapToUrlHash } from "@/lib/encodeFsMapToUrlHash"
import { cn } from "@/lib/utils"
import { OpenInNewWindowIcon, LockClosedIcon } from "@radix-ui/react-icons"
import { AnyCircuitElement } from "circuit-json"
import { Package } from "fake-snippets-api/lib/db/schema"
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
  Package as PackageIcon,
  Pencil,
  Save,
  Share,
  Sidebar,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "react-query"
import { Link, useLocation } from "wouter"
import { useAxios } from "@/hooks/use-axios"
import { useHotkeyCombo } from "@/hooks/use-hotkey"
import { useToast } from "@/hooks/use-toast"
import { useConfirmDeletePackageDialog } from "@/components/dialogs/confirm-delete-package-dialog"
import { useFilesDialog } from "@/components/dialogs/files-dialog"
import { useViewTsFilesDialog } from "@/components/dialogs/view-ts-files-dialog"
import { DownloadButtonAndMenu } from "@/components/DownloadButtonAndMenu"
import { TypeBadge } from "@/components/TypeBadge"
import { useForkPackageMutation } from "@/hooks/useForkPackageMutation"
import tscircuitCorePkg from "@tscircuit/core/package.json"
import { useRenamePackageDialog } from "../dialogs/rename-package-dialog"
import { useUpdatePackageDescriptionDialog } from "../dialogs/update-package-description-dialog"

export default function EditorNav({
  circuitJson,
  pkg,
  code,
  fsMap,
  hasUnsavedChanges,
  onTogglePreview,
  previewOpen,
  onSave,
  onDiscard,
  packageType,
  isSaving,
}: {
  pkg?: Package | null
  circuitJson?: AnyCircuitElement[] | null
  code: string
  fsMap: Record<string, string>
  packageType?: string
  hasUnsavedChanges: boolean
  previewOpen: boolean
  onTogglePreview: () => void
  isSaving: boolean
  onSave: () => void
  onDiscard?: () => void
}) {
  const [, navigate] = useLocation()
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const session = useGlobalStore((s) => s.session)
  const { Dialog: RenameDialog, openDialog: openRenameDialog } =
    useRenamePackageDialog()
  const {
    Dialog: UpdateDescriptionDialog,
    openDialog: openupdateDescriptionDialog,
  } = useUpdatePackageDescriptionDialog()
  const { Dialog: DeleteDialog, openDialog: openDeleteDialog } =
    useConfirmDeletePackageDialog()
  const { Dialog: FilesDialog, openDialog: openFilesDialog } = useFilesDialog()
  const { Dialog: ViewTsFilesDialog, openDialog: openViewTsFilesDialog } =
    useViewTsFilesDialog()

  const [isChangingType, setIsChangingType] = useState(false)
  const [currentType, setCurrentType] = useState(
    packageType ?? pkg?.snippet_type,
  )
  const [isPrivate, setIsPrivate] = useState(pkg?.is_private ?? false)
  const axios = useAxios()
  const { toast } = useToast()
  const qc = useQueryClient()

  const { mutate: forkSnippet, isLoading: isForking } = useForkPackageMutation({
    pkg: pkg!,
    currentCode: code,
    onSuccess: (forkedPackage) => {
      navigate("/editor?package_id=" + forkedPackage.package_id)
      setTimeout(() => {
        window.location.reload() //reload the page
      }, 2000)
    },
  })

  // Update currentType when snippet or packageType changes
  useEffect(() => {
    setCurrentType(packageType ?? pkg?.snippet_type)
  }, [packageType, pkg?.snippet_type])

  const handleTypeChange = async (newType: string) => {
    if (!pkg || newType === currentType) return

    try {
      setIsChangingType(true)

      const response = await axios.post("/packages/update", {
        package_id: pkg.package_id,
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
          qc.invalidateQueries({ queryKey: ["packages"] }),
          qc.invalidateQueries({ queryKey: ["packages", pkg.package_id] }),
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
      setCurrentType(pkg.snippet_type)
    } finally {
      setIsChangingType(false)
    }
  }

  const updatePackageVisibilityToPrivate = async (isPrivate: boolean) => {
    if (!pkg) return

    const response = await axios.post("/packages/update", {
      package_id: pkg.package_id,
      is_private: isPrivate,
    })

    if (response.status === 200) {
      setIsPrivate(isPrivate)
      toast({
        title: "Package visibility changed",
        description: `Successfully changed visibility to ${
          isPrivate ? "private" : "public"
        }`,
      })
    } else {
      setIsPrivate(pkg.is_private ?? false)
      toast({
        title: "Error",
        description: "Failed to update package visibility",
        variant: "destructive",
      })
      throw new Error("Failed to update package visibility")
    }
  }

  const canSavePackage = useMemo(
    () =>
      Boolean(
        isLoggedIn &&
          (!pkg || pkg?.owner_github_username === session?.github_username),
      ),
    [isLoggedIn, pkg, session?.github_username],
  )

  useHotkeyCombo(
    "cmd+s",
    () => {
      if (!hasUnsavedChanges || !canSavePackage) return
      onSave()
    },
    { target: window },
  )
  return (
    <nav className="lg:flex w-screen items-center justify-between px-2 py-3 border-b border-gray-200 bg-white text-sm border-t">
      <div className="lg:flex items-center my-2 ">
        <div className="flex items-center space-x-1">
          {pkg && (
            <>
              <div className="flex items-center space-x-1 overflow-hidden">
                <Link
                  className="text-blue-500 font-semibold hover:underline truncate"
                  href={`/${pkg.owner_github_username}`}
                  title={pkg.owner_github_username || ""}
                >
                  {pkg.owner_github_username}
                </Link>
                <span className="px-0.5 text-gray-500">/</span>
                <Link
                  className="text-blue-500 font-semibold hover:underline truncate"
                  href={`/${pkg.name}`}
                  title={pkg.unscoped_name}
                >
                  {pkg.unscoped_name}
                </Link>
              </div>
              {pkg.star_count !== undefined && (
                <span className="ml-2 text-gray-500 text-xs flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  {pkg.star_count}
                </span>
              )}
              {pkg.owner_github_username === session?.github_username && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-2"
                  onClick={() => openRenameDialog()}
                >
                  <Pencil className="h-3 w-3 text-gray-700" />
                </Button>
              )}
              {isPrivate && (
                <div className="relative group">
                  <LockClosedIcon className="h-3 w-3 text-gray-700" />
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                    private
                  </span>
                </div>
              )}
              <Link href={`/${pkg.name}`}>
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
            disabled={canSavePackage && pkg ? !hasUnsavedChanges : !isLoggedIn}
            onClick={canSavePackage ? onSave : () => forkSnippet()}
          >
            {canSavePackage ? (
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
              {pkg ? "unsaved changes" : "unsaved"}
            </div>
          )}
          {hasUnsavedChanges && onDiscard && Boolean(pkg?.package_id) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onDiscard}
              title="Discard all unsaved changes (Cmd+Shift+Z)"
            >
              <Undo2 className="mr-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end -space-x-1">
        <div className="flex mx-2 items-center space-x-1">
          {pkg && <TypeBadge type={`${packageType ?? pkg.snippet_type}`} />}
          {/* <Button
            variant="ghost"
            size="sm"
            disabled={hasUnsavedChanges || isSaving || !pkg}
            onClick={() => navigate(`/ai?snippet_id=${pkg!.package_id}`)}
          >
            <Sparkles className="mr-1 h-3 w-3" />
            Edit with AI
          </Button> */}
          <DownloadButtonAndMenu
            unscopedName={pkg?.unscoped_name}
            circuitJson={circuitJson}
            className="flex"
            desiredImageType={pkg?.default_view ?? "pcb"}
            author={pkg?.owner_github_username ?? undefined}
          />
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex px-2 text-xs"
            onClick={() => {
              const url = encodeFsMapToUrlHash(fsMap, packageType)
              navigator.clipboard.writeText(url)
              alert("URL copied to clipboard!")
            }}
          >
            <Share className="mr-1 h-3 w-3" />
            Copy URL
          </Button>
          {/* <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex px-2 text-xs"
          >
            <Eye className="mr-1 h-3 w-3" />
            Public
          </Button> */}
          {pkg && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-xs">
                    <Edit2 className="mr-2 h-3 w-3" />
                    Change Package Visibility
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      className="text-xs"
                      disabled={isPrivate}
                      onClick={() => updatePackageVisibilityToPrivate(true)}
                    >
                      Private {isPrivate && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-xs"
                      disabled={!isPrivate}
                      onClick={() => updatePackageVisibilityToPrivate(false)}
                    >
                      Public {!isPrivate && "✓"}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem
                  className="text-xs text-red-600"
                  onClick={() => openDeleteDialog()}
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Delete Package
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs text-gray-500" disabled>
                  @tscircuit/core@{tscircuitCorePkg.version}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
            <DropdownMenuTrigger asChild>
              <div className="md:hidden rounded-full p-1 hover:bg-gray-100 cursor-pointer">
                <Button className="md:hidden" variant="secondary" size="sm">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {hasUnsavedChanges && onDiscard && (
                <DropdownMenuItem
                  className="text-xs text-red-600"
                  onClick={onDiscard}
                >
                  <Undo2 className="mr-1 h-3 w-3" />
                  Discard Changes
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-xs"
                onClick={() => {
                  if (window) {
                    navigator.clipboard.writeText(
                      new URL(window.location.href).origin + "/" + pkg?.name,
                    )
                    toast({
                      title: "URL copied!",
                      description: "The URL has been copied to your clipboard.",
                    })
                  }
                }}
              >
                <Share className="mr-1 h-3 w-3" />
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs"
                onClick={() => {
                  if (
                    pkg &&
                    session?.github_username === pkg.owner_github_username
                  ) {
                    updatePackageVisibilityToPrivate(!isPrivate)
                  }
                }}
              >
                <Eye className="mr-1 h-3 w-3" />
                {session?.github_username === pkg?.owner_github_username
                  ? isPrivate
                    ? "Make Public"
                    : "Make Private"
                  : isPrivate
                    ? "Private Package"
                    : "Public Package"}
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
        packageId={pkg?.package_id ?? ""}
        currentDescription={pkg?.description ?? ""}
      />
      <RenameDialog
        packageId={pkg?.package_id ?? ""}
        currentName={pkg?.unscoped_name ?? ""}
      />
      <DeleteDialog
        packageId={pkg?.package_id ?? ""}
        packageName={pkg?.unscoped_name ?? ""}
        packageOwner={pkg?.owner_github_username ?? ""}
      />
      <FilesDialog snippetId={pkg?.package_id ?? ""} />
      <ViewTsFilesDialog />
    </nav>
  )
}
