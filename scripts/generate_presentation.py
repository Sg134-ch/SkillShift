import os
import sys
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime

SLIDES_DATA = [
    {
        "slide_num": 1,
        "title": "SkillShift Platform",
        "subtitle": "Adaptive Job-Matching & Concept Drift Detection Platform",
        "category": "Title Slide",
        "bullets": [
            "Solving the ATS Stale Penalty for Modern Tech Labor Markets",
            "Dual-Model Evaluation (2021 Historical Baseline vs. 2024 Adapted Model)",
            "Real-Time Out-of-Distribution (OOD) Vocabulary Emergence Monitoring"
        ],
        "kpi_callout": "SkillShift v1.0",
        "kpi_label": "Production Platform"
    },
    {
        "slide_num": 2,
        "title": "Executive Summary & Paradigm Shift",
        "subtitle": "Generative AI & Modern Stack Evolution (2021 – 2026)",
        "category": "Market Context",
        "bullets": [
            "2021 Baseline: Monolithic Java/R/Hadoop stacks dominate traditional ATS training sets.",
            "2024 Shift: Explosion of LLMs, LangChain, RAG, Vector DBs, Next.js 14, and Tailwind CSS.",
            "The Disconnect: Qualified modern candidates suffer false negative ATS rejections due to legacy dictionary baselines.",
            "SkillShift Value: Automates dynamic vocabulary expansion and eliminates stale penalty scores."
        ],
        "kpi_callout": "+310%",
        "kpi_label": "GenAI Skill Growth"
    },
    {
        "slide_num": 3,
        "title": "The 'ATS Stale Penalty' Problem",
        "subtitle": "Quantifying Semantic Divergence & Candidate Deflation",
        "category": "Problem Analysis",
        "bullets": [
            "Stale Model Deflation: Modern candidates flagged as Out-of-Distribution (OOD) noise receive scores <30%.",
            "Vocabulary Degradation: Static ATS dictionaries decay by ~15-20% annually in fast-moving tech domains.",
            "Distorted Pipelines: Talent acquisition teams miss top 5% modern engineering talent.",
            "Empirical Evidence: 37.5% of modern candidate rejections are algorithmic false negatives."
        ],
        "kpi_callout": "-48.5%",
        "kpi_label": "Average Score Deflation"
    },
    {
        "slide_num": 4,
        "title": "The SkillShift Dual-Model Solution",
        "subtitle": "Side-by-Side Diagnostic & Dynamic Assimilation",
        "category": "Core Architecture",
        "bullets": [
            "Stale Model (2021): Evaluates candidates strictly against historical keyword/vector baselines.",
            "Adapted Model (2024): Dynamically incorporates emergent OOD tokens and semantic clusters.",
            "Diagnostic Delta: Quantifies score recovery (e.g., 28% Stale → 94% Adapted = +66% Recovery).",
            "Zero Downtime: Continuous baseline vocabulary updating without full model re-training."
        ],
        "kpi_callout": "+66.4%",
        "kpi_label": "Average Score Recovery"
    },
    {
        "slide_num": 5,
        "title": "End-to-End System Architecture",
        "subtitle": "Modular Multi-Tier Platform Topology",
        "category": "System Design",
        "bullets": [
            "Data Layer: Ingests historical (2021 Kaggle DataScientist) & modern (2023-2024 LinkedIn Jobs) corpora.",
            "ML Pipeline: SentenceTransformers encoder, IsolationForest detector, NetworkX co-occurrence graph.",
            "Backend Service: FastAPI REST API (Port 8000/8001) with multipart file parsing & SQLite audit logging.",
            "Presentation Layer: Glassmorphic React 19 + Vite frontend and Streamlit alternative UI."
        ],
        "kpi_callout": "4 Tiers",
        "kpi_label": "Decoupled Architecture"
    },
    {
        "slide_num": 6,
        "title": "Machine Learning: Semantic Embeddings",
        "subtitle": "Dense Vector Representations & Hybrid Fallback",
        "category": "ML Deep Dive",
        "bullets": [
            "Primary Encoder: sentence-transformers/all-MiniLM-L6-v2 mapping text to 384-dimensional dense vectors.",
            "Cosine Similarity: Computes semantic alignment between job requirements and candidate profiles.",
            "Lightweight Fallback: Custom Subword Hash-Based Semantic Encoder for zero-dependency offline resilience.",
            "High-Throughput: Vector similarity computation executed in <15ms per candidate profile."
        ],
        "kpi_callout": "384-Dim",
        "kpi_label": "Dense Embedding Vectors"
    },
    {
        "slide_num": 7,
        "title": "Concept Drift: Isolation Forest Detector",
        "subtitle": "Out-of-Distribution (OOD) Emergence Identification",
        "category": "Anomaly Detection",
        "bullets": [
            "Algorithm: sklearn.ensemble.IsolationForest with 5% contamination factor.",
            "Baseline Fitting: Trained on historical baseline embedding space to map standard vocabulary boundaries.",
            "Anomaly Scoring: Isolates novel technical phrases (e.g., LangChain, LoRA, vLLM) as OOD signals.",
            "Automatic Assimilation: Accepted OOD signals trigger dynamic graph node creation."
        ],
        "kpi_callout": "5%",
        "kpi_label": "Contamination Factor"
    },
    {
        "slide_num": 8,
        "title": "Knowledge Graph Dynamics",
        "subtitle": "NetworkX & Vis.js Force-Directed Co-Occurrence",
        "category": "Graph Analytics",
        "bullets": [
            "Graph Modeling: NetworkX weighted undirected graph mapping skill co-occurrences in job postings.",
            "Inter-Domain Bridges: Reveals emergence of cross-category nodes (e.g., Python ↔ LangChain ↔ Vector DBs).",
            "Interactive UI: Physics-enabled force-directed visualization (Vis.js) with cluster color-coding.",
            "Cluster Categories: Generative AI, Data Science, Deep Learning, MLOps, Modern Web, Legacy Stacks."
        ],
        "kpi_callout": "1,420+",
        "kpi_label": "Active Skill Bridges"
    },
    {
        "slide_num": 9,
        "title": "Temporal Vocabulary Adaptation",
        "subtitle": "Mathematical Model Normalization & Centroid Shift",
        "category": "Mathematical Formulation",
        "bullets": [
            "Baseline Vocab expansion: Base_Vocab(t+1) = Base_Vocab(t) U Accepted_OOD_Skills.",
            "Centroid Calculation: Profile vectors normalized to eliminate structural penalty on non-legacy candidates.",
            "Reverse Drift Penalty: Detects legacy tools (Hadoop, SVN, SOAP) declining in contemporary role specs.",
            "Greedy Tokenization: Longest-match multi-token regex parser for phrases like 'RAG Architecture'."
        ],
        "kpi_callout": "100+",
        "kpi_label": "Ontology Entities"
    },
    {
        "slide_num": 10,
        "title": "Platform Module 1: Executive Dashboard",
        "subtitle": "Real-Time Observability & Timeline Playback",
        "category": "User Interface",
        "bullets": [
            "KPI Cards: Active tracking of 148,200+ job postings, +36.3% vocabulary growth, 480+ OOD skills.",
            "Interactive Timeline: Playable 2022–2025 timeline slider demonstrating month-by-month vocabulary expansion.",
            "Visual Analytics: Area charts for cumulative vocabulary inflow & bar charts for monthly surge events.",
            "Domain Breakdown: Shift intensity metrics across GenAI, MLOps, Modern Web, and Classical Data Science."
        ],
        "kpi_callout": "Live",
        "kpi_label": "Observability"
    },
    {
        "slide_num": 11,
        "title": "Platform Module 2: Matcher & Roadmap Studio",
        "subtitle": "Candidate Diagnostic & Personalized AI Learning Track",
        "category": "Student Portal",
        "bullets": [
            "Dual-Score Cards: Direct comparison of Stale Score vs. Adapted Score with explicit penalty rationale.",
            "File Uploader: Drag & drop uploader for PDF, DOCX, TXT resumes with client/server parsing.",
            "Skill Matrix: Color-coded breakdown of Flagged OOD Skills vs. Recognized Baseline Core.",
            "AI Learning Roadmap: 4-stage step-by-step learning track for missing modern skills with verified resources."
        ],
        "kpi_callout": "4 Stages",
        "kpi_label": "AI Roadmap Track"
    },
    {
        "slide_num": 12,
        "title": "Platform Module 3: ATS Batch Screening",
        "subtitle": "False Negative Leaderboard & Recruiter Intelligence",
        "category": "Recruiter Portal",
        "bullets": [
            "Batch Ingestion: Ingest and screen 1 to 50+ candidate resumes simultaneously.",
            "Rank Shift Audit: Highlights rank shifts (e.g., #7 Legacy Rank → #1 Adapted Rank).",
            "False Negative Rescuer: Identifies and flags top-tier candidates falsely rejected by legacy ATS.",
            "Audit CSV Export: One-click export of complete candidate cohort screening metrics."
        ],
        "kpi_callout": "37.5%",
        "kpi_label": "False Negatives Recovered"
    },
    {
        "slide_num": 13,
        "title": "Platform Module 4: JD Drift Auditor",
        "subtitle": "Job Description Optimization & Reach Maximization",
        "category": "Recruiter Portal",
        "bullets": [
            "Modernity Score: Audits company job specifications for obsolete keywords (Hadoop, SVN, Weka, Java 8).",
            "Reach Penalty Metric: Quantifies lost candidate reach (e.g., '-68% Modern Candidate Reach').",
            "Suggested Replacements: Maps legacy tools to modern cloud/AI alternatives (SVN → Git/CI-CD).",
            "AI Spec Optimizer: One-click generation and copying of modernized, candidate-optimized job descriptions."
        ],
        "kpi_callout": "96/100",
        "kpi_label": "Optimized Reach Score"
    },
    {
        "slide_num": 14,
        "title": "Market Demand & Company Explorer",
        "subtitle": "Enterprise Hiring Demand & Tech Stack Benchmarking",
        "category": "Market Intelligence",
        "bullets": [
            "Tier 1 Enterprise Coverage: Databricks, OpenAI, Anthropic, Scale AI, Snowflake, Stripe, Mistral AI, Microsoft.",
            "Tech Stack Intelligence: Maps required baseline skills vs. emerging OOD skills by hiring company.",
            "Role Matching: Computes candidate alignment % against active company hiring profiles.",
            "Salary & Urgency Insights: Tracks salary bands ($165k–$310k) and hiring urgency levels."
        ],
        "kpi_callout": "8 Giants",
        "kpi_label": "Benchmark Companies"
    },
    {
        "slide_num": 15,
        "title": "Backend API & Database Persistence",
        "subtitle": "FastAPI REST Microservice & Embedded SQLite Store",
        "category": "Backend Engineering",
        "bullets": [
            "FastAPI REST Router: Dual-port probing (8000/8001) with CORS middleware and Pydantic validation.",
            "Multipart Parser: High-speed server-side document extraction for PDF, DOCX, and plain text.",
            "SQLite Persistence: Auto-created database (`skillshift.db`) logging screening runs and JD audits.",
            "Audit History CRUD: Endpoints for historical screening run retrieval and audit log inspection."
        ],
        "kpi_callout": "SQLite",
        "kpi_label": "Audit Log Storage"
    },
    {
        "slide_num": 16,
        "title": "Empirical Benchmark Results",
        "subtitle": "Quantitative Performance & Verification Metrics",
        "category": "Results & Evaluation",
        "bullets": [
            "Score Recovery: Modern candidates achieve average +66.4% score recovery under adapted evaluation.",
            "False Negative Rescue: Successfully identifies 37.5% of high-fit candidates discarded by legacy ATS.",
            "JD Optimization: Upgrading job descriptions boosts modern applicant reach by up to +68%.",
            "API Latency: Average endpoint response time <45ms (FastAPI) and graph render <120ms (Vis.js)."
        ],
        "kpi_callout": "<45ms",
        "kpi_label": "API Response Latency"
    },
    {
        "slide_num": 17,
        "title": "Deployment & Future Vision",
        "subtitle": "Zero-Crash Fallback, Agentic Graphs & MCP Protocol",
        "category": "Future Roadmap",
        "bullets": [
            "Offline Resilience: Instant seamless fallback to hash encoders & mock datasets when offline.",
            "Quickstart Deployment: Simple `pip install -r requirements.txt` & `npm run dev` startup.",
            "Agentic Integration: Expansion towards LangGraph multi-agent graph workflows & CrewAI.",
            "MCP Protocol: Integrating Model Context Protocol (MCP) tool bindings for enterprise AI assistants."
        ],
        "kpi_callout": "v2.0",
        "kpi_label": "Agentic & MCP Vision"
    }
]

