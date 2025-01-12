import { useState, useEffect } from "react"

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [imageLoading, setImageLoading] = useState(true)

  const getOptimalWidths = () => {
    return [320, 640, 960, 1280, 1920]
  }

  const generateSrcSet = (format: string) => {
    return getOptimalWidths()
      .map((size) => `${src}?format=${format}&w=${size}&q=75 ${size}w`)
      .join(", ")
  }

  const getSizes = () => {
    return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  }

  useEffect(() => {
    if (priority) {
      const link = document.createElement("link")
      link.rel = "preload"
      link.as = "image"
      link.href = `${src}?format=avif&w=1280&q=75`
      link.type = "image/avif"
      document.head.appendChild(link)

      return () => {
        document.head.removeChild(link)
      }
    }
  }, [src, priority])

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
        src={`${src}?format=webp&w=640&q=75`}
        srcSet={generateSrcSet("webp")}
        sizes={getSizes()}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        className={`${className} ${
          imageLoading ? "animate-pulse bg-gray-200" : ""
        } w-full h-auto object-contain`}
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
