import { Link } from "wouter"
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
  buildId?: string
  releaseId?: string
}

export function PackageBreadcrumb({
  author,
  packageName,
  unscopedName,
  currentPage,
  releaseVersion,
  buildId,
  releaseId,
}: PackageBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="select-none">
        {/* Author */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/${author}`}>{author}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <span>/</span>
        </BreadcrumbSeparator>

        {/* Package */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/${packageName}`}>{unscopedName || packageName}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <span>/</span>
        </BreadcrumbSeparator>

        {/* Releases */}
        {(currentPage === "releases" ||
          releaseVersion ||
          currentPage === "builds") && (
          <>
            <BreadcrumbItem>
              {currentPage === "releases" ? (
                <BreadcrumbPage>releases</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={`/${packageName}/releases`}>releases</Link>
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
                  <Link href={`/${packageName}/releases/${releaseVersion}`}>
                    {releaseVersion}
                  </Link>
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
                  {buildId ? (
                    <BreadcrumbLink asChild>
                      <Link
                        href={`/${packageName}/releases/${releaseId}/builds`}
                      >
                        builds
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>builds</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {buildId && (
                  <>
                    <BreadcrumbSeparator>
                      <span>/</span>
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbPage>{buildId}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
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
