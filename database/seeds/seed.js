import {db} from "../../server/db.js";
import {hash} from "../../server/auth.js";

// Clean old demo data
db.exec(`
  DELETE FROM founder_invites;
  DELETE FROM audit_log;
  DELETE FROM media;
  DELETE FROM team_members;
  DELETE FROM evidence;
  DELETE FROM submissions;
  DELETE FROM founders;
  DELETE FROM startups;
  DELETE FROM events;
  DELETE FROM achievements;
  DELETE FROM leaders;
  DELETE FROM users;
  DELETE FROM incubation_centres;
  DELETE FROM universities;
`);

// 1. Universities
const u1 = db.prepare(`
  INSERT INTO universities(name, slug, logo_url, about, vision, mission, contact_json, website_url, hero_image_url)
  VALUES(?,?,?,?,?,?,?,?,?)
`).run(
  "Riverside University",
  "demo",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160&auto=format&fit=crop&q=80",
  "Riverside University has nurtured over 68 ventures across climate, healthcare, agriculture, deep tech and social impact, driving regional economic growth and sustainable innovation.",
  "To be a globally recognized cradle for pioneering founders solving high-consequence global challenges.",
  "Fostering interdisciplinary venture building by uniting cutting-edge research, seed capital, and hands-on institutional mentoring.",
  JSON.stringify({ email: "incubation@riverside.edu", phone: "+91 98765 43210", address: "Riverside Campus, Knowledge Corridor, Pune - 411007" }),
  "https://www.riverside.edu",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1800&auto=format&fit=crop&q=85"
);
const uid = u1.lastInsertRowid;

// Also allow slug 'riverside' for friendly URL
db.prepare(`
  INSERT OR IGNORE INTO universities(name, slug, logo_url, about, vision, mission, contact_json, website_url, hero_image_url)
  VALUES(?,?,?,?,?,?,?,?,?)
`).run(
  "Riverside University",
  "riverside",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160&auto=format&fit=crop&q=80",
  "Riverside University has nurtured over 68 ventures across climate, healthcare, agriculture, deep tech and social impact.",
  "To be a globally recognized cradle for pioneering founders.",
  "Fostering interdisciplinary venture building.",
  JSON.stringify({ email: "incubation@riverside.edu" }),
  "https://www.riverside.edu",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1800&auto=format&fit=crop&q=85"
);

// 2. Incubation Centre
const inc = db.prepare(`
  INSERT INTO incubation_centres(university_id, name, slug, about, vision, mission, facilities)
  VALUES(?,?,?,?,?,?,?)
`).run(
  uid,
  "Centre for Innovation & Incubation (RCII)",
  "demo-iic",
  "RCII is Riverside University's flagship incubator providing prototyping labs, pilot testbeds, early-stage grants, and venture scaling support in partnership with Rafts & Rivers.",
  "Build high-impact, scalable, technology-driven enterprises from university research.",
  "Empower student and external innovators through structured acceleration, angel networks, and institutional industry partnerships.",
  "IoT & Embedded Systems Lab, Bio-Incubator & Cleanroom, Rapid Prototyping Workshop, Legal & IP Cell, 200-seat Co-working Space"
);
const incId = inc.lastInsertRowid;

// 3. Admin Users
db.prepare(`
  INSERT INTO users(university_id, name, email, password_hash, role)
  VALUES(?,?,?,?,?)
`).run(null, "Super Admin", "superadmin@example.com", hash("ChangeMe123!"), "super_admin");

db.prepare(`
  INSERT INTO users(university_id, name, email, password_hash, role)
  VALUES(?,?,?,?,?)
`).run(uid, "University Admin", "admin@demo.edu", hash("ChangeMe123!"), "university_admin");

