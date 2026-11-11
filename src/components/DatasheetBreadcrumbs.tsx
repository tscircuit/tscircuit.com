import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getReferenceDesignsUrl } from "@/lib/reference-design-selection"
import { Fragment } from "react"
import { Link } from "wouter"

export function DatasheetBreadcrumbs({
  chipName,
  referenceDesignName,
}: {
  chipName: string
  referenceDesignName?: string
}) {
  const items = [
    { label: "Datasheets", href: "/datasheets" },
    { label: chipName, href: `/datasheets/${encodeURIComponent(chipName)}` },
    { label: "Reference designs", href: getReferenceDesignsUrl(chipName) },
    ...(referenceDesignName ? [{ label: referenceDesignName, href: "" }] : []),
  ]
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                aria-label="Show parent pages"
              >
                <BreadcrumbEllipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {items.slice(0, 2).map((item) => (
                <DropdownMenuItem asChild key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        {items.map((item, index) => (
          <Fragment key={`${index}:${item.href}`}>
            {index > 0 && (
              <BreadcrumbSeparator
                className={index < 2 ? "hidden sm:list-item" : "shrink-0"}
              />
            )}
            <BreadcrumbItem
              className={
                index < 2
                  ? "hidden min-w-0 sm:inline-flex"
                  : index === 2
                    ? "min-w-0 shrink-0"
                    : "min-w-0"
              }
            >
              {index === items.length - 1 ? (
                <BreadcrumbPage className="truncate">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild className="truncate">
                  <Link href={item.href} className="truncate">
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
