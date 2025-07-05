import kleur from "kleur"
import { Middleware } from "winterspec/middleware"

export const withErrorHandling: Middleware<{}, {}> = async (req, ctx, next) => {
  try {
    return await next(req, ctx)
  } catch (error: any) {
    console.error(kleur.red("Intercepted error:"), error)
    // If error is a Response, return it
    if (error instanceof Response) {
      return error
    }
    return (ctx as any).json(
      {
        ok: false,
        error: {
          message: error?.message,
          error_code: error?.error_code ?? "internal_server_error",
        },
      },
      { status: error?.status || 500 },
    )
  }
}
