import { Router } from "express";
import { createProject, deleteProject, getProject, getpublicProject, listProject, publishProject, updateProjectFiles } from "../controllers/ProjectController.js";
import { authmiddleware } from "../middleware/Authmiddleware.js";
import { chat } from "../controllers/Chatcontroller.js";
 
const projectRouter = Router();
projectRouter.get("public/:id", getpublicProject)
projectRouter.use(authmiddleware)
projectRouter.post("/",createProject)
projectRouter.get("/",listProject)
projectRouter.get("/:id",getProject)
projectRouter.delete("/:id", deleteProject)
projectRouter.put("/:id/files",updateProjectFiles)
projectRouter.post("/:id/publish",publishProject)
projectRouter.post("/:id/chat",chat)

export default projectRouter;
