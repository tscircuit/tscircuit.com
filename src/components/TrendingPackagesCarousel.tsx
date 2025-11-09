import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { StarFilledIcon } from "@radix-ui/react-icons"
import { Link } from "wouter"
import { Package } from "fake-snippets-api/lib/db/schema"
import { useRef } from "react"
import { CircuitBoard } from "lucide-react"
const CarouselItem = ({ pkg }: { pkg: Package }) => {
  const previewImageUrl =
    pkg.latest_cad_preview_image_url ??
    pkg.latest_pcb_preview_image_url ??
    pkg.latest_sch_preview_image_url ??
    undefined

  return (
    <Link href={`/${pkg.name}`}>
      <div className="flex-shrink-0 w-[200px] bg-white p-3 py-2 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="font-medium text-blue-600 mb-1 truncate text-sm">
          {pkg.name}
        </div>
        <div className="mb-0.5 md:mb-2 h-[5rem] md:h-[7rem] w-full rounded-md overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center relative">
          {previewImageUrl ? (
            <img
              src={previewImageUrl}
              alt="PCB preview"
              draggable={false}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none"
                e.currentTarget.nextElementSibling?.classList.remove("hidden")
                e.currentTarget.nextElementSibling?.classList.add("flex")
              }}
            />
          ) : null}
          <div
            className={`w-full h-full ${previewImageUrl ? "hidden" : "flex"} items-center justify-center`}
          >
            <CircuitBoard className="w-10 h-10 text-gray-300" />
          </div>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <StarFilledIcon className="w-3 h-3 mr-1" />
          {pkg.star_count || 0} stars
        </div>
      </div>
    </Link>
  )
}

export const TrendingPackagesCarousel = () => {
  const axios = useAxios()
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: trendingPackages } = useQuery<Package[]>(
    "trendingPackages",
    async () => {
      const response = await axios.get("/packages/list_trending")
      return response.data.packages
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  )

  return (
    <div className="w-full bg-gray-50 py-8 min-h-[280px]">
      {trendingPackages?.length ? (
        <>
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-6">Trending Packages</h2>
          </div>
          <div className="flex gap-6 overflow-x-hidden relative">
            <div
              ref={scrollRef}
              className="flex gap-6 transition-transform duration-1000 animate-carousel-left"
            >
              {[...(trendingPackages ?? []), ...(trendingPackages ?? [])].map(
                (pkg, i) => (
                  <CarouselItem key={`${pkg.package_id}-${i}`} pkg={pkg} />
                ),
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
