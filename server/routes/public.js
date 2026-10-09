import express from "express"; import {db} from "../db.js";
export const router=express.Router();
router.get("/university/:slug",(req,res)=>{
 const u=db.prepare("SELECT * FROM universities WHERE slug=?").get(req.params.slug); if(!u)return res.status(404).json({error:"University not found"});
 const inc=db.prepare("SELECT * FROM incubation_centres WHERE university_id=?").all(u.id);
 const starts=db.prepare("SELECT * FROM startups WHERE university_id=? AND public_visibility=1 ORDER BY id").all(u.id);
 const leaders=db.prepare("SELECT * FROM leaders WHERE university_id=? ORDER BY display_order").all(u.id);
 const achievements=db.prepare("SELECT * FROM achievements WHERE university_id=? ORDER BY date DESC").all(u.id);
 const events=db.prepare("SELECT * FROM events WHERE university_id=? ORDER BY event_date DESC").all(u.id);
 res.json({university:u,incubation:inc,leaders,achievements,events,startups:starts.map(s=>{
   const sub=db.prepare("SELECT answers_json, derived_json FROM submissions WHERE id=? AND status='verified'").get(s.published_submission_id);
   return {...s,answers:JSON.parse(sub?.answers_json||"{}"),metrics:JSON.parse(sub?.derived_json||"{}")};
 })});
});
router.get("/startup/:slug",(req,res)=>{
 const s=db.prepare("SELECT * FROM startups WHERE slug=? AND public_visibility=1").get(req.params.slug); if(!s)return res.status(404).json({error:"Startup not found"});
 const sub=db.prepare("SELECT * FROM submissions WHERE id=? AND status='verified'").get(s.published_submission_id); if(!sub)return res.status(404).json({error:"Profile not published"});
 const university=db.prepare("SELECT id,name,slug,logo_url,website_url,hero_image_url,about,vision,mission FROM universities WHERE id=?").get(s.university_id);
 res.json({startup:s,university,answers:JSON.parse(sub.answers_json||"{}"),metrics:JSON.parse(sub.derived_json||"{}"),founders:db.prepare("SELECT * FROM founders WHERE startup_id=? ORDER BY display_order").all(s.id),team:db.prepare("SELECT * FROM team_members WHERE startup_id=?").all(s.id),media:db.prepare("SELECT * FROM media WHERE startup_id=?").all(s.id),evidence:db.prepare("SELECT id,evidence_type,title,verification_status FROM evidence WHERE submission_id=?").all(sub.id)});
});
