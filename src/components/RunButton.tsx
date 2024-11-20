import { Loader2Icon, PlayIcon } from "lucide-react"
import { Button } from "./ui/button"

export const RunButton = ({
  onClick,
  disabled,
  isRunningCode,
}: {
  onClick: () => void
  disabled: boolean
  isRunningCode?: boolean
}) => {
  return (
    <Button
      className="bg-blue-600 hover:bg-blue-500 run-button"
      onClick={onClick}
      disabled={disabled || isRunningCode}
    >
      Run
      {isRunningCode ? (
        <Loader2Icon className="w-3 h-3 ml-2 animate-spin" />
      ) : (
        <PlayIcon className="w-3 h-3 ml-2" />
      )}
    </Button>
  )
}
