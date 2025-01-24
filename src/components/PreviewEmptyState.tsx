import { Button } from "@/components/ui/button"
import { PlayIcon } from "lucide-react"

const PreviewEmptyState = ({
  triggerRunTsx,
}: { triggerRunTsx: () => void }) => (
  <div className="flex items-center justify-center gap-3 py-10 text-center bg-gray-100 dark:bg-gray-700 dark:text-gray-100">
    No circuit json loaded
    <Button className="bg-blue-600 hover:bg-blue-500" onClick={triggerRunTsx}>
      Run Code
      <PlayIcon className="w-3 h-3 ml-2" />
    </Button>
  </div>
)

export default PreviewEmptyState
