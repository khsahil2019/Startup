import {avg,score} from "./scoring.js";
export function aiResilience(a){
 const displacement=6-score(a.Q60),augmentation=score(a.Q61),data=score(a.Q62),moat=score(a.Q63),adapt=score(a.Q64),dependency=6-score(a.Q65),governance=score(a.Q66);
 const s=(displacement+augmentation+data+moat+adapt+dependency+governance)/7;
 return {score:+Math.min(10,s*2).toFixed(1),profile:s>=4?"AI-augmentable":"AI-exposed",drivers:{displacement,augmentation,data,moat,adapt,dependency,governance}};
}
export function sdgImpact(a){
 const relevance=score(a.Q67),beneficiary=score(a.Q68),outcome=score(a.Q69),reach=score(a.Q70),measurement=score(a.Q71),centrality=score(a.Q72);
 const s=(relevance+beneficiary+outcome+reach+measurement+centrality)/6;
 return {score:+Math.min(10,s*2).toFixed(1),dimensions:{relevance,beneficiary,outcome,reach,measurement,centrality}};
}
export function uniqueness(a){
 const differentiation=score(a.Q42),defensibility=score(a.Q43),validation=score(a.Q44),scale=score(a.Q55),adapt=score(a.Q64);
 return {score:+(((differentiation+defensibility+validation+scale+adapt)/5)*2).toFixed(1),
 explanation:"Derived from customer switching reason, defensibility, validation, scalability and adaptability rather than founder self-rating."};
}
