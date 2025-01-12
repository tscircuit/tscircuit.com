import { useState } from "react"

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  sizes?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes: customSizes,
  ...props
}: OptimizedImageProps) {
  const [imageLoading, setImageLoading] = useState(true)

  // Calculate optimal widths based on the target width
  const getOptimalWidths = () => {
    if (!width) return [320, 640, 960, 1280]
    const baseWidth = Math.min(width, 1920)
    return [
      Math.round(baseWidth / 2),
      baseWidth,
      Math.min(baseWidth * 1.5, 1920),
    ].filter((w, i, arr) => arr.indexOf(w) === i)
  }

  const generateSrcSet = (format: string) => {
    return getOptimalWidths()
      .map((size) => `${src}?format=${format}&w=${size}&q=75 ${size}w`)
      .join(", ")
  }

  const getSizes = () => {
    if (customSizes) return customSizes
    if (width) return `(max-width: ${width}px) 100vw, ${width}px`
    return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  }

  // Preload the highest priority images
  if (priority) {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "image"
    link.href = `${src}?format=avif&w=${width || 1280}&q=75`
    link.type = "image/avif"
    document.head.appendChild(link)
  }

  return (
    <picture>
      <source
        type="image/avif"
        srcSet={generateSrcSet("avif")}
        sizes={getSizes()}
      />
      <source
        type="image/webp"
        srcSet={generateSrcSet("webp")}
        sizes={getSizes()}
      />
      <img
        src={`${src}?format=webp&w=${width || 1280}&q=75`}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        className={`${className} ${imageLoading ? "animate-pulse bg-gray-200" : ""}`}
        onLoad={() => setImageLoading(false)}
        onError={(e) => {
          console.error("Image failed to load:", e)
          setImageLoading(false)
        }}
        {...props}
      />
    </picture>
  )
}
