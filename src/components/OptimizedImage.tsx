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

  return (
    <picture>
      <source srcSet={`${src}?format=webp`} type="image/webp" />
      <img
        src={src}
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
