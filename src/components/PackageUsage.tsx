import { usePackageFileById } from "@/hooks/use-package-files"
import { useShikiHighlighter } from "@/hooks/use-shiki-highlighter"
import { useToast } from "@/hooks/use-toast"
import {
  findPackageComponentExport,
  getPackageUsage,
} from "@/lib/package-usage"
import type { PreviewParameterValues } from "@/lib/package-preview-parameters"
import { useQuery } from "react-query"
import { Code2, Copy } from "lucide-react"
import { Button } from "./ui/button"

export function PackageUsage({
  packageName,
  declarationFileId,
  values,
}: {
  packageName: string
  declarationFileId?: string
  values: PreviewParameterValues
}) {
  const declarations = usePackageFileById(declarationFileId ?? null)
  const { data: component, isError } = useQuery(
    [
      "packageComponentExport",
      declarationFileId,
      declarations.data?.content_text,
    ],
    () => findPackageComponentExport(declarations.data!.content_text!),
    { enabled: Boolean(declarations.data?.content_text), staleTime: Infinity },
  )
  const { highlighter } = useShikiHighlighter()
  const { toast } = useToast()
  const code = component
    ? getPackageUsage({ packageName, component, values })
    : null
  const html = code
    ? highlighter?.codeToHtml(code, { lang: "tsx", theme: "vitesse-light" })
    : null

  return (
    <section className="mt-6 min-w-0 rounded-lg border" aria-label="TSX usage">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <Code2 className="h-4 w-4" aria-hidden="true" />
          TSX usage
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={!code}
          onClick={async () => {
            if (!code) return
            try {
              await navigator.clipboard.writeText(code)
              toast({ title: "TSX copied to clipboard" })
            } catch {
              toast({ title: "Unable to copy TSX", variant: "destructive" })
            }
          }}
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
          Copy TSX
        </Button>
      </div>
      <p className="px-4 pt-3 text-sm text-gray-500">
        Use this package with the parameters selected above.
      </p>
      <div
        className="overflow-x-auto p-4 text-sm"
        data-testid="package-usage-code"
      >
        {code ? (
          html ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <pre>
              <code>{code}</code>
            </pre>
          )
        ) : (
          <p className="text-gray-500" role="status">
            {!declarationFileId ||
            declarations.error ||
            isError ||
            component === null
              ? "TSX usage is unavailable for this release's published exports."
              : "Loading TSX usage…"}
          </p>
        )}
      </div>
    </section>
  )
}