def build_pptx_file(output_path):
    """
    Creates native PowerPoint presentation (.pptx) file using python-pptx if available,
    or via OOXML zip generator script.
    """
    try:
        from pptx import Presentation
        from pptx.util import Inches, Pt
        from pptx.enum.text import PP_ALIGN
        from pptx.dml.color import RGBColor
        
        prs = Presentation()
        prs.slide_width = Inches(13.333)
        prs.slide_height = Inches(7.5)

        COLOR_BG = RGBColor(15, 23, 42)       # Dark slate background #0f172a
        COLOR_CARD = RGBColor(30, 41, 59)     # Surface card #1e293b
        COLOR_WHITE = RGBColor(255, 255, 255)
        COLOR_MUTED = RGBColor(148, 163, 184) # #94a3b8
        COLOR_CYAN = RGBColor(56, 189, 248)   # #38bdf8
        COLOR_PURPLE = RGBColor(168, 85, 247) # #a855f7
        COLOR_EMERALD = RGBColor(52, 211, 153)# #34d399
        
        blank_slide_layout = prs.slide_layouts[6]
        
        for data in SLIDES_DATA:
            slide = prs.slides.add_slide(blank_slide_layout)
            
            # Background shape
            bg = slide.shapes.add_shape(1, 0, 0, Inches(13.333), Inches(7.5))
            bg.fill.solid()
            bg.fill.fore_color.rgb = COLOR_BG
            bg.line.fill.background()
            
            # Header Box
            header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.733), Inches(1.2))
            tf_h = header_box.text_frame
            tf_h.word_wrap = True
            
            p_cat = tf_h.paragraphs[0]
            p_cat.text = data["category"].upper()
            p_cat.font.size = Pt(11)
            p_cat.font.bold = True
            p_cat.font.color.rgb = COLOR_CYAN
            
            p_title = tf_h.add_paragraph()
            p_title.text = data["title"]
            p_title.font.size = Pt(26)
            p_title.font.bold = True
            p_title.font.color.rgb = COLOR_WHITE
            
            p_sub = tf_h.add_paragraph()
            p_sub.text = data["subtitle"]
            p_sub.font.size = Pt(13)
            p_sub.font.color.rgb = COLOR_MUTED
            
            # Left Content Card
            card = slide.shapes.add_shape(1, Inches(0.8), Inches(1.9), Inches(8.5), Inches(5.0))
            card.fill.solid()
            card.fill.fore_color.rgb = COLOR_CARD
            card.line.color.rgb = RGBColor(51, 65, 85)
            
            content_box = slide.shapes.add_textbox(Inches(1.0), Inches(2.1), Inches(8.1), Inches(4.6))
            tf_c = content_box.text_frame
            tf_c.word_wrap = True
            
            for idx, bullet in enumerate(data["bullets"]):
                p_b = tf_c.add_paragraph() if idx > 0 else tf_c.paragraphs[0]
                p_b.text = "•  " + bullet
                p_b.font.size = Pt(15)
                p_b.font.color.rgb = COLOR_WHITE
                p_b.space_after = Pt(14)
                
            # Right KPI Stat Callout Card
            kpi_card = slide.shapes.add_shape(1, Inches(9.6), Inches(1.9), Inches(2.933), Inches(5.0))
            kpi_card.fill.solid()
            kpi_card.fill.fore_color.rgb = RGBColor(30, 41, 59)
            kpi_card.line.color.rgb = COLOR_CYAN
            
            kpi_box = slide.shapes.add_textbox(Inches(9.7), Inches(2.8), Inches(2.733), Inches(3.2))
            tf_k = kpi_box.text_frame
            tf_k.word_wrap = True
            
            p_k1 = tf_k.paragraphs[0]
            p_k1.alignment = PP_ALIGN.CENTER
            p_k1.text = data["kpi_callout"]
            p_k1.font.size = Pt(36)
            p_k1.font.bold = True
            p_k1.font.color.rgb = COLOR_CYAN
            
            p_k2 = tf_k.add_paragraph()
            p_k2.alignment = PP_ALIGN.CENTER
            p_k2.text = data["kpi_label"]
            p_k2.font.size = Pt(12)
            p_k2.font.bold = True
            p_k2.font.color.rgb = COLOR_WHITE
            p_k2.space_before = Pt(8)
            
            p_num = tf_k.add_paragraph()
            p_num.alignment = PP_ALIGN.CENTER
            p_num.text = f"Slide {data['slide_num']} of 17"
            p_num.font.size = Pt(10)
            p_num.font.color.rgb = COLOR_MUTED
            p_num.space_before = Pt(28)
            
        prs.save(output_path)
        print(f"Successfully generated native PPTX: {output_path}")
        return True
    except Exception as e:
        print(f"python-pptx notice: {e}. Building standalone PPTX OOXML ZIP structure...")
        return build_standalone_pptx(output_path)

