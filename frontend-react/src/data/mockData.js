/**
 * Authentic Real-World Benchmark Datasets for SkillShift Platform
 * Spanning Generative AI, Cloud/MLOps, Modern Web, Data Science, Product & Leadership
 */

export const executiveKpis = Object.assign(
  [
    {
      id: 'kpi-vocab-expansion',
      title: 'Market Vocabulary Growth',
      value: '+36.3%',
      trend: '+5.4% this quarter',
      trendType: 'positive',
      subtext: 'Emergent technical skills assimilated since 2022 baseline',
      iconType: 'TrendingUp'
    },
    {
      id: 'kpi-ood-rate',
      title: 'Out-of-Distribution Inflow',
      value: '42.8%',
      trend: '+8.2% vs 2023',
      trendType: 'warning',
      subtext: 'New job postings requiring post-2022 LLM/Cloud stacks',
      iconType: 'AlertTriangle'
    },
    {
      id: 'kpi-ats-gap',
      title: 'Legacy ATS Penalty Delta',
      value: '-48.5%',
      trend: 'Score suppression recovered',
      trendType: 'highlight',
      subtext: 'Average score deflation suffered by modern candidates',
      iconType: 'Zap'
    },
    {
      id: 'kpi-co-occurrence',
      title: 'Active Skill Bridges',
      value: '1,420+',
      trend: 'Network density +18%',
      trendType: 'positive',
      subtext: 'Inter-domain connections (e.g., Python ↔ LangChain ↔ Vector DBs)',
      iconType: 'Layers'
    }
  ],
  {
    totalJobsScanned: '148,200+',
    baselineVocabSize: '2,450',
    newOodSkillsDetected: '480+',
    adaptationAccuracyGain: '+66.4%'
  }
);

export const mockTimeline = [
  { month: '2022-01', vocab_size: 2340, new_skills_detected: 8, drift_rate: 0.8 },
  { month: '2022-06', vocab_size: 2395, new_skills_detected: 16, drift_rate: 1.4 },
  { month: '2022-11', vocab_size: 2450, new_skills_detected: 22, drift_rate: 2.1 },
  { month: '2023-03', vocab_size: 2548, new_skills_detected: 54, drift_rate: 4.8 },
  { month: '2023-08', vocab_size: 2680, new_skills_detected: 68, drift_rate: 5.9 },
  { month: '2023-12', vocab_size: 2795, new_skills_detected: 45, drift_rate: 4.2 },
  { month: '2024-04', vocab_size: 2920, new_skills_detected: 58, drift_rate: 5.1 },
  { month: '2024-09', vocab_size: 3055, new_skills_detected: 62, drift_rate: 5.4 },
  { month: '2025-01', vocab_size: 3190, new_skills_detected: 50, drift_rate: 4.6 },
];

export const mockCategoriesBreakdown = [
  { name: 'Generative AI & LLMs', category: 'Generative AI & LLMs', share: 38, percentage: 38, count: 48, color: '#38bdf8', growth: '+310%' },
  { name: 'Cloud, MLOps & Infra', category: 'Cloud, MLOps & Infra', share: 24, percentage: 24, count: 32, color: '#818cf8', growth: '+145%' },
  { name: 'Modern Web & Full-Stack', category: 'Modern Web & Full-Stack', share: 18, percentage: 18, count: 24, color: '#34d399', growth: '+110%' },
  { name: 'Data Science & Core ML', category: 'Data Science & Core ML', share: 14, percentage: 14, count: 18, color: '#fbbf24', growth: '+45%' },
  { name: 'Product & Leadership', category: 'Product & Leadership', share: 6, percentage: 6, count: 12, color: '#f472b6', growth: '+85%' }
];

