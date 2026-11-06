import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectToDatabase } from "./config/db.js";
import authRouter from "./routes/Authroutes.js";
const app = express();
connectToDatabase();
app.use(cors({origin:"process.env.ORIGIN.split(',')",credentials:true}))
app.use(express.json())
app.use(cookieParser())
app.get("/",(req,res)=>res.send("Server is Live!"))
app.use('/api/auth',authRouter)
app.use((err,_req,res,_next)=>{
    console.error(`[Error]${err.message}`);
    res.status(500).json({error:err.message})
})
const port = process.env.PORT||3000;
app.listen(port,()=>{
    console.log(`server is running on ${port}`)
})