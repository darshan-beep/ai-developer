import { Router } from "express";
import { login, logout, me, register } from "../controllers/AuthController.js";
import { authmiddleware } from "../middleware/Authmiddleware.js";
const authRouter = Router()
authRouter.post('/register',register)
authRouter.post('/login',login)
authRouter.post('/logout',logout)
authRouter.get('/me',authmiddleware,me)
export default authRouter;
