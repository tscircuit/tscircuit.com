type UploadErrorResponse = {
  status?: number
  data?: {
    error?: { message?: unknown }
    message?: unknown
  }
}

type UploadError = UploadErrorResponse & {
  response?: UploadErrorResponse
  message?: unknown
  code?: string
}

export const getAvatarUploadErrorMessage = (error: unknown): string => {
  const uploadError = error as UploadError | null | undefined

  // Redaxios rejects with the response itself; Axios wraps it in `response`.
  const messages = [
    uploadError?.data?.error?.message,
    uploadError?.data?.message,
    uploadError?.response?.data?.error?.message,
    uploadError?.response?.data?.message,
  ]
  for (const message of messages) {
    if (typeof message === "string" && message.trim()) {
      return message.trim()
    }
  }

  const status = uploadError?.response?.status ?? uploadError?.status
  switch (status) {
    case 401:
      return "Please sign in again before uploading your avatar."
    case 403:
      return "You don't have permission to update this avatar."
    case 413:
      return "The image is too large to upload. Choose a smaller image (up to 5MB)."
    case 415:
      return "This image format isn't supported. Try a PNG, JPG, or GIF image."
    case 429:
      return "Too many upload attempts. Please wait a moment and try again."
  }

  if (status && status >= 500) {
    return "The server couldn't save your avatar. Please try again later."
  }

  const message =
    typeof uploadError?.message === "string" ? uploadError.message.trim() : ""
  if (
    status === 0 ||
    uploadError?.code === "ERR_NETWORK" ||
    /^(failed to fetch|fetch failed|network ?error|networkerror when attempting to fetch resource\.?|load failed)$/i.test(
      message,
    )
  ) {
    return "Unable to reach the upload server. Check your internet connection and try again."
  }

  return (
    message ||
    "We couldn't upload your avatar. Please try again. If it still fails, contact support."
  )
}
