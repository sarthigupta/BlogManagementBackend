import { Context } from "hono";
import prisma from "../../infrastructure/db/prisma.js";
import type { AuthContext } from "../../types/auth.types.js";
import { blogSchema } from "./blog.schema.js";
import { generateSlug, generateExcerpt } from "../../helper/blog.helper.js";
import type { Prisma } from "../../generated/prisma/client.js";
import redis from "../../common/lib/redis.js";
export async function createBlog(c: Context) {
  try {
    const body = await c.req.json();
    const parsed = blogSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return c.json(
        {
          message: "Validation failed",
          success: false,
          errors,
        },
        400,
      );
    }
    const title = parsed.data.title;
    const content = parsed.data.content;
    const slug = generateSlug(title);
    const excerpt = generateExcerpt(content);
    const userId = (c as AuthContext).userId;
    const blog = await prisma.blog.create({
      data: {
        title: title,
        content: content,
        slug: slug,
        excerpt,
        authorId: userId,
      },
      select: {
        title: true,
        content: true,
        authorId: true,
      },
    });

    return c.json(
      {
        message: "Blog created successfully",
        success: true,
        blog,
      },
      201,
    );
  } catch (error) {
    console.error("Create Blog Error", error);
    return c.json(
      {
        message: "Internal server error",
        success: false,
      },
      500,
    );
  }
}

export async function getAllBlogs(c: Context) {
  try {
    const page = Number(c.req.query("page") || 1);
    const limit = Number(c.req.query("limit") || 10);
    const skip = (page - 1) * limit;

    const search = c.req.query("search");
    const status = c.req.query("status");

    const whereClause: Prisma.BlogWhereInput = {};
    if (search) {
      whereClause.title = {
        contains: search,

        mode: "insensitive",
      };
    }

    if (status) {
      whereClause.status = status;
    }
    const totalBlogs = await prisma.blog.count({
      where: whereClause,
    });

    const blogs = await prisma.blog.findMany({
      where: whereClause,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        createdAt: true,

        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return c.json(
      {
        message: "Blogs retrieved successfully",
        success: true,
        blogs,
        pagination: {
          page,
          limit,
          totalBlogs,
          totalPages: Math.ceil(totalBlogs / limit),
        },
      },
      200,
    );
  } catch (error) {
    console.error("Get Blogs Error", error);
    return c.json(
      {
        message: "Internal server error",
        success: false,
      },
      500,
    );
  }
}

export async function getBlogBySlug(c: Context) {
  try {
    const slug = c.req.param("slug");
    if (!slug) {
      return c.json(
        {
          message: "Slug is required",
          success: false,
        },
        404,
      );
    }
    const cachedBlog = await redis.get(`blog:${slug}`);

    if (cachedBlog) {
      return c.json({
        source: "cache",
        data: cachedBlog,
      });
    }
    const blog = await prisma.blog.findUnique({
      where: {
        slug: slug,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    if (!blog) {
      return c.json(
        {
          message: "Blog not found",
          success: false,
        },
        404,
      );
    }
    await redis.set(`blog:${slug}`, blog, {
      ex: 60 * 60,
    });
    return c.json(
      {
        message: "Blog retrieved successfully",
        success: true,
        blog,
      },
      200,
    );
  } catch (error) {
    console.log("Error in get blog by slug", error);
    return c.json(
      {
        message: "Internal server error",
        success: false,
      },
      500,
    );
  }
}

export async function deleteBlog(c: Context) {
  try {
    const slug = c.req.param("slug")!;
    const blog = await prisma.blog.findUnique({
      where: {
        slug: slug,
      },
      select: {
        authorId: true,
      },
    });

    if (!blog) {
      return c.json(
        {
          message: "Blog not found",
          success: false,
        },
        404,
      );
    }
    const userId = (c as AuthContext).userId;
    if (blog?.authorId !== userId) {
      return c.json(
        {
          message: "Unauthorized",
          success: false,
        },
        403,
      );
    }
    await prisma.blog.delete({
      where: {
        slug: slug,
      },
    });
    return c.json(
      {
        message: "Blog deleted successfully",
        success: true,
      },
      200,
    );
  } catch (error) {
    console.log("Error in deleteblog", error);
    return c.json(
      {
        message: "Internal server error",
        success: false,
      },
      500,
    );
  }
}

export async function updateBlog(c: Context) {
  try {
    const slug = c.req.param("slug")!;
    const body = await c.req.json();
    const parsed = blogSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
      }));
      return c.json(
        {
          message: "Validation failed",
          success: false,
          errors,
        },
        400,
      );
    }
    const blog = await prisma.blog.findUnique({
      where: {
        slug,
      },
      select: {
        authorId: true,
      },
    });
    if (!blog) {
      return c.json(
        {
          message: "Blog not found",
          success: false,
        },
        404,
      );
    }
    if (blog.authorId !== (c as AuthContext).userId) {
      return c.json(
        {
          message: "Unauthorized",
          success: false,
        },
        403,
      );
    }
    const title = parsed.data.title;
    const content = parsed.data.content;
    const excerpt = generateExcerpt(content);
    await prisma.blog.update({
      where: {
        slug,
      },
      data: {
        title,
        content,
        excerpt,
      },
      select: {
        title: true,
        slug: true,
        updatedAt: true,
        excerpt: true,
      },
    });
    await redis.del(`blog:${slug}`);

    return c.json(
      {
        message: "Blog updated successfully",
        success: true,
      },
      200,
    );
  } catch (error) {
    console.log("Error in updateblog", error);
    return c.json(
      {
        message: "Internal server error",
        success: false,
      },
      500,
    );
  }
}
