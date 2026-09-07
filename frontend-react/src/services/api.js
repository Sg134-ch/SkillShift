import axios from 'axios';
import { 
  mockTimeline, 
  mockSkillGraph, 
  mockCandidatePresets,
  mockCompanyDemands,
  mockBatchCandidates,
  mockLearningRoadmaps,
  mockJDAuditPresets
} from '../data/mockData';

const ENV_API_URL = import.meta.env.VITE_API_URL || null;
const CANDIDATE_PORTS = [8000, 8001];

let cachedActiveUrl = null;

/**
 * Checks for live backend server with environment variable priority and port fallback.
 */
export const checkBackendHealth = async () => {
  if (ENV_API_URL) {
    try {
      const res = await axios.get(`${ENV_API_URL}/`, { timeout: 1500 });
      if (res.status === 200) {
        cachedActiveUrl = `${ENV_API_URL}/api`;
        return { isLive: true, url: cachedActiveUrl, port: 'Configured' };
      }
    } catch {}
  }

  for (const port of CANDIDATE_PORTS) {
    const url = `http://localhost:${port}`;
    try {
      const res = await axios.get(`${url}/`, { timeout: 1200 });
      if (res.status === 200 && res.data) {
        cachedActiveUrl = `${url}/api`;
        return { isLive: true, url: cachedActiveUrl, port };
      }
    } catch {}
  }
  return { isLive: false, url: null, port: null };
};

/**
 * Server-side document parser for PDF, DOCX, TXT.
 */
export const uploadResumeFile = async (file) => {
  try {
    const health = await checkBackendHealth();
    if (health.isLive && health.url) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${health.url}/parse-resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 5000
      });
      if (res.data && res.data.text) {
        return { ...res.data, isLive: true };
      }
    }
  } catch (e) {
    console.warn("Backend file parse failed, using client parser", e);
  }
  return { filename: file.name, text: null, isLive: false };
};

/**
 * Server-side batch multi-file resume uploader.
 */
export const uploadBatchResumes = async (files) => {
  try {
    const health = await checkBackendHealth();
    if (health.isLive && health.url) {
      const formData = new FormData();
      for (const f of files) {
        formData.append('files', f);
      }
      const res = await axios.post(`${health.url}/upload-batch`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 8000
      });
      if (res.data && res.data.candidates) {
        return { candidates: res.data.candidates, count: res.data.count, isLive: true };
      }
    }
  } catch (e) {
    console.warn("Backend batch upload failed", e);
  }
  return { candidates: [], count: 0, isLive: false };
};

/**
 * Fetches drift metrics timeline.
 */
export const fetchDriftMetrics = async (forceSimulated = false) => {
  if (!forceSimulated) {
    try {
      const health = await checkBackendHealth();
      if (health.isLive && health.url) {
        const res = await axios.get(`${health.url}/drift-metrics`, { timeout: 2500 });
        if (res.data && res.data.timeline && res.data.timeline.length > 0) {
          return { data: res.data.timeline, isLive: true, port: health.port };
        }
      }
    } catch (e) {
      console.warn('Backend metrics call failed, using simulated fallback', e);
    }
  }
  return { data: mockTimeline, isLive: false, port: null };
};

/**
 * Fetches skill co-occurrence graph.
 */
export const fetchSkillGraph = async (forceSimulated = false) => {
  if (!forceSimulated) {
    try {
      const health = await checkBackendHealth();
      if (health.isLive && health.url) {
        const res = await axios.get(`${health.url}/skill-graph`, { timeout: 2500 });
        if (res.data && res.data.nodes && res.data.nodes.length > 0) {
          return { data: res.data, isLive: true, port: health.port };
        }
      }
    } catch (e) {
      console.warn('Backend graph call failed, using simulated fallback', e);
    }
  }
  return { data: mockSkillGraph, isLive: false, port: null };
};

/**
 * Evaluates candidate resume match.
 */
