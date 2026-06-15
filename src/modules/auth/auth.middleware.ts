import jwt from "jsonwebtoken";
import { Context } from "hono";
const JWT_SECRET = process.env.JWT_SECRET!;

type AuthContext = Context & {
  userId: string;
  role: string;
};
interface JwtPayload {
  userId: string;
  role: string;
}
export async function authMiddleware(c: Context, next: () => Promise<void>) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.json(
      {
        message: "Authorization header is missing",
        success: false,
      },
      401,
    );
  }
  //send token after Bearer
  if (!authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        message: "Invalid token format",
        success: false,
      },
      401,
    );
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return c.json(
      {
        message: "Invalid token format",
        success: false,
      },
      401,
    );
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (c as AuthContext).userId = decoded.userId;
    (c as AuthContext).role = decoded.role;
    await next();
  } catch (error) {
    return c.json(
      {
        message: "Invalid or expired token",
        success: false,
      },
      401,
    );
  }
}
