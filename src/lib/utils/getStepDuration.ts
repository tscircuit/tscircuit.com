export const getStepDuration = (
  started?: string | null,
  completed?: string | null,
) => {
  if (started && completed) {
    const duration = Math.floor(
      (new Date(completed).getTime() - new Date(started).getTime()) / 1000,
    )
    return `${duration}s`
  }
  return null
}
