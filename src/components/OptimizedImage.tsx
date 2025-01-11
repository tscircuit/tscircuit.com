import { useState } from "react"

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  ...props
}: OptimizedImageProps) {
  const [imageLoading, setImageLoading] = useState(true)

  const generateSrcSet = (format: string) => {
    const sizes = [320, 640, 960, 1280, 1920]
    return sizes
      .map((size) => `${src}?format=${format}&w=${size} ${size}w`)
      .join(", ")
  }

  const getSizes = () => {
    if (width) {
      // If width is specified, use it as a max-width
      return `(max-width: ${width}px) 100vw, ${width}px`
    }
    // Default responsive sizes
    return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
        src={`${src}?format=webp&w=${width || 1280}`}
        alt={alt}
        width={width}
        height={height}
        loading={props.priority ? "eager" : "lazy"}
        decoding="async"
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
