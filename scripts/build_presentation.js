const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// 17 Infographic Slides Data
const SLIDES = [
  {
    num: 1,
    title: "SkillShift Platform",
    subtitle: "Adaptive Job-Matching & Concept Drift Detection Platform",
    category: "Title Slide",
    bullets: [
      "Solving the ATS Stale Penalty for Modern Tech Labor Markets",
      "Dual-Model Evaluation (2021 Historical Baseline vs. 2024 Adapted Model)",
      "Real-Time Out-of-Distribution (OOD) Vocabulary Emergence Monitoring"
    ],
    kpiCallout: "SkillShift v1.0",
    kpiLabel: "Production Platform"
  },
  {
    num: 2,
    title: "Executive Summary & Paradigm Shift",
    subtitle: "Generative AI & Modern Stack Evolution (2021 – 2026)",
    category: "Market Context",
    bullets: [
      "2021 Baseline: Monolithic Java/R/Hadoop stacks dominate traditional ATS training sets.",
      "2024 Shift: Explosion of LLMs, LangChain, RAG, Vector DBs, Next.js 14, and Tailwind CSS.",
      "The Disconnect: Qualified modern candidates suffer false negative ATS rejections due to legacy dictionary baselines.",
      "SkillShift Value: Automates dynamic vocabulary expansion and eliminates stale penalty scores."
    ],
    kpiCallout: "+310%",
    kpiLabel: "GenAI Skill Growth"
  },
  {
    num: 3,
    title: "The 'ATS Stale Penalty' Problem",
    subtitle: "Quantifying Semantic Divergence & Candidate Deflation",
    category: "Problem Analysis",
    bullets: [
      "Stale Model Deflation: Modern candidates flagged as Out-of-Distribution (OOD) noise receive scores <30%.",
      "Vocabulary Degradation: Static ATS dictionaries decay by ~15-20% annually in fast-moving tech domains.",
      "Distorted Pipelines: Talent acquisition teams miss top 5% modern engineering talent.",
      "Empirical Evidence: 37.5% of modern candidate rejections are algorithmic false negatives."
    ],
    kpiCallout: "-48.5%",
    kpiLabel: "Average Score Deflation"
  },
  {
    num: 4,
    title: "The SkillShift Dual-Model Solution",
    subtitle: "Side-by-Side Diagnostic & Dynamic Assimilation",
    category: "Core Architecture",
    bullets: [
      "Stale Model (2021): Evaluates candidates strictly against historical keyword/vector baselines.",
      "Adapted Model (2024): Dynamically incorporates emergent OOD tokens and semantic clusters.",
      "Diagnostic Delta: Quantifies score recovery (e.g., 28% Stale → 94% Adapted = +66% Recovery).",
      "Zero Downtime: Continuous baseline vocabulary updating without full model re-training."
    ],
    kpiCallout: "+66.4%",
    kpiLabel: "Average Score Recovery"
  },
  {
    num: 5,
    title: "End-to-End System Architecture",
    subtitle: "Modular Multi-Tier Platform Topology",
    category: "System Design",
    bullets: [
      "Data Layer: Ingests historical (2021 Kaggle DataScientist) & modern (2023-2024 LinkedIn Jobs) corpora.",
      "ML Pipeline: SentenceTransformers encoder, IsolationForest detector, NetworkX co-occurrence graph.",
      "Backend Service: FastAPI REST API (Port 8000/8001) with multipart file parsing & SQLite audit logging.",
      "Presentation Layer: Glassmorphic React 19 + Vite frontend and Streamlit alternative UI."
    ],
    kpiCallout: "4 Tiers",
    kpiLabel: "Decoupled Architecture"
  },
  {
    num: 6,
    title: "Machine Learning: Semantic Embeddings",
    subtitle: "Dense Vector Representations & Hybrid Fallback",
    category: "ML Deep Dive",
    bullets: [
      "Primary Encoder: sentence-transformers/all-MiniLM-L6-v2 mapping text to 384-dimensional dense vectors.",
      "Cosine Similarity: Computes semantic alignment between job requirements and candidate profiles.",
      "Lightweight Fallback: Custom Subword Hash-Based Semantic Encoder for zero-dependency offline resilience.",
      "High-Throughput: Vector similarity computation executed in <15ms per candidate profile."
    ],
    kpiCallout: "384-Dim",
    kpiLabel: "Dense Embedding Vectors"
  },
  {
    num: 7,
    title: "Concept Drift: Isolation Forest Detector",
    subtitle: "Out-of-Distribution (OOD) Emergence Identification",
    category: "Anomaly Detection",
    bullets: [
      "Algorithm: sklearn.ensemble.IsolationForest with 5% contamination factor.",
      "Baseline Fitting: Trained on historical baseline embedding space to map standard vocabulary boundaries.",
      "Anomaly Scoring: Isolates novel technical phrases (e.g., LangChain, LoRA, vLLM) as OOD signals.",
      "Automatic Assimilation: Accepted OOD signals trigger dynamic graph node creation."
    ],
    kpiCallout: "5%",
    kpiLabel: "Contamination Factor"
  },
  {
    num: 8,
    title: "Knowledge Graph Dynamics",
    subtitle: "NetworkX & Vis.js Force-Directed Co-Occurrence",
    category: "Graph Analytics",
    bullets: [
      "Graph Modeling: NetworkX weighted undirected graph mapping skill co-occurrences in job postings.",
      "Inter-Domain Bridges: Reveals emergence of cross-category nodes (e.g., Python ↔ LangChain ↔ Vector DBs).",
      "Interactive UI: Physics-enabled force-directed visualization (Vis.js) with cluster color-coding.",
      "Cluster Categories: Generative AI, Data Science, Deep Learning, MLOps, Modern Web, Legacy Stacks."
    ],
    kpiCallout: "1,420+",
    kpiLabel: "Active Skill Bridges"
  },
  {
    num: 9,
    title: "Temporal Vocabulary Adaptation",
    subtitle: "Mathematical Model Normalization & Centroid Shift",
    category: "Mathematical Formulation",
    bullets: [
      "Baseline Vocab expansion: Base_Vocab(t+1) = Base_Vocab(t) U Accepted_OOD_Skills.",
      "Centroid Calculation: Profile vectors normalized to eliminate structural penalty on non-legacy candidates.",
      "Reverse Drift Penalty: Detects legacy tools (Hadoop, SVN, SOAP) declining in contemporary role specs.",
      "Greedy Tokenization: Longest-match multi-token regex parser for phrases like 'RAG Architecture'."
    ],
    kpiCallout: "100+",
    kpiLabel: "Ontology Entities"
  },
  {
    num: 10,
    title: "Platform Module 1: Executive Dashboard",
    subtitle: "Real-Time Observability & Timeline Playback",
    category: "User Interface",
    bullets: [
      "KPI Cards: Active tracking of 148,200+ job postings, +36.3% vocabulary growth, 480+ OOD skills.",
      "Interactive Timeline: Playable 2022–2025 timeline slider demonstrating month-by-month vocabulary expansion.",
      "Visual Analytics: Area charts for cumulative vocabulary inflow & bar charts for monthly surge events.",
      "Domain Breakdown: Shift intensity metrics across GenAI, MLOps, Modern Web, and Classical Data Science."
    ],
    kpiCallout: "Live",
    kpiLabel: "Observability"
  },
  {
    num: 11,
    title: "Platform Module 2: Matcher & Roadmap Studio",
    subtitle: "Candidate Diagnostic & Personalized AI Learning Track",
    category: "Student Portal",
    bullets: [
      "Dual-Score Cards: Direct comparison of Stale Score vs. Adapted Score with explicit penalty rationale.",
      "File Uploader: Drag & drop uploader for PDF, DOCX, TXT resumes with client/server parsing.",
      "Skill Matrix: Color-coded breakdown of Flagged OOD Skills vs. Recognized Baseline Core.",
      "AI Learning Roadmap: 4-stage step-by-step learning track for missing modern skills with verified resources."
    ],
    kpiCallout: "4 Stages",
    kpiLabel: "AI Roadmap Track"
  },
  {
    num: 12,
    title: "Platform Module 3: ATS Batch Screening",
    subtitle: "False Negative Leaderboard & Recruiter Intelligence",
    category: "Recruiter Portal",
    bullets: [
      "Batch Ingestion: Ingest and screen 1 to 50+ candidate resumes simultaneously.",
      "Rank Shift Audit: Highlights rank shifts (e.g., #7 Legacy Rank → #1 Adapted Rank).",
      "False Negative Rescuer: Identifies and flags top-tier candidates falsely rejected by legacy ATS.",
      "Audit CSV Export: One-click export of complete candidate cohort screening metrics."
    ],
    kpiCallout: "37.5%",
    kpiLabel: "False Negatives Recovered"
  },
  {
    num: 13,
    title: "Platform Module 4: JD Drift Auditor",
    subtitle: "Job Description Optimization & Reach Maximization",
    category: "Recruiter Portal",
    bullets: [
      "Modernity Score: Audits company job specifications for obsolete keywords (Hadoop, SVN, Weka, Java 8).",
      "Reach Penalty Metric: Quantifies lost candidate reach (e.g., '-68% Modern Candidate Reach').",
      "Suggested Replacements: Maps legacy tools to modern cloud/AI alternatives (SVN → Git/CI-CD).",
      "AI Spec Optimizer: One-click generation and copying of modernized, candidate-optimized job descriptions."
    ],
    kpiCallout: "96/100",
    kpiLabel: "Optimized Reach Score"
  },
  {
    num: 14,
    title: "Market Demand & Company Explorer",
    subtitle: "Enterprise Hiring Demand & Tech Stack Benchmarking",
    category: "Market Intelligence",
    bullets: [
      "Tier 1 Enterprise Coverage: Databricks, OpenAI, Anthropic, Scale AI, Snowflake, Stripe, Mistral AI, Microsoft.",
      "Tech Stack Intelligence: Maps required baseline skills vs. emerging OOD skills by hiring company.",
      "Role Matching: Computes candidate alignment % against active company hiring profiles.",
      "Salary & Urgency Insights: Tracks salary bands ($165k–$310k) and hiring urgency levels."
    ],
    kpiCallout: "8 Giants",
    kpiLabel: "Benchmark Companies"
  },
  {
    num: 15,
    title: "Backend API & Database Persistence",
    subtitle: "FastAPI REST Microservice & Embedded SQLite Store",
    category: "Backend Engineering",
    bullets: [
      "FastAPI REST Router: Dual-port probing (8000/8001) with CORS middleware and Pydantic validation.",
      "Multipart Parser: High-speed server-side document extraction for PDF, DOCX, and plain text.",
      "SQLite Persistence: Auto-created database (`skillshift.db`) logging screening runs and JD audits.",
      "Audit History CRUD: Endpoints for historical screening run retrieval and audit log inspection."
    ],
    kpiCallout: "SQLite",
    kpiLabel: "Audit Log Storage"
  },
  {
    num: 16,
    title: "Empirical Benchmark Results",
    subtitle: "Quantitative Performance & Verification Metrics",
    category: "Results & Evaluation",
    bullets: [
      "Score Recovery: Modern candidates achieve average +66.4% score recovery under adapted evaluation.",
      "False Negative Rescue: Successfully identifies 37.5% of high-fit candidates discarded by legacy ATS.",
      "JD Optimization: Upgrading job descriptions boosts modern applicant reach by up to +68%.",
      "API Latency: Average endpoint response time <45ms (FastAPI) and graph render <120ms (Vis.js)."
    ],
    kpiCallout: "<45ms",
    kpiLabel: "API Response Latency"
  },
  {
    num: 17,
    title: "Deployment & Future Vision",
    subtitle: "Zero-Crash Fallback, Agentic Graphs & MCP Protocol",
    category: "Future Roadmap",
    bullets: [
      "Offline Resilience: Instant seamless fallback to hash encoders & mock datasets when offline.",
      "Quickstart Deployment: Simple `pip install -r requirements.txt` & `npm run dev` startup.",
      "Agentic Integration: Expansion towards LangGraph multi-agent graph workflows & CrewAI.",
      "MCP Protocol: Integrating Model Context Protocol (MCP) tool bindings for enterprise AI assistants."
    ],
    kpiCallout: "v2.0",
    kpiLabel: "Agentic & MCP Vision"
  }
];

