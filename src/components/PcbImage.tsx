import { useState } from "react"

interface PcbImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
}

export function PcbImage({
  src,
  alt,
  className = "",
  fallbackSrc = "/assets/fallback-image.svg",
  ...props
}: PcbImageProps) {
  const [loading, setLoading] = useState(true)
  const [currentSrc, setCurrentSrc] = useState(src)

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`object-contain h-full w-full ${
        loading ? "animate-pulse bg-gray-200" : ""
      } ${className}`}
      onLoad={() => setLoading(false)}
      onError={() => {
        console.error("PCB image failed to load:", src)
        setCurrentSrc(fallbackSrc)
        setLoading(false)
      }}
      {...props}
    />
  )
}
