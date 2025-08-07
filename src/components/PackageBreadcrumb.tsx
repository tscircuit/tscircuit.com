import { PrefetchPageLink } from "@/components/PrefetchPageLink"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface PackageBreadcrumbProps {
  author: string
  packageName: string
  unscopedName?: string
  currentPage?: "releases" | "builds" | string
  releaseVersion?: string
}

export function PackageBreadcrumb({
  author,
  packageName,
  unscopedName,
  currentPage,
  releaseVersion,
}: PackageBreadcrumbProps) {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {/* Author */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <PrefetchPageLink href={`/${author}`}>{author}</PrefetchPageLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <span>/</span>
        </BreadcrumbSeparator>

        {/* Package */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <PrefetchPageLink href={`/${packageName}`}>
              {unscopedName || packageName}
            </PrefetchPageLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <span>/</span>
        </BreadcrumbSeparator>

        {/* Releases */}
        {(currentPage === "releases" || releaseVersion || currentPage === "builds") && (
          <>
            <BreadcrumbItem>
              {currentPage === "releases" ? (
                <BreadcrumbPage>releases</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <PrefetchPageLink href={`/${packageName}/releases`}>
                    releases
                  </PrefetchPageLink>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <span>/</span>
            </BreadcrumbSeparator>
          </>
        )}

        {/* Release Version */}
        {releaseVersion && (
          <>
            <BreadcrumbItem>
              {currentPage === "builds" ? (
                <BreadcrumbLink asChild>
                  <PrefetchPageLink href={`/${packageName}/release/${releaseVersion}`}>
                    {releaseVersion}
                  </PrefetchPageLink>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{releaseVersion}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {currentPage === "builds" && (
              <>
                <BreadcrumbSeparator>
                  <span>/</span>
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>builds</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </>
        )}

        {/* Other current pages */}
        {currentPage && !["releases", "builds"].includes(currentPage) && (
          <BreadcrumbItem>
            <BreadcrumbPage>{currentPage}</BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}