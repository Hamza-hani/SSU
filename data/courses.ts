import type { Course, Module, Lesson } from "../types";

/* =========================
   FINAL ASSESSMENT (LOCKED)
========================= */

function appendFinalAssessment(courseId: string, courseTitle: string, modules: Module[]): Module[] {
  return [
    ...modules,
    {
      id: `${courseId}-final-assessment`,
      title: "Final Assessment",
      lessons: [
        {
          id: `${courseId}-final-quiz`,
          title: `${courseTitle} — Final Assessment (Quiz)`,
          type: "quiz",
          completed: false,
          isFinalAssessment: true,
          gate: { requiresAllPreviousLessons: true }, // ✅ locked until all previous lessons done
          quiz: {
            passingPercent: 70,
            shuffleQuestions: true,
            shuffleOptions: true,
            questions: [
              {
                id: "q1",
                prompt: "Vital / critical infrastructure mainly refers to:",
                options: [
                  { id: "A", text: "Only private buildings" },
                  { id: "B", text: "Essential systems/assets needed for society and economy" },
                  { id: "C", text: "Only military bases" },
                  { id: "D", text: "Only social media networks" },
                ],
                correctOptionId: "B",
                explanation:
                  "Vital infrastructure includes essential systems, assets, and networks required for society and the economy.",
              },
              {
                id: "q2",
                prompt: "A major disruption to a power grid can impact:",
                options: [
                  { id: "A", text: "Hospitals and emergency response" },
                  { id: "B", text: "Only entertainment" },
                  { id: "C", text: "Only sports events" },
                  { id: "D", text: "No one" },
                ],
                correctOptionId: "A",
              },
              {
                id: "q3",
                prompt: "Threat Matrix is used to:",
                options: [
                  { id: "A", text: "Rank threats by likelihood and impact" },
                  { id: "B", text: "Clean servers automatically" },
                  { id: "C", text: "Increase salaries" },
                  { id: "D", text: "Change uniforms" },
                ],
                correctOptionId: "A",
              },
              {
                id: "q4",
                prompt: "Damage to water treatment plants can lead to:",
                options: [
                  { id: "A", text: "Water shortages and disease risks" },
                  { id: "B", text: "Faster internet" },
                  { id: "C", text: "More electricity" },
                  { id: "D", text: "Less rainfall" },
                ],
                correctOptionId: "A",
              },
              {
                id: "q5",
                prompt: "CIPI helps mostly with:",
                options: [
                  { id: "A", text: "Prioritizing critical infrastructure protection" },
                  { id: "B", text: "Buying vehicles" },
                  { id: "C", text: "Cooking meals" },
                  { id: "D", text: "Scheduling holidays" },
                ],
                correctOptionId: "A",
              },
            ],
          },
        },
      ],
    },
  ];
}

/* =========================
   DEFAULT GENERATOR
========================= */

function generateModules(courseId: string, courseTitle: string, count: number): Module[] {
  const modules: Module[] = Array.from({ length: count }, (_, i) => {
    const moduleNo = i + 1;

    const lessons: Lesson[] = [
      {
        id: `${courseId}-m${moduleNo}-v1`,
        title: `Module ${moduleNo} — Training Video`,
        type: "video",
        url: `/videos/${courseId}/m${moduleNo}-1.mp4`,
        completed: false,
      },
      {
        id: `${courseId}-m${moduleNo}-t1`,
        title: "Key Points (Notes)",
        type: "text",
        content: `# ${courseTitle} — Module ${moduleNo}\n\n## Key Points\n- Add module notes here.\n`,
        completed: false,
      },
    ];

    return {
      id: `${courseId}-m${moduleNo}`,
      title: `Module ${moduleNo}`,
      lessons,
    };
  });

  // ✅ Add locked final assessment at end
  return appendFinalAssessment(courseId, courseTitle, modules);
}

/* =========================
   VITAL INFRASTRUCTURE (AESTHETIC)
========================= */