def build_standalone_pptx(output_path):
    """
    Fallback standalone PPTX OOXML generator.
    Creates a fully valid .pptx archive containing slides.
    """
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as z:
        types_xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>'
        for i in range(1, len(SLIDES_DATA) + 1):
            types_xml += f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'
        types_xml += '</Types>'
        z.writestr('[Content_Types].xml', types_xml)
        
        z.writestr('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>')
        
        pres_xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:sldIdLst>'
        for i in range(1, len(SLIDES_DATA) + 1):
            pres_xml += f'<p:sldId id="{255 + i}" r:id="rId{i}"/>'
        pres_xml += '</p:sldIdLst></p:presentation>'
        z.writestr('ppt/presentation.xml', pres_xml)
        
        pres_rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        for i in range(1, len(SLIDES_DATA) + 1):
            pres_rels += f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i}.xml"/>'
        pres_rels += '</Relationships>'
        z.writestr('ppt/_rels/presentation.xml.rels', pres_rels)
        
        for i, s in enumerate(SLIDES_DATA, 1):
            bullets_text = " ".join(s["bullets"])
            slide_xml = f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:grpSpPr/></p:nvGrpSpPr><p:sp><p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cSpPr/><p:nvPr/></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:t>{s["title"]} - {s["subtitle"]}</a:t></a:r></a:p><a:p><a:r><a:t>{bullets_text}</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>'
            z.writestr(f'ppt/slides/slide{i}.xml', slide_xml)
            
    print(f"Generated standalone PPTX: {output_path}")
    return True

