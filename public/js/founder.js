const path=location.pathname.split("/"),startupId=path[2],token=path[3];
let questions=[],answers={},idx=0,submissionId=null,submissionStatus="draft";
const $=s=>document.querySelector(s);
const storageKey=`si:${startupId}`;
async function init(){
  try{
    questions=(await fetch("/api/questionnaire").then(r=>r.json())).questions;
    const old=localStorage.getItem(storageKey);if(old)try{answers=JSON.parse(old)}catch{}
    const r=await fetch(`/api/founder/${startupId}/${token}`);if(!r.ok)throw new Error("Invalid or expired invitation");
    const x=await r.json();
    $("#founderStartupName").textContent=`${x.startup.name} — Startup Impact Profile`;
    if(x.submission){submissionId=x.submission.id;submissionStatus=x.submission.status;answers={...answers,...x.submission.answers};if(x.submission.status==="changes_requested"){const n=$("#reviewNotice");n.style.display="block";n.innerHTML=`<strong>Changes requested by University Admin</strong><br>${x.submission.reviewer_note||"Please review your answers and resubmit."}`;}}
    render();
  }catch(e){$("#question").innerHTML=`<div class="panel-card" style="padding:40px"><h2>Founder link unavailable</h2><p>${e.message}</p></div>`;$(".actions").style.display="none";}
}
function render(){const q=questions[idx];if(!q)return;const val=answers[q.id]||"";$("#question").innerHTML=`<div class="panel-card question-card"><div class="question-meta"><span class="badge">${q.section}</span><span>${idx+1} / ${questions.length}</span></div><label>${idx+1}. ${q.text}</label>${q.type==="textarea"?`<textarea id="ans" rows="7" placeholder="Write in simple language...">${val}</textarea>`:`<select id="ans"><option value="">Please select</option>${(q.options||[]).map(o=>`<option value="${escapeHtml(o)}" ${val===o?"selected":""}>${escapeHtml(o)}</option>`).join("")}</select>`}</div>`;$("#bar").style.width=((idx+1)/questions.length*100)+"%";$("#progressLabel").textContent=`Question ${idx+1} of ${questions.length}`;$("#prev").disabled=idx===0;$("#next").style.display=idx===questions.length-1?"none":"inline-block";$("#submit").style.display=idx===questions.length-1?"inline-block":"none";}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));}
async function save(){const q=questions[idx],v=$("#ans").value;answers[q.id]=v;localStorage.setItem(storageKey,JSON.stringify(answers));const r=await fetch(`/api/founder/${startupId}/${token}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({answers})});if(r.ok){const x=await r.json();submissionId=x.submission_id;$("#save").textContent=`Saved • Version ${x.version}`}else $("#save").textContent="Saved locally; server save needs attention";}
$("#next").onclick=async()=>{await save();idx++;render();scrollTo(0,0)};
$("#prev").onclick=async()=>{await save();idx--;render();scrollTo(0,0)};
$("#submit").onclick=async()=>{await save();const r=await fetch(`/api/founder/${startupId}/${token}/submit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({submission_id:submissionId})});const x=await r.json();if(r.ok){$("#question").innerHTML=`<div class="panel-card" style="padding:40px"><h2>Submitted successfully</h2><p>Your profile has been sent to the University for verification. It will not become public until approved.</p></div>`;$(".actions").style.display="none";$("#save").textContent="Submitted for verification";}else{$("#save").textContent=x.missing?`Please complete: ${x.missing.join(", ")}`:(x.error||"Submission could not be completed.");}};
$("#uploadEvidence").onclick=async()=>{const f=$("#evidenceFile").files[0];if(!f){$("#evidenceStatus").textContent="Choose a file first.";return;}const fd=new FormData();fd.append("file",f);fd.append("title",$("#evidenceTitle").value||f.name);fd.append("evidence_type",$("#evidenceType").value);const r=await fetch(`/api/founder/${startupId}/${token}/evidence`,{method:"POST",body:fd});const x=await r.json();$("#evidenceStatus").textContent=r.ok?`Uploaded: ${x.title||f.name} • Pending University verification`:(x.error||"Upload failed");};
init();
