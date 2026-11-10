import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getReferenceDesignsUrl } from "@/lib/reference-design-selection"
import { Fragment } from "react"
import { Link } from "wouter"

export function DatasheetBreadcrumbs({
  chipName,
  referenceDesignName,
  referenceDesigns = false,
}: {
  chipName: string
  referenceDesignName?: string
  referenceDesigns?: boolean
}) {
  const items = [
    { label: "Datasheets", href: "/datasheets" },
    { label: chipName, href: `/datasheets/${encodeURIComponent(chipName)}` },
    ...(referenceDesigns
      ? [{ label: "Reference designs", href: getReferenceDesignsUrl(chipName) }]
      : []),
    ...(referenceDesignName ? [{ label: referenceDesignName, href: "" }] : []),
  ]
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={`${index}:${item.href}`}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem className="min-w-0">
              {index === items.length - 1 ? (
                <BreadcrumbPage className="break-all">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href} className="break-all">
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