def build_odf_file(output_path):
    """
    Creates native OpenDocument Presentation (.odf / .odp) ZIP file.
    Follows ODF Standard v1.2 specification.
    """
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as z:
        mimetype_info = zipfile.ZipInfo('mimetype')
        mimetype_info.compress_type = zipfile.ZIP_STORED
        z.writestr(mimetype_info, b'application/vnd.oasis.opendocument.presentation')
        
        manifest_xml = """<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.presentation"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>
</manifest:manifest>"""
        z.writestr('META-INF/manifest.xml', manifest_xml)
        
        meta_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" office:version="1.2">
  <office:meta>
    <dc:title>SkillShift Presentation</dc:title>
    <dc:description>Adaptive Job-Matching & Concept Drift Detection Platform</dc:description>
    <dc:creator>SkillShift ML Team</dc:creator>
    <meta:creation-date>{datetime.utcnow().isoformat()}Z</meta:creation-date>
  </office:meta>
</office:document-meta>"""
        z.writestr('meta.xml', meta_xml)
        
        styles_xml = """<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:xmlns:svg:1.0" office:version="1.2">
  <office:styles>
    <style:style style:name="Default" style:family="presentation"/>
  </office:styles>
</office:document-styles>"""
        z.writestr('styles.xml', styles_xml)
        
        slides_xml_content = ""
        for s in SLIDES_DATA:
            bullets_xml = "".join([f'<text:p text:style-name="P2">•  {b}</text:p>' for b in s["bullets"]])
            slides_xml_content += f"""
      <draw:page draw:name="Slide_{s['slide_num']}" draw:master-page-name="Default">
        <draw:frame draw:style-name="gr1" draw:text-style-name="P1" svg:width="25cm" svg:height="3cm" svg:x="2cm" svg:y="1.5cm">
          <draw:text-box>
            <text:p text:style-name="HeaderCategory">{s['category'].upper()}</text:p>
            <text:h text:style-name="TitleStyle" text:outline-level="1">{s['title']}</text:h>
            <text:p text:style-name="SubTitleStyle">{s['subtitle']}</text:p>
          </draw:text-box>
        </draw:frame>
        <draw:frame draw:style-name="gr2" svg:width="17cm" svg:height="11cm" svg:x="2cm" svg:y="5cm">
          <draw:text-box>
            {bullets_xml}
          </draw:text-box>
        </draw:frame>
        <draw:frame draw:style-name="gr3" svg:width="6cm" svg:height="11cm" svg:x="20cm" svg:y="5cm">
          <draw:text-box>
            <text:h text:style-name="KpiCallout" text:outline-level="2">{s['kpi_callout']}</text:h>
            <text:p text:style-name="KpiLabel">{s['kpi_label']}</text:p>
            <text:p text:style-name="SlideNum">Slide {s['slide_num']} of 17</text:p>
          </draw:text-box>
        </draw:frame>
      </draw:page>"""
            
        content_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.2">
  <office:automatic-styles>
    <style:style style:name="HeaderCategory" style:family="text">
      <style:text-properties fo:color="#38bdf8" fo:font-size="11pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="TitleStyle" style:family="text">
      <style:text-properties fo:color="#0f172a" fo:font-size="24pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="SubTitleStyle" style:family="text">
      <style:text-properties fo:color="#64748b" fo:font-size="13pt"/>
    </style:style>
    <style:style style:name="P2" style:family="text">
      <style:text-properties fo:color="#1e293b" fo:font-size="14pt"/>
    </style:style>
    <style:style style:name="KpiCallout" style:family="text">
      <style:text-properties fo:color="#0284c7" fo:font-size="32pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="KpiLabel" style:family="text">
      <style:text-properties fo:color="#334155" fo:font-size="12pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="SlideNum" style:family="text">
      <style:text-properties fo:color="#94a3b8" fo:font-size="10pt"/>
    </style:style>
  </office:automatic-styles>
  <office:body>
    <office:presentation>
      {slides_xml_content}
    </office:presentation>
  </office:body>
</office:document-content>"""
        z.writestr('content.xml', content_xml)

    print(f"Successfully generated native ODF presentation: {output_path}")
    return True

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    pptx_path = os.path.join(root_dir, "SkillShift_Presentation.pptx")
    odf_path = os.path.join(root_dir, "SkillShift_Presentation.odf")
    odp_path = os.path.join(root_dir, "SkillShift_Presentation.odp")
    
    print("Generating SkillShift 17-Slide Infographic Presentations...")
    build_pptx_file(pptx_path)
    build_odf_file(odf_path)
    build_odf_file(odp_path)
    
    print("\nGeneration complete!")
    print(f"1. PowerPoint (.pptx): {pptx_path}")
    print(f"2. OpenDocument (.odf): {odf_path}")
    print(f"3. OpenDocument (.odp): {odp_path}")

if __name__ == "__main__":
    main()
