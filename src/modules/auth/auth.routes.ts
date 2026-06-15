import {Hono} from "hono";
import {signup, login, me} from "./auth.controller.js";
import {authMiddleware} from "./auth.middleware.js";


const authRouter = new Hono();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/me", authMiddleware, me);

export default authRouter;