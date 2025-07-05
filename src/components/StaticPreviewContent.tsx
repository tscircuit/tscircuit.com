import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, EllipsisIcon, PlayIcon, Share } from "lucide-react"
import React from "react"

const SkeletonContent = () => (
  <div className="h-full p-4 space-y-4">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="space-y-2 mt-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
)

export default function StaticPreviewLoading() {
  return (
    <div className="flex flex-col relative h-full">
      <div className="md:sticky md:top-2">
        <Tabs defaultValue="code" className="flex-grow flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs loading-placeholder"
              disabled
              aria-label="Loading placeholder"
            >
              <Share className="mr-1 h-3 w-3" />
              Copy URL
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="px-2 text-xs loading-placeholder"
              disabled
              aria-label="Loading placeholder"
            >
              <Download className="mr-1 h-3 w-3" />
              Download
            </Button>
            <div className="flex-grow" />
            <Button
              disabled
              className="bg-blue-600 hover:bg-blue-500 cursor-not-allowed loading-placeholder"
              aria-label="Loading placeholder"
            >
              Run
              <PlayIcon className="w-3 h-3 ml-2" />
            </Button>
            <TabsList>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="pcb" className="whitespace-nowrap">
                PCB
              </TabsTrigger>
              <TabsTrigger value="schematic" className="whitespace-nowrap">
                Schematic
              </TabsTrigger>
              <TabsTrigger value="cad">3D</TabsTrigger>
              <div className="whitespace-nowrap p-2 mr-1 cursor-pointer relative">
                <EllipsisIcon className="w-4 h-4" />
              </div>
            </TabsList>
          </div>
          <TabsContent value="code" className="flex-grow overflow-hidden">
            <SkeletonContent />
          </TabsContent>
          <TabsContent value="pcb" className="h-[500px]">
            <SkeletonContent />
          </TabsContent>
          <TabsContent value="schematic" className="h-[500px]">
            <SkeletonContent />
          </TabsContent>
          <TabsContent value="cad" className="h-[500px]">
            <SkeletonContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
