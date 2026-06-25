import {Hono} from 'hono'
import {createBlog,getAllBlogs,updateBlog,deleteBlog,getBlogBySlug} from "./blog.controller.js";
import {authMiddleware} from "../auth/auth.middleware.js"; 

const blogRouter = new Hono();

blogRouter.post("/", authMiddleware, createBlog);
blogRouter.get("/", authMiddleware, getAllBlogs);
blogRouter.put("/:slug", authMiddleware, updateBlog);
blogRouter.delete("/:slug", authMiddleware, deleteBlog);
blogRouter.get("/slug/:slug", authMiddleware, getBlogBySlug);
export default blogRouter;