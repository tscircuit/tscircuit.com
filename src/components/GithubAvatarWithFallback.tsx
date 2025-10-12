import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const GithubAvatarWithFallback = ({
  username,
  fallback,
  className,
  fallbackClassName,
  size,
}: {
  username?: string | null
  fallback?: string | null
  className?: string
  fallbackClassName?: string
  size?: number
}) => {
  return (
    <Avatar className={`border-4 border-gray-100 ${className}`}>
      {username && (
        <AvatarImage
          src={`https://github.com/${username}.png${
            size ? `?size=${size}` : ""
          }`}
          alt={`${username || fallback} avatar`}
          className="object-cover"
        />
      )}
      <AvatarFallback
        className={`bg-blue-100 text-blue-600 ${fallbackClassName}`}
      >
        {(username || fallback || "")
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)}
      </AvatarFallback>
    </Avatar>
  )
}
