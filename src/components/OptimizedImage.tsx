import { useState, useEffect } from "react"

/**
 * OptimizedImage component for responsive images with automatic srcset generation
 *
 * This component automatically generates srcset attributes for responsive images.
 * Place your original high-resolution images in src/assets/originals/.
 * The build process will automatically generate all required sizes.
 *
 * Example usage:
 * <OptimizedImage
 *   src="/assets/example.jpg"
 *   alt="Example"
 * />
 *
 * The build process will generate:
 * /assets/
 *   example-400w.jpg
 *   example-600w.jpg
 *   example-800w.jpg
 *   example-1000w.jpg
 *   example-1200w.jpg
 *   example-1600w.jpg
 *   example-2000w.jpg
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
  const basePath = src.substring(0, src.lastIndexOf("."))
  const extension = src.substring(src.lastIndexOf("."))
  const srcSet = widths
    .map((w) => `${basePath}-${w}w${extension} ${w}w`)
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