export const evaluateResumeMatch = async (resumeText, targetJobTitle, forceSimulated = false) => {
  if (!forceSimulated) {
    try {
      const health = await checkBackendHealth();
      if (health.isLive && health.url) {
        const res = await axios.post(`${health.url}/match`, {
          resume_text: resumeText,
          target_job_title: targetJobTitle
        }, { timeout: 4000 });
        
        if (res.data && typeof res.data.score_before_adaptation === 'number') {
          return { ...res.data, isLive: true, port: health.port };
        }
      }
    } catch (e) {
      console.warn('Backend match call failed, falling back to local evaluation engine', e);
    }
  }

  // Local simulated fallback
  const lowerResume = resumeText.toLowerCase();
  const matchedPreset = mockCandidatePresets.find(p => 
    p.targetJobTitle === targetJobTitle && 
    (lowerResume.includes('langchain') || lowerResume.includes('prompt engineering') || lowerResume.includes('llama'))
  );

  if (matchedPreset) {
    return {
      score_before_adaptation: matchedPreset.scores.stale,
      score_after_adaptation: matchedPreset.scores.adapted,
      missing_skills_flagged: matchedPreset.flaggedSkills,
      explanation: matchedPreset.explanation,
      isLive: false
    };
  }

  const oodKeywords = ['langchain', 'prompt engineering', 'llama', 'rag', 'vector', 'openai', 'llms', 'generative ai', 'lora', 'claude', 'next.js 14', 'tailwind'];
  const baseKeywords = ['python', 'sql', 'pandas', 'scikit-learn', 'java', 'docker', 'aws', 'statistics', 'react'];

  const foundOod = oodKeywords.filter(k => lowerResume.includes(k));
  const foundBase = baseKeywords.filter(k => lowerResume.includes(k));

  let scoreBefore = 0.5 + (foundBase.length * 0.08) - (foundOod.length * 0.09);
  let scoreAfter = 0.5 + (foundBase.length * 0.08) + (foundOod.length * 0.11);

  scoreBefore = Math.max(0.15, Math.min(0.95, scoreBefore));
  scoreAfter = Math.max(0.25, Math.min(0.98, scoreAfter));

  let explanation = "";
  if (foundOod.length > 0) {
    explanation = `The stale 2021 model penalized modern concepts (${foundOod.slice(0, 3).join(', ')}) as out-of-distribution noise. After adaptation, the model recognizes them as cutting-edge requirements for ${targetJobTitle}.`;
  } else if (scoreBefore >= 0.7) {
    explanation = `Strong alignment with established historical baseline requirements for ${targetJobTitle}. Minimal concept drift impact detected.`;
  } else {
    explanation = `The resume exhibits modest semantic overlap with both baseline and adapted job criteria for ${targetJobTitle}.`;
  }

  return {
    score_before_adaptation: scoreBefore,
    score_after_adaptation: scoreAfter,
    missing_skills_flagged: foundOod.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    explanation,
    isLive: false
  };
};

/**
 * Fetches company skill demands.
 */
export const fetchCompanyDemands = async (skillQuery = '', domain = 'all', forceSimulated = false) => {
  if (!forceSimulated) {
    try {
      const health = await checkBackendHealth();
      if (health.isLive && health.url) {
        const res = await axios.get(`${health.url}/companies`, {
          params: { skill: skillQuery || undefined, domain: domain !== 'all' ? domain : undefined },
          timeout: 2500
        });
        if (res.data && res.data.companies) {
          return { companies: res.data.companies, total: res.data.total, isLive: true, port: health.port };
        }
      }
    } catch (e) {
      console.warn('Backend company call failed, using simulated directory', e);
    }
  }

  let results = [...mockCompanyDemands];
  if (skillQuery) {
    const q = skillQuery.toLowerCase().trim();
    results = results.filter(c => 
      c.requiredSkills.some(s => s.toLowerCase().includes(q)) ||
      c.emergingSkills.some(s => s.toLowerCase().includes(q)) ||
      c.roleTitle.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q)
    );
  }
  if (domain && domain !== 'all') {
    results = results.filter(c => 
      c.industry.toLowerCase().includes(domain.toLowerCase()) || 
      c.roleTitle.toLowerCase().includes(domain.toLowerCase()) ||
      c.tier.toLowerCase().includes(domain.toLowerCase())
    );
  }

  return { companies: results, total: results.length, isLive: false, port: null };
};

/**
 * Runs recruiter batch candidate screening.
 */
export const runBatchScreening = async (candidates = mockBatchCandidates, targetJobTitle = 'Machine Learning Engineer', forceSimulated = false) => {
  if (!forceSimulated) {
    try {
      const health = await checkBackendHealth();
      if (health.isLive && health.url) {
        const formatted = candidates.map(c => ({
          id: c.id,
          name: c.name,
          title: c.title || targetJobTitle,
          resume_text: c.resumeSnippet || c.resume_text || c.name
        }));

        const res = await axios.post(`${health.url}/batch-screen`, {
          target_job_title: targetJobTitle,
          candidates: formatted
        }, { timeout: 6000 });

        if (res.data && res.data.candidates) {
          return { ...res.data, isLive: true, port: health.port };
        }
      }
    } catch (e) {
      console.warn('Backend batch screening failed, falling back to simulated leaderboard', e);
    }
  }

  return {
    candidates: mockBatchCandidates,
    metrics: {
      totalScreened: mockBatchCandidates.length,
      falseNegativesRecovered: 3,
      falseNegativeRate: '37.5%',
      averageAdaptationGain: '+44.6%'
    },
    isLive: false,
    port: null
  };
};