// 4. University Leaders
const leadersData = [
  { name: "Prof. Arvind Sen", designation: "Vice Chancellor & Patron", biography: "Distinguished academician and former National Science Fellow guiding interdisciplinary institutional research.", order: 1, img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80" },
  { name: "Dr. Malini Rao", designation: "Director, Centre for Innovation", biography: "Pioneered the Riverside Innovation Hub; advisor to early-stage deeptech and life science spinouts.", order: 2, img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80" },
  { name: "Rajesh Varma", designation: "Chief Executive Officer, Incubation", biography: "20+ years in venture development, venture capital liaison, and national incubation program frameworks.", order: 3, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80" },
  { name: "Dr. Sneha Kulkarni", designation: "Head of Intellectual Property & Tech Transfer", biography: "Leads patent strategy, university spin-out licensing, and research commercialization.", order: 4, img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80" }
];
for (const l of leadersData) {
  db.prepare(`
    INSERT INTO leaders(university_id, name, designation, biography, image_url, display_order)
    VALUES(?,?,?,?,?,?)
  `).run(uid, l.name, l.designation, l.biography, l.img, l.order);
}

// 5. University Achievements
const achievementsData = [
  { title: "Top 5 National Incubation Hub 2026", description: "Recognized among India's premier university ecosystems by the Department of Science & Technology.", date: "2026-08-15" },
  { title: "₹52 Cr+ Cumulative Portfolio Revenue", description: "Incubated ventures surpassed ₹52 Crore annual combined run-rate across national and export markets.", date: "2026-06-30" },
  { title: "Best CleanTech & AgriTech Ecosystem Award", description: "Honored at the Global Impact Summit for deep research commercialization in sustainability.", date: "2025-11-20" },
  { title: "12 Patents Granted to Student Startups", description: "High-density institutional patent filings successfully granted across IoT, AgriTech, and Green Materials.", date: "2025-09-10" }
];
for (const a of achievementsData) {
  db.prepare(`
    INSERT INTO achievements(university_id, title, description, date)
    VALUES(?,?,?,?)
  `).run(uid, a.title, a.description, a.date);
}

// 6. University Events
const eventsData = [
  { title: "Annual Venture Showcase & Demo Day 2026", description: "Live investor presentations with over 45 angel syndicates and venture capital partners.", event_date: "2026-11-14" },
  { title: "DeepTech & Climate Investor Roundtable", description: "Closed-room pitch sessions for seed and series-A stage university climate spinouts.", event_date: "2026-10-22" },
  { title: "Founders Bootcamp & Prototype Grant Launch", description: "Hands-on venture structuring and customer discovery program for student innovators.", event_date: "2026-09-05" }
];
for (const ev of eventsData) {
  db.prepare(`
    INSERT INTO events(university_id, title, description, event_date)
    VALUES(?,?,?,?)
  `).run(uid, ev.title, ev.description, ev.event_date);
}

// 7. Seed The 6 Showcase Startups matching the screenshot
const startupsData = [
  {
    name: "AgriSense",
    slug: "agrisense",
    venture_type: "student",
    stage: "incubated",
    sector: "AgriTech",
    stage_display: "Currently Incubated",
    overall_score: 92,
    summary: "Precision Agriculture Solutions",
    quote: "Using AI and IoT to empower small and marginal farmers with real-time crop insights.",
    logo_url: "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=200&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80",
    founder: {
      name: "Priya Sharma",
      role: "Founder & CEO",
      email: "priya@agrisense.in",
      image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
      education: "M.Sc. Agricultural Engineering, IIT",
      experience: "5+ years in precision farming",
      linkedin: "https://linkedin.com"
    },
    facts: {
      incorporation_year: 2023,
      team_size: 8,
      location: "Riverside University",
      funding_raised: "₹1.5 Cr (Seed)",
      current_stage: "Early Revenue",
      website: "www.agrisense.in",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    team: [
      { name: "Rahul Verma", role: "Head of IoT & Hardware", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80" },
      { name: "Dr. Sunita Nair", role: "Agronomist & Soil Scientist", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80" },
      { name: "Amit Patel", role: "Full Stack & ML Lead", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80" }
    ],
    metrics: {
      overall_score: 92,
      valuation: {
        valueCr: 2.80,
        lowCr: 2.25,
        highCr: 3.25,
        stage: "Early Revenue",
        methodology: "Scorecard + DCF (Weighted)",
        data_date: "28 Sept 2026",
        dimensions: {
          "Market Opportunity": 8.5,
          "Traction": 6.8,
          "Revenue": 6.2,
          "Team Strength": 8.4,
          "Technology / IP": 7.6,
          "Scalability": 8.3,
          "Business Model": 7.9,
          "Risk Adjustment": 6.9
        },
        contribution: [
          { label: "Market Opportunity", pct: 20, color: "#3b82f6" },
          { label: "Traction", pct: 15, color: "#10b981" },
          { label: "Revenue", pct: 10, color: "#f59e0b" },
          { label: "Team", pct: 15, color: "#8b5cf6" },
          { label: "Technology / IP", pct: 15, color: "#ec4899" },
          { label: "Scalability", pct: 15, color: "#06b6d4" },
          { label: "Risk Adjustment", pct: 10, color: "#64748b" }
        ]
      },
      investability: {
        score: 8.6,
        stage: "Early Revenue",
        readiness_level: "Investment Ready (with milestones)",
        dimensions: {
          "Founder & Team": 8.8,
          "Market Opportunity": 8.4,
          "Traction": 7.8,
          "Business Model": 8.2,
          "Scalability": 8.6,
          "Capital Efficiency": 7.4,
          "Execution Evidence": 8.1,
          "Risk Profile": 6.9
        },
        strengths: [
          "Strong founder-domain alignment with specialized agricultural engineering credentials",
          "Clear market need and large underserved addressable opportunity across smallholder farming",
          "Demonstrated early traction with 320+ paying clients and strong renewal rates",
          "Scalable and capital-efficient asset-light sensor deployment model"
        ],
        watch_points: [
          "Customer acquisition cost needs continued validation across varied rural distribution channels",
          "Second-line leadership development required as operations expand to multiple states",
          "Regulatory approvals and pesticide spraying guidelines in target northern markets",
          "Working capital requirements during seasonal agricultural sowing cycles"
        ]
      },
      ai_resilience: {
        score: 8.1,
        profile: "AI-Augmentable",
        description: "The venture is well positioned to use AI as a productivity and product-enhancement layer rather than being directly displaced by AI.",
        dimensions: {
          "AI Exposure (Risk of Displacement)": 3.2,
          "AI Augmentation Potential": 8.6,
          "AI Dependency": 5.1,
          "Human Moat": 7.8,
          "Data / IP Moat": 7.9,
          "Adaptability": 8.4,
          "AI Opportunity": 8.8
        },
        insights: [
          { title: "Low risk of direct displacement", desc: "Physical on-ground hardware and localized field verification prevent AI-only software substitution." },
          { title: "High potential for AI augmentation", desc: "LLMs enable hyper-localized agro-advisories in regional dialects (Marathi, Hindi, Kannada)." },
          { title: "Proprietary field data creates defensibility", desc: "Over 120,000 real soil and moisture readings power unique edge-calibrated models." }
        ]
      },
      sdg_impact: {
        score: 8.2,
        rating_text: "High Positive Impact",
        primary_sdgs: [
          { no: 2, title: "Zero Hunger", color: "#DDA63A" },
          { no: 8, title: "Decent Work & Economic Growth", color: "#A21942" },
          { no: 12, title: "Responsible Consumption & Production", color: "#BF8B2E" },
          { no: 13, title: "Climate Action", color: "#3F7E44" }
        ],
        dimensions: {
          "Contribution to SDG Goals": 8.6,
          "Measurability of Impact": 8.1,
          "Scalability of Impact": 8.4,
          "Alignment with National Priorities": 7.9
        },
        metrics: [
          { value: "1,200+", label: "Farmers Reached", icon: "users" },
          { value: "18%", label: "Avg. Yield Increase", icon: "trending-up" },
          { value: "12,500 t", label: "Reduced (est.) CO2e", icon: "cloud" },
          { value: "35%", label: "Women Farmers", icon: "award" }
        ]
      },
      clients_revenue: {
        paying_clients: "320+",
        revenue_cr: "₹1.8 Cr",
        growth_pct: "120%",
        states_count: 6,
        key_clients: ["IFFCO", "Tata Trusts", "Mahyco", "Coromandel", "Mahindra Agri", "State Agriculture Dept."],
        revenue_trend: [
          { year: "2022", lakh: 25 },
          { year: "2023", lakh: 80 },
          { year: "2024", lakh: 180 }
        ],
        segments: [
          { label: "Farmer Producer Organisations (FPOs)", pct: 45, color: "#10b981" },
          { label: "Co-operatives", pct: 25, color: "#3b82f6" },
          { label: "Agri-input Companies", pct: 15, color: "#f59e0b" },
          { label: "Government Projects", pct: 10, color: "#8b5cf6" },
          { label: "Direct Farmers", pct: 5, color: "#ec4899" }
        ]
      },
      uniqueness: {
        score: 8.5,
        statement: "AgriSense combines ultra low-cost IoT sensors with AI-driven crop advisory tailored for small and marginal farmers, addressing a large underserved market with a simplified, local-language platform.",
        dimensions: {
          "Technology Integration": 8.5,
          "Local Language & Accessibility": 8.2,
          "Market Focus (Small Farmers)": 8.8,
          "Cost Advantage": 8.1,
          "Execution Capability": 7.9,
          "Defensibility": 7.9
        },
        value_propositions: [
          "Low-cost, easy-to-install IoT sensors designed for harsh rural conditions",
          "AI-driven advisory in local languages (Marathi, Hindi, Gujarati, Telugu)",
          "Purpose-built for small and marginal landholdings under 2 hectares",
          "Integrates micro-weather telemetry, soil nitrogen-phosphorus and crop stage data",
          "Strong distribution partnerships with state FPOs and grassroots cooperatives"
        ],
        testimonial: {
          quote: "AgriSense gives us timely advice in our own language. It has helped me increase my yield by 20% while reducing fertilizer expenditure.",
          author: "Ramesh Patil",
          designation: "Farmer, Maharashtra (Pilot User)",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
        }
      },
      road_ahead: {
        timeline: [
          {
            year: "2026",
            title: "Validation & Market Entry",
            color: "#10b981",
            bullets: ["100 pilot farmers", "Product V2 launch", "₹25L revenue", "3 states pilot"]
          },
          {
            year: "2027",
            title: "Early Scale",
            color: "#3b82f6",
            bullets: ["500 farmers", "₹1.2 Cr revenue", "10 states expansion", "Strategic partners onboarding"]
          },
          {
            year: "2028",
            title: "Expansion",
            color: "#8b5cf6",
            bullets: ["3,000 farmers", "₹3.5 Cr revenue", "Series A readiness", "15-member team growth"]
          },
          {
            year: "2029",
            title: "National Scale",
            color: "#f59e0b",
            bullets: ["10,000 farmers", "₹10 Cr revenue", "Pan-India presence", "Profitable operations"]
          },
          {
            year: "2030",
            title: "Global Opportunities",
            color: "#ef4444",
            bullets: ["50,000 farmers", "₹25 Cr revenue", "Export to SE Asia & Africa", "Strategic global partners"]
          }
        ],
        financial_projections: [
          { year: "2026", revenue: 0.25, ebitda: 0.05, net_profit: 0.02 },
          { year: "2027", revenue: 1.20, ebitda: 0.30, net_profit: 0.10 },
          { year: "2028", revenue: 3.50, ebitda: 0.90, net_profit: 0.40 },
          { year: "2029", revenue: 10.0, ebitda: 2.80, net_profit: 1.20 },
          { year: "2030", revenue: 25.0, ebitda: 7.50, net_profit: 3.80 }
        ]
      },
      business_plan: [
        { no: 1, title: "Executive Summary", summary: "AgriSense addresses productivity gaps for 120M+ Indian smallholder farmers through affordable sensing and AI telemetry." },
        { no: 2, title: "Market & Opportunity", summary: "Targeting a $4.2B precision agriculture market with low churn and subscription-based enterprise FPO packages." },
        { no: 3, title: "Product Architecture", summary: "Low-power BLE/LoRa mesh gateways connecting soil sensor probes to cloud edge inference microservices." },
        { no: 4, title: "Go-To-Market & Economics", summary: "B2B2C distribution via agricultural cooperatives, achieving positive unit economics from month 14." },
        { no: 5, title: "Support & Mentoring", summary: "Incubation and venture-development support from RCII, with continuous methodology guidance from Rafts & Rivers." }
      ]
    },
    answers: {
      Q1: "AgriSense Technologies Pvt Ltd",
      Q2: "Priya Sharma",
      Q18: "AgriSense combines ultra low-cost IoT sensors with AI-driven crop advisory tailored for small and marginal farmers, addressing a large underserved market with a simplified, local-language platform.",
      Q28: "Yes",
      Q29: "320+ paying clients including 14 FPOs",
      Q31: "₹1.8 Cr",
      Q45: "IoT sensors, LoRaWAN telemetry, Machine learning agronomy engine"
    }
  },
  {
    name: "MediLoop",
    slug: "mediloop",
    venture_type: "external",
    stage: "graduated",
    sector: "Healthcare",
    stage_display: "Graduated",
    overall_score: 92,
    summary: "Healthcare Diagnostics & Pathology Automation",
    quote: "Democratizing rapid, low-cost diagnostic testing for tier-2 and tier-3 community healthcare centers.",
    logo_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80",
    founder: {
      name: "Dr. Vikram Malhotra",
      role: "Founder & MD",
      email: "vikram@mediloop.health",
      image_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
      education: "MBBS, M.Tech Biomedical Devices",
      experience: "Ex-Apollo diagnostic technologies lead",
      linkedin: "https://linkedin.com"
    },
    facts: {
      incorporation_year: 2022,
      team_size: 16,
      location: "Riverside University Tech Park",
      funding_raised: "₹3.2 Cr (Pre-Series A)",
      current_stage: "Scaling Revenue",
      website: "www.mediloop.health",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    team: [
      { name: "Dr. Aarti Sen", role: "Chief Scientific Officer", image: "https://images.unsplash.com/photo-1594824813515-785e507205e4?w=200&auto=format&fit=crop&q=80" },
      { name: "Rohan Kapoor", role: "VP Engineering", image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80" }
    ],
    metrics: {
      overall_score: 92,
      valuation: {
        valueCr: 5.60,
        lowCr: 4.80,
        highCr: 6.50,
        stage: "Growth / Scaling",
        methodology: "DCF + Market Multiple",
        data_date: "28 Sept 2026",
        dimensions: {
          "Market Opportunity": 9.1,
          "Traction": 8.4,
          "Revenue": 7.9,
          "Team Strength": 8.7,
          "Technology / IP": 8.5,
          "Scalability": 8.2,
          "Business Model": 8.0,
          "Risk Adjustment": 7.4
        },
        contribution: [
          { label: "Market Opportunity", pct: 25, color: "#3b82f6" },
          { label: "Traction", pct: 20, color: "#10b981" },
          { label: "Revenue", pct: 15, color: "#f59e0b" },
          { label: "Technology / IP", pct: 20, color: "#ec4899" },
          { label: "Scalability", pct: 10, color: "#06b6d4" },
          { label: "Risk Adjustment", pct: 10, color: "#64748b" }
        ]
      },
      investability: {
        score: 8.2,
        stage: "Growth / Scaling",
        readiness_level: "Series A Ready",
        dimensions: {
          "Founder & Team": 9.0,
          "Market Opportunity": 8.8,
          "Traction": 8.5,
          "Business Model": 8.1,
          "Scalability": 8.3,
          "Capital Efficiency": 7.8,
          "Execution Evidence": 8.4,
          "Risk Profile": 7.2
        },
        strengths: [
          "ISO-13485 certified manufacturing line established",
          "Over 180 clinics and regional diagnostic chains deployed",
          "Proprietary microfluidics cartridge patent granted",
          "High recurring gross margins on disposable testing cartridges"
        ],
        watch_points: [
          "Clinical trials and CDSCO expansion approvals for molecular tests",
          "Supply chain lead times for specialized optical sensors",
          "Working capital requirements for hospital equipment leasing"
        ]
      },
      ai_resilience: {
        score: 7.9,
        profile: "AI-Enhanced Workflow",
        description: "Employs neural computer vision for automated slide cytometry while maintaining physical cartridge moats.",
        dimensions: {
          "AI Exposure (Risk of Displacement)": 2.8,
          "AI Augmentation Potential": 9.2,
          "AI Dependency": 6.0,
          "Human Moat": 8.4,
          "Data / IP Moat": 8.6,
          "Adaptability": 8.1,
          "AI Opportunity": 8.5
        },
        insights: [
          { title: "Physical device defensibility", desc: "Digital AI models require actual physical reagent blood interaction." },
          { title: "Computer vision automation", desc: "Automated white-blood-cell differential counting cuts review time by 80%." }
        ]
      },
      sdg_impact: {
        score: 8.5,
        rating_text: "High Positive Impact",
        primary_sdgs: [
          { no: 3, title: "Good Health & Well-Being", color: "#4C9F38" },
          { no: 9, title: "Industry, Innovation & Infrastructure", color: "#F36D25" },
          { no: 10, title: "Reduced Inequalities", color: "#DD1367" }
        ],
        dimensions: {
          "Contribution to SDG Goals": 8.9,
          "Measurability of Impact": 8.5,
          "Scalability of Impact": 8.4,
          "Alignment with National Priorities": 8.6
        },
        metrics: [
          { value: "450k+", label: "Patients Tested", icon: "activity" },
          { value: "65%", label: "Cost Reduction per Test", icon: "trending-down" },
          { value: "180+", label: "Tier 2/3 Clinics", icon: "home" },
          { value: "4", label: "Patents Granted", icon: "shield" }
        ]
      },
      clients_revenue: {
        paying_clients: "180+",
        revenue_cr: "₹2.4 Cr",
        growth_pct: "145%",
        states_count: 8,
        key_clients: ["Metropolis Health", "Apollo Rural Health", "Thyrocare Affiliates", "State Health Mission"],
        revenue_trend: [
          { year: "2022", lakh: 40 },
          { year: "2023", lakh: 110 },
          { year: "2024", lakh: 240 }
        ],
        segments: [
          { label: "Tier 2/3 Private Clinics", pct: 50, color: "#3b82f6" },
          { label: "Diagnostic Lab Chains", pct: 30, color: "#10b981" },
          { label: "Government Health Centres", pct: 15, color: "#f59e0b" },
          { label: "Direct Corporate Wellness", pct: 5, color: "#8b5cf6" }
        ]
      },
      uniqueness: {
        score: 8.6,
        statement: "Microfluidic cartridge automation providing 15-minute complete diagnostic panels without refrigerated storage.",
        dimensions: {
          "Technology Integration": 8.9,
          "Local Accessibility": 8.6,
          "Cost Advantage": 8.7,
          "Execution Capability": 8.4,
          "Defensibility": 8.8
        },
        value_propositions: [
          "Room-temperature stable dry chemistry microfluidic cartridges",
          "Results delivered in under 15 minutes at 1/3rd normal lab cost",
          "Automated cloud sync with patient digital health records"
        ],
        testimonial: {
          quote: "MediLoop has brought hospital-grade blood diagnostics directly into our rural clinic. Turnaround time dropped from 3 days to 15 minutes.",
          author: "Dr. K. Joshi",
          designation: "Chief Medical Officer, Rural Health Mission",
          avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=120&auto=format&fit=crop&q=80"
        }
      },
      road_ahead: {
        timeline: [
          { year: "2026", title: "Scale Diagnostic Centers", color: "#10b981", bullets: ["300 clinics", "₹3.8 Cr revenue", "CDSCO oncology panel"] },
          { year: "2027", title: "National Distribution", color: "#3b82f6", bullets: ["1,000 clinics", "₹9.5 Cr revenue", "Series A round"] },
          { year: "2028", title: "Southeast Asia Entry", color: "#8b5cf6", bullets: ["Vietnam & Indonesia pilots", "₹22 Cr revenue"] }
        ],
        financial_projections: [
          { year: "2026", revenue: 3.80, ebitda: 0.95, net_profit: 0.50 },
          { year: "2027", revenue: 9.50, ebitda: 2.80, net_profit: 1.60 },
          { year: "2028", revenue: 22.0, ebitda: 7.20, net_profit: 4.50 },
          { year: "2029", revenue: 45.0, ebitda: 16.0, net_profit: 10.5 },
          { year: "2030", revenue: 80.0, ebitda: 30.0, net_profit: 21.0 }
        ]
      },
      business_plan: [
        { no: 1, title: "Executive Summary", summary: "Next-generation point-of-care medical diagnostics platform for emerging markets." },
        { no: 2, title: "Clinical Validation", summary: "Over 50,000 paired sample comparisons with 99.2% gold standard concordance." }
      ]
    },
    answers: {
      Q1: "MediLoop Health Systems Pvt Ltd",
      Q2: "Dr. Vikram Malhotra",
      Q18: "AI-powered rapid point-of-care diagnostics and pathology automation for tier-2/3 clinics.",
      Q28: "Yes",
      Q29: "180+ clinics",
      Q31: "₹2.4 Cr"
    }
  },
  {
    name: "EcoBrick",
    slug: "ecobrick",
    venture_type: "student",
    stage: "pre-incubated",
    sector: "CleanTech",
    stage_display: "Pre-incubated",
    overall_score: 90,
    summary: "Green Construction Materials & Carbon-Negative Blocks",
    quote: "Transforming industrial thermal waste into certified green structural building blocks.",
    logo_url: "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=200&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80",
    founder: {
      name: "Ananya Deshmukh",
      role: "Founder & Materials Lead",
      email: "ananya@ecobrick.in",
      image_url: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&auto=format&fit=crop&q=80",
      education: "B.Tech Civil & Environmental Engineering",
      experience: "University Research Fellow on geopolymers",
      linkedin: "https://linkedin.com"
    },
    facts: {
      incorporation_year: 2024,
      team_size: 5,
      location: "Riverside University Prototyping Yard",
      funding_raised: "₹40 Lakh (Institutional Grant)",
      current_stage: "Pilot Production",
      website: "www.ecobrick.in",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    team: [
      { name: "Devendra Rathore", role: "Production Engineer", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
      { name: "Meera Sen", role: "Quality & Testing Lead", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80" }
    ],
    metrics: {
      overall_score: 90,
      valuation: {
        valueCr: 1.90,
        lowCr: 1.50,
        highCr: 2.30,
        stage: "Pre-Revenue / Pilot",
        methodology: "Scorecard Method",
        data_date: "28 Sept 2026",
        dimensions: {
          "Market Opportunity": 8.6,
          "Traction": 6.5,
          "Revenue": 5.8,
          "Team Strength": 7.9,
          "Technology / IP": 8.8,
          "Scalability": 8.0,
          "Business Model": 7.4,
          "Risk Adjustment": 6.8
        },
        contribution: [
          { label: "Technology / IP", pct: 30, color: "#ec4899" },
          { label: "Market Opportunity", pct: 25, color: "#3b82f6" },
          { label: "Team Strength", pct: 20, color: "#8b5cf6" },
          { label: "Scalability", pct: 15, color: "#06b6d4" },
          { label: "Risk Adjustment", pct: 10, color: "#64748b" }
        ]
      },
      investability: {
        score: 7.6,
        stage: "Pre-Revenue / Pilot",
        readiness_level: "Seed Ready",
        dimensions: {
          "Founder & Team": 8.0,
          "Market Opportunity": 8.5,
          "Traction": 6.9,
          "Business Model": 7.3,
          "Scalability": 7.8,
          "Capital Efficiency": 8.2,
          "Execution Evidence": 7.4,
          "Risk Profile": 6.7
        },
        strengths: [
          "Zero-clinker geopolymer binder with 70% lower embodied carbon",
          "BIS certification trials completed successfully",
          "Off-take MOU signed with 3 regional infrastructure builders"
        ],
        watch_points: [
          "Capital expenditure for automated automated batching plant",
          "Long-term moisture curing consistency under varying humidity"
        ]
      },
      ai_resilience: {
        score: 8.3,
        profile: "Physical Chemistry Moat",
        description: "Hard physical science and chemical process engineering with minimal disruption risk.",
        dimensions: {
          "AI Exposure (Risk of Displacement)": 1.9,
          "AI Augmentation Potential": 7.8,
          "AI Dependency": 3.5,
          "Human Moat": 8.8,
          "Data / IP Moat": 8.5,
          "Adaptability": 8.0,
          "AI Opportunity": 8.2
        },
        insights: [
          { title: "Physical manufacturing moat", desc: "Proprietary formulation of fly-ash activation cannot be duplicated by AI." },
          { title: "ML-assisted batch optimization", desc: "Algorithms optimize chemical admixtures according to ambient weather." }
        ]
      },
      sdg_impact: {
        score: 8.9,
        rating_text: "Exceptional Environmental Impact",
        primary_sdgs: [
          { no: 9, title: "Industry, Innovation & Infrastructure", color: "#F36D25" },
          { no: 11, title: "Sustainable Cities & Communities", color: "#F99D26" },
          { no: 12, title: "Responsible Consumption & Production", color: "#BF8B2E" },
          { no: 13, title: "Climate Action", color: "#3F7E44" }
        ],
        dimensions: {
          "Contribution to SDG Goals": 9.2,
          "Measurability of Impact": 8.8,
          "Scalability of Impact": 8.7,
          "Alignment with National Priorities": 8.9
        },
        metrics: [
          { value: "4,800 t", label: "Industrial Waste Recycled", icon: "refresh-cw" },
          { value: "70%", label: "Carbon Reduction vs Clay", icon: "feather" },
          { value: "1.2M", label: "Bricks Manufactured", icon: "box" },
          { value: "2", label: "Patents Pending", icon: "file-text" }
        ]
      },
      clients_revenue: {
        paying_clients: "12",
        revenue_cr: "₹45 Lakh",
        growth_pct: "95%",
        states_count: 2,
        key_clients: ["L&T Infra Project Pilot", "Godrej Green Homes", "Pune Municipal Corp PWD"],
        revenue_trend: [
          { year: "2023", lakh: 8 },
          { year: "2024", lakh: 45 }
        ],
        segments: [
          { label: "Commercial Developers", pct: 55, color: "#10b981" },
          { label: "Municipal & PWD Projects", pct: 30, color: "#3b82f6" },
          { label: "Private Homebuilders", pct: 15, color: "#f59e0b" }
        ]
      },
      uniqueness: {
        score: 8.4,
        statement: "Patent-pending ambient-cured geopolymer synthesis eliminating the need for kiln firing or high-pressure steam autoclaves.",
        dimensions: {
          "Technology Integration": 8.2,
          "Cost Advantage": 8.6,
          "Execution Capability": 7.6,
          "Defensibility": 8.7
        },
        value_propositions: [
          "Zero kiln-firing required — cures at room temperature",
          "Higher compressive strength (12 MPa) than traditional burnt red clay bricks",
          "Consumes 80% industrial byproduct materials"
        ],
        testimonial: {
          quote: "EcoBrick blocks provided superior thermal insulation and cut our walling masonry costs by 18%.",
          author: "Sunil Hegde",
          designation: "Project Director, Green Infrastructure Ltd",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
        }
      },
      road_ahead: {
        timeline: [
          { year: "2026", title: "Commercial Pilot Plant", color: "#10b981", bullets: ["50,000 bricks/month", "₹75L revenue"] },
          { year: "2027", title: "Regional Expansion", color: "#3b82f6", bullets: ["2 plants in Maharashtra", "₹3.5 Cr revenue"] }
        ],
        financial_projections: [
          { year: "2026", revenue: 0.75, ebitda: 0.15, net_profit: 0.08 },
          { year: "2027", revenue: 3.50, ebitda: 0.90, net_profit: 0.55 },
          { year: "2028", revenue: 8.50, ebitda: 2.60, net_profit: 1.80 }
        ]
      },
      business_plan: [
        { no: 1, title: "Executive Summary", summary: "High-performance carbon-negative structural building blocks for modern sustainable architecture." }
      ]
    },
    answers: {
      Q1: "EcoBrick Materials Pvt Ltd",
      Q2: "Ananya Deshmukh",
      Q18: "Carbon-negative building materials engineered from upcycled industrial fly ash and agricultural waste.",
      Q28: "Yes",
      Q29: "12 clients",
      Q31: "₹45 Lakh"
    }
  },
  {
    name: "SkyTech Drones",
    slug: "skytech-drones",
    venture_type: "student",
    stage: "ideation",
    sector: "DeepTech",
    stage_display: "Ideation Stage",
    overall_score: 92,
    summary: "Autonomous UAVs & Edge-Vision Aerial Robotics",
    quote: "Precision autonomous robotics for infrastructure inspection and precision aerial surveying.",
    logo_url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=200&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80",
    founder: {
      name: "Kabir Sen",
      role: "Co-Founder & Drone Systems Architect",
      email: "kabir@skytechdrones.io",
      image_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80",
      education: "B.Tech Aerospace Engineering",
      experience: "Winner, National UAV Innovation Challenge",
      linkedin: "https://linkedin.com"
    },
    facts: {
      incorporation_year: 2024,
      team_size: 6,
      location: "Riverside University Drone Lab",
      funding_raised: "₹25 Lakh (University Grant)",
      current_stage: "Prototype Testing",
      website: "www.skytechdrones.io",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    team: [
      { name: "Tanvi Rao", role: "Flight Dynamics Lead", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
      { name: "Sanjay Joshi", role: "Embedded Avionics", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" }
    ],
    metrics: {
      overall_score: 92,
      valuation: {
        valueCr: 3.40,
        lowCr: 2.80,
        highCr: 4.10,
        stage: "Ideation / Prototype",
        methodology: "Berkus Method + Risk Factor",
        data_date: "28 Sept 2026",
        dimensions: {
          "Market Opportunity": 9.2,
          "Traction": 5.4,
          "Revenue": 4.8,
          "Team Strength": 8.9,
          "Technology / IP": 9.4,
          "Scalability": 8.7,
          "Business Model": 7.6,
          "Risk Adjustment": 6.9
        },
        contribution: [
          { label: "Technology / IP", pct: 35, color: "#ec4899" },
          { label: "Team Strength", pct: 25, color: "#8b5cf6" },
          { label: "Market Opportunity", pct: 20, color: "#3b82f6" },
          { label: "Scalability", pct: 10, color: "#06b6d4" },
          { label: "Risk Adjustment", pct: 10, color: "#64748b" }
        ]
      },
      investability: {
        score: 7.8,
        stage: "Ideation / Prototype",
        readiness_level: "Pre-Seed Ready",
        dimensions: {
          "Founder & Team": 8.9,
          "Market Opportunity": 9.0,
          "Traction": 5.8,
          "Business Model": 7.5,
          "Scalability": 8.6,
          "Capital Efficiency": 7.2,
          "Execution Evidence": 7.9,
          "Risk Profile": 6.8
        },
        strengths: [
          "Proprietary flight-control algorithm operating under GPS-denied tunnels and bridges",
          "DGCA Type Certification roadmap in active progress",
          "High payload capacity to weight ratio"
        ],
        watch_points: [
          "Import substitution for specialized high-KV brushless motors",
          "Commercial defense and airspace drone corridor clearances"
        ]
      },
      ai_resilience: {
        score: 8.5,
        profile: "AI-Native Aerial Robotics",
        description: "Directly integrates real-time edge AI SLAM navigation and visual defect segmentation.",
        dimensions: {
          "AI Exposure (Risk of Displacement)": 2.1,
          "AI Augmentation Potential": 9.5,
          "AI Dependency": 6.5,
          "Human Moat": 8.6,
          "Data / IP Moat": 8.9,
          "Adaptability": 8.8,
          "AI Opportunity": 9.4
        },
        insights: [
          { title: "Autonomous edge inference", desc: "Drones conduct live structural crack detection on bridges without cloud latency." }
        ]
      },
      sdg_impact: {
        score: 7.8,
        rating_text: "High Infrastructure Impact",
        primary_sdgs: [
          { no: 9, title: "Industry, Innovation & Infrastructure", color: "#F36D25" },
          { no: 12, title: "Responsible Consumption & Production", color: "#BF8B2E" }
        ],
        dimensions: {
          "Contribution to SDG Goals": 8.0,
          "Measurability of Impact": 7.8,
          "Scalability of Impact": 8.2,
          "Alignment with National Priorities": 8.4
        },
        metrics: [
          { value: "450 km", label: "Powerline Inspected", icon: "zap" },
          { value: "85%", label: "Inspection Hazard Reduction", icon: "shield-alert" },
          { value: "3", label: "DGCA Approvals in Review", icon: "check-circle" },
          { value: "1", label: "Patent Filed", icon: "file" }
        ]
      },
      clients_revenue: {
        paying_clients: "5",
        revenue_cr: "₹15 Lakh",
        growth_pct: "160%",
        states_count: 2,
        key_clients: ["State Electricity Board", "National Highway Contractors", "Mining Survey Consortium"],
        revenue_trend: [
          { year: "2024", lakh: 15 }
        ],
        segments: [
          { label: "Infrastructure Contractors", pct: 60, color: "#3b82f6" },
          { label: "Power & Utilities", pct: 40, color: "#10b981" }
        ]
      },
      uniqueness: {
        score: 8.8,
        statement: "Dual-camera edge photogrammetry UAV capable of sub-millimeter flaw detection inside enclosed high-voltage environments.",
        dimensions: {
          "Technology Integration": 9.4,
          "Cost Advantage": 8.0,
          "Execution Capability": 8.1,
          "Defensibility": 8.9
        },
        value_propositions: [
          "GPS-denied navigation through visual inertial odometry",
          "Automated defect classification with onboard neural accelerators",
          "Ruggedized IP54 weather-sealed composite carbon airframe"
        ],
        testimonial: {
          quote: "SkyTech's prototype inspected our transmission line towers in 2 hours where rope crews typically require 2 days.",
          author: "N. Deshpande",
          designation: "Executive Engineer, Power Transmission Corp",
          avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80"
        }
      },
      road_ahead: {
        timeline: [
          { year: "2026", title: "DGCA Certification & Pilots", color: "#10b981", bullets: ["10 drone fleet", "₹50L revenue"] },
          { year: "2027", title: "Industrial Drone-as-a-Service", color: "#3b82f6", bullets: ["50 drone fleet", "₹3.2 Cr revenue"] }
        ],
        financial_projections: [
          { year: "2026", revenue: 0.50, ebitda: 0.10, net_profit: 0.05 },
          { year: "2027", revenue: 3.20, ebitda: 0.85, net_profit: 0.45 }
        ]
      },
      business_plan: [
        { no: 1, title: "Executive Summary", summary: "Autonomous edge-intelligent aerial robotics for enterprise critical asset maintenance." }
      ]
    },
    answers: {
      Q1: "SkyTech Autonomous Systems",
      Q2: "Kabir Sen",
      Q18: "Autonomous long-endurance micro-UAVs for precision crop spraying and infrastructure inspection.",
      Q28: "Yes",
      Q29: "5 enterprise pilots",
      Q31: "₹15 Lakh"
    }
  },
  {
    name: "Finz Foods",
    slug: "finz-foods",
    venture_type: "external",
    stage: "incubated",
    sector: "FoodTech",
    stage_display: "Currently Incubated",
    overall_score: 90,
    summary: "Sustainable Micro-Algae Protein & Nutrition",
    quote: "Pioneering climate-resilient alternative proteins for functional foods and affordable child nutrition.",
    logo_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
    founder: {
      name: "Siddharth Kulkarni",
      role: "Founder & Food Biochemist",
      email: "siddharth@finzfoods.com",
      image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
      education: "M.Tech Food Biotechnology",
      experience: "8 years in fermentation & bioactive proteins",
      linkedin: "https://linkedin.com"
    },
    facts: {
      incorporation_year: 2023,
      team_size: 7,
      location: "Riverside Bio-Incubator Facility",
      funding_raised: "₹1.1 Cr (Angel Syndicates)",
      current_stage: "Early Commercial",
      website: "www.finzfoods.com",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    team: [
      { name: "Pooja Hegde", role: "Bioprocess Engineer", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80" }
    ],
    metrics: {
      overall_score: 90,
      valuation: {
        valueCr: 2.10,
        lowCr: 1.70,
        highCr: 2.60,
        stage: "Early Commercial",
        methodology: "Scorecard + Precedent Multiples",
        data_date: "28 Sept 2026",
        dimensions: {
          "Market Opportunity": 8.7,
          "Traction": 7.4,
          "Revenue": 6.8,
          "Team Strength": 8.2,
          "Technology / IP": 8.4,
          "Scalability": 8.1,
          "Business Model": 7.8,
          "Risk Adjustment": 7.0
        },
        contribution: [
          { label: "Technology / IP", pct: 25, color: "#ec4899" },
          { label: "Market Opportunity", pct: 25, color: "#3b82f6" },
          { label: "Traction", pct: 20, color: "#10b981" },
          { label: "Team", pct: 15, color: "#8b5cf6" },
          { label: "Risk Adjustment", pct: 15, color: "#64748b" }
        ]
      },
      investability: {
        score: 8.0,
        stage: "Early Commercial",
        readiness_level: "Seed Stage",
        dimensions: {
          "Founder & Team": 8.5,
          "Market Opportunity": 8.8,
          "Traction": 7.6,
          "Business Model": 8.0,
          "Scalability": 8.2,
          "Capital Efficiency": 7.6,
          "Execution Evidence": 7.9,
          "Risk Profile": 7.0
        },
        strengths: [
          "FSSAI food product formulation approvals secured",
          "Proprietary photobioreactor design yields 3x higher protein density",
          "Active supply contract with 2 regional FMCG nutraceutical brands"
        ],
        watch_points: [
          "Scale-up of bioreactor drying facilities",
          "Price sensitivity of retail consumer protein powders"
        ]
      },
      ai_resilience: {
        score: 7.7,
        profile: "Biotech Formulation Moat",
        description: "Living biological cultures and sterile photobioreactors provide deep insulation against algorithmic disruption.",
        dimensions: {
          "AI Exposure (Risk of Displacement)": 2.2,
          "AI Augmentation Potential": 8.4,
          "AI Dependency": 4.8,
          "Human Moat": 8.3,
          "Data / IP Moat": 8.1,
          "Adaptability": 7.9,
          "AI Opportunity": 8.1
        },
        insights: [
          { title: "Bio-fermentation moat", desc: "Specialized spirulina strain cultivation requires physical aseptic cleanroom controls." }
        ]
      },
      sdg_impact: {
        score: 8.7,
        rating_text: "High Nutrition Impact",
        primary_sdgs: [
          { no: 2, title: "Zero Hunger", color: "#DDA63A" },
          { no: 3, title: "Good Health & Well-Being", color: "#4C9F38" },
          { no: 12, title: "Responsible Consumption & Production", color: "#BF8B2E" }
        ],
        dimensions: {
          "Contribution to SDG Goals": 8.9,
          "Measurability of Impact": 8.6,
          "Scalability of Impact": 8.5,
          "Alignment with National Priorities": 8.7
        },
        metrics: [
          { value: "85,000", label: "Nutritional Servings Delivered", icon: "smile" },
          { value: "90%", label: "Less Water vs Plant Protein", icon: "droplet" },
          { value: "45%", label: "Bioavailable Protein Density", icon: "heart" },
          { value: "2", label: "School Nutrition Pilots", icon: "book-open" }
        ]
      },
      clients_revenue: {
        paying_clients: "42",
        revenue_cr: "₹65 Lakh",
        growth_pct: "115%",
        states_count: 3,
        key_clients: ["NutraPure Labs", "Govt School Nutrition Pilot", "GreenBites Healthy Snacks"],
        revenue_trend: [
          { year: "2023", lakh: 20 },
          { year: "2024", lakh: 65 }
        ],
        segments: [
          { label: "B2B Food Ingredients", pct: 60, color: "#10b981" },
          { label: "Institutional Mid-day Meals", pct: 25, color: "#3b82f6" },
          { label: "Direct-to-Consumer", pct: 15, color: "#f59e0b" }
        ]
      },
      uniqueness: {
        score: 8.2,
        statement: "Neutral-taste micro-algae isolates that seamlessly blend into traditional flour, porridge and dairy without off-flavor.",
        dimensions: {
          "Technology Integration": 8.1,
          "Cost Advantage": 8.4,
          "Execution Capability": 8.0,
          "Defensibility": 8.3
        },
        value_propositions: [
          "Odourless and neutral taste profile through enzymatic deodorization",
          "Rich in 9 essential amino acids and natural Vitamin B12",
          "Zero pesticide and minimal arable land footprint"
        ],
        testimonial: {
          quote: "Finz Foods' protein powder blended effortlessly into our baked snack line with zero off-note taste.",
          author: "Anil Mehra",
          designation: "Head of R&D, GreenBites Foods",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
        }
      },
      road_ahead: {
        timeline: [
          { year: "2026", title: "Commercial Bioreactor Scaling", color: "#10b981", bullets: ["2-ton monthly output", "₹1.5 Cr revenue"] },
          { year: "2027", title: "National FMCG Partnerships", color: "#3b82f6", bullets: ["5 national brands", "₹5.0 Cr revenue"] }
        ],
        financial_projections: [
          { year: "2026", revenue: 1.50, ebitda: 0.35, net_profit: 0.18 },
          { year: "2027", revenue: 5.00, ebitda: 1.40, net_profit: 0.85 }
        ]
      },
      business_plan: [
        { no: 1, title: "Executive Summary", summary: "Scalable microalgae biotechnology for the $14B global alternative protein market." }
      ]
    },
    answers: {
      Q1: "Finz Foods Technologies",
      Q2: "Siddharth Kulkarni",
      Q18: "Micro-algae protein extraction providing sustainable nutritional supplements for rural mid-day meals.",
      Q28: "Yes",
      Q29: "42 B2B clients",
      Q31: "₹65 Lakh"
    }
  },
  {
    name: "Cosmo Cool",
    slug: "cosmo-cool",
    venture_type: "external",
    stage: "pre-incubated",
    sector: "CleanTech",
    stage_display: "Pre-incubated",
    overall_score: 90,
    summary: "Solar Thermal Farm-Gate Cold Storage",
    quote: "Decentralized thermal cooling for rural milk and horticulture farmers without grid electricity.",
    logo_url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=200&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=600&auto=format&fit=crop&q=80",
    founder: {
      name: "Rameshwar Gupta",
      role: "Founder & Thermal Engineer",
      email: "rameshwar@cosmocool.energy",
      image_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80",
      education: "M.Tech Thermal & Fluids Engineering",
      experience: "10 years in solar adsorption cooling systems",
      linkedin: "https://linkedin.com"
    },
    facts: {
      incorporation_year: 2024,
      team_size: 4,
      location: "Riverside University Clean Energy Cell",
      funding_raised: "₹35 Lakh (Clean Energy Fellowship)",
      current_stage: "Field Pilot",
      website: "www.cosmocool.energy",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    team: [
      { name: "Suresh Patil", role: "Refrigeration Mechanic & Field Ops", image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80" }
    ],
    metrics: {
      overall_score: 90,
      valuation: {
        valueCr: 1.50,
        lowCr: 1.20,
        highCr: 1.90,
        stage: "Field Prototype",
        methodology: "Scorecard Method",
        data_date: "28 Sept 2026",
        dimensions: {
          "Market Opportunity": 8.9,
          "Traction": 5.9,
          "Revenue": 5.2,
          "Team Strength": 7.8,
          "Technology / IP": 8.5,
          "Scalability": 7.9,
          "Business Model": 7.5,
          "Risk Adjustment": 6.8
        },
        contribution: [
          { label: "Technology / IP", pct: 30, color: "#ec4899" },
          { label: "Market Opportunity", pct: 25, color: "#3b82f6" },
          { label: "Team", pct: 20, color: "#8b5cf6" },
          { label: "Scalability", pct: 15, color: "#06b6d4" },
          { label: "Risk Adjustment", pct: 10, color: "#64748b" }
        ]
      },
      investability: {
        score: 7.4,
        stage: "Field Prototype",
        readiness_level: "Early Seed Ready",
        dimensions: {
          "Founder & Team": 7.8,
          "Market Opportunity": 8.9,
          "Traction": 6.2,
          "Business Model": 7.4,
          "Scalability": 7.8,
          "Capital Efficiency": 7.9,
          "Execution Evidence": 7.2,
          "Risk Profile": 6.8
        },
        strengths: [
          "Zero battery maintenance — uses water-ice thermal phase change storage",
          "Operates at 4°C for 36 continuous hours even during heavy cloud cover",
          "Eliminates 30% post-harvest spoilage for dairy farmers"
        ],
        watch_points: [
          "Transport logistics of insulated thermal storage panels",
          "Government subsidy release timelines for solar cold chains"
        ]
      },
      ai_resilience: {
        score: 8.0,
        profile: "Thermodynamic Hardware Moat",
        description: "Deep thermodynamic hardware engineering with IoT remote temperature monitoring.",
        dimensions: {
          "AI Exposure (Risk of Displacement)": 1.8,
          "AI Augmentation Potential": 7.6,
          "AI Dependency": 3.2,
          "Human Moat": 8.5,
          "Data / IP Moat": 8.2,
          "Adaptability": 8.0,
          "AI Opportunity": 8.1
        },
        insights: [
          { title: "Physical cold-chain moat", desc: "Thermal heat exchange cannot be displaced by AI software." }
        ]
      },
      sdg_impact: {
        score: 8.4,
        rating_text: "High Climate & Rural Impact",
        primary_sdgs: [
          { no: 7, title: "Affordable & Clean Energy", color: "#FCC30B" },
          { no: 9, title: "Industry, Innovation & Infrastructure", color: "#F36D25" },
          { no: 12, title: "Responsible Consumption & Production", color: "#BF8B2E" }
        ],
        dimensions: {
          "Contribution to SDG Goals": 8.6,
          "Measurability of Impact": 8.4,
          "Scalability of Impact": 8.3,
          "Alignment with National Priorities": 8.5
        },
        metrics: [
          { value: "48", label: "Farm Units Deployed", icon: "sun" },
          { value: "32%", label: "Post-Harvest Waste Avoided", icon: "shield" },
          { value: "18k kWh", label: "Grid Energy Saved", icon: "zap" },
          { value: "1", label: "Thermal Battery Patent", icon: "award" }
        ]
      },
      clients_revenue: {
        paying_clients: "18",
        revenue_cr: "₹32 Lakh",
        growth_pct: "90%",
        states_count: 2,
        key_clients: ["Baramati Dairy Cooperative", "Kisan Fresh Producers", "Sahyadri Farmers Producer Co"],
        revenue_trend: [
          { year: "2023", lakh: 5 },
          { year: "2024", lakh: 32 }
        ],
        segments: [
          { label: "Dairy Cooperatives", pct: 65, color: "#10b981" },
          { label: "Horticulture Growers", pct: 25, color: "#3b82f6" },
          { label: "Government Agri Hubs", pct: 10, color: "#f59e0b" }
        ]
      },
      uniqueness: {
        score: 8.1,
        statement: "Battery-less solar thermal refrigeration using non-toxic phase-change material that stores cold energy during peak daylight hours.",
        dimensions: {
          "Technology Integration": 8.0,
          "Cost Advantage": 8.5,
          "Execution Capability": 7.8,
          "Defensibility": 8.3
        },
        value_propositions: [
          "Zero recurring electricity bills and zero toxic chemical refrigerants",
          "Maintains 4°C temperature for 36 hours without sunlight",
          "Payback period of under 18 months for village milk chilling points"
        ],
        testimonial: {
          quote: "Our dairy society used to lose hundreds of liters of evening milk during blackouts. Cosmo Cool preserves the milk overnight perfectly.",
          author: "Babanrao Shinde",
          designation: "Chairman, Village Milk Cooperative",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
        }
      },
      road_ahead: {
        timeline: [
          { year: "2026", title: "Commercial Manufacturing", color: "#10b981", bullets: ["100 cold-room units", "₹80L revenue"] },
          { year: "2027", title: "State Dairy Expansion", color: "#3b82f6", bullets: ["500 cold-room units", "₹3.8 Cr revenue"] }
        ],
        financial_projections: [
          { year: "2026", revenue: 0.80, ebitda: 0.18, net_profit: 0.10 },
          { year: "2027", revenue: 3.80, ebitda: 0.95, net_profit: 0.60 }
        ]
      },
      business_plan: [
        { no: 1, title: "Executive Summary", summary: "Decentralized battery-less solar cold chain technology for emerging market agricultural resilience." }
      ]
    },
    answers: {
      Q1: "Cosmo Cool Thermal Energy",
      Q2: "Rameshwar Gupta",
      Q18: "Passive solar thermal refrigeration units for farm-gate decentralized milk and produce storage.",
      Q28: "Yes",
      Q29: "18 cooperative units",
      Q31: "₹32 Lakh"
    }
  }
];

// Insert startups, founders, submissions, team, and media
for (const s of startupsData) {
  const stRes = db.prepare(`
    INSERT INTO startups(
      university_id, incubation_id, name, slug, venture_type, stage,
      portfolio_status, logo_url, founder_image_url, summary, sector, public_visibility
    )
    VALUES(?,?,?,?,?,?,?,?,?,?,?,1)
  `).run(
    uid,
    incId,
    s.name,
    s.slug,
    s.venture_type,
    s.stage,
    "published",
    s.cover_url,
    s.founder.image_url,
    s.summary,
    s.sector
  );
  const startupId = stRes.lastInsertRowid;

  // Insert founder
  db.prepare(`
    INSERT INTO founders(startup_id, name, role, email, image_url, display_order)
    VALUES(?,?,?,?,?,1)
  `).run(
    startupId,
    s.founder.name,
    s.founder.role,
    s.founder.email,
    s.founder.image_url
  );

  // Insert team members
  if (s.team && s.team.length > 0) {
    for (const tm of s.team) {
      db.prepare(`
        INSERT INTO team_members(startup_id, name, role, image_url)
        VALUES(?,?,?,?)
      `).run(startupId, tm.name, tm.role, tm.image);
    }
  }

  // Insert verified submission
  const subRes = db.prepare(`
    INSERT INTO submissions(startup_id, version_no, status, answers_json, derived_json, submitted_at, reviewed_at, reviewer_note)
    VALUES(?,1,'verified',?,?,datetime('now','-10 days'),datetime('now','-2 days'),'Verified by University Incubation Review Panel')
  `).run(
    startupId,
    JSON.stringify(s.answers),
    JSON.stringify({...s.metrics, facts: s.facts || {}, quote: s.quote || ''})
  );
  const submissionId = subRes.lastInsertRowid;

  // Link published submission
  db.prepare(`
    UPDATE startups SET current_submission_id=?, published_submission_id=? WHERE id=?
  `).run(submissionId, submissionId, startupId);

  // Add media
  db.prepare(`
    INSERT INTO media(startup_id, kind, title, url, caption)
    VALUES(?,?,?,?,?)
  `).run(startupId, "image", s.name + " Showcase", s.cover_url, s.summary);

  // Add verification evidence
  db.prepare(`
    INSERT INTO evidence(startup_id, submission_id, evidence_type, title, verification_status)
    VALUES(?,?,'registration','Certificate of Incorporation','verified')
  `).run(startupId, submissionId);

  db.prepare(`
    INSERT INTO evidence(startup_id, submission_id, evidence_type, title, verification_status)
    VALUES(?,?,'financial','GST Return & Revenue Proof','verified')
  `).run(startupId, submissionId);
}

console.log(`Successfully seeded Riverside University with ${startupsData.length} comprehensive startups!`);