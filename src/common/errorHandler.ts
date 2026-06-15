// import { Context } from 'hono'
// import { ZodError } from 'zod'
// import { AppError } from './errors/errors.js'
// import { sendResponse } from './response.js'

// export function onErrorHandler(err: unknown, c: Context) {
//   const requestId = c.get('requestId')

//   if (err instanceof AppError) {
//     return sendResponse(c, err.statusCode, err.message, undefined, requestId)
//   }

//   if (err instanceof ZodError) {
//     const details = err.issues.map((e) => ({ path: e.path, message: e.message }))
//     return sendResponse(c, 422, 'Validation error', { details }, requestId)
//   }

//   console.error(
//     JSON.stringify({
//       timestamp: new Date().toISOString(),
//       level: 'error',
//       message: 'Unhandled error',
//       requestId,
//       error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
//     }),
//   )

//   return sendResponse(c, 500, 'Internal server error', undefined, requestId)
// }
