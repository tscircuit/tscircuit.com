export function BuildPreviewContent() {
  return (
    <div className="flex items-center justify-center">
      <img
        src="/placeholder.svg?height=300&width=500"
        alt="Deployment preview"
        className="object-contain rounded p-2 max-h-[400px]"
      />
    </div>
  )
}
