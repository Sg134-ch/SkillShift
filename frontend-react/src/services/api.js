import axios from 'axios';
import { 
  mockTimeline, 
  mockSkillGraph, 
  mockCandidatePresets 
} from '../data/mockData';

const CANDIDATE_PORTS = [8000, 8001];

let cachedActiveUrl = null;

/**
 * Checks for live backend server on port 8000 or 8001 with quick timeout.
 */
export const checkBackendHealth = async () => {
  for (const port of CANDIDATE_PORTS) {
    const url = `http://localhost:${port}`;
    try {
      const res = await axios.get(`${url}/`, { timeout: 1200 });
      if (res.status === 200 && res.data) {
        cachedActiveUrl = `${url}/api`;
        return { isLive: true, url: cachedActiveUrl, port };
      }
    } catch {
      // Continue to next port
    }
  }
  return { isLive: false, url: null, port: null };
};

/**
 * Fetches drift metrics timeline (Live with fallback).
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
      console.warn('Backend metrics call failed, falling back to simulated data', e);
    }
  }
  return { data: mockTimeline, isLive: false, port: null };
};

/**
 * Fetches skill co-occurrence graph (Live with fallback).
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
      console.warn('Backend graph call failed, falling back to simulated graph', e);
    }
  }
  return { data: mockSkillGraph, isLive: false, port: null };
};

/**
 * Evaluates candidate resume against target job (Live with intelligent simulated fallback).
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

  // Local simulated matching engine
  // Check if matches one of our preset archetypes
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

  // Generic heuristic simulation for custom user input:
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
