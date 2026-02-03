import React from "react"
import { Link } from "wouter"
import { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"
import { Building2 } from "lucide-react"

export interface OrgCardProps {
  org: Omit<PublicOrgSchema, "github_handle">
  withLink?: boolean
  className?: string
  onClick?: (org: Omit<PublicOrgSchema, "github_handle">) => void
}

export const OrgCard: React.FC<OrgCardProps> = ({
  org,
  withLink = true,
  className = "",
  onClick,
}) => {
  const handle = org.tscircuit_handle || ""

  const handleClick = () => {
    if (onClick) {
      onClick(org)
    } else if (!withLink) {
      window.location.href = `/${handle}`
    }
  }

  const cardContent = (
    <div
      className={`border p-4 rounded-md hover:shadow-md transition-shadow flex flex-col gap-4 cursor-pointer ${className}`}
      onClick={!withLink ? handleClick : undefined}
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-50 border flex items-center justify-center">
          {org.avatar_url ? (
            <img
              src={org.avatar_url}
              alt={`${handle} avatar`}
              className="object-cover h-full w-full transition-transform duration-300 hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = "none"
                target.nextElementSibling?.classList.remove("hidden")
                target.nextElementSibling?.classList.add("flex")
              }}
            />
          ) : null}
          <div
            className={`${org.avatar_url ? "hidden" : "flex"} items-center justify-center h-full w-full`}
          >
            <Building2 className="w-6 h-6 text-gray-300" />
          </div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center my-auto">
          <div className="flex justify-between items-start">
            <h2 className="text-md font-semibold truncate pr-[30px]">
              <span className="text-gray-900">
                {org.display_name || org.name || handle}
              </span>
            </h2>
          </div>
          <p className="text-sm text-gray-500 truncate max-w-xs">@{handle}</p>
        </div>
      </div>
    </div>
  )

  if (withLink && handle) {
    return (
      <Link
        key={handle}
        href={`/${handle}`}
        onClick={onClick ? () => onClick(org) : undefined}
      >
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
