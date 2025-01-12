import { useState, useEffect } from "react"

/**
 * OptimizedImage component for responsive images with automatic srcset generation
 *
 * This component automatically generates srcset attributes for responsive images.
 * You must provide images with all the required widths (400w, 600w, 800w, 1000w, 1200w, 1600w, 2000w)
 * in the same folder as the source image.
 *
 * Example usage:
 * <OptimizedImage
 *   src="/src/assets/example/example-1200w.webp"
 *   alt="Example"
 * />
 *
 * Required file structure:
 * /src/assets/example/
 *   example-400w.webp
 *   example-600w.webp
 *   example-800w.webp
 *   example-1000w.webp
 *   example-1200w.webp
 *   example-1600w.webp
 *   example-2000w.webp
 */
interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  priority?: boolean
}

const getImageSizes = (src: string) => {
  if (src.endsWith(".svg")) return { srcSet: src, sizes: "100vw" }

  const widths = [400, 600, 800, 1000, 1200, 1600, 2000]
  const srcSet = widths
    .map((w) => src.replace("1200w", `${w}w`))
    .map((path) => `${path} ${path.match(/\d+w/)?.[0] ?? ""}`)
    .join(", ")

  const sizes =
    "(max-width: 400px) 400px, (max-width: 600px) 600px, (max-width: 800px) 800px, (max-width: 1000px) 1000px, (max-width: 1200px) 1200px, (max-width: 1600px) 1600px, 2000px"

  return { srcSet, sizes }
}

export function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const { srcSet, sizes } = getImageSizes(src)

  useEffect(() => {
    if (priority) {
      const link = document.createElement("link")
      link.rel = "preload"
      link.as = "image"
      link.href = src
      link.type = src.endsWith(".svg") ? "image/svg+xml" : "image/webp"
      link.imageSrcset = srcSet
      link.imageSizes = sizes
      document.head.appendChild(link)

      return () => {
        document.head.removeChild(link)
      }
    }
  }, [src, priority, srcSet, sizes])

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
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
  )
}
