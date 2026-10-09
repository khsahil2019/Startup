import {avg,score} from "./scoring.js";
const stage={Ideation:.55,Prototype:.70,MVP:.90,Pilot:1.05,"Early revenue":1.30,Growth:1.70};
export function valuation(a){
 const founder=avg(a,["Q05","Q06","Q07","Q08","Q09","Q14","Q15","Q16"]);
 const traction=avg(a,["Q28","Q29","Q30","Q31","Q32","Q33","Q34","Q36"]);
 const market=avg(a,["Q37","Q38","Q40","Q41","Q42","Q43","Q44"]);
 const team=avg(a,["Q45","Q46","Q47","Q48","Q49","Q50","Q51"]);
 const scale=avg(a,["Q55","Q56","Q57","Q58","Q59"]);
 const raw=(founder*0.20+traction*0.25+market*0.20+team*0.15+scale*0.20);
 const base=0.18+raw*0.18;
 const v=base*(stage[a.Q17]||.7);
 return {valueCr:+v.toFixed(2),lowCr:+(v*.78).toFixed(2),highCr:+(v*1.22).toFixed(2),
 methodology:"Stage-adjusted multi-factor scorecard using founder execution, traction, market validation, team, scalability and evidence. This is an indicative modelled estimate, not a certified statutory valuation."};
}
