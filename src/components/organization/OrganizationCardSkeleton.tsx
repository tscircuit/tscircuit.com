import React from "react"

export const OrganizationCardSkeleton: React.FC = () => {
  return (
    <div className="border p-4 rounded-md animate-pulse">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          {/* Organization Avatar skeleton */}
          <div className="flex-shrink-0">
            <div className="h-16 w-16 rounded-full bg-slate-200 border-2 border-gray-100"></div>
          </div>

          {/* Organization Info skeleton */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <div className="min-w-0 flex-1">
                {/* Organization name */}
                <div className="h-5 bg-slate-200 rounded w-3/4 sm:w-1/2 mb-1"></div>
              </div>

              {/* Actions dropdown skeleton */}
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-slate-200 rounded"></div>
              </div>
            </div>

            {/* Statistics and Metadata skeleton */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs mb-1">
              {/* Visibility */}
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 bg-slate-200 rounded"></div>
                <div className="h-3 bg-slate-200 rounded w-8 sm:w-12"></div>
              </div>

              {/* Members */}
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 bg-slate-200 rounded"></div>
                <div className="h-3 bg-slate-200 rounded w-12 sm:w-16"></div>
              </div>

              {/* Packages */}
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 bg-slate-200 rounded"></div>
                <div className="h-3 bg-slate-200 rounded w-14 sm:w-16"></div>
              </div>
            </div>

            {/* Created time skeleton */}
            <div className="h-3 bg-slate-200 rounded w-20 sm:w-24"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
