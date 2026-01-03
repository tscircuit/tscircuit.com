import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"

export const GithubAvatarWithFallback = ({
  username,
  fallback,
  className,
  fallbackClassName,
  size,
  colorClassName,
  imageUrl,
}: {
  username?: string | null
  fallback?: string | null
  className?: string
  fallbackClassName?: string
  size?: number
  colorClassName?: string
  imageUrl?: string | null
}) => {
  const hasUsernameOrFallback = username || fallback

  return (
    <Avatar className={className}>
      <AvatarImage
        src={imageUrl ?? undefined}
        alt={`${username || fallback} avatar`}
        className="object-cover"
      />
      <AvatarFallback
        className={`${colorClassName || "bg-blue-100 text-blue-600"} ${fallbackClassName}`}
      >
        {hasUsernameOrFallback ? (
          (username || fallback || "")
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        ) : (
          <User className="w-1/2 h-1/2" />
        )}
      </AvatarFallback>
    </Avatar>
  )
}
