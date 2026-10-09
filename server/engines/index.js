import {valuation} from "./valuation.js"; import {aiResilience,sdgImpact,uniqueness} from "./impact.js"; import {investability} from "./investability.js"; import {projections,businessPlan} from "./business.js";
export function deriveAll(a){
 const v=valuation(a),ai=aiResilience(a),sdg=sdgImpact(a),u=uniqueness(a),inv=investability(a,ai,sdg),p=projections(a);
 return {valuation:v,ai_resilience:ai,sdg_impact:sdg,uniqueness:u,investability:inv,business_potential:p,road_ahead:p,business_plan:businessPlan(a,{v,ai,sdg,inv,u,p})};
}
