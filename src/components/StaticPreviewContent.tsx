import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Share, PlayIcon, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
);

export default function StaticPreviewLoading() {
  return (
    <div className="flex flex-col relative h-full">
      <div className="md:sticky md:top-2">
        <Tabs defaultValue="code" className="flex-grow flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
              <Share className="mr-1 h-3 w-3" />
              Copy URL
            </Button>
            <Button disabled variant="ghost" size="sm" className="px-2 text-xs">
        <Download className="mr-1 h-3 w-3" />
        Download
      </Button>
            <div className="flex-grow" />
            <Button
              disabled
              className="bg-blue-600 hover:bg-blue-500 cursor-not-allowed"
            >
                Run 
              <PlayIcon className="w-3 h-3 ml-2" />
            </Button>
            <TabsList>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="pcb" className="whitespace-nowrap">PCB</TabsTrigger>
              <TabsTrigger value="schematic" className="whitespace-nowrap">Schematic</TabsTrigger>
              <TabsTrigger value="cad">3D</TabsTrigger>
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
  );
}
