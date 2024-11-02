import { useEffect } from "react";
export default function useWarnUserForUnsavedChanges({
  hasUnsavedChanges,
}: {
  hasUnsavedChanges: boolean;
}) {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = ""; // Shows the confirmation dialog on reload or close if there are unsaved changes
      }
    };

    // Attach event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
}
