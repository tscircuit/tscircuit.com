export const PackageCardSkeleton = () => {
  return (
    <div className="border border-gray-200 rounded-lg p-3 animate-pulse min-h-[120px]">
      <div className="flex items-center gap-2">
        <div className="h-16 w-16 flex-shrink-0 rounded-md bg-slate-200"></div>
        <div className="flex-1">
          <div className="h-6 bg-slate-200 rounded w-1/2 mb-1"></div>
          <div className="h-10 bg-slate-200 rounded w-full mb-2"></div>
          <div className="flex items-center gap-3">
            <div className="h-4 bg-slate-200 rounded w-12"></div>
            <div className="h-4 bg-slate-200 rounded w-16"></div>
            <div className="h-4 bg-slate-200 rounded w-20"></div>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-4">
          <div className="h-8 w-8 bg-slate-200 rounded"></div>
          <div className="h-8 w-8 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}
