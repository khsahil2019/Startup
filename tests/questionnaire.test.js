import test from "node:test";import assert from "node:assert/strict";import {QUESTIONNAIRE} from "../server/questionnaire.js";import {deriveAll} from "../server/engines/index.js";
test("exactly 75 core questions",()=>assert.equal(QUESTIONNAIRE.length,75));
test("questions are structured",()=>QUESTIONNAIRE.forEach(q=>{assert.ok(q.id);assert.ok(q.section);assert.ok(q.text);assert.ok(Array.isArray(q.options))}));
test("engine produces all promised public metrics",()=>{const a=Object.fromEntries(QUESTIONNAIRE.map(q=>[q.id,q.options[0]||"Sample answer"]));const m=deriveAll(a);for(const k of ["valuation","ai_resilience","sdg_impact","uniqueness","investability","business_potential","road_ahead","business_plan"])assert.ok(m[k]);assert.equal(m.business_plan.length,20)});