/**
 * Audits a company Job Description for concept drift and obsolete requirements.
 */
export const auditJobDescription = async (jdText, targetJobTitle = 'Machine Learning Engineer', forceSimulated = false) => {
  if (!forceSimulated) {
    try {
      const health = await checkBackendHealth();
      if (health.isLive && health.url) {
        const res = await axios.post(`${health.url}/audit-jd`, {
          jd_text: jdText,
          target_job_title: targetJobTitle
        }, { timeout: 3000 });

        if (res.data && typeof res.data.modernityScore === 'number') {
          return { ...res.data, isLive: true, port: health.port };
        }
      }
    } catch (e) {
      console.warn('Backend JD audit failed, falling back to simulated auditor', e);
    }
  }

  const matchedPreset = mockJDAuditPresets.find(p => p.roleTitle.toLowerCase().includes(targetJobTitle.toLowerCase()) || jdText.includes(p.staleKeywords[0]));
  if (matchedPreset) {
    return { ...matchedPreset, isLive: false, port: null };
  }

  const textLower = jdText.toLowerCase();
  const staleKeywords = ['hadoop', 'mapreduce', 'svn', 'subversion', 'java 8', 'weka', 'perl', 'soap', 'angularjs', 'jquery', 'bootstrap 3', 'sas', 'spss', 'excel vba'];
  const foundStale = staleKeywords.filter(k => textLower.includes(k)).map(s => s.charAt(0).toUpperCase() + s.slice(1));
  const modernity = Math.max(30, 100 - (foundStale.length * 15));

  return {
    modernityScore: modernity,
    optimizedScore: Math.min(98, modernity + 35),
    staleKeywords: foundStale,
    suggestedReplacements: foundStale.map(s => ({ stale: s, modern: `Modern ${s} Cloud/AI Alternative` })),
    candidateReachPenalty: `-${foundStale.length * 15 + 10}% Modern Candidate Reach`,
    verdict: foundStale.length > 0 ? 'Obsolete keywords detected that reduce reach among contemporary candidates.' : 'Modern and well-aligned job description.',
    modernizedText: jdText,
    isLive: false,
    port: null
  };
};

/**
 * Retrieves past screening runs from SQLite database.
 */
export const fetchScreeningHistory = async () => {
  try {
    const health = await checkBackendHealth();
    if (health.isLive && health.url) {
      const res = await axios.get(`${health.url}/history/screenings`, { timeout: 2500 });
      if (res.data && res.data.history) {
        return res.data.history;
      }
    }
  } catch (e) {
    console.warn("Could not fetch screening history", e);
  }
  return [];
};

/**
 * Retrieves past JD audits from SQLite database.
 */
export const fetchAuditHistory = async () => {
  try {
    const health = await checkBackendHealth();
    if (health.isLive && health.url) {
      const res = await axios.get(`${health.url}/history/audits`, { timeout: 2500 });
      if (res.data && res.data.history) {
        return res.data.history;
      }
    }
  } catch (e) {
    console.warn("Could not fetch audit history", e);
  }
  return [];
};

/**
 * Generates structured learning roadmap for missing skills.
 */
export const generateLearningRoadmap = (flaggedSkills = [], targetJobTitle = 'Machine Learning Engineer') => {
  const lowerSkills = flaggedSkills.map(s => s.toLowerCase());
  if (lowerSkills.some(s => s.includes('langchain') || s.includes('rag') || s.includes('vector') || s.includes('prompt') || s.includes('lora') || s.includes('llm') || s.includes('peft') || s.includes('vllm'))) {
    return mockLearningRoadmaps['Generative AI'];
  }
  if (lowerSkills.some(s => s.includes('fastapi') || s.includes('docker') || s.includes('kubernetes') || s.includes('mlops') || s.includes('aws') || s.includes('triton'))) {
    return mockLearningRoadmaps['Cloud & MLOps'];
  }
  if (lowerSkills.some(s => s.includes('next') || s.includes('tailwind') || s.includes('react') || s.includes('typescript') || s.includes('supabase'))) {
    return mockLearningRoadmaps['Modern Web'];
  }
  return mockLearningRoadmaps['Generative AI'];
};
