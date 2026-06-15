import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { Context } from "hono";
import prisma from "../../infrastructure/db/prisma.js";
import { signupSchema, loginSchema } from "./auth.schema.js";

const JWT_SECRET = process.env.JWT_SECRET!;
type AuthContext = Context & {
  userId: string;
  role: string;
};

export async function signup(c: Context) {
  try {
    const body = await c.req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        {
          message: "Invalid input data",
          success: false,
          errors: parsed.error.flatten().fieldErrors,
        },
        400,
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const password = parsed.data.password;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return c.json(
        {
          message: "User already exists",
          success: false,
        },
        409,
      );
    }
    const hashedPassword = await argon2.hash(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
      },
    });
    return c.json(
      {
        message: "User created successfully",
        success: true,
        user,
      },
      201,
    );
  } catch (error) {
    console.error("Signup Error", error);
    return c.json(
      {
        message: "Internal server error",
        success: false,
      },
      500,
    );
  }
}

export async function login(c: Context) {
  try {
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        {
          message: "Invalid input data",
          success: false,
          errors: parsed.error.flatten().fieldErrors,
        },
        400,
      );
    }
    const email = parsed.data.email.toLowerCase().trim();
    const password = parsed.data.password;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return c.json(
        {
          message: "User not found",
          success: false,
        },
        404,
      );
    }
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      return c.json(
        {
          message: "Invalid credentials, please try again",
          success: false,
        },
        401,
      );
    }

    //token wala thing

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return c.json(
      {
        message: "Login successful",
        success: true,
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role
        }
      },
      200,
    );
  } catch (error) {
    console.error("Login Error", error);
    return c.json(
      {
        message: "Internal server error",
        success: false,
      },
      500,
    );
  }
}


export async function me(
    c: Context
) {
    const userId =
        (c as AuthContext)
            .userId;

    const user =
        await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

    if (!user) {
        return c.json({
            success: false,
            message: "User not found"
        }, 404);
    }

    return c.json({
        success: true,
        user
    }, 200);
}