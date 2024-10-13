import { PlayIcon } from "lucide-react"
import { Button } from "./ui/button"

export const RunButton = ({
  onClick,
  disabled,
}: {
  onClick: () => void
  disabled: boolean
}) => {
  return (
    <Button
      className="bg-blue-600 hover:bg-blue-500"
      onClick={onClick}
      disabled={disabled}
    >
      Run
      <PlayIcon className="w-3 h-3 ml-2" />
    </Button>
  )
}
