import React from "react"
import { Link } from "wouter"
import { Account } from "fake-snippets-api/lib/db/schema"
import { User } from "lucide-react"

export interface UserCardProps {
  /** The account data to display */
  account: Account | Omit<Account, "account_id">
  /** Whether to render the card with a link to the user profile page */
  withLink?: boolean
  /** Custom class name for the card container */
  className?: string
  /** Custom onClick handler */
  onClick?: (account: Account | Omit<Account, "account_id">) => void
}

export const UserCard: React.FC<UserCardProps> = ({
  account,
  withLink = true,
  className = "",
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(account)
    } else if (!withLink) {
      window.location.href = `/${account.github_username}`
    }
  }

  const cardContent = (
    <div
      className={`border p-4 rounded-md hover:shadow-md transition-shadow flex flex-col gap-4 cursor-pointer ${className}`}
      onClick={!withLink ? handleClick : undefined}
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-50 border flex items-center justify-center">
          <img
            src={`https://github.com/${account.github_username}.png`}
            alt={`${account.github_username} avatar`}
            className="object-cover h-full w-full transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = "none"
              target.nextElementSibling?.classList.remove("hidden")
              target.nextElementSibling?.classList.add("flex")
            }}
          />
          <div className="hidden items-center justify-center h-full w-full">
            <User className="w-6 h-6 text-gray-300" />
          </div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center my-auto">
          <div className="flex justify-between items-start">
            <h2 className="text-md font-semibold truncate pr-[30px]">
              <span className="text-gray-900">{account.github_username}</span>
            </h2>
          </div>
          <p className="text-sm text-gray-500 truncate max-w-xs">
            @{account.github_username}
          </p>
        </div>
      </div>
    </div>
  )

  if (withLink) {
    return (
      <Link
        key={account.github_username}
        href={`/${account.github_username}`}
        onClick={onClick ? () => onClick(account) : undefined}
      >
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
