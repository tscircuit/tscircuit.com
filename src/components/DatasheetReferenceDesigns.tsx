import { Link } from "wouter"
import { ArrowRight, CircuitBoard } from "lucide-react"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { getDatasheetReferenceDesignPackages } from "@/lib/datasheet-reference-design-packages"
import { getPackageRootUrl } from "@/lib/package-file-routes"
import { Button } from "@/components/ui/button"

function ReferenceDesignPackage({ name }: { name: string }) {
  const { data: pkg, isLoading, error, refetch } = usePackageByName(name)
  const [author, packageName] = name.split("/")
  const href = `${getPackageRootUrl(author, packageName)}#pcb`
  const image = pkg?.latest_pcb_preview_image_url

  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <Link
        href={href}
        aria-label={`Open ${name}`}
        className="flex aspect-[16/9] items-center justify-center overflow-hidden border-b border-gray-200 bg-gray-50"
      >
        {image ? (
          <img
            src={image}
            alt={`${name} PCB preview`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain"
          />
        ) : (
          <CircuitBoard className="h-12 w-12 text-gray-300" />
        )}
      </Link>
      <div className="p-4">
        <h3 className="break-words font-semibold text-blue-600">
          <Link href={href}>{name}</Link>
        </h3>
        {isLoading ? (
          <p className="mt-2 text-sm text-gray-500">Loading package...</p>
        ) : error ? (
          <div className="mt-2 text-sm text-gray-600">
            <p>Unable to load package details.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <p className="mt-2 line-clamp-3 text-sm text-gray-600">
            {pkg?.description || pkg?.ai_description}
          </p>
        )}
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          Open package <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}

export function DatasheetReferenceDesigns({ chipName }: { chipName: string }) {
  const packages = getDatasheetReferenceDesignPackages(chipName)
  if (packages.length === 0) return null

  return (
    <section
      id="reference-designs"
      aria-labelledby="reference-designs-heading"
      className="mb-6 rounded-lg border bg-white p-6 shadow-sm"
    >
      <h2 id="reference-designs-heading" className="text-xl font-semibold">
        Reference designs
      </h2>
      <p className="mb-4 mt-2 text-sm text-gray-600">
        Explore published circuits, their source, and build outputs.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {packages.map((name) => (
          <ReferenceDesignPackage key={name} name={name} />
        ))}
      </div>
    </section>
  )
}