export const mockCandidatePresets = [
  {
    id: 'preset-genai-specialist',
    name: 'Sarah Cheulkar (Modern GenAI Engineer)',
    title: 'Sarah Cheulkar (Modern GenAI Engineer)',
    badge: 'High Concept Drift 🚀',
    badgeType: 'amber',
    targetJobTitle: 'Machine Learning Engineer',
    resumeText: `Sarah Cheulkar | Senior AI Engineer
Email: sarah.c@example.com | GitHub: github.com/sarah-ai
Professional Summary:
Senior AI Systems Engineer with 5+ years building distributed ML systems and 2+ years designing production Generative AI architectures.
Technical Skills:
- Generative AI: LangChain, LlamaIndex, LangGraph, RAG Architecture, Vector Databases (Pinecone, ChromaDB, Qdrant), Prompt Engineering, Fine-Tuning (LoRA, QLoRA, PEFT), OpenAI API, Anthropic Claude, vLLM, Ollama, Model Context Protocol (MCP).
- ML & Deep Learning: Python, PyTorch, Hugging Face Transformers, Scikit-Learn, Pandas, NumPy, CUDA.
- Backend & DevOps: FastAPI, Docker, Kubernetes, AWS (SageMaker, S3, EC2), MLflow, CI/CD, GitHub Actions.
Experience:
Lead AI Engineer @ Cortex Labs (2022-Present):
- Designed high-throughput RAG pipeline with hybrid BM25 + HNSW vector indexing, reducing hallucination by 42% and latency to <350ms.
- Fine-tuned open-weight Llama 3 8B with QLoRA for enterprise domain queries, cutting token inference costs by 65%.
- Implemented asynchronous FastAPI microservices serving over 2M daily LLM inference requests orchestrated via vLLM on Kubernetes.`,
    scores: { stale: 0.28, adapted: 0.94, delta: '+66%' },
    flaggedSkills: ['LangChain', 'LlamaIndex', 'RAG Architecture', 'Vector Databases', 'LoRA', 'PEFT', 'vLLM', 'Prompt Engineering'],
    recognizedBaseline: ['Python', 'PyTorch', 'Docker', 'Kubernetes', 'FastAPI', 'AWS'],
    trueMissing: ['Advanced MLOps Pipeline Automation', 'Multi-Agent Orchestration (LangGraph Deep Dive)', 'Kubernetes Custom Resource Definitions (CRDs) for AI', 'Cost Optimization for At-Scale LLM Serving'],
    explanation: 'The stale 2021 ATS model penalized modern Generative AI competencies (LangChain, RAG, LoRA, Vector DBs) as out-of-distribution noise, deflating the score to 28%. The adapted model recognized them as top-priority requirements, restoring score to 94% (+66% recovery).',
    dimensions: [
      { name: 'Core Technical Competence', stale: 82, adapted: 95 },
      { name: 'Modern Tooling Alignment', stale: 22, adapted: 96 },
      { name: 'Domain Relevance', stale: 65, adapted: 93 },
      { name: 'Leadership & Soft Skills', stale: 60, adapted: 88 }
    ]
  },
  {
    id: 'preset-evergreen-ds',
    name: 'Shruti Gupta (Classical Data Scientist)',
    title: 'Shruti Gupta (Classical Data Scientist)',
    badge: 'Evergreen Foundational Core ✅',
    badgeType: 'emerald',
    targetJobTitle: 'Data Scientist',
    resumeText: `Shruti Gupta | Lead Data Scientist
PhD in Applied Statistics | 7+ years of industry experience
Technical Competencies:
- Core Languages & Tools: Python, R, SQL, Pandas, NumPy, SciPy, Scikit-Learn, Statsmodels, Jupyter.
- Machine Learning: XGBoost, LightGBM, Random Forest, Logistic Regression, Time Series (ARIMA, Prophet), PCA, Clustering.
- Experimentation: A/B Testing, Multi-Arm Bandits, Hypothesis Testing, Causal Inference, Power Analysis.
- Business Intelligence: Tableau, Power BI, Matplotlib, Seaborn, Snowflake, dbt.
Selected Experience:
Lead Data Scientist @ Apex Analytics (2020-Present):
- Built customer lifetime value (LTV) and churn prediction models processing 10M+ transactional records.
- Designed and analyzed 50+ enterprise A/B experimentation tests driving $12M incremental ARR.
- Mentored junior data analysts and established standardized statistical modeling guidelines.`,
    scores: { stale: 0.88, adapted: 0.91, delta: '+3%' },
    flaggedSkills: ['Snowflake', 'dbt'],
    recognizedBaseline: ['Python', 'SQL', 'R', 'Pandas', 'Scikit-Learn', 'Statistics', 'A/B Testing', 'Tableau'],
    explanation: 'Candidate demonstrates strong evergreen alignment with foundational data science and statistical modeling requirements across both historical and adapted benchmarks.',
    dimensions: [
      { name: 'Core Technical Competence', stale: 92, adapted: 93 },
      { name: 'Modern Tooling Alignment', stale: 78, adapted: 85 },
      { name: 'Domain Relevance', stale: 90, adapted: 92 },
      { name: 'Leadership & Soft Skills', stale: 82, adapted: 86 }
    ]
  },
  {
    id: 'preset-legacy-engineer',
    name: 'Shreyas Shetty (Legacy Stack Developer)',
    title: 'Shreyas Shetty (Legacy Stack Developer)',
    badge: 'Reverse Concept Drift 📉',
    badgeType: 'rose',
    targetJobTitle: 'Software Engineer',
    resumeText: `Shreyas Shetty | Systems Software Developer
Experience: 10+ years developing enterprise backend systems.
Core Skills: Java 8, Hadoop, MapReduce, Apache Ant, Subversion (SVN), SOAP Web Services, XML, Weka, Perl, Apache Tomcat, EJB, Struts, Oracle DB, SQL.
Experience:
Senior Developer @ Legacy Enterprise Corp (2014-Present):
- Maintained monolithic Java 8 banking pipelines with MapReduce and Hadoop batch processing.
- Handled version control via SVN repository management and SOAP XML service contracts.`,
    scores: { stale: 0.74, adapted: 0.32, delta: '-42%' },
    flaggedSkills: ['Hadoop', 'MapReduce', 'Java 8', 'SVN', 'SOAP XML', 'Weka', 'Perl'],
    recognizedBaseline: ['SQL', 'Java'],
    trueMissing: ['Spring Boot / Microservices Architecture', 'Docker / Containerization', 'React.js / Modern Frontend', 'RESTful APIs / GraphQL', 'Cloud Platforms (AWS/Azure)'],
    explanation: 'The candidate is over-indexed on legacy tools (Hadoop, SVN, SOAP) which scored highly on the stale 2021 model. The 2024 adapted model recognizes these as deprecated or declining, significantly reducing the match score to 32% for modern Software Engineering roles.',
    dimensions: [
      { name: 'Core Technical Competence', stale: 88, adapted: 45 },
      { name: 'Modern Tooling Alignment', stale: 75, adapted: 18 },
      { name: 'Architectural Knowledge', stale: 65, adapted: 35 }
    ]
  },
  {
    id: 'preset-frontend-transition',
    name: 'Shreyas Shetty (Aspiring Full-Stack)',
    title: 'Shreyas Shetty (Aspiring Full-Stack)',
    badge: 'High Upskill Potential 📈',
    badgeType: 'cyan',
    targetJobTitle: 'Full-Stack Developer',
    resumeText: `Shreyas Shetty | Frontend Developer
Email: shreyas.s@example.com | GitHub: github.com/shreyas-web
Professional Summary:
Passionate Frontend Developer with 3 years of experience building responsive web interfaces. Looking to transition into Full-Stack development.
Technical Skills:
- Frontend: HTML5, CSS3, JavaScript (ES6+), React.js, Redux, Tailwind CSS, Bootstrap.
- Tools & Workflows: Git, GitHub, Webpack, npm/yarn, Figma, VS Code, Jest (basic testing).
Experience:
Frontend Dev @ WebCraft Studio (2021-Present):
- Developed responsive e-commerce storefronts using React and Tailwind.
- Improved PageSpeed Insights score by 25% through lazy loading and bundle optimization.`,
    scores: { stale: 0.65, adapted: 0.82, delta: '+17%' },
    flaggedSkills: ['Tailwind CSS', 'Figma', 'Webpack'],
    recognizedBaseline: ['HTML5', 'CSS3', 'JavaScript', 'React.js', 'Git'],
    trueMissing: ['Node.js / Express Backend', 'Database Management (PostgreSQL/MongoDB)', 'API Design and Authentication (JWT/OAuth)', 'Cloud Deployment (Vercel/Heroku)'],
    explanation: 'A solid frontend foundation was recognized by both models. The adapted model identified modern UI workflows (Tailwind, Figma) boosting the score, but flagged the complete absence of backend and database paradigms necessary for full-stack.',
    dimensions: [
      { name: 'Frontend Competence', stale: 85, adapted: 90 },
      { name: 'Backend Competence', stale: 10, adapted: 15 },
      { name: 'Modern Tooling Alignment', stale: 55, adapted: 85 }
    ]
  },
  {
    id: 'preset-data-analyst',
    name: 'Shravani Umrani (Data Analyst to Data Scientist)',
    title: 'Shravani Umrani (Data Analyst to Data Scientist)',
    badge: 'Role Transition 🔄',
    badgeType: 'emerald',
    targetJobTitle: 'Data Scientist',
    resumeText: `Shravani Umrani | Data Analyst
Email: shravani.u@example.com
Professional Summary:
Detail-oriented Data Analyst experienced in translating complex datasets into actionable business intelligence.
Technical Skills:
- Analytics: SQL, Excel (Advanced), Tableau, Power BI, Google Analytics.
- Programming/Stats: Python (basic scripting), R (ggplot2, dplyr), A/B Testing, Descriptive Statistics.
Experience:
Data Analyst @ FinTech Solutions (2020-Present):
- Built interactive Tableau dashboards utilized by the executive team, saving 15 hours of manual reporting weekly.
- Executed complex SQL joins and window functions across 50M+ row databases to identify revenue leakage.`,
    scores: { stale: 0.58, adapted: 0.76, delta: '+18%' },
    flaggedSkills: ['Tableau', 'Power BI', 'Google Analytics'],
    recognizedBaseline: ['SQL', 'Excel', 'Python', 'R', 'A/B Testing'],
    trueMissing: ['Machine Learning Algorithms (Scikit-Learn/XGBoost)', 'Deep Learning Fundamentals (PyTorch/TensorFlow)', 'Model Deployment & MLOps', 'Advanced Statistical Modeling'],
    explanation: 'The stale model scored this average for Data Science due to lack of ML keywords. The adapted model recognizes strong data visualization and SQL foundations as critical prerequisites, slightly elevating the score, but highlights the ML gap.',
    dimensions: [
      { name: 'Analytics & BI Competence', stale: 90, adapted: 92 },
      { name: 'Machine Learning Capability', stale: 20, adapted: 45 },
      { name: 'Data Engineering & SQL', stale: 85, adapted: 88 }
    ]
  },
  {
    id: 'preset-modern-fullstack',
    name: 'Shravani Umrani (Modern Full-Stack Developer)',
    title: 'Shravani Umrani (Modern Full-Stack Developer)',
    badge: 'Framework Shift ⚡',
    badgeType: 'amber',
    targetJobTitle: 'Software Engineer',
    resumeText: `Shravani Umrani | Full-Stack Software Engineer
Skills: React 19, Next.js 14, TypeScript, JavaScript, Tailwind CSS, Node.js, Express, Fastify, GraphQL, REST APIs, Supabase, PostgreSQL, Redis, Docker, AWS Lambda, Prisma, WebSockets, Git.
Experience:
Full Stack Developer @ Nimbus Tech (2022-Present):
- Developed high-performance SaaS web application with Next.js App Router, Server Components, and Tailwind CSS.
- Architected realtime collaboration engine using WebSockets, Redis pub/sub, and PostgreSQL via Prisma ORM.
- Configured automated CI/CD deployment pipelines on AWS with Docker containerization.`,
    scores: { stale: 0.42, adapted: 0.92 },
    flaggedSkills: ['Next.js 14', 'Tailwind CSS', 'Supabase', 'Prisma', 'React 19'],
    recognizedBaseline: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    explanation: 'Modern full-stack framework competencies (Next.js App Router, Tailwind CSS, Supabase) penalized by legacy screening were fully recognized under adapted 2024–2026 scoring (+50% recovery).',
    dimensions: [
      { name: 'Core Technical Competence', stale: 80, adapted: 94 },
      { name: 'Modern Tooling Alignment', stale: 35, adapted: 95 },
      { name: 'Domain Relevance', stale: 62, adapted: 91 },
      { name: 'Leadership & Soft Skills', stale: 60, adapted: 85 }
    ]
  },
  {
    id: 'preset-ai-pm',
    name: 'David Thorne (Technical Product Manager - AI)',
    badge: 'Product & Leadership 🌟',
    targetJobTitle: 'Technical Product Manager',
    resumeText: `David Thorne | Principal Product Manager - AI Platforms
Skills: Product Strategy, Product Roadmap, OKRs, KPIs, User Story Mapping, A/B Testing, User Research, Wireframing, Figma, Jira, Linear, Mixpanel, Amplitude, PRD Writing, LLM Evaluation, Structured Communication, Cross-Functional Alignment, Stakeholder Management.
Experience:
Principal PM @ NeuralFlow (2021-Present):
- Led cross-functional team of 12 engineers and data scientists delivering enterprise LLM copilot platform.
- Defined product telemetry, evaluation metrics (RAG Triad), and growth roadmap resulting in $8M ARR in year one.
- Conducted 60+ customer discovery interviews and authored detailed PRDs for model fine-tuning features.`,
    scores: { stale: 0.52, adapted: 0.91 },
    flaggedSkills: ['Linear', 'Mixpanel', 'Amplitude', 'LLM Evaluation', 'User Story Mapping'],
    recognizedBaseline: ['Product Strategy', 'Roadmap', 'A/B Testing', 'Jira', 'Figma'],
    explanation: 'Modern AI product management practices (RAG telemetry, Linear, modern product analytics) recognized alongside strong cross-functional leadership and stakeholder alignment.',
    dimensions: [
      { name: 'Core Technical Competence', stale: 70, adapted: 88 },
      { name: 'Modern Tooling Alignment', stale: 45, adapted: 92 },
      { name: 'Domain Relevance', stale: 68, adapted: 94 },
      { name: 'Leadership & Soft Skills', stale: 85, adapted: 96 }
    ]
  }
];

