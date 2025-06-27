export type ErrorObjectOrString =
  | {
      message: string
    }
  | string

export const getErrorText = (error: ErrorObjectOrString) => {
  if (typeof error === "string") {
    return error
  }
  return error.message
}
