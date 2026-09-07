import React, { useState, useEffect } from 'react';
import { 
  FileEdit, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check, 
  RotateCcw, 
  Layers, 
  Zap, 
  TrendingUp,
  FileText,
  Sliders,
  History,
  Clock,
  X
} from 'lucide-react';
import { auditJobDescription, fetchAuditHistory } from '../services/api';
import { mockJDAuditPresets } from '../data/mockData';

const JDAuditor = ({ isBackendLive }) => {
  const [selectedPresetId, setSelectedPresetId] = useState(mockJDAuditPresets[0].id);
  const [targetRole, setTargetRole] = useState(mockJDAuditPresets[0].category);
  const [jdText, setJdText] = useState(mockJDAuditPresets[0].rawText);
  const [auditResult, setAuditResult] = useState(mockJDAuditPresets[0]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [historyAudits, setHistoryAudits] = useState([]);

  useEffect(() => {
    loadHistory();
  }, [isBackendLive]);

  const loadHistory = async () => {
    try {
      const hist = await fetchAuditHistory();
      setHistoryAudits(hist || []);
    } catch (e) {
      console.error("Failed to fetch audit history", e);
    }
  };

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setTargetRole(preset.category);
    setJdText(preset.rawText);
    setAuditResult(preset);
  };

  const handleAudit = async () => {
    if (!jdText.trim()) return;
    setLoading(true);
    const res = await auditJobDescription(jdText, targetRole);
    setAuditResult(res);
    setLoading(false);
    loadHistory();
  };

  const handleCopyModernized = () => {
    if (auditResult?.modernizedText) {
      navigator.clipboard.writeText(auditResult.modernizedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRestoreAudit = (audit) => {
    setSelectedPresetId('history-' + audit.id);
    setTargetRole(audit.roleTitle || 'Custom Spec');
    setJdText(audit.rawText || '');
    setAuditResult({
      id: audit.id,
      roleTitle: audit.roleTitle,
      category: audit.roleTitle,
      modernityScore: audit.modernityScore,
      optimizedScore: audit.optimizedScore,
      candidateReachPenalty: audit.candidateReachPenalty,
      staleKeywords: audit.staleKeywords || [],
      suggestedReplacements: audit.suggestedReplacements || [],
      modernizedText: audit.modernizedText || ''
    });
    setShowHistoryDrawer(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Job Description (JD) Drift Auditor & Optimizer</h2>
            <span className="badge badge-purple">
              <FileEdit size={13} />
              Talent Acquisition Tool
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '820px', fontSize: '0.9375rem' }}>
            Identify obsolete, legacy skill requirements in your company's job postings that inadvertently filter out cutting-edge applicants. Modernize your hiring criteria to expand talent reach.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowHistoryDrawer(true)}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.875rem' }}
          >
            <History size={16} />
            <span>Audit History Logs ({historyAudits.length})</span>
          </button>
        </div>
      </div>

      {/* Preset JD Archetypes */}
      <div>
        <label style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)', marginBottom: '12px', display: 'block' }}>
          Select a Benchmark Spec to Audit:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {mockJDAuditPresets.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`card card-interactive ${isSelected ? 'card-glass' : ''}`}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  borderColor: isSelected ? 'var(--accent-purple)' : 'var(--border-subtle)',
                  background: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-rose" style={{ fontSize: '0.6875rem' }}>
                    Modernity: {preset.modernityScore}/100
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {preset.category}
                  </span>
                </div>
                <strong style={{ fontSize: '0.9375rem', color: isSelected ? 'var(--accent-purple)' : 'var(--text-primary)' }}>
                  {preset.roleTitle}
                </strong>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {preset.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Main Audit Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) minmax(400px, 1.2fr)', gap: '24px' }}>
        
        {/* Left Side: JD Input and Role Config */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--accent-purple)" />
              <span>Job Posting Specification</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Editable Input
            </span>
          </div>

          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
              Target Job Category / Domain
            </label>
            <input 
              type="text"
              className="input-base"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Machine Learning Engineer, Backend Developer"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
              Job Description Text (Requirements & Responsibilities)
            </label>
            <textarea
              className="input-base"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={12}
              style={{ width: '100%', resize: 'vertical', fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'inherit' }}
              placeholder="Paste your active job spec requirements here..."
            />
          </div>

          <button 
            onClick={handleAudit}
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px 20px', background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}
          >
            {loading ? (
              <span>Auditing Concept Drift...</span>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Audit & Modernize Requirements</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        {/* Right Side: Audit Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Modernity Scores Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            <div className="card" style={{ borderLeft: '4px solid var(--accent-rose)', padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Current Modernity Index
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-rose)', lineHeight: 1 }}>
                  {auditResult.modernityScore}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--accent-rose)', fontWeight: 600 }}>
                {auditResult.candidateReachPenalty}
              </span>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--accent-emerald)', padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Optimized Reach Score
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-emerald)', lineHeight: 1 }}>
                  {auditResult.optimizedScore || 96}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                Maximum Candidate Pool Conversion
              </span>
            </div>

          </div>

          {/* Stale Requirements & Suggested Replacements */}
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={17} color="var(--accent-amber)" />
              <span>Flagged Obsolete Requirements & Recommended Upgrades</span>
            </h4>

            {auditResult.suggestedReplacements && auditResult.suggestedReplacements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {auditResult.suggestedReplacements.map((item, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '10px 14px', 
                      background: 'var(--bg-surface-elevated)', 
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-rose" style={{ fontSize: '0.75rem' }}>
                        Obsolete: {item.stale}
                      </span>
                    </div>
                    <ArrowRight size={15} color="var(--text-muted)" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                        Replace with: {item.modern}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No explicit obsolete keywords detected.
              </div>
            )}
          </div>

          {/* Modernized Job Description Output Box */}
          {auditResult.modernizedText && (
            <div className="card" style={{ padding: '22px', border: '1px solid rgba(124, 58, 237, 0.3)', background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.04) 0%, var(--bg-surface) 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="var(--accent-purple)" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    AI-Modernized Job Description Output
                  </h4>
                </div>
                <button 
                  onClick={handleCopyModernized} 
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.75rem' }}
                >
                  {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Modernized Spec'}</span>
                </button>
              </div>

              <pre style={{ 
                background: 'var(--bg-canvas)', 
                padding: '16px', 
                borderRadius: '10px', 
                fontSize: '0.8125rem', 
                color: 'var(--text-secondary)',
                lineHeight: '1.65',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                border: '1px solid var(--border-subtle)'
              }}>
                {auditResult.modernizedText}
              </pre>
            </div>
          )}

        </div>

      </div>

      {/* History Drawer Modal */}
      {showHistoryDrawer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: 999,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            height: '100%',
            backgroundColor: 'var(--bg-surface)',
            borderLeft: '1px solid var(--border-subtle)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <History size={20} color="var(--accent-purple)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Audit History Logs</h3>
              </div>
              <button 
                onClick={() => setShowHistoryDrawer(false)}
                className="btn-icon"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Past job description modernizations automatically persisted to the local SQLite database.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              {historyAudits.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <Clock size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
                  <p>No past JD audits found in database.</p>
                  <p style={{ fontSize: '0.75rem', marginTop: '6px' }}>Run an audit to automatically log your results.</p>
                </div>
              ) : (
                historyAudits.map((hist) => (
                  <div 
                    key={hist.id} 
                    className="card card-interactive"
                    style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}
                    onClick={() => handleRestoreAudit(hist)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--accent-purple)' }}>
                        {hist.roleTitle}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {new Date(hist.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8125rem' }}>
                      <span className="badge badge-rose" style={{ fontSize: '0.75rem' }}>
                        Initial: {hist.modernityScore}/100
                      </span>
                      <ArrowRight size={14} color="var(--text-muted)" />
                      <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                        Optimized: {hist.optimizedScore}/100
                      </span>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {hist.rawText}
                    </p>

                    <button 
                      className="btn-secondary" 
                      style={{ alignSelf: 'flex-start', padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      Load this Spec
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default JDAuditor;