export const mockCompanyDemands = [
  {
    id: "databricks", "name": "Databricks", "industry": "Data & AI Lakehouse", "tier": "AI Unicorn / Enterprise",
    "logoColor": "#ff3621", "roleTitle": "GenAI Applications Engineer", "department": "AI Solutions & MosaicML",
    "salaryBand": "$175,000 - $235,000", "location": "San Francisco, CA (Hybrid / Remote)",
    "hiringUrgency": "Surging Demand 🔥", "growthPct": "+240%",
    "requiredSkills": ["Python", "LangChain", "RAG Architecture", "FastAPI", "Vector Databases", "PyTorch"],
    "emergingSkills": ["Vector Databases", "LangChain", "RAG Architecture", "LoRA Fine-Tuning", "LangGraph"],
    "description": "Building next-generation generative AI workflows and custom LLM inference pipelines on MosaicML and Lakehouse architecture."
  },
  {
    id: "openai", "name": "OpenAI", "industry": "Frontier AI Research", "tier": "Frontier Lab",
    "logoColor": "#10a37f", "roleTitle": "AI Platform Systems Engineer", "department": "Applied Engineering",
    "salaryBand": "$210,000 - $310,000", "location": "San Francisco, CA (Hybrid)",
    "hiringUrgency": "Surging Demand 🔥", "growthPct": "+310%",
    "requiredSkills": ["Python", "PyTorch", "Docker", "Kubernetes", "FastAPI", "Distributed Systems"],
    "emergingSkills": ["vLLM", "Triton Inference", "Prompt Engineering", "LoRA / Fine-Tuning", "MCP"],
    "description": "Scale high-throughput API endpoints and orchestrate distributed model evaluation infrastructure for millions of developers."
  },
  {
    id: "anthropic", "name": "Anthropic", "industry": "AI Safety & Large Models", "tier": "Frontier Lab",
    "logoColor": "#d97706", "roleTitle": "Prompt Systems & Evaluation Engineer", "department": "Model Alignment & Product",
    "salaryBand": "$190,000 - $265,000", "location": "San Francisco, CA (Hybrid / Remote)",
    "hiringUrgency": "Surging Demand 🔥", "growthPct": "+280%",
    "requiredSkills": ["Python", "Prompt Engineering", "Statistics", "Scikit-Learn", "FastAPI", "TypeScript"],
    "emergingSkills": ["Prompt Engineering", "RAG Architecture", "LlamaIndex", "Model Context Protocol"],
    "description": "Develop automated benchmarking pipelines and evaluate safety steering across frontier Claude model architectures."
  },
  {
    id: "scale-ai", "name": "Scale AI", "industry": "Data Engine for Enterprise AI", "tier": "AI Unicorn",
    "logoColor": "#ec4899", "roleTitle": "LLM Fine-Tuning Specialist", "department": "Generative AI Platform",
    "salaryBand": "$165,000 - $225,000", "location": "New York, NY / Remote",
    "hiringUrgency": "High Growth ⚡", "growthPct": "+190%",
    "requiredSkills": ["Python", "PyTorch", "LoRA / PEFT", "Hugging Face", "SQL", "Docker"],
    "emergingSkills": ["LoRA / Fine-Tuning", "Vector Databases", "Llama 3 Adaptation", "RLHF"],
    "description": "Create customized model adaptation runs and RLHF alignment datasets for Fortune 500 enterprise clients."
  },
  {
    id: "snowflake", "name": "Snowflake", "industry": "Data Cloud & Cortex AI", "tier": "Public Enterprise",
    "logoColor": "#29b5e8", "roleTitle": "MLOps & Cortex AI Developer", "department": "Data Cloud Platforms",
    "salaryBand": "$160,000 - $215,000", "location": "San Mateo, CA / Remote",
    "hiringUrgency": "High Growth ⚡", "growthPct": "+145%",
    "requiredSkills": ["Python", "SQL", "AWS", "Docker", "FastAPI", "Snowpark ML"],
    "emergingSkills": ["Vector Search", "LangChain", "Cortex LLMs", "dbt"],
    "description": "Enable serverless LLM query features and semantic search capabilities across petabyte-scale data warehouses."
  },
  {
    id: "stripe", "name": "Stripe", "industry": "Financial Infrastructure", "tier": "FinTech Giant",
    "logoColor": "#635bff", "roleTitle": "Machine Learning Infrastructure Engineer", "department": "Radar Fraud & Risk ML",
    "salaryBand": "$180,000 - $245,000", "location": "Seattle, WA / San Francisco, CA / Remote",
    "hiringUrgency": "Active Hiring ✅", "growthPct": "+65%",
    "requiredSkills": ["Python", "SQL", "Docker", "Kubernetes", "AWS", "Scikit-Learn", "PyTorch"],
    "emergingSkills": ["FastAPI", "Vector Databases", "Streaming Inference", "Kafka"],
    "description": "Architect low-latency ML scoring systems processing hundreds of millions of transaction requests daily."
  },
  {
    id: "mistral-ai", "name": "Mistral AI", "industry": "Open-Weight Frontier Models", "tier": "Frontier AI Unicorn",
    "logoColor": "#f97316", "roleTitle": "Open Source Model Optimization Engineer", "department": "Core Inference Team",
    "salaryBand": "$175,000 - $240,000", "location": "Paris, France / Remote EU & US",
    "hiringUrgency": "Surging Demand 🔥", "growthPct": "+350%",
    "requiredSkills": ["Python", "C++", "PyTorch", "CUDA", "Docker", "Hugging Face"],
    "emergingSkills": ["vLLM", "Quantization (AWQ/GGUF)", "LoRA Fine-Tuning"],
    "description": "Optimize ultra-efficient inference runtimes for open-weight models (Mistral, Mixtral) on edge and cloud clusters."
  },
  {
    id: "microsoft", "name": "Microsoft", "industry": "Cloud & AI Copilot", "tier": "Big Tech",
    "logoColor": "#00a4ef", "roleTitle": "Azure AI & Semantic Kernel Engineer", "department": "Azure AI Platform",
    "salaryBand": "$165,000 - $230,000", "location": "Redmond, WA / Remote",
    "hiringUrgency": "High Growth ⚡", "growthPct": "+110%",
    "requiredSkills": ["Python", "C#", "Azure", "Docker", "FastAPI", "SQL"],
    "emergingSkills": ["Semantic Kernel", "Vector Databases", "RAG Architecture", "Prompt Engineering"],
    "description": "Build enterprise-grade Copilot orchestration backends and vector indexing pipelines on Azure OpenAI Service."
  },
  {
    id: "google", "name": "Google", "industry": "Search & Cloud", "tier": "Big Tech",
    "logoColor": "#ea4335", "roleTitle": "Gemini Systems Engineer", "department": "Google DeepMind",
    "salaryBand": "$180,000 - $260,000", "location": "Mountain View, CA / Remote",
    "hiringUrgency": "High Growth ⚡", "growthPct": "+150%",
    "requiredSkills": ["Python", "C++", "TensorFlow", "Kubernetes", "GCP", "Docker"],
    "emergingSkills": ["JAX", "TPU Profiling", "Gemini API", "Multimodal RAG"],
    "description": "Optimize distributed training and inference for multimodal Gemini models on TPU clusters."
  },
  {
    id: "meta", "name": "Meta", "industry": "Social Media & VR", "tier": "Big Tech",
    "logoColor": "#0668E1", "roleTitle": "Llama Core Contributor", "department": "FAIR (Fundamental AI Research)",
    "salaryBand": "$190,000 - $280,000", "location": "Menlo Park, CA / Remote",
    "hiringUrgency": "Active Hiring ✅", "growthPct": "+130%",
    "requiredSkills": ["Python", "PyTorch", "C++", "CUDA", "React", "GraphQL"],
    "emergingSkills": ["Llama 3", "Open Source ML", "Model Distillation"],
    "description": "Drive open-source innovations for the Llama family of models and optimize on-device inference."
  },
  {
    id: "amazon", "name": "Amazon", "industry": "E-commerce & Cloud", "tier": "Big Tech",
    "logoColor": "#FF9900", "roleTitle": "AWS Bedrock Specialist", "department": "AWS AI Platforms",
    "salaryBand": "$160,000 - $220,000", "location": "Seattle, WA / Remote",
    "hiringUrgency": "High Growth ⚡", "growthPct": "+120%",
    "requiredSkills": ["Java", "Python", "AWS", "DynamoDB", "Docker", "React"],
    "emergingSkills": ["AWS Bedrock", "Titan Models", "Agentic Workflows"],
    "description": "Enable enterprise customers to build generative AI applications using managed foundational models on AWS Bedrock."
  },
  {
    id: "netflix", "name": "Netflix", "industry": "Streaming Media", "tier": "Big Tech",
    "logoColor": "#E50914", "roleTitle": "Personalization ML Engineer", "department": "Algorithms & Recommendations",
    "salaryBand": "$250,000 - $350,000", "location": "Los Gatos, CA / Remote",
    "hiringUrgency": "Active Hiring ✅", "growthPct": "+40%",
    "requiredSkills": ["Python", "Scala", "Spark", "PyTorch", "React", "AWS"],
    "emergingSkills": ["Reinforcement Learning", "Streaming Analytics", "Graph Neural Networks"],
    "description": "Evolve the world's best recommendation engine using real-time streaming data and deep learning architectures."
  },
  {
    id: "apple", "name": "Apple", "industry": "Consumer Electronics", "tier": "Big Tech",
    "logoColor": "#000000", "roleTitle": "On-Device ML Engineer", "department": "Apple Intelligence",
    "salaryBand": "$170,000 - $250,000", "location": "Cupertino, CA",
    "hiringUrgency": "Surging Demand 🔥", "growthPct": "+200%",
    "requiredSkills": ["Swift", "C++", "Objective-C", "CoreML", "Python"],
    "emergingSkills": ["On-Device LLMs", "Neural Engine Optimization", "Privacy-Preserving ML"],
    "description": "Deploy foundational models directly to iOS and macOS devices with strict memory and power constraints."
  },
  {
    id: "jpmorgan", "name": "JPMorgan Chase", "industry": "Investment Banking", "tier": "Global Finance",
    "logoColor": "#005e38", "roleTitle": "Quantitative Developer", "department": "AI Data Analytics",
    "salaryBand": "$150,000 - $210,000", "location": "New York, NY",
    "hiringUrgency": "Active Hiring ✅", "growthPct": "+50%",
    "requiredSkills": ["Python", "C++", "Java", "SQL", "Pandas", "Scikit-Learn"],
    "emergingSkills": ["LLMs for FinTech", "Time Series Forecasting", "Alternative Data"],
    "description": "Design predictive models for algorithmic trading and automate financial report generation using LLMs."
  }
];

