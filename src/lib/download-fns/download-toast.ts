import toast from "react-hot-toast"

export const withDownloadToast = async <T>(
  message: string,
  prepareDownload: () => Promise<T>,
): Promise<T> => {
  const toastId = toast.loading(message)
  try {
    return await prepareDownload()
  } finally {
    toast.dismiss(toastId)
  }
}
