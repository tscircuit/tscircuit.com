export const SnippetCardSkeleton = () => {
  return (
    <div className="border p-4 rounded-md animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 flex-shrink-0 rounded-md bg-slate-200"></div>
        <div className="flex-1">
          <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
          <div className="flex gap-2">
            <div className="h-3 bg-slate-200 rounded w-16"></div>
            <div className="h-3 bg-slate-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