function generateVitalInfrastructureModules(courseId: string, courseTitle: string): Module[] {
  const moduleTitles = [
    "Introduction & Importance (11.1–11.2)",
    "Categories of Vital Infrastructure (11.3)",
    "Identifying Infrastructure Components (11.4)",
    "Methods of Identification (11.5)",
    "Threat Matrix & Vulnerability Assessment (11.6)",
    "Infrastructure Mapping Techniques (11.7)",
    "CIPI + Prioritization + ATA Program (11.8–11.9)",
    "Tech Tools + Challenges (11.10–11.11)",
  ];

  const notes: string[] = [
    `
# Chapter 1 — Identifying Vital Infrastructure
## Module 1 — Introduction & Importance

### Definition
**Vital / Critical Infrastructure** = essential **systems, assets, and networks** required for society + economy to function.

### Importance
Supports core services:
- Electricity / energy
- Water supply & sanitation
- Transportation (roads, bridges, airports, rail)
- Telecommunications / data connectivity
- Emergency response

### Impact of disruption
Damage/disruption can cause:
- National security risk
- Public health emergencies
- Economic instability
- Breakdown of public services

### Vulnerability examples
**Cyber-attack:** power grid attack → electricity stops → hospitals, business, emergency services affected.  
**Natural disaster:** water treatment damage → water shortage → disease outbreaks & public health crisis.

### Field mindset (SSU)
**Identify → Assess → Prioritize → Protect**
`.trim(),

    `
# Module 2 — Categories of Vital Infrastructure (11.3)

## Common Categories
| Category | Examples |
|---|---|
| Energy | Power plants, oil refineries, substations |
| Water & Sanitation | Treatment plants, pipelines, reservoirs |
| Communication | Data centers, towers, critical cables |
| Transport | Roads, bridges, ports, airports, railways |
| Health Services | Hospitals, emergency care centers |
| Finance | Banks, stock exchanges, central databases |
| Government | Admin centers, critical HQs |

## Key takeaway
One category failing can **cascade** into others (e.g., power failure → telecom + hospitals + transport).

✅ **Task:** In your city/area, list **2 examples per category**.
`.trim(),

    `
# Module 3 — Identifying Critical Infrastructure & Components (11.4)

## What you identify (3 layers)
1) **Sector** (Energy / Water / Transport)  
2) **Asset** (Airport / Hospital / Substation)  
3) **Critical components** (control room, feeders, servers, pumps, gates)

## Quick Checklist
- What service does it provide?
- Who depends on it (public / govt / operations)?
- What happens if it stops (1 hour / 24 hours)?
- Redundancy exists or single point of failure?

## Output (what trainee should produce)
- Asset name + location
- Sector category
- Key components
- Dependency notes
- Risk notes (physical / cyber / natural)
`.trim(),

    `
# Module 4 — Methods of Identification (11.5)

## 1) Visual Indicators (Ground / Aerial)
Look for:
- Fenced perimeters, warning signage
- Heavy secured movement + restricted zones
- Antennas, satellite dishes, cooling towers
- Hardened / reinforced structures

## 2) Reconnaissance / Surveillance
- Observe access roads, chokepoints, patrol routines
- CCTV, barriers, guard posts, lighting
- UAV imagery / thermal optics (where applicable)

## 3) GIS + Satellite Analysis
- Layer population density + utility grids + known sites
- Track change over time (construction / expansion)

## 4) HUMINT + OSINT
- HUMINT: local sources, field reports
- OSINT: maps, news, public databases

✅ **Drill:** Choose one asset and write:
- 5 visual indicators
- 3 OSINT sources
- 2 likely entry points
`.trim(),

    `
# Module 5 — Threat Matrix & Vulnerability Assessment (11.6)

## Threat Matrix (concept)
Maps **Threat type → Likelihood → Impact** to prioritize protection.

### Sample matrix
| Infrastructure | Physical | Cyber | Natural | Civil Unrest |
|---|---:|---:|---:|---:|
| Power Grid | High | Medium | High | Low |
| Hospital | Medium | Medium | High | Medium |
| Data Center | Medium | High | Medium | Medium |
| Airport | High | Medium | High | High |
| Water Plant | High | Medium | High | Low |

## Vulnerability Assessment (simple steps)
1) Identify asset & components  
2) Identify weaknesses (access, cyber exposure, lack of redundancy)  
3) Rate risk (Low/Med/High)  
4) Recommend controls (guards, CCTV, access control, cyber hardening)

✅ **Output template**
- Asset:
- Threats:
- Weak points:
- Risk rating:
- Recommended measures:
`.trim(),

    `
# Module 6 — Infrastructure Mapping Techniques (11.7)

## Why mapping matters
Shows:
- Asset locations
- Dependencies (how systems connect)
- High-risk zones during crisis

## Common mapping techniques
- GIS layers (population + roads + utilities)
- Buffer zones (e.g., 500m / 1km radius)
- Critical node mapping (single points of failure)
- Access route mapping (entry/exit routes, chokepoints)

✅ **Exercise:** Map 1 critical site and mark:
- Primary access route
- Alternate route
- Crowd hotspots
- Nearby medical facility
`.trim(),

    `
# Module 7 — CIPI + Prioritization + ATA Program (11.8–11.9)

## CIPI (Critical Infrastructure Priority Index)
Ranks assets by importance to:
- National security
- Public health & safety
- Economy
- Governance continuity

### Simple tiers
- **Tier 1:** Nationally critical (catastrophic if disrupted)
- **Tier 2:** Regionally critical (major disruption across regions)
- **Tier 3:** Locally critical (important for local services)

✅ **Practical:** Classify these (Tier + 2-line justification):
- Airport
- Water plant
- Local police station
`.trim(),

    `
# Module 8 — Technological Tools + Challenges (11.10–11.11)

## Tools
### IoT & Smart Sensors
- Structural health monitoring (pressure/temp/vibration)
- Fault detection in power/water systems

### AI / Machine Learning
- Predict failures
- Detect anomalies
- Risk scoring for prioritization

### UAVs / Drones
- Inspection of bridges/towers/remote sites
- Post-disaster assessment

### BIM + Cyber Mapping
- Digital asset models
- Monitor SCADA/data centers where applicable

## Challenges
- Classification complexity (what counts as vital?)
- Evolving threats (cyber + terrorism + climate)
- Interdependence (one failure triggers others)
- Limited visibility/access in some areas

✅ Final takeaway: **Identify → Map → Assess → Prioritize → Protect**
`.trim(),
  ];

  const modules: Module[] = moduleTitles.map((title, idx) => {
    const moduleNo = idx + 1;

    const lessons: Lesson[] = [
      {
        id: `${courseId}-m${moduleNo}-v1`,
        title: `Module ${moduleNo} — Training Video`,
        type: "video",
        url: `/videos/${courseId}/m${moduleNo}-1.mp4`,
        completed: false,
      },
      {
        id: `${courseId}-m${moduleNo}-t1`,
        title: "Key Points (Notes)",
        type: "text",
        content: notes[idx] || `# ${courseTitle} — Module ${moduleNo}\n\n## Key Points\n- Add notes here.\n`,
        completed: false,
      },
    ];

    return {
      id: `${courseId}-m${moduleNo}`,
      title: `Module ${moduleNo} — ${title}`,
      lessons,
    };
  });

  // ✅ Add locked final assessment at end
  return appendFinalAssessment(courseId, courseTitle, modules);
}

