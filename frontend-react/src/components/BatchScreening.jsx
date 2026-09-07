import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Download, 
  Filter, 
  FileCheck, 
  Zap, 
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Building2,
  Sliders,
  Upload,
  FileUp,
  FileText,
  Plus,
  Trash2,
  X,
  History,
  Clock
} from 'lucide-react';
import { runBatchScreening, uploadBatchResumes, fetchScreeningHistory } from '../services/api';
import { mockBatchCandidates } from '../data/mockData';
import { useApp } from '../context/AppContext';

const BatchScreening = ({ isBackendLive }) => {
  const multiFileInputRef = useRef(null);
  const { recruiterCohort, setRecruiterCohort } = useApp();
  
  const [dragActive, setDragActive] = useState(false);
  const [showAddManual, setShowAddManual] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [historyRuns, setHistoryRuns] = useState([]);
  
  const [manualName, setManualName] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualText, setManualText] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const { targetRole, candidates, uploadedFiles, metrics } = recruiterCohort;

  const updateState = (updates) => {
    setRecruiterCohort(prev => ({ ...prev, ...updates }));
  };

  const executeScreening = async (candidateList) => {
    const listToScreen = candidateList || candidates;
    if (!listToScreen || listToScreen.length === 0) return;

    setLoading(true);
    try {
      const res = await runBatchScreening(listToScreen, targetRole);
      updateState({
        candidates: res.candidates || [],
        metrics: res.metrics || metrics
      });
    } catch (err) {
      console.error("Batch screening error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeScreening();
    loadHistory();
  }, [targetRole, isBackendLive]);

  const loadHistory = async () => {
    const hist = await fetchScreeningHistory();
    setHistoryRuns(hist || []);
  };

  const processMultipleFiles = async (files) => {
    if (!files || files.length === 0) return;

    setLoading(true);
    const fileArray = Array.from(files);

    // Try server-side batch upload first
    const serverResult = await uploadBatchResumes(fileArray);
    if (serverResult.candidates && serverResult.candidates.length > 0) {
      const updated = [...serverResult.candidates, ...candidates];
      updateState({
        candidates: updated,
        uploadedFiles: [...uploadedFiles, ...fileArray.map(f => ({ name: f.name, size: (f.size / 1024).toFixed(1) + ' KB' }))]
      });
      executeScreening(updated);
      setLoading(false);
      return;
    }

    // Client-side fallback
    const newCandidates = [];
    const newFileEntries = [];

    fileArray.forEach((file, index) => {
      const candidateId = `user-cand-${Date.now()}-${index}`;
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      
      newFileEntries.push({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      });

      const reader = new FileReader();

      if (file.name.endsWith('.pdf')) {
        reader.onload = (e) => {
          try {
            const buffer = e.target.result;
            const textDecoder = new TextDecoder('utf-8');
            const rawString = typeof buffer === 'string' ? buffer : textDecoder.decode(new Uint8Array(buffer));
            const extracted = rawString.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
            const text = extracted.length > 50 ? extracted : `Resume of ${cleanName}: Python, PyTorch, LangChain, RAG, Vector Databases, FastAPI, Docker, Cloud Systems.`;
            
            const cand = {
              id: candidateId,
              name: cleanName,
              title: targetRole,
              resumeSnippet: text,
              resume_text: text,
              legacyAtsScore: 0.40,
              adaptedModelScore: 0.85
            };

            updateState({
              candidates: [cand, ...candidates],
              uploadedFiles: [...uploadedFiles, ...newFileEntries]
            });
            executeScreening([cand, ...candidates]);
          } catch {}
        };
        reader.readAsArrayBuffer(file);
      } else {
        reader.onload = (e) => {
          const text = e.target.result || `Resume of ${cleanName}`;
          const cand = {
            id: candidateId,
            name: cleanName,
            title: targetRole,
            resumeSnippet: text,
            resume_text: text,
            legacyAtsScore: 0.40,
            adaptedModelScore: 0.85
          };
          updateState({
            candidates: [cand, ...candidates],
            uploadedFiles: [...uploadedFiles, ...newFileEntries]
          });
          executeScreening([cand, ...candidates]);
        };
        reader.readAsText(file);
      }
    });
    setLoading(false);
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processMultipleFiles(e.dataTransfer.files);
    }
  };

  const handleManualAdd = (e) => {
    e.preventDefault();
    if (!manualName.trim() || !manualText.trim()) return;

    const newCand = {
      id: `manual-${Date.now()}`,
      name: manualName.trim(),
      title: manualTitle.trim() || targetRole,
      resumeSnippet: manualText.trim(),
      resume_text: manualText.trim(),
      legacyAtsScore: 0.45,
      adaptedModelScore: 0.88
    };

    const updated = [newCand, ...candidates];
    updateState({ candidates: updated });
    setManualName('');
    setManualTitle('');
    setManualText('');
    setShowAddManual(false);
    executeScreening(updated);
  };

  const handleRemoveCandidate = (id, e) => {
    e.stopPropagation();
    const updated = candidates.filter(c => c.id !== id);
    updateState({ candidates: updated });
    executeScreening(updated);
  };

  const handleResetPresets = () => {
    updateState({
      uploadedFiles: [],
      candidates: mockBatchCandidates
    });
    executeScreening(mockBatchCandidates);
  };

  const handleClearAll = () => {
    updateState({
      uploadedFiles: [],
      candidates: [],
      metrics: {
        totalScreened: 0,
        falseNegativesRecovered: 0,
        falseNegativeRate: '0%',
        averageAdaptationGain: '+0%'
      }
    });
  };

  const handleReloadFromHistory = (run) => {
    updateState({
      targetRole: run.targetRole,
      candidates: run.candidates,
      metrics: {
        totalScreened: run.totalScreened,
        falseNegativesRecovered: run.falseNegatives,
        falseNegativeRate: run.falseNegativeRate,
        averageAdaptationGain: run.avgAdaptationGain
      }
    });
    setShowHistoryDrawer(false);
  };

  const filteredCandidates = candidates.filter(c => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'fn') return c.verdict?.includes('False Negative');
    if (statusFilter === 'baseline') return c.verdict?.includes('Consistent');
    if (statusFilter === 'legacy') return c.verdict?.includes('Reverse') || c.verdict?.includes('Low');
    return true;
  });

  const getRankBadgeClass = (rank) => {
    if (rank === 1) return 'rank-badge rank-gold';
    if (rank === 2) return 'rank-badge rank-silver';
    if (rank === 3) return 'rank-badge rank-bronze';
    return 'rank-badge rank-default';
  };

  const exportCSV = () => {
    const headers = ['Adapted Rank,Name,Title,Legacy ATS Score,Legacy Rank,Adapted Score,Adapted Rank,Rank Shift,Verdict,Flagged OOD Skills\n'];
    const rows = candidates.map(c => 
      `"${c.adaptedRank}","${c.name}","${c.title}","${Math.round(c.legacyAtsScore * 100)}%","${c.legacyRank}","${Math.round(c.adaptedModelScore * 100)}%","${c.adaptedRank}","${c.rankShift > 0 ? '+' + c.rankShift : c.rankShift}","${c.verdict}","${(c.flaggedSkills || []).join('; ')}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `skillshift_screening_audit_${targetRole.toLowerCase().replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Top Header & Context */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>ATS False-Negative Leaderboard & Batch Screening</h2>
            <span className="badge badge-purple">
              <Users size={13} />
              Recruiter Intelligence Studio
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '820px', fontSize: '0.9375rem' }}>
            Upload multiple real candidate resumes at once. Audit screening bias, eliminate <strong>algorithmic false negatives</strong>, and persist all screening runs in your local SQLite database.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => { setShowHistoryDrawer(!showHistoryDrawer); loadHistory(); }}
            className="btn-secondary"
            style={{ fontSize: '0.8125rem', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <History size={14} />
            <span>Past Audits ({historyRuns.length})</span>
          </button>
          <button 
            onClick={handleResetPresets}
            className="btn-secondary"
            style={{ fontSize: '0.8125rem', padding: '9px 14px' }}
          >
            Load 8 Benchmarks
          </button>
          <button 
            onClick={handleClearAll}
            className="btn-secondary"
            style={{ fontSize: '0.8125rem', padding: '9px 14px', color: 'var(--accent-rose)' }}
          >
            Clear Cohort
          </button>
          <button 
            onClick={exportCSV} 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '0.8125rem' }}
          >
            <Download size={15} />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* History Drawer */}
      {showHistoryDrawer && (
        <div className="card" style={{ padding: '20px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--accent-purple)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--accent-purple)" />
              <span>SQLite Persistent Screening History:</span>
            </strong>
            <button onClick={() => setShowHistoryDrawer(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          {historyRuns.length === 0 ? (
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No past runs logged yet. Run a screening to save to SQLite database.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
              {historyRuns.map((run) => (
                <div 
                  key={run.id}
                  onClick={() => handleReloadFromHistory(run)}
                  className="card card-interactive"
                  style={{ padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{run.targetRole}</strong>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      {run.totalScreened} Candidates • {run.falseNegatives} False Negatives Rescued
                    </div>
                  </div>
                  <span className="badge badge-purple" style={{ fontSize: '0.6875rem' }}>
                    Reload
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Multi-Resume File Dropzone & Upload Panel */}
      <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <input 
          type="file" 
          ref={multiFileInputRef}
          onChange={(e) => processMultipleFiles(e.target.files)}
          multiple
          accept=".pdf,.docx,.doc,.txt,.md,.rtf"
          style={{ display: 'none' }}
        />

        <div 
          className={`dropzone-container ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => multiFileInputRef.current?.click()}
          style={{ padding: '26px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <FileUp size={32} color="var(--accent-purple)" />
          <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
            Upload Multiple Resumes (Drag & Drop or Click to Browse)
          </strong>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Select 1 to 50+ PDF, DOCX, Word, or plain text resumes to evaluate simultaneously
          </span>
        </div>

        {/* Uploaded Files Chips & Manual Add Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Active Cohort ({candidates.length} Profiles):
            </span>
            {uploadedFiles.map((f, idx) => (
              <span key={idx} className="badge badge-indigo" style={{ fontSize: '0.6875rem' }}>
                {f.name} ({f.size})
              </span>
            ))}
          </div>

          <button 
            onClick={() => setShowAddManual(!showAddManual)}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} />
            <span>{showAddManual ? 'Close Quick-Add' : 'Quick-Add Candidate Manually'}</span>
          </button>
        </div>

        {/* Manual Candidate Form Drawer */}
        {showAddManual && (
          <form onSubmit={handleManualAdd} style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Add Candidate Resume Text</strong>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Candidate Full Name (e.g. Jordan Smith)"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                required
                style={{ fontSize: '0.8125rem' }}
              />
              <input 
                type="text" 
                placeholder="Candidate Current Title (e.g. Senior ML Dev)"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                style={{ fontSize: '0.8125rem' }}
              />
            </div>
            <textarea 
              rows={3}
              placeholder="Paste candidate skills / resume text here..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              required
              style={{ fontSize: '0.8125rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setShowAddManual(false)} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.75rem' }}>
                Add to Batch & Screen
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Aggregate Executive Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
        
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid var(--accent-indigo)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Cohort Screened
          </span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {metrics.totalScreened}
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Candidate profiles evaluated simultaneously</span>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid var(--accent-emerald)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            False Negatives Recovered
          </span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-emerald)', lineHeight: 1 }}>
            {metrics.falseNegativesRecovered}
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>Top talent rescued from ATS rejection</span>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid var(--accent-amber)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            ATS Bias Filter Rate
          </span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-amber)', lineHeight: 1 }}>
            {metrics.falseNegativeRate}
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Falsely penalized for modern terminology</span>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid var(--accent-cyan)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Avg Score Gain After Drift Fix
          </span>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-cyan)', lineHeight: 1 }}>
            {metrics.averageAdaptationGain}
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>True technical capability unlocked</span>
        </div>

      </div>

      {/* Interactive Controls & Filters */}
      <div className="card" style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Target Job Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label htmlFor="target-screen-role" style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>
            Target Benchmark Role:
          </label>
          <select 
            id="target-screen-role"
            value={targetRole}
            onChange={(e) => updateState({ targetRole: e.target.value })}
            style={{ width: '230px', padding: '8px 12px', fontSize: '0.875rem' }}
          >
            <option value="Machine Learning Engineer">Machine Learning Engineer</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="Software Engineer">Software Engineer</option>
          </select>

          <button 
            onClick={() => executeScreening()}
            disabled={loading}
            className="btn-primary"
            style={{ padding: '9px 18px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>{loading ? 'Evaluating Model...' : 'Re-Run Batch Screen'}</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Candidates' },
            { id: 'fn', label: 'False Negatives Rescued 🌟' },
            { id: 'baseline', label: 'Consistent Baseline Core' },
            { id: 'legacy', label: 'Legacy / Low Overlap' }
          ].map((f) => {
            const isSelected = statusFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                  color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Leaderboard Table Container */}
      {candidates.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <Users size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '6px' }}>No Candidates in Cohort</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Upload resumes above or click "Load 8 Benchmarks" to begin screening.</p>
        </div>
      ) : (
        <div className="data-table-container card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>Adapted Rank</th>
                <th>Candidate & Skill Profile</th>
                <th style={{ width: '150px' }}>Legacy ATS Score</th>
                <th style={{ width: '160px' }}>Adapted Score (2024)</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Rank Shift</th>
                <th style={{ width: '200px' }}>Drift Audit Verdict</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((cand) => {
                const isExpanded = expandedId === cand.id;
                const legacyPct = Math.round(cand.legacyAtsScore * 100);
                const adaptedPct = Math.round(cand.adaptedModelScore * 100);

                return (
                  <React.Fragment key={cand.id}>
                    <tr 
                      style={{ cursor: 'pointer', background: isExpanded ? 'var(--bg-surface-elevated)' : 'transparent' }}
                      onClick={() => setExpandedId(isExpanded ? null : cand.id)}
                    >
                      
                      {/* Rank Badge */}
                      <td style={{ textAlign: 'center' }}>
                        <div className={getRankBadgeClass(cand.adaptedRank)}>
                          #{cand.adaptedRank}
                        </div>
                      </td>

                      {/* Candidate Name & Info */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{cand.name}</strong>
                            {cand.experience && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({cand.experience})</span>}
                          </div>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{cand.title}</span>
                          
                          {/* Flagged Skills Chips */}
                          {cand.flaggedSkills && cand.flaggedSkills.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                              {cand.flaggedSkills.map((sk, idx) => (
                                <span key={idx} className="badge badge-amber" style={{ fontSize: '0.6875rem', padding: '1px 6px' }}>
                                  {sk}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Legacy ATS Score */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                            <span style={{ color: legacyPct < 60 ? 'var(--accent-rose)' : 'var(--text-primary)', fontWeight: 700 }}>
                              {legacyPct}%
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rank #{cand.legacyRank}</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'var(--bg-canvas)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${legacyPct}%`, height: '100%', background: legacyPct < 60 ? 'var(--accent-rose)' : 'var(--accent-amber)' }} />
                          </div>
                        </div>
                      </td>

                      {/* Adapted Model Score */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                            <span style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>
                              {adaptedPct}%
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>Rank #{cand.adaptedRank}</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'var(--bg-canvas)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${adaptedPct}%`, height: '100%', background: 'var(--accent-emerald)' }} />
                          </div>
                        </div>
                      </td>

                      {/* Rank Shift Indicator */}
                      <td style={{ textAlign: 'center' }}>
                        {cand.rankShift > 0 ? (
                          <span className="rank-shift-up">
                            <ArrowUpRight size={16} />
                            <span>+{cand.rankShift}</span>
                          </span>
                        ) : cand.rankShift < 0 ? (
                          <span className="rank-shift-down">
                            <ArrowDownRight size={16} />
                            <span>{cand.rankShift}</span>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>0 (Steady)</span>
                        )}
                      </td>

                      {/* Verdict Pill */}
                      <td>
                        <span className={`badge badge-${cand.verdictType || 'indigo'}`} style={{ fontSize: '0.75rem' }}>
                          {cand.verdict}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button 
                            onClick={(e) => handleRemoveCandidate(cand.id, e)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            title="Remove candidate from batch"
                          >
                            <Trash2 size={15} />
                          </button>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        </div>
                      </td>

                    </tr>

                    {/* Expanded Breakdown Drawer */}
                    {isExpanded && (
                      <tr style={{ background: 'var(--bg-surface-elevated)' }}>
                        <td colSpan="7" style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FileCheck size={16} color="var(--accent-cyan)" />
                              <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                Drift Diagnostic & Screening Rationale
                              </strong>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                              {cand.matchNotes || 'Candidate exhibits standard semantic overlap against benchmark requirements.'}
                            </p>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              <strong>Resume Excerpt:</strong> "{cand.resumeSnippet}"
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default BatchScreening;
