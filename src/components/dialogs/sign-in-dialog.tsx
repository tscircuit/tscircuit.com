import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { createUseDialog } from "./create-use-dialog"

export const SignInDialog = ({
  open,
  onOpenChange,
  onSignIn,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSignIn: () => void
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign in required</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-500 mb-4">
            You need to be signed in to perform this action. Sign in with GitHub to continue.
          </p>
          <Button onClick={onSignIn} className="w-full">
            <GitHubLogoIcon className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useSignInDialog = createUseDialog(SignInDialog)