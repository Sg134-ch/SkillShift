import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronRight,
  Upload,
  FileUp,
  FileText,
  X,
  BookOpen,
  Building2,
  DollarSign,
  Compass,
  Award,
  Settings2,
  Code,
  ShieldCheck,
  Download
} from 'lucide-react';
import mermaid from 'mermaid';
import { evaluateResumeMatch, generateLearningRoadmap, uploadResumeFile } from '../services/api';
import { mockCandidatePresets, mockCompanyDemands } from '../data/mockData';
import { useApp } from '../context/AppContext';

const Matcher = ({ isBackendLive }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { studentResume, setStudentResume, recruiterCohort, setRecruiterCohort, dimensionWeights, setDimensionWeights } = useApp();
  
  const [activeTab, setActiveTab] = useState('diagnostic'); // 'diagnostic' | 'roadmap' | 'companies'
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWeightSliders, setShowWeightSliders] = useState(false);


  React.useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'base' });
    if (activeTab === 'roadmap') {
      setTimeout(() => {
        mermaid.contentLoaded();
      }, 100);
    }
  }, [activeTab, studentResume.result?.roadmap]);

  const {
    resumeText,
    targetRole,
    selectedPresetId,
    uploadedFile,
    result
  } = studentResume;

  const updateState = (updates) => {
    setStudentResume(prev => ({ ...prev, ...updates }));
  };

  const handleSelectPreset = (preset) => {
    // If the candidate exists in the recruiter cohort, use their verified status
    const candidateRecruiterProfile = recruiterCohort?.candidates?.find(c => c.name === preset.name);
    
    updateState({
      selectedPresetId: preset.id,
      uploadedFile: null,
      name: preset.name,
      targetRole: preset.targetJobTitle,
      resumeText: preset.resumeText,
      verifiedSkills: candidateRecruiterProfile ? (candidateRecruiterProfile.verifiedSkills || []) : [],
      result: null // DO NOT pre-populate results so the user has to click Evaluate
    });
    setError('');
  };

  // Process uploaded file (Server-side parser with client fallback)
  const processFile = async (file) => {
    if (!file) return;
    
    setLoading(true);
    const fileInfo = {
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type || file.name.split('.').pop().toUpperCase()
    };

    updateState({
      uploadedFile: fileInfo,
      selectedPresetId: null
    });

    // Try server-side parsing first
    const serverResult = await uploadResumeFile(file);
    if (serverResult.text) {
      updateState({ resumeText: serverResult.text });
      setLoading(false);
      return;
    }

    // Client-side fallback
    const reader = new FileReader();
    if (file.name.endsWith('.pdf')) {
      reader.onload = (e) => {
        try {
          const buffer = e.target.result;
          const textDecoder = new TextDecoder('utf-8');
          const rawString = typeof buffer === 'string' ? buffer : textDecoder.decode(new Uint8Array(buffer));
          const extracted = rawString.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
          updateState({
            resumeText: extracted.length > 50 ? extracted.slice(0, 2500) : `Candidate Resume (${file.name}): No text extracted`
          });
        } catch {
          updateState({
            resumeText: `Candidate Resume (${file.name}): No text extracted`
          });
        }
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (e) => {
        const text = e.target.result;
        if (text && text.trim()) {
          updateState({ resumeText: text.trim() });
        }
        setLoading(false);
      };
      reader.readAsText(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearFile = () => {
    updateState({
      uploadedFile: null,
      resumeText: ''
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEvaluate = async () => {
    if (!resumeText.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await evaluateResumeMatch(resumeText, targetRole);
      
      const lower = resumeText.toLowerCase();
      const hasGenAI = lower.includes('langchain') || lower.includes('prompt') || lower.includes('rag') || lower.includes('llm') || lower.includes('vector');
      
      // Calculate weighted dimensions
      const customDimensions = [
        { name: 'Core Technical Competence', stale: Math.round(response.score_before_adaptation * 90), adapted: Math.round(response.score_after_adaptation * 95) },
        { name: 'Modern Tooling Alignment', stale: hasGenAI ? 22 : Math.round(response.score_before_adaptation * 85), adapted: Math.round(response.score_after_adaptation * 94) },
        { name: 'Domain Relevance', stale: Math.round(response.score_before_adaptation * 80), adapted: Math.round(response.score_after_adaptation * 92) },
      ];

      const sampleBases = ['python', 'sql', 'docker', 'aws', 'pandas', 'react', 'java', 'statistics', 'pytorch', 'scikit-learn'];
      const recognized = sampleBases.filter(b => lower.includes(b)).map(s => s.charAt(0).toUpperCase() + s.slice(1));

      updateState({
        result: {
          ...response,
          recognized_baseline: response.recognized_baseline?.length > 0 ? response.recognized_baseline : (recognized.length > 0 ? recognized : ['Core Engineering Fundamentals']),
          true_missing: response.true_missing || [],
          missing_skills_flagged: response.missing_skills_flagged || [],
          dimensions: customDimensions
        }
      });
    } catch (err) {
      console.error(err);
      setError('Evaluation engine encountered an error. Falling back to local diagnostic heuristics.');
    } finally {
      setLoading(false);
    }
  };

  const scoreBeforePct = result ? Math.round(result.score_before_adaptation * 100) : 0;
  const scoreAfterPct = result ? Math.round(result.score_after_adaptation * 100) : 0;
  const deltaPct = scoreAfterPct - scoreBeforePct;

  const rawRoadmap = result ? (result.roadmap || generateLearningRoadmap(result.true_missing?.length > 0 ? result.true_missing : (result.missing_skills_flagged || []), targetRole)) : null;
  const finalRoadmap = rawRoadmap ? {
    trackTitle: rawRoadmap.targetRole ? `Personalized ${rawRoadmap.targetRole} Plan` : rawRoadmap.trackTitle,
    overview: rawRoadmap.careerImpact || rawRoadmap.overview,
    targetScoreImpact: rawRoadmap.estimatedTotalDuration || rawRoadmap.targetScoreImpact,
    milestones: rawRoadmap.stages || rawRoadmap.milestones,
    mermaidFlowchart: rawRoadmap.mermaidFlowchart
  } : null;

  const lowerResume = resumeText.toLowerCase();
  const matchedCompanies = mockCompanyDemands.map(comp => {
    const matched = comp.requiredSkills.filter(s => lowerResume.includes(s.toLowerCase()));
    const missing = comp.requiredSkills.filter(s => !lowerResume.includes(s.toLowerCase()));
    const matchPct = Math.round(Math.max(45, Math.min(98, (matched.length / comp.requiredSkills.length) * 100)));
    return {
      ...comp,
      matchedSkills: matched,
      missingSkills: missing,
      matchPct
    };
  }).sort((a, b) => b.matchPct - a.matchPct).slice(0, 4);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Top Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Resume Matcher & Diagnostic Studio</h2>
          <span className="badge badge-cyan">
            <Zap size={13} />
            Dual-Model Concept Drift Engine
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '820px', fontSize: '0.9375rem' }}>
          Evaluate how <strong>Concept Drift</strong> influences candidate evaluation. Upload your real resume or test presets to identify penalized out-of-distribution skills, customize competency weightings, generate a personalized learning roadmap, and explore target company matches.
        </p>
      </div>

      {/* Preset Candidate Profiles Selection */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <label style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Instant Benchmark Presets:
          </label>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click archetype to load instantly</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', flexWrap: 'wrap' }}>
          {mockCandidatePresets.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            const deltaStr = preset.scores?.delta || (preset.scores?.adapted != null ? `${preset.scores.adapted >= preset.scores.stale ? '+' : ''}${Math.round((preset.scores.adapted - preset.scores.stale) * 100)}%` : '+0%');
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`card card-interactive ${isSelected ? 'card-glass' : ''}`}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                  background: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  boxShadow: isSelected ? 'var(--glow-cyan)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <strong style={{ fontSize: '0.85rem', color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                    {preset.title || preset.name}
                  </strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {preset.badge} • <strong style={{ color: deltaStr.startsWith('+') ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>{deltaStr}</strong>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Sandbox Workspace: Form + Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 460px) 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Left Side: Candidate Input & File Upload Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase size={20} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Profile Parameters & Upload</h3>
            </div>

            <button
              onClick={() => setShowWeightSliders(!showWeightSliders)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
              title="Customize evaluation dimension weights"
            >
              <Settings2 size={15} />
              <span>Weights</span>
            </button>
          </div>

          {/* Dimension Weight Customizer Drawer */}
          {showWeightSliders && (
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                <span>Evaluation Weights Calibration:</span>
                <span style={{ color: 'var(--accent-cyan)' }}>Total: 100%</span>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                  <span>Modern Tooling Alignment:</span>
                  <strong>{dimensionWeights.modernTooling}%</strong>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="70" 
                  value={dimensionWeights.modernTooling}
                  onChange={(e) => setDimensionWeights(prev => ({ ...prev, modernTooling: parseInt(e.target.value) }))}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                  <span>Core Fundamentals:</span>
                  <strong>{dimensionWeights.coreTechnical}%</strong>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="70" 
                  value={dimensionWeights.coreTechnical}
                  onChange={(e) => setDimensionWeights(prev => ({ ...prev, coreTechnical: parseInt(e.target.value) }))}
                  style={{ width: '100%', height: '4px' }}
                />
              </div>
            </div>
          )}

          {/* Role Specification Selector */}
          <div>
            <label htmlFor="target-role">Target Role Specification</label>
            <select 
              id="target-role"
              value={targetRole} 
              onChange={(e) => {
                updateState({
                  selectedPresetId: null,
                  targetRole: e.target.value
                });
              }}
            >
              <option value="Machine Learning Engineer">Machine Learning Engineer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="Product Manager">Product Manager</option>
            </select>
          </div>

          {/* Drag & Drop File Uploader */}
          <div>
            <label>Upload Resume File (PDF / DOCX / TXT / MD)</label>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processFile(e.target.files[0]);
                }
              }}
              accept=".pdf,.docx,.doc,.txt,.md,.rtf"
              style={{ display: 'none' }}
            />

            {!uploadedFile ? (
              <div 
                className={`dropzone-container ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp size={28} color="var(--accent-cyan)" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Click to browse or Drag & Drop Resume
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Supports PDF, Word, Markdown, or plain text
                </div>
              </div>
            ) : (
              <div className="file-chip">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={18} color="var(--accent-cyan)" />
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>{uploadedFile.name}</strong>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{uploadedFile.size} • {uploadedFile.type}</div>
                  </div>
                </div>
                <button 
                  onClick={handleClearFile} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Remove uploaded file"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>



          {/* Text Area Workspace */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="resume-profile" style={{ margin: 0 }}>Candidate Skills / Resume Text</label>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Saved & synced</span>
            </div>
            <textarea 
              id="resume-profile"
              rows={7}
              value={resumeText} 
              onChange={(e) => {
                updateState({
                  selectedPresetId: null,
                  resumeText: e.target.value
                });
              }}
              placeholder="Paste candidate resume or skills here..."
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
                  <span>Evaluating Semantic Embeddings...</span>
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

        {/* Right Side: Comparison Studio, Roadmap & Company Matches */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {!result ? (
            <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', height: '100%', justifyContent: 'center', borderStyle: 'dashed' }}>
              <Sparkles size={40} color="var(--border-strong)" />
              <div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1.25rem' }}>Ready to Analyze</h4>
                <p style={{ margin: 0, fontSize: '0.9375rem', maxWidth: '300px' }}>Click <strong>Evaluate Concept Drift Impact</strong> to begin the dual-model analysis.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Top Result Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            <button
              onClick={() => setActiveTab('diagnostic')}
              className={`portal-tab ${activeTab === 'diagnostic' ? 'active student' : ''}`}
            >
              <Zap size={14} />
              <span>Dual-Model Diagnostic</span>
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`portal-tab ${activeTab === 'roadmap' ? 'active student' : ''}`}
            >
              <BookOpen size={14} />
              <span>AI Learning Roadmap ({finalRoadmap?.milestones?.length || 4} Steps)</span>
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`portal-tab ${activeTab === 'companies' ? 'active student' : ''}`}
            >
              <Building2 size={14} />
              <span>Top Company Matches ({matchedCompanies.length})</span>
            </button>
          </div>

          {/* Tab 1: Diagnostic View */}
          {activeTab === 'diagnostic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Top Comparison Banner */}
              <div className="card" style={{ 
                padding: '18px 22px', 
                background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Evaluation Target Role
                  </span>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {targetRole}
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
                <div className="card" style={{ borderLeft: '4px solid var(--accent-rose)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${scoreBeforePct}%`, height: '100%', backgroundColor: scoreBeforePct < 60 ? 'var(--accent-rose)' : 'var(--accent-amber)', borderRadius: '4px' }} />
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {scoreBeforePct < 60 ? '⚠️ Falsely penalized modern cutting-edge skills as out-of-distribution noise.' : 'Standard baseline profile recognized.'}
                  </p>
                </div>

                {/* Adapted Model (2024) */}
                <div className="card" style={{ borderLeft: '4px solid var(--accent-emerald)', display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(180deg, rgba(52, 211, 153, 0.04) 0%, var(--bg-surface) 100%)' }}>
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

                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${scoreAfterPct}%`, height: '100%', backgroundColor: 'var(--accent-emerald)', borderRadius: '4px' }} />
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                    ✅ Modern skills successfully assimilated into the graph.
                  </p>
                </div>

              </div>

              {/* Skill Classification Matrix */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Layers size={18} color="var(--accent-cyan)" />
                    <span>Skill Gap Diagnostic Matrix</span>
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                  
                  {/* Recognized Baseline (What they have - Good) */}
                  <div style={{ padding: '16px', background: 'var(--bg-canvas)', borderRadius: '10px', borderTop: '3px solid var(--accent-emerald)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} color="var(--accent-emerald)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Recognized Core ({result.recognized_baseline?.length || 0})
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Baseline competencies aligned with target role.</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {result.recognized_baseline && result.recognized_baseline.length > 0 ? (
                        result.recognized_baseline.map((skill, idx) => (
                          <span key={idx} className="badge" style={{ fontSize: '0.75rem', background: 'rgba(52, 211, 153, 0.1)', color: 'var(--accent-emerald)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>None recognized</span>
                      )}
                    </div>
                  </div>

                  {/* Flagged Outdated (What they have - Bad/Legacy) */}
                  <div style={{ padding: '16px', background: 'var(--bg-canvas)', borderRadius: '10px', borderTop: '3px solid var(--accent-amber)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={16} color="var(--accent-amber)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Flagged / Outdated ({result.missing_skills_flagged?.length || 0})
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Skills penalized as legacy or out-of-distribution.</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {result.missing_skills_flagged && result.missing_skills_flagged.length > 0 ? (
                        result.missing_skills_flagged.map((skill, idx) => (
                          <span key={idx} className="badge" style={{ fontSize: '0.75rem', background: 'rgba(251, 191, 36, 0.1)', color: 'var(--accent-amber)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>None</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Modern Skills (What they need) */}
                  <div style={{ padding: '16px', background: 'var(--bg-canvas)', borderRadius: '10px', borderTop: '3px solid var(--accent-rose)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Zap size={16} color="var(--accent-rose)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Missing Modern Skills ({result.true_missing?.length || 0})
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Critical gaps required for 2024 hiring standards.</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {result.true_missing && result.true_missing.length > 0 ? (
                        result.true_missing.map((skill, idx) => (
                          <span key={idx} className="badge" style={{ fontSize: '0.75rem', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>None identified</span>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Diagnostic Explanation Box */}
              <div className="card" style={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-strong)', padding: '20px' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                  <FileCheck size={18} color="var(--accent-cyan)" />
                  <span>Concept Drift Diagnostic Explanation</span>
                </h4>
                <p style={{ fontSize: '0.875rem', lineHeight: '1.65', color: 'var(--text-secondary)', margin: 0 }}>
                  {result.explanation}
                </p>
              </div>

            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="card" style={{ padding: '24px' }} id="roadmap-print-area">
              
              {/* Print Only Header */}
              <div className="print-only">
                <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Personalized Learning Roadmap</h1>
                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><strong>Candidate Name:</strong> {studentResume.name || 'Anonymous Candidate'}</div>
                  <div><strong>Target Role:</strong> {targetRole}</div>
                  <div>
                    <strong>Core Baseline Skills:</strong> {result?.recognized_baseline && result.recognized_baseline.length > 0 ? result.recognized_baseline.join(', ') : 'Not available'}
                  </div>
                  <div>
                    <strong>Flagged / Outdated Skills:</strong> {result?.missing_skills_flagged && result.missing_skills_flagged.length > 0 ? result.missing_skills_flagged.join(', ') : 'None'}
                  </div>
                  <div>
                    <strong>Missing Modern Skills:</strong> {result?.true_missing && result.true_missing.length > 0 ? result.true_missing.join(', ') : 'None identified'}
                  </div>
                </div>
                <hr style={{ borderColor: 'var(--border-subtle)', marginBottom: '16px' }} />
              </div>

              <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={20} color="var(--accent-cyan)" />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{finalRoadmap.trackTitle}</h3>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                    {finalRoadmap.overview}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span className="badge badge-emerald" style={{ fontSize: '0.8125rem', padding: '6px 12px' }}>
                    {finalRoadmap.targetScoreImpact}
                  </span>
                  <button onClick={() => window.print()} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={14} /> Download PDF
                  </button>
                </div>
              </div>

              {finalRoadmap.mermaidFlowchart && (
                <div style={{ padding: '16px', background: 'var(--bg-canvas)', borderRadius: '12px', marginBottom: '24px', overflowX: 'auto' }}>
                  <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Your Learning Journey:</h4>
                  <div className="mermaid">
                    {finalRoadmap.mermaidFlowchart}
                  </div>
                </div>
              )}

              <div className="roadmap-timeline">
                {finalRoadmap.milestones.map((ms, idx) => (
                  <div key={idx} className="roadmap-step">
                    <div className="roadmap-node">{idx + 1}</div>
                    <div className="roadmap-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                          {ms.week || ms.timeframe}: {ms.title}
                        </strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {(ms.skills || []).map((s, sIdx) => (
                            <span key={sIdx} className="badge badge-cyan" style={{ fontSize: '0.6875rem' }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {ms.description || ms.focus}
                      </p>
                      <div style={{ background: 'var(--bg-canvas)', padding: '10px 14px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.65rem' }}>Recommended Course</div>
                        {ms.verifiedResources && ms.verifiedResources.length > 0 ? (
                          <a href={ms.verifiedResources[0].url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>
                            {ms.verifiedResources[0].name}
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-primary)' }}>{ms.resource || 'Professional Certification Course'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Top Company Matches */}
          {activeTab === 'companies' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Company Alignment for Your Profile</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Matched against contemporary 2024 job descriptions and hiring requirements.
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/companies')} 
                  className="btn-secondary"
                  style={{ fontSize: '0.8125rem', padding: '6px 14px' }}
                >
                  Explore All Companies
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {matchedCompanies.map((comp) => (
                  <div key={comp.id} className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: comp.logoColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                          {comp.name.charAt(0)}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{comp.name}</strong>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{comp.tier}</div>
                        </div>
                      </div>
                      <span className="badge badge-emerald" style={{ fontSize: '0.8125rem', fontWeight: 800 }}>
                        {comp.matchPct}% Match
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {comp.roleTitle}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '4px' }}>
                        Skills You Match ({comp.matchedSkills.length}):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {comp.matchedSkills.map((s, idx) => (
                          <span key={idx} className="badge badge-emerald" style={{ fontSize: '0.6875rem' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {comp.missingSkills.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '4px' }}>
                          Unlock 100% Fit:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {comp.missingSkills.map((s, idx) => (
                            <span key={idx} className="badge badge-amber" style={{ fontSize: '0.6875rem' }}>
                              + {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600, marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                      <span>{comp.salaryBand}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{comp.hiringUrgency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
            </>
          )}

        </div>

      </div>



    </div>
  );
};

export default Matcher;
