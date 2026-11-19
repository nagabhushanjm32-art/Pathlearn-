import { Request, Response, NextFunction } from "express"
import { ZodSchema, ZodError } from "zod"

export function validate(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync(req.body)
      req.body = validatedData
      next()
    } catch (error: any) {
      if (error instanceof ZodError || error?.issues) {
        const issues = (error.issues || (error as any).errors || []) as any[]
        const fieldErrors: Record<string, string[]> = {}

        issues.forEach((err: any) => {
          const field = Array.isArray(err.path) ? err.path.join(".") : "form"
          if (!fieldErrors[field]) {
            fieldErrors[field] = []
          }
          fieldErrors[field].push(err.message || "Invalid value")
        })

        const firstErrorMessage = issues[0]?.message || "Invalid request data"

        return res.status(400).json({
          status: "error",
          message: firstErrorMessage,
          errors: fieldErrors,
        })
      }

      return res.status(400).json({
        status: "error",
        message: "Invalid input provided",
      })
    }
  }
}
