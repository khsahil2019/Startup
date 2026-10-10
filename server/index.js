import "dotenv/config"; import express from "express"; import helmet from "helmet"; import cors from "cors"; import path from "path"; import fs from "fs"; import {fileURLToPath} from "url"; import "./db.js"; import {router as auth} from "./routes/auth.js"; import {router as admin} from "./routes/admin.js"; import {router as founder} from "./routes/founder.js"; import {router as pub} from "./routes/public.js"; import {router as questionnaire} from "./routes/questionnaire.js";
const app=express(),root=path.dirname(fileURLToPath(import.meta.url)); app.use(helmet({contentSecurityPolicy:false}));app.use(cors());app.use(express.json({limit:"5mb"}));app.use(express.urlencoded({extended:true}));
app.use("/api/auth",auth);app.use("/api/admin",admin);app.use("/api/founder",founder);app.use("/api/public",pub);app.use("/api/questionnaire",questionnaire);
app.use(express.static(path.join(root,"../public")));
const uploadDir = process.env.UPLOAD_DIR || (process.env.VERCEL ? "/tmp/uploads" : "./uploads");
try { fs.mkdirSync(path.resolve(uploadDir), { recursive: true }); } catch (_) {}
app.use("/uploads", express.static(path.resolve(uploadDir), {index:false}));
app.get("/",(q,s)=>s.redirect("/u/demo"));
app.get("/founder/:startup/:token",(q,s)=>s.sendFile(path.join(root,"../public/founder.html")));
app.get("/u/:slug",(q,s)=>s.sendFile(path.join(root,"../public/university.html")));
app.get("/startup/:slug",(q,s)=>s.sendFile(path.join(root,"../public/startup.html")));
app.get("/admin",(q,s)=>s.sendFile(path.join(root,"../public/admin.html")));
app.get("/health",(q,s)=>s.json({ok:true,service:"startup-impact"}));
if (!process.env.VERCEL) {
  app.listen(process.env.PORT||8080,()=>console.log("Startup Impact server ready"));
}
export default app;

