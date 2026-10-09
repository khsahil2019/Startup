import express from "express"; import {db} from "../db.js"; import {verifyPassword,sign} from "../auth.js";
export const router=express.Router();
router.post("/login",(req,res)=>{const u=db.prepare("SELECT * FROM users WHERE email=? AND active=1").get(req.body.email);if(!u||!verifyPassword(req.body.password,u.password_hash))return res.status(401).json({error:"Invalid credentials"});res.json({token:sign(u),user:{id:u.id,name:u.name,role:u.role,university_id:u.university_id}})});
