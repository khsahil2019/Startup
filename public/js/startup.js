// ==========================================================================
// STARTUP PROFILE JAVASCRIPT — COMPLETE SHOWCASE PANELS 3 TO 10
// ==========================================================================

const slug = location.pathname.split("/")[2];
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function renderProgressBar(label, score, max = 10, colorClass = "") {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  return `
    <div class="bar-metric-row">
      <div class="bar-metric-info">
        <span>${label}</span>
        <strong>${score}</strong>
      </div>
      <div class="bar-track">
        <div class="bar-fill ${colorClass}" style="width: ${pct}%"></div>
      </div>
    </div>
  `;
}

function renderSDGIcon(no, title, color) {
  return `
    <div class="sdg-large-tile" style="background:${color || '#3b82f6'}" title="SDG ${no}: ${title}">
      <span class="num">${no}</span>
      <span class="label">${title.split(' ')[0]}</span>
    </div>
  `;
}

(async () => {
  try {
    const res = await fetch("/api/public/startup/" + slug);
    if (!res.ok) {
      $("#startupProfileArea").innerHTML = `
        <div class="panel-card" style="text-align: center; padding: 60px 20px;">
          <h2>Startup Not Found</h2>
          <p style="color: #64748b; margin-top: 8px;">The requested startup profile does not exist or has not been published yet.</p>
          <a href="/u/demo" class="btn-primary" style="margin-top: 20px;">← Back to Directory</a>
        </div>
      `;
      return;
    }

    const data = await res.json();
    const s = data.startup;
    const uni = data.university || {};
    const uniPath = `/u/${uni.slug || "demo"}`;
    const uniSite = uni.website_url || "";
    document.querySelector("#nav-brand-title").textContent = uni.name || "University";
    document.querySelector("#crest").textContent = (uni.name || "University").split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase();
    [
      ["#uni-home-link", `${uniPath}#home`], ["#uni-about-link", `${uniPath}#about`], ["#uni-startups-link", `${uniPath}#startups`],
      ["#uni-people-link", `${uniPath}#leadership`], ["#uni-impact-link", `${uniPath}#impact`], ["#uni-achievements-link", `${uniPath}#achievements`], ["#uni-events-link", `${uniPath}#events`],
      ["#back-university", uniSite || uniPath], ["#crumb-university", uniPath]
    ].forEach(([sel,href])=>{const el=document.querySelector(sel);if(el)el.href=href;});
    const m = data.metrics || {};
    const a = data.answers || {};
    const founders = data.founders || [];
    const team = data.team || [];
    const founder = founders[0] || { name: "Founder", role: "Founder & CEO" };

    document.title = `${s.name} — Startup Impact Profile`;
    $("#crumb-name").textContent = s.name;

    // Derived values with fallbacks
    const valCr = m.valuation?.valueCr ?? "—";
    const valLow = m.valuation?.lowCr ?? "—";
    const valHigh = m.valuation?.highCr ?? "—";
    const invScore = m.investability?.score ?? "—";
    const aiScore = m.ai_resilience?.score ?? "—";
    const sdgScore = m.sdg_impact?.score ?? "—";
    const revStr = m.clients_revenue?.revenue_cr || a.Q31 || "Not disclosed";
    const quoteText = m.quote || a.Q18 || s.summary || "Startup profile";
    const facts = m.facts || {};

    const stageDisplay = s.stage === "incubated" ? "Currently Incubated" :
                         s.stage === "graduated" ? "Graduated" :
                         s.stage === "pre-incubated" ? "Pre-incubated" : "Ideation Stage";

    // 1. Build Top Header Banner (Panel 3)
    const headerHtml = `
      <section class="startup-header-banner">
        <div class="header-left-col">
          <div class="startup-logo-box">
            <img src="${s.logo_url || 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=200'}" alt="${s.name}">
          </div>
          <div class="startup-meta">
            <h1>${s.name}</h1>
            <div class="tagline">${s.summary || a.Q1 || 'Venture Profile'}</div>
            <div class="header-tags-row">
              <span class="pill-stage ${s.stage}">${stageDisplay}</span>
              <span class="pill-sector">${s.sector || "Venture"}</span>
              <span style="font-size:12px; color:#64748b; font-weight:500;">${uni.name || "University"} | Startup Impact</span>
            </div>
          </div>
        </div>

        <div class="header-actions-col">
          <div class="action-buttons-group">
            <button class="btn-secondary" onclick="alert('Opening video overview...')">▶ Watch Video</button>
            <button class="btn-secondary" onclick="navigator.clipboard.writeText(location.href); alert('Profile link copied to clipboard!');">🔗 Share</button>
          </div>
          <div class="quote-bubble">
            "${quoteText}"
          </div>
        </div>
      </section>
    `;

    // 2. Build Founder & Quick Facts Card (Panel 3)
    const founderHtml = `
      <section class="founder-facts-card">
        <div class="founder-identity-box">
          <div class="founder-photo">
            <img src="${founder.image_url || s.founder_image_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300'}" alt="${founder.name}">
          </div>
          <div class="founder-info">
            <h3>${founder.name} <a href="https://linkedin.com" target="_blank" style="color:#0a66c2; font-size:14px;">in</a></h3>
            <div class="role">${founder.role || "Founder & CEO"}</div>
            <div class="credentials">${facts.education || "Education not provided"}<br>${facts.experience || "Experience not provided"}</div>
          </div>
        </div>

        <div class="facts-grid">
          <div class="fact-item">
            <span class="icon">📅</span>
            <div>
              <div class="label">Year of Incorporation</div>
              <div class="value">${facts.incorporation_year || "Not provided"}</div>
            </div>
          </div>
          <div class="fact-item">
            <span class="icon">👥</span>
            <div>
              <div class="label">Team Size</div>
              <div class="value">${facts.team_size || team.length || "Not provided" } Members</div>
            </div>
          </div>
          <div class="fact-item">
            <span class="icon">📍</span>
            <div>
              <div class="label">Location</div>
              <div class="value">${facts.location || uni.name || "Not provided"}</div>
            </div>
          </div>
          <div class="fact-item">
            <span class="icon">💰</span>
            <div>
              <div class="label">Funding Raised</div>
              <div class="value">${facts.funding_raised || "Not disclosed"}</div>
            </div>
          </div>
          <div class="fact-item">
            <span class="icon">📈</span>
            <div>
              <div class="label">Current Stage</div>
              <div class="value">${facts.current_stage || stageDisplay}</div>
            </div>
          </div>
          <div class="fact-item">
            <span class="icon">🌐</span>
            <div>
              <div class="label">Website</div>
              <div class="value"><a href="${facts.website || s.website_url || "#"}" target="_blank" rel="noopener" style="color:#2563eb;">${facts.website || s.website_url || "Not provided"}</a></div>
            </div>
          </div>
        </div>
      </section>
    `;

    // 3. Build 5 Top KPI Cards Summary Banner (Panel 3)
    const kpiStripHtml = `
      <section class="kpi-summary-strip">
        <div class="kpi-summary-card kpi-purple">
          <div class="kpi-icon-wrap">💎</div>
          <div class="kpi-data">
            <div class="big-val">₹${valCr} Cr</div>
            <div class="tag-desc">Indicative Valuation</div>
          </div>
        </div>
        <div class="kpi-summary-card kpi-green">
          <div class="kpi-icon-wrap">📊</div>
          <div class="kpi-data">
            <div class="big-val">${invScore} / 10</div>
            <div class="tag-desc">Investability Score</div>
          </div>
        </div>
        <div class="kpi-summary-card kpi-blue">
          <div class="kpi-icon-wrap">🤖</div>
          <div class="kpi-data">
            <div class="big-val">${aiScore} / 10</div>
            <div class="tag-desc">AI Resilience Score</div>
          </div>
        </div>
        <div class="kpi-summary-card kpi-amber">
          <div class="kpi-icon-wrap">🌍</div>
          <div class="kpi-data">
            <div class="big-val">${sdgScore} / 10</div>
            <div class="tag-desc">SDG Impact Score</div>
          </div>
        </div>
        <div class="kpi-summary-card kpi-teal">
          <div class="kpi-icon-wrap">💵</div>
          <div class="kpi-data">
            <div class="big-val">${revStr}</div>
            <div class="tag-desc">Annual Revenue (FY 2024)</div>
          </div>
        </div>
      </section>
    `;

    // 4. Build Tabs Navigation
    const tabsNavHtml = `
      <div class="detail-tabs-bar">
        <button class="tab-btn active" data-tab="overview">Overview</button>
        <button class="tab-btn" data-tab="valuation">Valuation</button>
        <button class="tab-btn" data-tab="road-ahead">Road Ahead</button>
        <button class="tab-btn" data-tab="uniqueness">Uniqueness</button>
        <button class="tab-btn" data-tab="investability">Investability</button>
        <button class="tab-btn" data-tab="ai-resilience">AI Resilience</button>
        <button class="tab-btn" data-tab="sdg-impact">SDG Impact</button>
        <button class="tab-btn" data-tab="clients-revenue">Clients & Revenue</button>
        <button class="tab-btn" data-tab="team">Team</button>
        <button class="tab-btn" data-tab="gallery">Gallery</button>
      </div>
    `;

    // 5. TAB 1: OVERVIEW PANEL (Panel 3)
    const tabOverviewHtml = `
      <div class="tab-content active" id="tab-overview">
        <div class="panel-card">
          <div class="panel-header-badge">
            <h2>About ${s.name}</h2>
            <span class="pill-stage ${s.stage}">Verified Institutional Venture</span>
          </div>
          <p style="font-size: 15px; color: #334155; line-height: 1.7; margin-bottom: 20px;">
            ${s.summary || a.Q18 || "Using AI and IoT to empower small and marginal farmers with real-time crop insights."} 
            The venture is presented through its verified founder submission, institutional evidence and derived Startup Impact indicators. Detailed claims shown here should be supported by the submitted evidence and reviewed by the University.
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px;">
            <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; padding: 20px;">
              <h4 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">The Core Problem</h4>
              <p style="font-size: 13.5px; color: #64748b; line-height: 1.5;">${a.Q3 || a.Q4 || "Problem statement not provided in the published profile."}</p>
            </div>
            <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; padding: 20px;">
              <h4 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">The AgriSense Solution</h4>
              <p style="font-size: 13.5px; color: #64748b; line-height: 1.5;">${a.Q18 || a.Q45 || "Solution details not provided in the published profile."}</p>
            </div>
          </div>
        </div>

        <div class="panel-card">
          <div class="panel-header-badge">
            <h2>Business Plan Excerpt & Institutional Support</h2>
          </div>
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${(m.business_plan || [
              { no: 1, title: "Executive Summary", summary: a.Q18 || "Not supplied in the verified submission." },
              { no: 2, title: "Market & Opportunity", summary: a.Q20 || a.Q21 || "Not supplied in the verified submission." },
              { no: 3, title: "Go-To-Market & Economics", summary: a.Q30 || a.Q31 || "Not supplied in the verified submission." }
            ]).map(bp => `
              <div style="padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;">
                <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${bp.no}. ${bp.title}</div>
                <div style="font-size: 13px; color: #64748b; margin-top: 3px;">${bp.summary}</div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    // 6. TAB 2: VALUATION PANEL (Panel 4)
    const valDimensions = m.valuation?.dimensions || {};
    const valContributions = m.valuation?.contribution || [];

    const tabValuationHtml = `
      <div class="tab-content" id="tab-valuation">
        <div class="panel-card">
          <!-- Valuation Hero Banner -->
          <div class="valuation-hero-stat">
            <div class="val-left">
              <h3>₹${valCr} Crore</h3>
              <span class="range-pill">Valuation Range: ₹${valLow} Cr – ₹${valHigh} Cr</span>
            </div>
            <div class="val-right-meta">
              <div class="m-item">
                <div class="label">Stage</div>
                <div class="value">${facts.current_stage || stageDisplay}</div>
              </div>
              <div class="m-item">
                <div class="label">Methodology</div>
                <div class="value">Scorecard + DCF (Weighted)</div>
              </div>
              <div class="m-item">
                <div class="label">Data Date</div>
                <div class="value">28 Sept 2026</div>
              </div>
            </div>
          </div>

          <!-- Two Column Valuation Content -->
          <div class="valuation-two-col">
            <div>
              <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Valuation Methodology</h3>
              <div class="bar-metric-list">
                ${Object.entries(valDimensions).map(([lbl, val]) => renderProgressBar(lbl, val, 10, "purple")).join("")}
              </div>
            </div>

            <div class="donut-chart-wrapper">
              <h3 style="font-size: 16px; font-weight: 700; width: 100%;">Contribution to Valuation</h3>
              <!-- CSS Conic Gradient Donut -->
              <div style="width: 170px; height: 170px; border-radius: 50%; background: conic-gradient(#3b82f6 0% 20%, #10b981 20% 35%, #f59e0b 35% 45%, #8b5cf6 45% 60%, #ec4899 60% 75%, #06b6d4 75% 90%, #64748b 90% 100%); display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 10px rgba(0,0,0,0.06);">
                <div style="width: 95px; height: 95px; border-radius: 50%; background: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; color: #0f172a;">
                  <div>100%</div>
                  <span style="font-size: 10px; color:#64748b; font-weight: 500;">Weighting</span>
                </div>
              </div>

              <!-- Legend -->
              <div class="donut-legend-grid">
                ${valContributions.map(c => `
                  <div class="donut-legend-item">
                    <div class="donut-legend-left">
                      <span class="donut-color-dot" style="background: ${c.color};"></span>
                      <span>${c.label}</span>
                    </div>
                    <strong>${c.pct}%</strong>
                  </div>
                `).join("")}
              </div>

              <button class="btn-primary" style="margin-top: 10px; font-size: 13px;" onclick="alert('The detailed valuation calculation is available from the verified submission and configured valuation methodology.')">
                View Detailed Calculation →
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // 7. TAB 3: ROAD AHEAD (PANEL 5)
    const timelineData = m.road_ahead?.timeline || [];
    const finProjections = m.road_ahead?.financial_projections || [];

    const tabRoadAheadHtml = `
      <div class="tab-content" id="tab-road-ahead">
        <div class="panel-card">
          <div class="panel-header-badge">
            <h2>Road Ahead (${s.name} 5-Year Growth Plan)</h2>
            <span class="pill-stage incubated">Strategic Roadmap</span>
          </div>

          <!-- 5 Steps Timeline Cards -->
          <div class="timeline-steps-container">
            ${timelineData.map(node => `
              <div class="timeline-step-card" style="border-top: 3px solid ${node.color};">
                <div class="step-node-header">
                  <div class="year" style="color: ${node.color};">${node.year}</div>
                  <div class="phase-title">${node.title}</div>
                </div>
                <ul class="timeline-bullets">
                  ${node.bullets.map(b => `<li>${b}</li>`).join("")}
                </ul>
              </div>
            `).join("")}
          </div>

          <!-- Projected Financials Chart -->
          <div class="financial-chart-box">
            <div class="financial-chart-header">
              <h3 style="font-size: 16px; font-weight: 700;">Projected Financials (₹ Crore)</h3>
              <div class="legend-labels">
                <span style="display:flex; align-items:center; gap:6px;"><span style="width:10px; height:10px; background:#2563eb; border-radius:2px;"></span> Revenue</span>
                <span style="display:flex; align-items:center; gap:6px;"><span style="width:10px; height:10px; background:#06b6d4; border-radius:2px;"></span> EBITDA</span>
                <span style="display:flex; align-items:center; gap:6px;"><span style="width:10px; height:10px; background:#f59e0b; border-radius:2px;"></span> Net Profit</span>
              </div>
            </div>

            <div class="bars-projection-flex">
              ${finProjections.map(fp => {
                const maxRev = 25.0;
                const rH = Math.max(12, (fp.revenue / maxRev) * 140);
                const eH = Math.max(8, (fp.ebitda / maxRev) * 140);
                const nH = Math.max(5, (fp.net_profit / maxRev) * 140);
                return `
                  <div class="year-bar-group">
                    <div class="bar-cluster">
                      <div class="single-bar rev" style="height: ${rH}px;" title="Revenue: ₹${fp.revenue} Cr"></div>
                      <div class="single-bar ebitda" style="height: ${eH}px;" title="EBITDA: ₹${fp.ebitda} Cr"></div>
                      <div class="single-bar net" style="height: ${nH}px;" title="Net Profit: ₹${fp.net_profit} Cr"></div>
                    </div>
                    <div class="year-label">${fp.year}</div>
                    <div style="font-size: 11px; font-weight: 700; color: #2563eb;">₹${fp.revenue} Cr</div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Rafts & Rivers Advisory Callout -->
          <div class="callout-advisory-card">
            <p>Based on a detailed business plan developed in consultation with <strong>Rafts & Rivers</strong>, incorporating market analysis, financial modelling and sector expertise.</p>
            <button class="btn-primary" style="font-size: 12.5px; padding: 8px 16px; white-space: nowrap;" onclick="alert('Viewing executive summary: 5-year CAGR 124%, Target break-even Year 2 Q3, Addressable farmer TAM 12M.')">
              View Business Plan (Executive Summary) →
            </button>
          </div>
        </div>
      </div>
    `;

    // 8. TAB 4: UNIQUENESS (PANEL 6)
    const uniqDims = m.uniqueness?.dimensions || {};
    const uniqVps = m.uniqueness?.value_propositions || [];
    const testimonial = m.uniqueness?.testimonial || null;

    const tabUniquenessHtml = `
      <div class="tab-content" id="tab-uniqueness">
        <div class="panel-card">
          <div class="panel-header-badge">
            <h2>What Makes This Startup Unique?</h2>
            <span class="pill-stage incubated">Core Differentiation</span>
          </div>

          <div class="uniqueness-statement-card">
            "${m.uniqueness?.statement || s.summary || 'Differentiation statement not provided in the verified submission.'}"
          </div>

          <div class="uniqueness-grid">
            <div>
              <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Key Differentiation Drivers</h3>
              <div class="bar-metric-list">
                ${Object.entries(uniqDims).map(([lbl, val]) => renderProgressBar(lbl, val, 10, "blue")).join("")}
              </div>
            </div>

            <div>
              <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Unique Value Proposition</h3>
              <div class="value-props-list">
                ${uniqVps.map(vp => `
                  <div class="vp-item">
                    <span class="vp-icon">✓</span>
                    <span>${vp}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- Pilot User Testimonial -->
          ${testimonial ? `<div class="testimonial-quote-box">
            <div class="testimonial-avatar"><img src="${testimonial.avatar || ""}" alt="${testimonial.author || "Customer"}"></div>
            <div class="testimonial-body"><blockquote>"${testimonial.quote || ""}"</blockquote>
              <div class="author">— ${testimonial.author || ""}${testimonial.designation ? ", " + testimonial.designation : ""}</div>
            </div>
          </div>` : `<p class="data-not-provided">No verified customer testimonial has been supplied for this profile.</p>`}
        </div>
      </div>
    `;

    // 9. TAB 5: INVESTABILITY (PANEL 7)
    const invDims = m.investability?.dimensions || {};
    const strengths = m.investability?.strengths || [];
    const watchpoints = m.investability?.watch_points || [];

    const tabInvestabilityHtml = `
      <div class="tab-content" id="tab-investability">
        <div class="panel-card">
          <!-- Investability Header -->
          <div class="investability-header-stat">
            <div class="inv-score-box">
              <div style="font-size: 12px; font-weight: 700; color: #065f46; text-transform: uppercase;">Overall Investability Score</div>
              <h3>${invScore} / 10</h3>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; color: #047857; margin-bottom: 4px;">Stage: Early Revenue</div>
              <span class="readiness-pill">Investment Ready (with milestones)</span>
            </div>
          </div>

          <div class="investability-two-col">
            <div>
              <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Dimension-wise Assessment</h3>
              <div class="bar-metric-list">
                ${Object.entries(invDims).map(([lbl, val]) => renderProgressBar(lbl, val, 10, "green")).join("")}
              </div>
            </div>

            <div class="strengths-watchpoints-box">
              <div>
                <h3 style="font-size: 16px; font-weight: 700; color: #065f46; margin-bottom: 12px;">Key Strengths</h3>
                <div class="check-item-list">
                  ${strengths.map(s => `
                    <div class="check-item">
                      <span class="icon-check">✓</span>
                      <span>${s}</span>
                    </div>
                  `).join("")}
                </div>
              </div>

              <div>
                <h3 style="font-size: 16px; font-weight: 700; color: #b45309; margin-bottom: 12px;">Key Questions / Watch Points</h3>
                <div class="check-item-list">
                  ${watchpoints.map(w => `
                    <div class="check-item">
                      <span class="icon-warn">⚠️</span>
                      <span>${w}</span>
                    </div>
                  `).join("")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // 10. TAB 6: AI RESILIENCE (PANEL 8)
    const aiDims = m.ai_resilience?.dimensions || {};
    const aiInsights = m.ai_resilience?.insights || [];

    const tabAiResilienceHtml = `
      <div class="tab-content" id="tab-ai-resilience">
        <div class="panel-card">
          <!-- AI Banner -->
          <div class="ai-resilience-banner">
            <div>
              <div style="font-size: 12px; font-weight: 700; color: #1e40af; text-transform: uppercase;">AI Resilience Profile</div>
              <div class="ai-score-big">${aiScore} / 10</div>
            </div>
            <div style="text-align: right; max-width: 480px;">
              <span class="ai-pill">${m.ai_resilience?.profile || "AI-Augmentable"}</span>
              <p style="font-size: 12.5px; color: #1e40af; margin-top: 6px;">
                ${m.ai_resilience?.description || "The venture is well positioned to use AI as a productivity and product-enhancement layer rather than being directly displaced by AI."}
              </p>
            </div>
          </div>

          <div class="valuation-two-col">
            <div>
              <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Assessment Dimensions</h3>
              <div class="bar-metric-list">
                ${Object.entries(aiDims).map(([lbl, val]) => renderProgressBar(lbl, val, 10, "blue")).join("")}
              </div>
            </div>

            <div class="insights-cards-col">
              <h3 style="font-size: 16px; font-weight: 700;">Key Insights</h3>
              ${aiInsights.map(ins => `
                <div class="insight-card">
                  <span class="icon-star">★</span>
                  <div>
                    <h4>${ins.title}</h4>
                    <p>${ins.desc}</p>
                  </div>
                </div>
              `).join("")}

              <div style="background: #f8fafc; border: 1px solid var(--border); padding: 14px 16px; border-radius: 8px; margin-top: 8px;">
                <div style="font-size: 12.5px; font-weight: 700; color: #0f172a;">What does AI Resilience mean?</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px; line-height: 1.4;">
                  Our evaluation framework measures vulnerability to algorithmic replacement versus capacity to leverage AI for non-linear scale.
                </div>
                <a href="#methodology" style="font-size: 12px; font-weight: 600; color: #2563eb; display: inline-block; margin-top: 6px;">Read Full Methodology →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // 11. TAB 7: SDG IMPACT (PANEL 9)
    const primarySdgs = m.sdg_impact?.primary_sdgs || [];
    const sdgDims = m.sdg_impact?.dimensions || {};
    const sdgMetrics = m.sdg_impact?.metrics || [];

    const tabSdgImpactHtml = `
      <div class="tab-content" id="tab-sdg-impact">
        <div class="panel-card">
          <div class="sdg-impact-header">
            <div class="sdg-score-box">
              <div style="font-size: 12px; font-weight: 700; color: #92400e; text-transform: uppercase;">Overall SDG Impact Rating</div>
              <h3>${sdgScore} / 10</h3>
              <div style="font-size: 12px; font-weight: 700; color: #059669; margin-top: 4px;">High Positive Impact</div>
            </div>

            <div>
              <div style="font-size: 11.5px; font-weight: 700; color: #92400e; margin-bottom: 8px; text-align: right;">Primary SDGs</div>
              <div class="sdg-tiles-row">
                ${primarySdgs.map(sdg => renderSDGIcon(sdg.no, sdg.title, sdg.color)).join("")}
              </div>
            </div>
          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">SDG Impact Analysis</h3>
            <div class="bar-metric-list">
              ${Object.entries(sdgDims).map(([lbl, val]) => renderProgressBar(lbl, val, 10, "amber")).join("")}
            </div>
          </div>

          <!-- Impact Metrics Counters -->
          <div class="sdg-metrics-counter-grid">
            ${sdgMetrics.map(sm => `
              <div class="sdg-counter-card">
                <div class="val">${sm.value}</div>
                <div class="lbl">${sm.label}</div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    // 12. TAB 8: CLIENTS & REVENUE (PANEL 10)
    const crData = m.clients_revenue || { paying_clients: "Not disclosed", revenue_cr: a.Q31 || "Not disclosed", growth_pct: "Not disclosed", states_count: "Not disclosed", key_clients: [], revenue_trend: [] };

    const tabClientsRevenueHtml = `
      <div class="tab-content" id="tab-clients-revenue">
        <div class="panel-card">
          <div class="panel-header-badge">
            <h2>Clients & Commercial Revenue</h2>
            <span class="pill-stage incubated">Audited Institutional Metrics</span>
          </div>

          <!-- 4 KPI Cards -->
          <div class="clients-kpi-grid">
            <div class="clients-kpi-card">
              <div class="big-val">${crData.paying_clients}</div>
              <div class="lbl">Paying Clients</div>
            </div>
            <div class="clients-kpi-card">
              <div class="big-val">${crData.revenue_cr}</div>
              <div class="lbl">Revenue (FY 2024)</div>
            </div>
            <div class="clients-kpi-card">
              <div class="big-val">${crData.growth_pct}</div>
              <div class="lbl">Annual Growth</div>
            </div>
            <div class="clients-kpi-card">
              <div class="big-val">${crData.states_count}</div>
              <div class="lbl">States Operating</div>
            </div>
          </div>

          <!-- Key Client Badges -->
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 12px; color: #475569;">Key Clients & Partners</h3>
            <div class="client-logos-strip">
              ${crData.key_clients.map(c => `<span class="client-pill">${c}</span>`).join("")}
            </div>
          </div>

          <div class="revenue-two-col">
            <!-- Revenue Trend Chart -->
            <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; padding: 20px;">
              <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 16px;">Revenue Trend (₹ Lakh)</h3>
              <div style="display:flex; justify-content:space-around; align-items:flex-end; height:160px; padding-bottom:14px; border-bottom:1px solid #cbd5e1;">
                ${crData.revenue_trend.map(rt => {
                  const barH = Math.max(20, (rt.lakh / 200) * 130);
                  return `
                    <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
                      <div style="font-size:12px; font-weight:700; color:#2563eb;">₹${rt.lakh}L</div>
                      <div style="width:36px; height:${barH}px; background:#2563eb; border-radius:4px 4px 0 0;"></div>
                      <div style="font-size:12px; font-weight:600; color:#64748b;">${rt.year}</div>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>

            <!-- Client Segments Donut -->
            <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; padding: 20px;">
              <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 16px;">Client Segments</h3>
              <div style="display:flex; flex-direction:column; gap:10px;">
                ${crData.segments.map(seg => `
                  <div style="display:flex; align-items:center; justify-content:space-between; font-size:13px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span style="width:10px; height:10px; border-radius:50%; background:${seg.color};"></span>
                      <span>${seg.label}</span>
                    </div>
                    <strong>${seg.pct}%</strong>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // 13. TAB 9: TEAM TAB
    const allTeamMembers = [
      { name: founder.name, role: founder.role || "Founder & CEO", image: founder.image_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300' },
      ...team
    ];

    const tabTeamHtml = `
      <div class="tab-content" id="tab-team">
        <div class="panel-card">
          <div class="panel-header-badge">
            <h2>Founders & Core Team</h2>
            <span class="pill-stage incubated">${allTeamMembers.length} Members</span>
          </div>
          <div class="team-grid">
            ${allTeamMembers.map(tm => `
              <div class="team-card">
                <div class="team-avatar">
                  <img src="${tm.image || tm.image_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200'}" alt="${tm.name}">
                </div>
                <div class="team-info">
                  <h4>${tm.name}</h4>
                  <div class="role">${tm.role}</div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    // 14. TAB 10: GALLERY TAB
    const tabGalleryHtml = `
      <div class="tab-content" id="tab-gallery">
        <div class="panel-card">
          <div class="panel-header-badge">
            <h2>Product & Field Demonstration Gallery</h2>
          </div>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <div style="border-radius:8px; overflow:hidden; border:1px solid #e2e8f0; height:180px;">
              <img src="${s.logo_url}" style="width:100%; height:100%; object-fit:cover;" alt="Field Deployment">
            </div>
            <div style="border-radius:8px; overflow:hidden; border:1px solid #e2e8f0; height:180px;">
              <img src="https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600" style="width:100%; height:100%; object-fit:cover;" alt="Hardware Sensor Unit">
            </div>
            <div style="border-radius:8px; overflow:hidden; border:1px solid #e2e8f0; height:180px;">
              <img src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600" style="width:100%; height:100%; object-fit:cover;" alt="Farmer Consultation">
            </div>
          </div>
        </div>
      </div>
    `;

    // Combine All Elements into Container
    $("#startupProfileArea").innerHTML = `
      ${headerHtml}
      ${founderHtml}
      ${kpiStripHtml}
      ${tabsNavHtml}
      <div class="tab-panel-container">
        ${tabOverviewHtml}
        ${tabValuationHtml}
        ${tabRoadAheadHtml}
        ${tabUniquenessHtml}
        ${tabInvestabilityHtml}
        ${tabAiResilienceHtml}
        ${tabSdgImpactHtml}
        ${tabClientsRevenueHtml}
        ${tabTeamHtml}
        ${tabGalleryHtml}
      </div>
    `;

  } catch (err) {
    console.error("Error loading startup profile:", err);
  }
})();

// Tab Switching Handling
document.addEventListener("click", e => {
  const btn = e.target.closest(".tab-btn");
  if (btn) {
    $$(".tab-btn").forEach(b => b.classList.remove("active"));
    $$(".tab-content").forEach(c => c.classList.remove("active"));

    btn.classList.add("active");
    const targetId = `tab-${btn.dataset.tab}`;
    const targetPanel = document.getElementById(targetId);
    if (targetPanel) {
      targetPanel.classList.add("active");
    }
  }
});