export const mockBatchCandidates = [
  {
    id: 'cand-1',
    name: 'Sarah Cheulkar',
    title: 'Senior AI Engineer',
    resumeSnippet: 'Specialized in LangChain, LlamaIndex, RAG Architecture, Vector DBs (ChromaDB, Pinecone), LoRA fine-tuning, PyTorch, and FastAPI.',
    resume_text: 'Specialized in LangChain, LlamaIndex, RAG Architecture, Vector DBs (ChromaDB, Pinecone), LoRA fine-tuning, PyTorch, and FastAPI.',
    legacyAtsScore: 0.28,
    adaptedModelScore: 0.94,
    legacyRank: 7,
    adaptedRank: 1,
    rankShift: 6,
    flaggedSkills: ['LangChain', 'LlamaIndex', 'RAG Architecture', 'Vector Databases', 'LoRA'],
    matchNotes: 'Penalized by legacy ATS as irrelevant due to emergent concepts. Restored by concept drift adaptation (+66%).',
    verdict: 'False Negative Corrected 🌟',
    verdictType: 'emerald',
    isVerified: true,
    verifiedSkills: ['PyTorch', 'Python', 'AWS']
  },
  {
    id: 'cand-2',
    name: 'Shravani Umrani',
    title: 'Full-Stack Software Engineer',
    resumeSnippet: 'Next.js 14 App Router, React 19, TypeScript, Tailwind CSS, Supabase, Prisma ORM, Docker, and AWS serverless deployment.',
    resume_text: 'Next.js 14 App Router, React 19, TypeScript, Tailwind CSS, Supabase, Prisma ORM, Docker, and AWS serverless deployment.',
    legacyAtsScore: 0.38,
    adaptedModelScore: 0.95,
    legacyRank: 7,
    adaptedRank: 1,
    rankShift: 6,
    flaggedSkills: ['Next.js 14', 'Tailwind CSS', 'Supabase'],
    matchNotes: 'High-value modern stack. Legacy ATS penalized absence of jQuery and standard REST keywords.',
    verdict: 'False Negative Corrected 🌟',
    verdictType: 'emerald',
    isVerified: true,
    verifiedSkills: ['TypeScript', 'Next.js 14', 'React 19']
  },
  {
    id: 'cand-3',
    name: 'Shruti Gupta',
    title: 'Lead Data Scientist',
    resumeSnippet: 'PhD in Statistics with 7 years in Python, SQL, Pandas, Scikit-Learn, XGBoost, A/B testing, and Snowflake.',
    resume_text: 'PhD in Statistics with 7 years in Python, SQL, Pandas, Scikit-Learn, XGBoost, A/B testing, and Snowflake.',
    legacyAtsScore: 0.88,
    adaptedModelScore: 0.91,
    legacyRank: 1,
    adaptedRank: 3,
    rankShift: -2,
    flaggedSkills: ['Snowflake'],
    matchNotes: 'Strong foundational competence across both historical and modern screening models.',
    verdict: 'Consistent Baseline Core ✅',
    verdictType: 'cyan',
    isVerified: false,
    verifiedSkills: []
  },
  {
    id: 'cand-4',
    name: 'David Thorne',
    title: 'MLOps Infrastructure Specialist',
    resumeSnippet: 'Kubernetes, Docker, AWS SageMaker, MLflow, Triton Inference Server, vLLM, Terraform, and GitHub Actions CI/CD.',
    resume_text: 'Kubernetes, Docker, AWS SageMaker, MLflow, Triton Inference Server, vLLM, Terraform, and GitHub Actions CI/CD.',
    legacyAtsScore: 0.48,
    adaptedModelScore: 0.89,
    legacyRank: 5,
    adaptedRank: 4,
    rankShift: 1,
    flaggedSkills: ['vLLM', 'Triton Inference', 'GitHub Actions'],
    matchNotes: 'Modern cloud-native inference runtime credited under adapted criteria.',
    verdict: 'False Negative Corrected 🌟',
    verdictType: 'emerald',
    isVerified: true,
    verifiedSkills: ['Docker', 'Kubernetes', 'AWS SageMaker']
  },
  {
    id: 'cand-5',
    name: 'Shreyas Shetty',
    title: 'Legacy Backend Developer',
    resumeSnippet: '10 years experience in Java 8, Hadoop, MapReduce, SVN, SOAP XML, Weka, and Perl.',
    resume_text: '10 years experience in Java 8, Hadoop, MapReduce, SVN, SOAP XML, Weka, and Perl.',
    legacyAtsScore: 0.74,
    adaptedModelScore: 0.32,
    legacyRank: 2,
    adaptedRank: 8,
    rankShift: -6,
    flaggedSkills: ['Hadoop', 'MapReduce', 'SVN', 'SOAP XML', 'Java 8', 'Weka'],
    matchNotes: 'Reverse concept drift: Reliance on legacy tools reduced alignment with modern expectations.',
    verdict: 'Reverse Drift / Legacy Penalty 📉',
    verdictType: 'rose'
  }
];

