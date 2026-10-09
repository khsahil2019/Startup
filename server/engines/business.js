const rev={"₹0":0,"Below ₹1 lakh":0.5,"₹1–5 lakh":3,"₹5–25 lakh":15,"₹25 lakh–₹1 crore":60,"₹1–5 crore":300,"Above ₹5 crore":600};
const growth={"Uncertain":1.10,"Gradual growth":1.30,"Strong growth":1.65,"Rapid scale":2.10,"Not estimated":1.20};
export function projections(a){
 const base=rev[a.Q31]??0; const g=growth[a.Q58]??1.2;
 return {year1:+base.toFixed(1),year2:+(base*g).toFixed(1),year3:+(base*g*g).toFixed(1),year5:+(base*g**4).toFixed(1),
 assumptions:["Current revenue band supplied by founder","Growth direction supplied by founder","Projection is scenario-based, not a guarantee","Verifier evidence should be attached to current revenue/traction"]};
}
export function businessPlan(a,m){return [
["Executive Summary","Startup, founder, stage, problem, traction and opportunity."],
["Founder & Context","Founder journey, capabilities and support context."],
["Problem & Customer","Problem, affected customer and evidence."],
["Solution","Product form and customer value."],
["Unique Value Proposition","Differentiation and defensibility."],
["Market Opportunity","Geography, customer and reachable market."],
["Competition","Alternatives and switching reason."],
["Business Model","Revenue model and unit economics inputs."],
["Product & Technology","Product stage, technology and AI exposure."],
["Traction, Clients & Revenue","Customers, revenue and evidence."],
["Go-to-Market","Acquisition and scaling channel."],
["Partnerships","University, industry and ecosystem route."],
["Operations","Production/delivery and capacity considerations."],
["Team & Hiring","Current capabilities and missing capability."],
["Financial Assumptions","Revenue, margin, cost and growth assumptions."],
["Funding & Use of Funds","Funding requirement and intended use."],
["1–5 Year Road Ahead","Milestones and modelled scenario projections."],
["SDG Contribution","Impact area, beneficiaries and evidence."],
["AI Resilience","AI exposure, opportunity, moat and adaptability."],
["Risks & Mitigation","Primary risk and incubation support priorities."]
].map(([title,summary],i)=>({no:i+1,title,summary}));}
