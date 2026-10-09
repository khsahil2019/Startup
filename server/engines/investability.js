import {avg} from "./scoring.js"; import {score} from "./scoring.js";
export function investability(a,ai,sdg){
 const founder=avg(a,["Q05","Q06","Q07","Q08","Q09","Q15","Q16"]);
 const traction=avg(a,["Q28","Q30","Q31","Q32","Q33","Q34","Q36"]);
 const market=avg(a,["Q37","Q38","Q40","Q42","Q44"]);
 const team=avg(a,["Q45","Q46","Q47","Q48","Q49","Q50","Q51"]);
 const economics=avg(a,["Q52","Q53","Q55","Q56","Q57","Q58","Q59"]);
 const evidence=avg(a,["Q33","Q36","Q44","Q51","Q71"]);
 const value=(founder*1.5+traction*1.5+market+team+economics+evidence+ai.score*.5+sdg.score*.25)/7.25;
 return {score:+Math.min(10,value*2).toFixed(1),dimensions:{founder:+(founder*2).toFixed(1),traction:+(traction*2).toFixed(1),market:+(market*2).toFixed(1),team:+(team*2).toFixed(1),economics:+(economics*2).toFixed(1),evidence:+(evidence*2).toFixed(1)},note:"Investment-readiness indicator. It is not investment advice and does not predict returns."};
}