export const mockLearningRoadmaps = {
  'Generative AI': {
    targetRole: 'Generative AI & Machine Learning Engineer',
    primaryDomain: 'Generative AI',
    missingSkillsCount: 4,
    missingSkillsList: ['LangChain', 'RAG Architecture', 'Vector Databases', 'LoRA Fine-Tuning'],
    estimatedTotalDuration: '8 Weeks (Part-Time Intensive)',
    stages: [
      {
        stageNumber: 1,
        title: 'Stage 1: Core Foundations & Mathematical Principles',
        timeframe: 'Weeks 1–2 (10–12 hrs/week)',
        focus: 'Master transformer internal mechanics, high-dimensional vector embeddings, and similarity metrics.',
        milestones: [
          'Understand self-attention math, positional encodings, and tokenization mechanics',
          'Implement dense semantic embeddings and build an in-memory vector index',
          'Explore cosine similarity vs dot product vs euclidean distance in latent space'
        ],
        verifiedResources: [
          { name: 'Attention Is All You Need (Vaswani et al.)', url: 'https://arxiv.org/abs/1706.03762' },
          { name: 'DeepLearning.AI: Vector Databases from Embeddings to Apps', url: 'https://www.deeplearning.ai/short-courses/vector-databases-embeddings-applications/' }
        ]
      },
      {
        stageNumber: 2,
        title: 'Stage 2: Hands-On RAG & Framework Mastery',
        timeframe: 'Weeks 3–4 (12–15 hrs/week)',
        focus: 'Build modular Retrieval-Augmented Generation systems using LangChain and ChromaDB.',
        milestones: [
          'Implement document chunking, metadata filtering, and hybrid BM25 + dense search',
          'Integrate Cross-Encoder re-ranking to maximize contextual retrieval precision',
          'Add citation tracking and build conversational memory buffers'
        ],
        verifiedResources: [
          { name: 'LangChain Official Documentation & Tutorials', url: 'https://python.langchain.com/docs/introduction/' },
          { name: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP (Lewis et al.)', url: 'https://arxiv.org/abs/2005.11401' }
        ]
      },
      {
        stageNumber: 3,
        title: 'Stage 3: Parameter-Efficient Fine-Tuning & Quantization',
        timeframe: 'Weeks 5–6 (15–18 hrs/week)',
        focus: 'Fine-tune open-weight models with LoRA/QLoRA on custom domain datasets.',
        milestones: [
          'Format instruction-tuning and alignment datasets with chat templates',
          'Configure Hugging Face TRL and PEFT LoRA rank hyperparameters (r=16, alpha=32)',
          'Evaluate model performance using automated benchmark metrics and RAG Triad'
        ],
        verifiedResources: [
          { name: 'LoRA: Low-Rank Adaptation of Large Language Models (Hu et al.)', url: 'https://arxiv.org/abs/2106.09685' },
          { name: 'Hugging Face PEFT Documentation', url: 'https://huggingface.co/docs/peft/index' }
        ]
      },
      {
        stageNumber: 4,
        title: 'Stage 4: Autonomous Agentic Workflows & Production Deployment',
        timeframe: 'Weeks 7–8 (15–20 hrs/week)',
        focus: 'Architect multi-agent graphs with LangGraph, Model Context Protocol (MCP), and high-throughput vLLM serving.',
        milestones: [
          'Build cyclical agentic graph with tool calling, human-in-the-loop, and persistent checkpointers',
          'Deploy model on AWS/GCP behind high-throughput FastAPI and vLLM server',
          'Author end-to-end technical case study and publish GitHub showcase repository'
        ],
        verifiedResources: [
          { name: 'LangGraph Multi-Agent Architecture Guide', url: 'https://langchain-ai.github.io/langgraph/' },
          { name: 'vLLM High-Throughput Inference Engine', url: 'https://docs.vllm.ai/en/latest/' }
        ]
      }
    ],
    futuristicTrend: {
      horizon: '2025–2027+ Emergent Shift',
      trajectory: 'Migration from static prompt engineering to autonomous multi-agent graphs (LangGraph/CrewAI) and Model Context Protocol (MCP) tool integration.',
      demandGrowth: '+380% Enterprise Surge',
      keyEvolution: 'Static Prompting → Autonomous Reasoning & Multi-Agent Graphs'
    }
  }
};

export const mockJDAuditPresets = [
  {
    id: 'preset-jd-ml',
    category: 'Machine Learning Engineer',
    roleTitle: 'Senior Machine Learning Engineer',
    description: 'Legacy ML job spec with deprecated big data tools (Hadoop, MapReduce, SVN, Weka).',
    rawText: 'Seeking Senior Machine Learning Engineer with experience in Hadoop, MapReduce, Subversion (SVN), Java 8, Weka, and SOAP web services to build backend analytical pipelines.',
    staleKeywords: ['Hadoop', 'MapReduce', 'SVN', 'Java 8', 'Weka'],
    suggestedReplacements: [
      { stale: 'Hadoop', modern: 'Apache Spark / Vector Databases' },
      { stale: 'MapReduce', modern: 'Apache Spark / Distributed Embeddings' },
      { stale: 'SVN', modern: 'Git / GitHub Actions CI/CD' },
      { stale: 'Java 8', modern: 'Python 3.11+ / Modern Java 21' },
      { stale: 'Weka', modern: 'PyTorch / Scikit-Learn / Hugging Face' }
    ],
    modernityScore: 32,
    optimizedScore: 96,
    candidateReachPenalty: '-68% Modern Candidate Reach',
    verdict: 'Severe concept drift penalty: Obsolete requirements suppress qualified modern applicants.',
    modernizedText: 'Seeking Senior ML Engineer skilled in Python, PyTorch, LangChain, RAG Architecture, Vector Databases, Spark, Docker, Kubernetes, and GitHub Actions CI/CD.'
  }
];

export const mockDriftRadarSkills = [
  { id: 'sk-1', name: 'LangGraph & Agentic Systems', category: 'Generative AI', firstDetected: '2024-02', anomalyScore: 0.94, trend: '+380%', trendIcon: '🚀', status: 'OOD Critical ⚡', coOccurrences: 'Python, RAG, MCP, LangChain' },
  { id: 'sk-2', name: 'Vector Databases (Pinecone, ChromaDB)', category: 'Generative AI', firstDetected: '2023-08', anomalyScore: 0.88, trend: '+310%', trendIcon: '🚀', status: 'OOD High 🚀', coOccurrences: 'Embeddings, RAG, Python' },
  { id: 'sk-3', name: 'LoRA / QLoRA Fine-Tuning', category: 'Generative AI', firstDetected: '2023-10', anomalyScore: 0.85, trend: '+260%', trendIcon: '🚀', status: 'OOD High 🚀', coOccurrences: 'PyTorch, Hugging Face, PEFT' },
  { id: 'sk-4', name: 'vLLM & Triton Inference', category: 'Cloud & MLOps', firstDetected: '2023-11', anomalyScore: 0.82, trend: '+240%', trendIcon: '📈', status: 'OOD High 🚀', coOccurrences: 'Docker, Kubernetes, CUDA' },
  { id: 'sk-5', name: 'Next.js 14/15 App Router', category: 'Modern Web', firstDetected: '2023-12', anomalyScore: 0.65, trend: '+175%', trendIcon: '📈', status: 'OOD Moderate 📈', coOccurrences: 'React 19, TypeScript, Tailwind' },
  { id: 'sk-6', name: 'PyTorch 2.x Deep Learning', category: 'Data Science', firstDetected: '2021-08', anomalyScore: 0.15, trend: '+45%', trendIcon: '✅', status: 'Baseline Core ✅', coOccurrences: 'Python, CUDA, Transformers' },
  { id: 'sk-7', name: 'FastAPI Microservices', category: 'Cloud & MLOps', firstDetected: '2022-01', anomalyScore: 0.25, trend: '+85%', trendIcon: '🌐', status: 'Assimilated 🌐', coOccurrences: 'Python, Docker, REST' },
  { id: 'sk-8', name: 'Hadoop & MapReduce', category: 'Backend Legacy', firstDetected: '2014-01', anomalyScore: 0.05, trend: '-65%', trendIcon: '📉', status: 'Deprecated / Reverse 📉', coOccurrences: 'Java 8, Legacy SQL' }
];

export const mockSkillGraph = {
  nodes: [
    { id: 'langchain', label: 'LangChain', group: 1, cluster: 'Generative AI', isOOD: true },
    { id: 'rag', label: 'RAG Architecture', group: 1, cluster: 'Generative AI', isOOD: true },
    { id: 'vector_db', label: 'Vector Databases', group: 1, cluster: 'Generative AI', isOOD: true },
    { id: 'prompt_eng', label: 'Prompt Engineering', group: 1, cluster: 'Generative AI', isOOD: true },
    { id: 'lora', label: 'LoRA / PEFT', group: 1, cluster: 'Generative AI', isOOD: true },
    { id: 'python', label: 'Python', group: 2, cluster: 'Data Science', isOOD: false },
    { id: 'pytorch', label: 'PyTorch', group: 2, cluster: 'Deep Learning', isOOD: false },
    { id: 'sql', label: 'SQL', group: 2, cluster: 'Data Science', isOOD: false },
    { id: 'pandas', label: 'Pandas', group: 2, cluster: 'Data Science', isOOD: false },
    { id: 'docker', label: 'Docker', group: 3, cluster: 'DevOps & MLOps', isOOD: false },
    { id: 'kubernetes', label: 'Kubernetes', group: 3, cluster: 'DevOps & MLOps', isOOD: false },
    { id: 'fastapi', label: 'FastAPI', group: 3, cluster: 'DevOps & MLOps', isOOD: false },
    { id: 'react', label: 'React 19', group: 4, cluster: 'Modern Web', isOOD: false },
    { id: 'nextjs', label: 'Next.js 14', group: 4, cluster: 'Modern Web', isOOD: true },
    { id: 'typescript', label: 'TypeScript', group: 4, cluster: 'Modern Web', isOOD: false },
    { id: 'product_strategy', label: 'Product Strategy', group: 5, cluster: 'Product Management', isOOD: false },
    { id: 'leadership', label: 'Engineering Leadership', group: 7, cluster: 'Leadership & Management', isOOD: false }
  ],
  edges: [
    { from: 'langchain', to: 'rag', value: 10 },
    { from: 'rag', to: 'vector_db', value: 10 },
    { from: 'python', to: 'langchain', value: 9 },
    { from: 'python', to: 'pytorch', value: 9 },
    { from: 'pytorch', to: 'lora', value: 8 },
    { from: 'fastapi', to: 'docker', value: 8 },
    { from: 'docker', to: 'kubernetes', value: 8 },
    { from: 'react', to: 'nextjs', value: 9 },
    { from: 'nextjs', to: 'typescript', value: 8 },
    { from: 'python', to: 'sql', value: 10 },
    { from: 'product_strategy', to: 'leadership', value: 7 }
  ]
};

export const mockUsersDb = [
  {
    id: "usr_default_admin",
    name: "Alex Sterling",
    email: "alex@skillshift.com",
    password: "password123",
    role: "student",
    education: "M.S. Computer Science",
    claimedSkills: ["Python", "React", "Next.js", "Machine Learning", "Vector Databases"],
    verifiedSkills: ["Python", "React"],
    certificates: [],
    githubLinked: true,
    githubUrl: "https://github.com/alexsterling",
    applications: []
  },
  {
    id: "usr_recruiter_admin",
    name: "Rachel Hiring",
    email: "recruiter@skillshift.com",
    password: "password123",
    role: "recruiter",
    education: "",
    claimedSkills: [],
    verifiedSkills: [],
    certificates: [],
    githubLinked: false,
    githubUrl: "",
    applications: []
  },
  {
    id: "usr_rec_google", name: "Google Recruiter", email: "recruiter@google.com", password: "password123", role: "recruiter", companyId: "google"
  },
  {
    id: "usr_rec_meta", name: "Meta Recruiter", email: "recruiter@meta.com", password: "password123", role: "recruiter", companyId: "meta"
  },
  {
    id: "usr_rec_amazon", name: "Amazon Recruiter", email: "recruiter@amazon.com", password: "password123", role: "recruiter", companyId: "amazon"
  },
  {
    id: "usr_rec_netflix", name: "Netflix Recruiter", email: "recruiter@netflix.com", password: "password123", role: "recruiter", companyId: "netflix"
  },
  {
    id: "usr_rec_apple", name: "Apple Recruiter", email: "recruiter@apple.com", password: "password123", role: "recruiter", companyId: "apple"
  },
  {
    id: "usr_rec_jpmorgan", name: "JPMorgan Recruiter", email: "recruiter@jpmorgan.com", password: "password123", role: "recruiter", companyId: "jpmorgan"
  }
];