/* =========================
   COURSES LIST
========================= */

export const courses: Course[] = [
  {
    id: "identify-vital-infrastructure",
    title: "Identify Vital Infrastructure",
    description:
      "Learn to identify and assess critical infrastructure components that require protection in security operations.",
    level: "Beginner",
    category: "FUNDAMENTALS",
    duration: "4 weeks",
    modules: 8,
    progress: 0,
    modulesList: generateVitalInfrastructureModules("identify-vital-infrastructure", "Identify Vital Infrastructure"),
  },

  {
    id: "motorcade-planning",
    title: "Motorcade Planning & Execution",
    description: "Master planning and execution of secure motorcade operations for high-value principals.",
    level: "Advanced",
    category: "OPERATIONS",
    duration: "6 weeks",
    modules: 12,
    progress: 0,
    modulesList: generateModules("motorcade-planning", "Motorcade Planning & Execution", 12),
  },
  {
    id: "attack-on-motorcade",
    title: "Attack on Motorcade: Countermeasures",
    description: "Recognize threats and apply countermeasures during motorcade operations.",
    level: "Advanced",
    category: "TACTICAL",
    duration: "5 weeks",
    modules: 10,
    progress: 10,
    modulesList: generateModules("attack-on-motorcade", "Attack on Motorcade Countermeasures", 10),
  },
  {
    id: "rings-of-security",
    title: "Rings of Security (Inner, Middle, Outer)",
    description: "Understand layered security perimeters for comprehensive principal protection.",
    level: "Intermediate",
    category: "STRATEGY",
    duration: "4 weeks",
    modules: 9,
    progress: 0,
    modulesList: generateModules("rings-of-security", "Rings of Security", 9),
  },
  {
    id: "weapons-basic-advanced",
    title: "Weapons (Basic & Advance)",
    description: "Comprehensive training on weapon systems, maintenance, and tactical usage.",
    level: "Intermediate",
    category: "FIREARMS",
    duration: "8 weeks",
    modules: 15,
    progress: 0,
    modulesList: generateModules("weapons-basic-advanced", "Weapons Basic and Advance", 15),
  },
  {
    id: "introduction-to-pistol",
    title: "Introduction to Pistol",
    description: "Foundational pistol training covering safety, handling, and marksmanship.",
    level: "Beginner",
    category: "FIREARMS",
    duration: "3 weeks",
    modules: 6,
    progress: 0,
    modulesList: generateModules("introduction-to-pistol", "Introduction to Pistol", 6),
  },
  {
    id: "pistol-techniques-live-fire",
    title: "Pistol Techniques Live Fire",
    description: "Advanced live-fire pistol training focusing on accuracy and tactical response.",
    level: "Advanced",
    category: "FIREARMS",
    duration: "4 weeks",
    modules: 8,
    progress: 0,
    modulesList: generateModules("pistol-techniques-live-fire", "Pistol Techniques Live Fire", 8),
  },
  {
    id: "shoulder-weapon-intro",
    title: "Introduction to Shoulder Weapon",
    description: "Fundamental rifle and carbine training for protective security.",
    level: "Intermediate",
    category: "FIREARMS",
    duration: "4 weeks",
    modules: 7,
    progress: 0,
    modulesList: generateModules("shoulder-weapon-intro", "Introduction to Shoulder Weapon", 7),
  },
  {
    id: "shoulder-weapon-live-fire",
    title: "Shoulder Weapon Technique Live Fire",
    description: "Advanced live-fire shoulder weapon techniques in dynamic scenarios.",
    level: "Advanced",
    category: "FIREARMS", // ✅ fixed typo
    duration: "5 weeks",
    modules: 9,
    progress: 0,
    modulesList: generateModules("shoulder-weapon-live-fire", "Shoulder Weapon Technique Live Fire", 9),
  },
  {
    id: "attack-on-principal",
    title: "Attack on Principal Response Protocol",
    description: "Immediate action drills and response protocols during principal attacks.",
    level: "Advanced",
    category: "TACTICAL",
    duration: "6 weeks",
    modules: 11,
    progress: 0,
    modulesList: generateModules("attack-on-principal", "Attack on Principal Response Protocol", 11),
  },
  {
    id: "blue-book-security",
    title: "Blue Book (Venue) Security Assessment",
    description: "Venue security assessment methodologies and documentation procedures.",
    level: "Intermediate",
    category: "OPERATIONS",
    duration: "5 weeks",
    modules: 10,
    progress: 0,
    modulesList: generateModules("blue-book-security", "Blue Book Venue Security Assessment", 10),
  },
  {
    id: "tactical-radio",
    title: "Tactical Radio Communication",
    description: "Secure and effective radio communication protocols for operations.",
    level: "Beginner",
    category: "COMMUNICATIONS",
    duration: "3 weeks",
    modules: 6,
    progress: 0,
    modulesList: generateModules("tactical-radio", "Tactical Radio Communication", 6),
  },
  {
    id: "psd-organisation",
    title: "Organisation of Protective Security Detail (PSD)",
    description: "Structure, roles, and coordination of protective security details.",
    level: "Intermediate",
    category: "STRATEGY",
    duration: "5 weeks",
    modules: 9,
    progress: 0,
    modulesList: generateModules("psd-organisation", "Organisation of PSD", 9),
  },
  {
    id: "ied-search",
    title: "Vehicle / Building Search for IED",
    description: "Systematic vehicle and building search procedures for IED detection.",
    level: "Advanced",
    category: "TACTICAL",
    duration: "4 weeks",
    modules: 8,
    progress: 0,
    modulesList: generateModules("ied-search", "Vehicle Building Search for IED", 8),
  },
  {
    id: "advanced-motor-driving",
    title: "Advanced Motor Driving",
    description: "Defensive and evasive driving techniques for protective security.",
    level: "Advanced",
    category: "OPERATIONS",
    duration: "6 weeks",
    modules: 12,
    progress: 0,
    modulesList: generateModules("advanced-motor-driving", "Advanced Motor Driving", 12),
  },
  {
    id: "martial-art-close-protection",
    title: "Martial Art (Close Protection Focus)",
    description: "Specialized martial arts training for close protection scenarios.",
    level: "Intermediate",
    category: "PHYSICAL",
    duration: "8 weeks",
    modules: 14,
    progress: 0,
    modulesList: generateModules("martial-art-close-protection", "Martial Art Close Protection", 14),
  },
  {
    id: "cybersecurity-protective",
    title: "Cybersecurity for Protective Professionals",
    description: "Essential cybersecurity knowledge for modern protective specialists.",
    level: "Intermediate",
    category: "TECHNOLOGY",
    duration: "5 weeks",
    modules: 10,
    progress: 0,
    modulesList: generateModules("cybersecurity-protective", "Cybersecurity for Protective Professionals", 10),
  },
];
