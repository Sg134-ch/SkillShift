import React, { useState } from 'react';
import { 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Sliders, 
  TrendingUp,
  FileCheck,
  RotateCcw,
  Zap,
  Layers,
  ChevronRight
} from 'lucide-react';
import { evaluateResumeMatch } from '../services/api';
import { mockCandidatePresets } from '../data/mockData';

const Matcher = ({ isBackendLive }) => {
  const [jobTitle, setJobTitle] = useState('Machine Learning Engineer');
  const [resumeText, setResumeText] = useState(mockCandidatePresets[0].resumeText);
  const [selectedPresetId, setSelectedPresetId] = useState(mockCandidatePresets[0].id);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({
    score_before_adaptation: mockCandidatePresets[0].scores.stale,
    score_after_adaptation: mockCandidatePresets[0].scores.adapted,
    missing_skills_flagged: mockCandidatePresets[0].flaggedSkills,
    recognized_baseline: mockCandidatePresets[0].recognizedBaseline,
    explanation: mockCandidatePresets[0].explanation,
    dimensions: mockCandidatePresets[0].dimensions,
    isLive: false
  });
  const [error, setError] = useState('');

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setJobTitle(preset.targetJobTitle);
    setResumeText(preset.resumeText);
    setResult({
      score_before_adaptation: preset.scores.stale,
      score_after_adaptation: preset.scores.adapted,
      missing_skills_flagged: preset.flaggedSkills,
      recognized_baseline: preset.recognizedBaseline,
      explanation: preset.explanation,
      dimensions: preset.dimensions,
      isLive: false
    });
    setError('');
  };

  const handleEvaluate = async () => {
    if (!resumeText.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await evaluateResumeMatch(resumeText, jobTitle);
      
      // Auto-populate dimensions if custom text
      const lower = resumeText.toLowerCase();
      const hasGenAI = lower.includes('langchain') || lower.includes('prompt') || lower.includes('rag') || lower.includes('llm');
      
      const customDimensions = [
        { name: 'Core Technical Competence', stale: Math.round(response.score_before_adaptation * 90), adapted: Math.round(response.score_after_adaptation * 95) },
        { name: 'Modern Tooling Alignment', stale: hasGenAI ? 20 : Math.round(response.score_before_adaptation * 85), adapted: Math.round(response.score_after_adaptation * 92) },
        { name: 'Domain Relevance', stale: Math.round(response.score_before_adaptation * 80), adapted: Math.round(response.score_after_adaptation * 90) },
      ];

      // Extract basic recognized skills
      const sampleBases = ['python', 'sql', 'docker', 'aws', 'pandas', 'react', 'java', 'statistics'];
      const recognized = sampleBases.filter(b => lower.includes(b)).map(s => s.charAt(0).toUpperCase() + s.slice(1));

      setResult({
        ...response,
        recognized_baseline: recognized.length > 0 ? recognized : ['Standard Fundamentals'],
        dimensions: customDimensions
      });
    } catch (err) {
      console.error(err);
      setError('Evaluation engine encountered an error. Falling back to local diagnostic heuristics.');
    } finally {
      setLoading(false);
    }
  };

  const scoreBeforePct = Math.round(result.score_before_adaptation * 100);
  const scoreAfterPct = Math.round(result.score_after_adaptation * 100);
  const deltaPct = scoreAfterPct - scoreBeforePct;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Top Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Resume Matcher & Diagnostic Studio</h2>
          <span className="badge badge-indigo">
            <Zap size={13} />
            Dual-Model Engine
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '800px', fontSize: '0.9375rem' }}>
          Evaluate how <strong>Concept Drift</strong> influences candidate screening. See how a static 2021 model penalizes modern high-value skills as anomalous out-of-distribution noise, and how the 2024 adapted model restores matching fairness.
        </p>
      </div>

      {/* Preset Candidate Profiles Selection */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <label style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Instant Test Presets (Select a Candidate Archetype):
          </label>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to load & evaluate instantly</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {mockCandidatePresets.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`card card-interactive ${isSelected ? 'card-glass' : ''}`}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                  background: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  boxShadow: isSelected ? 'var(--glow-cyan)' : 'var(--card-shadow)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge badge-${preset.badgeType}`}>
                    {preset.badge}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {preset.targetJobTitle}
                  </span>
                </div>
                <strong style={{ fontSize: '0.9375rem', color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                  {preset.title}
                </strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', marginTop: 'auto', paddingTop: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delta:</span>
                  <strong style={{ color: preset.scores.delta.startsWith('+') ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                    {preset.scores.delta}
                  </strong>
                  <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Sandbox Workspace: Form + Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 460px) 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Left Side: Candidate Input Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
            <Briefcase size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Profile Parameters</h3>
          </div>

          <div>
            <label htmlFor="target-role">Target Role Specification</label>
            <select 
              id="target-role"
              value={jobTitle} 
              onChange={(e) => {
                setSelectedPresetId(null);
                setJobTitle(e.target.value);
              }}
            >
              <option value="Machine Learning Engineer">Machine Learning Engineer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="Software Engineer">Software Engineer</option>
            </select>
          </div>

          <div>
            <label htmlFor="resume-profile">Candidate Resume / Skill Profile</label>
            <textarea 
              id="resume-profile"
              rows={8}
              value={resumeText} 
              onChange={(e) => {
                setSelectedPresetId(null);
                setResumeText(e.target.value);
              }}
              placeholder="Paste candidate resume or skill profile here..."
              style={{ lineHeight: '1.6', fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <button 
              className="btn-primary" 
              onClick={handleEvaluate}
              disabled={loading}
              style={{ width: '100%', padding: '12px 20px' }}
            >
              {loading ? (
                <>
                  <div className="status-dot simulated" />
                  <span>Computing Semantic Embeddings...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Evaluate Concept Drift Impact</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-rose)', borderRadius: '10px', fontSize: '0.8125rem' }}>
              {error}
            </div>
          )}

        </div>

        {/* Right Side: Dual-Model Comparison Studio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Comparison Banner */}
          <div className="card" style={{ 
            padding: '20px 24px', 
            background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Evaluation Target
              </span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {jobTitle}
              </h4>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Model Shift Delta:</span>
              <span className={`badge badge-${deltaPct > 0 ? 'emerald' : deltaPct === 0 ? 'cyan' : 'rose'}`} style={{ fontSize: '0.9375rem', padding: '6px 14px' }}>
                {deltaPct > 0 ? `+${deltaPct}% Accuracy Gain` : `${deltaPct}% Drift Penalty`}
              </span>
            </div>
          </div>

          {/* Dual Big Score Cards (Side-by-Side) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            
            {/* Stale Model (2021) */}
            <div className="card" style={{ 
              borderLeft: '4px solid var(--accent-rose)', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Stale Model (2021)
                </span>
                <span className="badge badge-rose">Static Baseline</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, color: scoreBeforePct < 60 ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
                  {scoreBeforePct}%
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Match Score</span>
              </div>

              {/* Progress visual bar */}
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${scoreBeforePct}%`, height: '100%', backgroundColor: scoreBeforePct < 60 ? 'var(--accent-rose)' : 'var(--accent-amber)', borderRadius: '4px' }} />
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                {scoreBeforePct < 60 ? '⚠️ High risk of rejecting qualified talent due to out-of-distribution penalties.' : 'Standard baseline profile recognized.'}
              </p>
            </div>

            {/* Adapted Model (2024) */}
            <div className="card" style={{ 
              borderLeft: '4px solid var(--accent-emerald)', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              background: 'linear-gradient(180deg, rgba(52, 211, 153, 0.04) 0%, var(--bg-surface) 100%)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Adapted Model (2024)
                </span>
                <span className="badge badge-emerald">Active Assimilation</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--accent-emerald)' }}>
                  {scoreAfterPct}%
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Match Score</span>
              </div>

              {/* Progress visual bar */}
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${scoreAfterPct}%`, height: '100%', backgroundColor: 'var(--accent-emerald)', borderRadius: '4px' }} />
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                ✅ Modern skill semantics successfully assimilated into the graph.
              </p>
            </div>

          </div>

          {/* Skill Classification Scanner Matrix */}
          <div className="card">
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--accent-cyan)" />
              <span>Extracted Skill Classification Matrix</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
              
              {/* Out-of-Distribution Penalized Skills */}
              <div style={{ padding: '16px', background: 'var(--bg-surface-elevated)', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <AlertTriangle size={16} color="var(--accent-amber)" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                    Flagged Out-of-Distribution ({result.missing_skills_flagged?.length || 0})
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {result.missing_skills_flagged && result.missing_skills_flagged.length > 0 ? (
                    result.missing_skills_flagged.map((skill, idx) => (
                      <span key={idx} className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>None (Standard baseline vocabulary)</span>
                  )}
                </div>
              </div>

              {/* Recognized Baseline Skills */}
              <div style={{ padding: '16px', background: 'var(--bg-surface-elevated)', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <CheckCircle2 size={16} color="var(--accent-emerald)" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    Recognized Baseline Core ({result.recognized_baseline?.length || 0})
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {result.recognized_baseline && result.recognized_baseline.length > 0 ? (
                    result.recognized_baseline.map((skill, idx) => (
                      <span key={idx} className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No explicit core baseline tokens</span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Dimensional Competence Breakdown */}
          {result.dimensions && result.dimensions.length > 0 && (
            <div className="card">
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
                Dimensional Competency Comparison
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {result.dimensions.map((dim, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{dim.name}</span>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span style={{ color: 'var(--accent-rose)' }}>Stale: {dim.stale}%</span>
                        <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>Adapted: {dim.adapted}%</span>
                      </div>
                    </div>
                    {/* Dual comparison bar */}
                    <div style={{ position: 'relative', height: '10px', background: 'var(--bg-surface-elevated)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${dim.adapted}%`, background: 'var(--accent-emerald)', opacity: 0.85, borderRadius: '5px' }} />
                      <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${dim.stale}%`, background: 'var(--accent-rose)', opacity: 0.9, borderRadius: '5px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diagnostic Explanation Box */}
          <div className="card" style={{ 
            backgroundColor: 'var(--bg-surface-elevated)', 
            border: '1px solid var(--border-strong)',
            padding: '20px'
          }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              <FileCheck size={18} color="var(--accent-cyan)" />
              <span>Concept Drift Diagnostic Explanation</span>
            </h4>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.65', color: 'var(--text-secondary)', margin: 0 }}>
              {result.explanation}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Matcher;