// Helper: Calculate CRC32 checksum for ZIP headers
function crc32(buf) {
  let c = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ crc32Table[(c ^ buf[i]) & 0xFF];
  }
  return (c ^ (-1)) >>> 0;
}

const crc32Table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crc32Table[i] = c;
}

// Simple ZIP Archive Creator
function createZipBuffer(fileEntries) {
  const localHeaders = [];
  const centralDirs = [];
  let currentOffset = 0;

  for (const entry of fileEntries) {
    const filenameBuf = Buffer.from(entry.name, 'utf8');
    const uncompressedData = Buffer.from(entry.content);
    const uncompressedSize = uncompressedData.length;
    const crc = crc32(uncompressedData);

    let compressedData = uncompressedData;
    let method = 0; // Stored (no compression) by default for mimetype

    if (entry.compress !== false) {
      compressedData = zlib.deflateRawSync(uncompressedData);
      method = 8; // Deflated
    }
    const compressedSize = compressedData.length;

    // Local file header (30 bytes + filename + data)
    const localHeader = Buffer.alloc(30 + filenameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // Signature
    localHeader.writeUInt16LE(20, 4);         // Version needed
    localHeader.writeUInt16LE(0, 6);          // General flag
    localHeader.writeUInt16LE(method, 8);     // Compression method
    localHeader.writeUInt16LE(0, 10);         // Last mod time
    localHeader.writeUInt16LE(0, 12);         // Last mod date
    localHeader.writeUInt32LE(crc, 14);       // CRC32
    localHeader.writeUInt32LE(compressedSize, 18);
    localHeader.writeUInt32LE(uncompressedSize, 22);
    localHeader.writeUInt16LE(filenameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);         // Extra field length
    filenameBuf.copy(localHeader, 30);

    const localChunk = Buffer.concat([localHeader, compressedData]);
    localHeaders.push(localChunk);

    // Central Directory Header (46 bytes + filename)
    const cdHeader = Buffer.alloc(46 + filenameBuf.length);
    cdHeader.writeUInt32LE(0x02014b50, 0);   // Signature
    cdHeader.writeUInt16LE(20, 4);           // Version made by
    cdHeader.writeUInt16LE(20, 6);           // Version needed
    cdHeader.writeUInt16LE(0, 8);            // General flag
    cdHeader.writeUInt16LE(method, 10);      // Compression method
    cdHeader.writeUInt16LE(0, 12);           // Last mod time
    cdHeader.writeUInt16LE(0, 14);           // Last mod date
    cdHeader.writeUInt32LE(crc, 16);         // CRC32
    cdHeader.writeUInt32LE(compressedSize, 20);
    cdHeader.writeUInt32LE(uncompressedSize, 24);
    cdHeader.writeUInt16LE(filenameBuf.length, 28);
    cdHeader.writeUInt16LE(0, 30);           // Extra field length
    cdHeader.writeUInt16LE(0, 32);           // File comment length
    cdHeader.writeUInt16LE(0, 34);           // Disk number start
    cdHeader.writeUInt16LE(0, 36);           // Internal attributes
    cdHeader.writeUInt32LE(0, 38);           // External attributes
    cdHeader.writeUInt32LE(currentOffset, 42); // Relative offset of local header
    filenameBuf.copy(cdHeader, 46);

    centralDirs.push(cdHeader);
    currentOffset += localChunk.length;
  }

  const allLocalBuf = Buffer.concat(localHeaders);
  const allCdBuf = Buffer.concat(centralDirs);

  // End of Central Directory Record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);          // EOCD Signature
  eocd.writeUInt16LE(0, 4);                   // Disk number
  eocd.writeUInt16LE(0, 6);                   // Disk where CD starts
  eocd.writeUInt16LE(centralDirs.length, 8);  // Number of CD records on disk
  eocd.writeUInt16LE(centralDirs.length, 10); // Total CD records
  eocd.writeUInt32LE(allCdBuf.length, 12);    // Size of central directory
  eocd.writeUInt32LE(allLocalBuf.length, 16); // Offset of start of CD
  eocd.writeUInt16LE(0, 20);                  // Comment length

  return Buffer.concat([allLocalBuf, allCdBuf, eocd]);
}

// Build PowerPoint PPTX
function buildPPTX() {
  const entries = [];
  
  let typesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>`;
  
  let presXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldIdLst>`;
  
  let presRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`;

  SLIDES.forEach((s, idx) => {
    const slideNum = idx + 1;
    typesXml += `<Override PartName="/ppt/slides/slide${slideNum}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
    presXml += `<p:sldId id="${255 + slideNum}" r:id="rId${slideNum}"/>`;
    presRels += `<Relationship Id="rId${slideNum}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${slideNum}.xml"/>`;
    
    const bulletsText = s.bullets.map(b => `• ${b}`).join(' ');
    const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:grpSpPr/></p:nvGrpSpPr>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/><a:lstStyle/>
          <a:p><a:r><a:t>${s.category.toUpperCase()}: ${s.title}</a:t></a:r></a:p>
          <a:p><a:r><a:t>${s.subtitle}</a:t></a:r></a:p>
          <a:p><a:r><a:t>${bulletsText}</a:t></a:r></a:p>
          <a:p><a:r><a:t>KPI: ${s.kpiCallout} - ${s.kpiLabel} (Slide ${slideNum} of 17)</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

    entries.push({ name: `ppt/slides/slide${slideNum}.xml`, content: slideXml });
  });

  typesXml += `</Types>`;
  presXml += `</p:sldIdLst></p:presentation>`;
  presRels += `</Relationships>`;

  entries.push({ name: '[Content_Types].xml', content: typesXml });
  entries.push({ name: '_rels/.rels', content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>` });
  entries.push({ name: 'ppt/presentation.xml', content: presXml });
  entries.push({ name: 'ppt/_rels/presentation.xml.rels', content: presRels });

  return createZipBuffer(entries);
}

// Build OpenDocument ODF / ODP
function buildODF() {
  const entries = [];

  // mimetype must be uncompressed first entry
  entries.push({
    name: 'mimetype',
    content: 'application/vnd.oasis.opendocument.presentation',
    compress: false
  });

  entries.push({
    name: 'META-INF/manifest.xml',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.presentation"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`
  });

  entries.push({
    name: 'meta.xml',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" office:version="1.2">
  <office:meta>
    <dc:title>SkillShift Presentation</dc:title>
    <dc:description>Adaptive Job-Matching & Concept Drift Detection Platform</dc:description>
    <dc:creator>SkillShift ML Team</dc:creator>
  </office:meta>
</office:document-meta>`
  });

  entries.push({
    name: 'styles.xml',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" office:version="1.2">
  <office:styles>
    <style:style style:name="Default" style:family="presentation"/>
  </office:styles>
</office:document-styles>`
  });

  let slidesXml = '';
  SLIDES.forEach(s => {
    const bulletsXml = s.bullets.map(b => `<text:p text:style-name="P2">•  ${b}</text:p>`).join('');
    slidesXml += `
      <draw:page draw:name="Slide_${s.num}" draw:master-page-name="Default">
        <draw:frame draw:style-name="gr1" svg:width="25cm" svg:height="3cm" svg:x="2cm" svg:y="1.5cm">
          <draw:text-box>
            <text:p text:style-name="HeaderCategory">${s.category.toUpperCase()}</text:p>
            <text:h text:style-name="TitleStyle" text:outline-level="1">${s.title}</text:h>
            <text:p text:style-name="SubTitleStyle">${s.subtitle}</text:p>
          </draw:text-box>
        </draw:frame>
        <draw:frame draw:style-name="gr2" svg:width="17cm" svg:height="11cm" svg:x="2cm" svg:y="5cm">
          <draw:text-box>
            ${bulletsXml}
          </draw:text-box>
        </draw:frame>
        <draw:frame draw:style-name="gr3" svg:width="6cm" svg:height="11cm" svg:x="20cm" svg:y="5cm">
          <draw:text-box>
            <text:h text:style-name="KpiCallout" text:outline-level="2">${s.kpiCallout}</text:h>
            <text:p text:style-name="KpiLabel">${s.kpiLabel}</text:p>
            <text:p text:style-name="SlideNum">Slide ${s.num} of 17</text:p>
          </draw:text-box>
        </draw:frame>
      </draw:page>`;
  });

  entries.push({
    name: 'content.xml',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" office:version="1.2">
  <office:automatic-styles>
    <style:style style:name="HeaderCategory" style:family="text"><style:text-properties fo:color="#38bdf8" fo:font-size="11pt" fo:font-weight="bold"/></style:style>
    <style:style style:name="TitleStyle" style:family="text"><style:text-properties fo:color="#0f172a" fo:font-size="24pt" fo:font-weight="bold"/></style:style>
    <style:style style:name="SubTitleStyle" style:family="text"><style:text-properties fo:color="#64748b" fo:font-size="13pt"/></style:style>
    <style:style style:name="P2" style:family="text"><style:text-properties fo:color="#1e293b" fo:font-size="14pt"/></style:style>
    <style:style style:name="KpiCallout" style:family="text"><style:text-properties fo:color="#0284c7" fo:font-size="32pt" fo:font-weight="bold"/></style:style>
    <style:style style:name="KpiLabel" style:family="text"><style:text-properties fo:color="#334155" fo:font-size="12pt" fo:font-weight="bold"/></style:style>
    <style:style style:name="SlideNum" style:family="text"><style:text-properties fo:color="#94a3b8" fo:font-size="10pt"/></style:style>
  </office:automatic-styles>
  <office:body>
    <office:presentation>
      ${slidesXml}
    </office:presentation>
  </office:body>
</office:document-content>`
  });

  return createZipBuffer(entries);
}

// Generate files directly
const rootDir = path.dirname(__dirname);
const pptxPath = path.join(rootDir, 'SkillShift_Presentation.pptx');
const odfPath = path.join(rootDir, 'SkillShift_Presentation.odf');
const odpPath = path.join(rootDir, 'SkillShift_Presentation.odp');

console.log('Generating 17-slide SkillShift Presentation files...');
const pptxBuf = buildPPTX();
fs.writeFileSync(pptxPath, pptxBuf);
console.log(`Saved PPTX: ${pptxPath} (${pptxBuf.length} bytes)`);

const odfBuf = buildODF();
fs.writeFileSync(odfPath, odfBuf);
console.log(`Saved ODF: ${odfPath} (${odfBuf.length} bytes)`);

fs.writeFileSync(odpPath, odfBuf);
console.log(`Saved ODP: ${odpPath} (${odfBuf.length} bytes)`);
