// import { Context } from "hono";
// import type { ContentfulStatusCode } from "hono/utils/http-status";

// type ApiResponse<T = unknown> = {
//   success: boolean;
//   message: string;
//   data?: T;
//   requestId?: string;
// };

// export const sendResponse = <T>(
//   c: Context,
//   statusCode: ContentfulStatusCode,
//   message: string,
//   data?: T,
//   requestId?: string
// ) => {
//   const response: ApiResponse<T> = {
//     success: statusCode < 400,
//     message,
//     ...(data !== undefined && { data }),
//     ...(requestId && { requestId }),
//   };

//   return c.json(response, statusCode);
// };