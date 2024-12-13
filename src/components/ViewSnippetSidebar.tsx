import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { useCurrentSnippet } from "@/hooks/use-current-snippet"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { AtSign, Bot, Clock, Code, File, GitFork, Link2, Package } from "lucide-react"
import { Link } from "wouter"
import { useFilesDialog } from "./dialogs/files-dialog"
import { useEditDatasheetUrlDialog } from "./dialogs/edit-datasheet-url-dialog"
import { Button } from "./ui/button"
import { useState } from "react"

export default function ViewSnippetSidebar({
  className,
}: {
  className?: string
}) {
  const { snippet } = useCurrentSnippet()
  const { toast } = useToast()
  const { Dialog: FilesDialog, openDialog: openFilesDialog } = useFilesDialog()
  const { Dialog: DatasheetUrlDialog, openDialog: openDatasheetUrlDialog } = useEditDatasheetUrlDialog()
  const { copyToClipboard } = useCopyToClipboard()
  const [datasheetUrlDialogProps, setDatasheetUrlDialogProps] = useState<{ snippetId: string; currentUrl: string | null } | null>(null)

  return (
    <div
      className={cn(
        "w-64 h-full bg-gray-100 text-gray-700 flex flex-col flex-shrink-0",
        "hidden sm:block h-screen sticky top-0",
        className,
      )}
    >
      <nav className="flex-grow overflow-y-auto">
        <ul className="p-2 space-y-2">
          {[
            {
              icon: <Code className="w-5 h-5" />,
              label: "Edit Code",
              href: `/editor?snippet_id=${snippet?.snippet_id}`,
            },
            {
              icon: <Bot className="w-5 h-5" />,
              label: "Edit with AI",
              badge: "AI",
              href: `/ai?snippet_id=${snippet?.snippet_id}`,
            },
            {
              icon: <Link2 className="w-5 h-5" />,
              label: "Datasheet",
              content: snippet?.datasheet_url ? (
                <div className="flex items-center gap-2 mt-2">
                  <a
                    href={snippet.datasheet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm truncate max-w-[150px]"
                  >
                    View Datasheet
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (snippet) {
                        setDatasheetUrlDialogProps({ snippetId: snippet.snippet_id, currentUrl: snippet.datasheet_url ?? null })
                        openDatasheetUrlDialog()
                      }
                    }}
                  >
                    Edit
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (snippet) {
                      setDatasheetUrlDialogProps({ snippetId: snippet.snippet_id, currentUrl: null })
                      openDatasheetUrlDialog()
                    }
                  }}
                >
                  Add Datasheet URL
                </Button>
              ),
              badge: snippet?.datasheet_url ? "URL" : undefined,
            },
            {
              icon: <GitFork className="w-5 h-5" />,
              label: "Forks",
              notImplemented: true,
            },
            {
              icon: <AtSign className="w-5 h-5" />,
              label: "References",
              notImplemented: true,
            },
            {
              icon: <Package className="w-5 h-5" />,
              label: "Dependencies",
              notImplemented: true,
            },
            {
              icon: <Clock className="w-5 h-5" />,
              label: "Versions",
              notImplemented: true,
            },
            {
              icon: <File className="w-5 h-5" />,
              label: "Files",
              onClick: () => {
                if (snippet) {
                  openFilesDialog()
                }
              },
            },
          ].map((item, index) => (
            <li key={index}>
              <Link
                href={item.href ?? "#"}
                onClick={
                  item.notImplemented
                    ? () => {
                        toast({
                          title: "Not Implemented!",
                          description: (
                            <div>
                              The {item.label} selection is not implemented yet.
                              Help us out!{" "}
                              <a
                                className="text-blue-500 hover:underline font-semibold"
                                href="https://github.com/tscircuit/snippets"
                              >
                                Check out our Github
                              </a>
                            </div>
                          ),
                        })
                      }
                    : item.onClick
                }
                className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-200 rounded-md"
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200 space-y-4">
        <div className="space-y-1">
          <div className="text-xs font-medium">Copy embed code</div>
          <div
            className="text-[0.5em] p-2 rounded-sm bg-blue-50 border border-blue-200 cursor-pointer font-mono whitespace-nowrap overflow-hidden text-ellipsis"
            onClick={() => {
              const embedCode = `<iframe src="${window.location.origin}/preview?snippet_id=${snippet?.snippet_id}" width="100%" height="500" frameborder="0"></iframe>`
              navigator.clipboard.writeText(embedCode)
              toast({
                title: "Copied!",
                description: "Embed code copied to clipboard",
              })
            }}
          >
            {`<iframe src="${window.location.origin}/preview?snippet_id=${snippet?.snippet_id}" width="100%" height="500" frameborder="0"></iframe>`}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium">Copy import code</div>
          <div
            className="text-[0.5em] p-2 rounded-sm bg-blue-50 border border-blue-200 cursor-pointer font-mono whitespace-nowrap overflow-hidden text-ellipsis"
            onClick={() =>
              copyToClipboard(
                `import CircuitModule from "@tsci/${snippet?.owner_name}.${snippet?.unscoped_name}"`,
              )
            }
          >
            import CircuitModule from "@tsci/{snippet?.owner_name}.
            {snippet?.unscoped_name}"
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-medium">Copy install command</div>
          <div
            className="text-[0.5em] p-2 rounded-sm bg-blue-50 border border-blue-200 cursor-pointer font-mono whitespace-nowrap overflow-hidden text-ellipsis"
            onClick={() =>
              copyToClipboard(
                `tsci add @tsci/${snippet?.owner_name}.${snippet?.unscoped_name}`,
              )
            }
          >
            tsci add @tsci/{snippet?.owner_name}.{snippet?.unscoped_name}
          </div>
        </div>
      </div>
      {snippet && <FilesDialog snippetId={snippet.snippet_id} />}
      {snippet && datasheetUrlDialogProps && <DatasheetUrlDialog {...datasheetUrlDialogProps} />}
    </div>
  )
}
