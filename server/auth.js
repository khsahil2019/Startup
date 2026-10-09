import jwt from "jsonwebtoken"; import bcrypt from "bcryptjs";
const secret=process.env.JWT_SECRET||"development-only-secret";
export const hash=p=>bcrypt.hashSync(p,12);
export const verifyPassword=(p,h)=>bcrypt.compareSync(p,h);
export const sign=u=>jwt.sign({id:u.id,role:u.role,university_id:u.university_id},secret,{expiresIn:"12h"});
export function requireAuth(req,res,next){
 const h=req.headers.authorization||""; if(!h.startsWith("Bearer ")) return res.status(401).json({error:"Authentication required"});
 try{req.user=jwt.verify(h.substring(7),secret);next()}catch{return res.status(401).json({error:"Session expired"})}
}
export const allow=(...roles)=>(req,res,next)=>roles.includes(req.user?.role)?next():res.status(403).json({error:"Insufficient permission"});
