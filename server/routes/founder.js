import express from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";
import {db,audit} from "../db.js";
import {deriveAll} from "../engines/index.js";
import {QUESTIONNAIRE} from "../questionnaire.js";

export const router=express.Router();
const uploadRoot=process.env.UPLOAD_DIR || "./uploads";
fs.mkdirSync(uploadRoot,{recursive:true});
const storage=multer.diskStorage({
  destination:(req,file,cb)=>cb(null,uploadRoot),
  filename:(req,file,cb)=>{
    const ext=path.extname(file.originalname||"").toLowerCase();
    cb(null,`${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
  }
});
const upload=multer({storage,limits:{fileSize:10*1024*1024},fileFilter:(req,file,cb)=>{
  const ok=["application/pdf","image/png","image/jpeg","image/webp"].includes(file.mimetype);
  cb(ok?null:new Error("Only PDF, PNG, JPG and WEBP evidence files are allowed"),ok);
}});

function validInvite(id,raw){
  const h=crypto.createHash("sha256").update(raw||"").digest("hex");
  return db.prepare("SELECT * FROM founder_invites WHERE startup_id=? AND token_hash=? AND active=1 AND (expires_at IS NULL OR expires_at>datetime('now'))").get(id,h);
}
function requiredMissing(answers){
  return QUESTIONNAIRE.filter(q=>!answers[q.id] && q.type!=="textarea").map(q=>q.id);
}

router.get("/:startup/:token",(req,res)=>{
  const i=validInvite(req.params.startup,req.params.token); if(!i)return res.status(401).json({error:"Invalid founder invitation"});
  const s=db.prepare("SELECT id,name,venture_type,stage,logo_url,founder_image_url FROM startups WHERE id=?").get(req.params.startup);
  if(!s)return res.status(404).json({error:"Startup not found"});
  const sub=db.prepare("SELECT * FROM submissions WHERE startup_id=? AND status IN ('draft','changes_requested') ORDER BY version_no DESC LIMIT 1").get(s.id);
  res.json({startup:s,submission:sub?{id:sub.id,version:sub.version_no,status:sub.status,answers:JSON.parse(sub.answers_json||"{}"),reviewer_note:sub.reviewer_note||""}:null,question_count:QUESTIONNAIRE.length});
});

router.put("/:startup/:token",(req,res)=>{
  const i=validInvite(req.params.startup,req.params.token); if(!i)return res.status(401).json({error:"Invalid founder invitation"});
  const answers=req.body.answers||{};
  let sub=db.prepare("SELECT * FROM submissions WHERE startup_id=? AND status='draft' ORDER BY version_no DESC LIMIT 1").get(req.params.startup);
  const changeReq=db.prepare("SELECT * FROM submissions WHERE startup_id=? AND status='changes_requested' ORDER BY version_no DESC LIMIT 1").get(req.params.startup);
  if(changeReq && !sub){
    const x=db.prepare("INSERT INTO submissions(startup_id,version_no,status,answers_json) SELECT startup_id,version_no+1,'draft',answers_json FROM submissions WHERE id=?").run(changeReq.id);
    sub=db.prepare("SELECT * FROM submissions WHERE id=?").get(x.lastInsertRowid);
    db.prepare("UPDATE submissions SET answers_json=?, reviewer_note=NULL, reviewed_at=NULL, reviewed_by=NULL WHERE id=?").run(JSON.stringify(answers),sub.id);
  } else if(!sub){
    const max=db.prepare("SELECT COALESCE(MAX(version_no),0) m FROM submissions WHERE startup_id=?").get(req.params.startup_id || req.params.startup).m;
    const x=db.prepare("INSERT INTO submissions(startup_id,version_no,status,answers_json) VALUES(?,?,?,?)").run(req.params.startup,max+1,"draft",JSON.stringify(answers));
    sub=db.prepare("SELECT * FROM submissions WHERE id=?").get(x.lastInsertRowid);
  } else {
    db.prepare("UPDATE submissions SET answers_json=?, updated_at=CURRENT_TIMESTAMP WHERE id=?").run(JSON.stringify(answers),sub.id);
  }
  db.prepare("UPDATE startups SET current_submission_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(sub.id,req.params.startup);
  res.json({saved:true,submission_id:sub.id,version:sub.version_no});
});

router.post("/:startup/:token/submit",(req,res)=>{
  const i=validInvite(req.params.startup,req.params.token); if(!i)return res.status(401).json({error:"Invalid founder invitation"});
  const sub=db.prepare("SELECT * FROM submissions WHERE id=?").get(req.body.submission_id);
  if(!sub||sub.startup_id!=req.params.startup)return res.status(400).json({error:"Invalid submission"});
  const answers=JSON.parse(sub.answers_json||"{}");
  const missing=requiredMissing(answers);
  if(missing.length)return res.status(422).json({error:"Please complete all required questions",missing});
  const derived=deriveAll(answers);
  db.prepare("UPDATE submissions SET status='submitted',submitted_at=CURRENT_TIMESTAMP,derived_json=? WHERE id=?").run(JSON.stringify(derived),sub.id);
  db.prepare("UPDATE startups SET current_submission_id=?,portfolio_status='under_review',updated_at=CURRENT_TIMESTAMP WHERE id=?").run(sub.id,req.params.startup);
  audit(null,req.params.startup,"founder_submitted",{},derived);
  res.json({submitted:true,submission_id:sub.id,version:sub.version_no});
});

router.post("/:startup/:token/evidence",upload.single("file"),(req,res)=>{
  const i=validInvite(req.params.startup,req.params.token); if(!i)return res.status(401).json({error:"Invalid founder invitation"});
  if(!req.file)return res.status(400).json({error:"Evidence file is required"});
  const sub=db.prepare("SELECT id FROM submissions WHERE startup_id=? AND status IN ('draft','submitted','changes_requested') ORDER BY version_no DESC LIMIT 1").get(req.params.startup);
  if(!sub)return res.status(400).json({error:"No active submission"});
  const relative=`/uploads/${req.file.filename}`;
  const x=db.prepare("INSERT INTO evidence(startup_id,submission_id,evidence_type,title,file_url,verification_status) VALUES(?,?,?,?,?,'pending')").run(req.params.startup,sub.id,req.body.evidence_type||"supporting_document",req.body.title||req.file.originalname,relative);
  audit(null,req.params.startup,"founder_evidence_uploaded",{}, {evidence_id:x.lastInsertRowid,title:req.body.title||req.file.originalname});
  res.json({uploaded:true,id:x.lastInsertRowid,file_url:relative,status:"pending"});
});
