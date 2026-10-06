import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Layers, 
  ArrowUpRight, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  BarChart3,
  Calendar,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { fetchDriftMetrics } from '../services/api';
import { mockCategoriesBreakdown, executiveKpis } from '../data/mockData';
import { Link } from 'react-router-dom';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: 'var(--bg-surface)', 
        border: '1px solid var(--border-strong)', 
        padding: '12px 16px', 
        borderRadius: '12px',
        boxShadow: 'var(--card-shadow)',
        fontSize: '0.8125rem'
      }}>
        <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color, margin: '3px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
            <span>{entry.name}:</span>
            <strong>{entry.value.toLocaleString()}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = ({ isBackendLive }) => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      const res = await fetchDriftMetrics();
      setMetrics(res.data);
      setTimelineIndex(res.data.length - 1);
      setLoading(false);
    };
    loadMetrics();
  }, [isBackendLive]);

  // Timeline playback animation effect
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineIndex(prev => {
          if (prev >= metrics.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 600);
    }
    return () => clearInterval(interval);
  }, [isPlaying, metrics.length]);

  const currentTimelinePoint = metrics[timelineIndex] || {
    month: '2024-05',
    vocab_size: 2975,
    new_skills_detected: 33,
    drift_rate: 4.4
  };

  const visibleData = metrics.slice(0, timelineIndex + 1);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Top Welcome & Summary Header */}
      <div className="card" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.05))', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '8px', color: 'var(--accent-cyan)' }}>
                <Activity size={20} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Market Intelligence & Drift Detection</h2>
              <span className="badge badge-emerald">
                <span className="status-dot active" style={{ width: '6px', height: '6px' }} />
                Live Observability
              </span>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '16px', maxWidth: '800px' }}>
              <strong>What is Concept Drift?</strong> Over time, the skills required for a job change faster than the filters used by recruiters (ATS systems). 
              For example, modern "Software Engineers" use <em>Next.js</em> and <em>Vector Databases</em>, but older systems might reject them for lacking <em>jQuery</em> or <em>Hadoop</em>. 
              <br/><br/>
              SkillShift constantly scans job postings to detect <strong>emergent skills</strong> before legacy systems adapt. This dashboard tracks how rapidly new skills are replacing old ones.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/matcher" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Sparkles size={18} />
              <span>Launch Matcher Sandbox</span>
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Executive Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        
        {/* KPI 1 */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tracked Postings
            </span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', color: 'var(--accent-cyan)' }}>
              <BarChart3 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {executiveKpis.totalJobsScanned}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--accent-emerald)' }}>
            <TrendingUp size={14} />
            <span>+18.4% YoY Volume</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Vocabulary
            </span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(129, 140, 248, 0.12)', color: 'var(--accent-indigo)' }}>
              <Layers size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {currentTimelinePoint.vocab_size?.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <span>Baseline: {executiveKpis.baselineVocabSize} (2021)</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              OOD Drift Detected
            </span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.12)', color: 'var(--accent-amber)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)', marginBottom: '4px' }}>
            +{executiveKpis.newOodSkillsDetected}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--accent-amber)' }}>
            <span>Emergent AI & Cloud Skills</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Model Match Recovery
            </span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.12)', color: 'var(--accent-emerald)' }}>
              <Zap size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: '4px' }}>
            {executiveKpis.adaptationAccuracyGain}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <span>Stale Penalty Reversed</span>
          </div>
        </div>

      </div>

      {/* Interactive Timeline Player Bar */}
      <div className="card" style={{ padding: '20px 24px', background: 'var(--bg-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="btn-primary" 
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}
              title={isPlaying ? "Pause Simulation" : "Play Timeline Animation"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => { setIsPlaying(false); setTimelineIndex(0); }}
              style={{ padding: '8px 14px' }}
              title="Reset to 2023-01"
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block' }}>Simulated Date</span>
              <strong style={{ fontSize: '1.125rem', color: 'var(--accent-cyan)' }}>
                {currentTimelinePoint.month}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Vocabulary Inflow: </span>
              <strong style={{ color: 'var(--text-primary)' }}>{currentTimelinePoint.vocab_size} terms</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>New Out-of-Distribution Skills: </span>
              <strong style={{ color: 'var(--accent-amber)' }}>+{currentTimelinePoint.new_skills_detected}</strong>
            </div>
          </div>
        </div>

        {/* Timeline Slider */}
        <input 
          type="range" 
          min="0" 
          max={metrics.length - 1} 
          value={timelineIndex}
          onChange={(e) => {
            setIsPlaying(false);
            setTimelineIndex(Number(e.target.value));
          }}
          style={{ 
            width: '100%', 
            cursor: 'pointer',
            accentColor: 'var(--accent-cyan)'
          }} 
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          <span>2023-01 (Baseline)</span>
          <span>2023-08 (Llama 2 & Open LLMs)</span>
          <span>2024-04 (Llama 3 & Agentic RAG)</span>
          <span>2024-05 (Present)</span>
        </div>
      </div>

      {/* Visual Analytics Charts: Area & Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px' }}>
        
        {/* Chart 1: Cumulative Vocabulary Growth */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>
                Vocabulary Growth & Inflow
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Model dictionary adaptation curve over time.
              </p>
            </div>
            <span className="badge badge-cyan">Cumulative</span>
          </div>

          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visibleData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="vocabGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--text-muted)" 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                />
                <YAxis 
                  domain={['dataMin - 50', 'dataMax + 50']} 
                  stroke="var(--text-muted)" 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="vocab_size" 
                  name="Vocabulary Size"
                  stroke="var(--accent-cyan)" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#vocabGradient)" 
                  activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Drift Anomalies */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>
                Out-of-Distribution Surge Events
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Number of anomalous skills detected by IsolationForest per month.
              </p>
            </div>
            <span className="badge badge-amber">Monthly Rate</span>
          </div>

          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visibleData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--text-muted)" 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="new_skills_detected" 
                  name="New Out-of-Distribution Skills"
                  fill="var(--accent-amber)" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Category Inflow Breakdown Cards */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
          Shift Intensity by Domain Category
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {mockCategoriesBreakdown.map((cat, idx) => (
            <div key={idx} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                  {cat.name}
                </span>
                <span className="badge" style={{ background: `${cat.color}20`, color: cat.color }}>
                  {cat.growth}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {cat.share}%
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  ({cat.count} new skills)
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${cat.share}%`, height: '100%', backgroundColor: cat.color, borderRadius: '3px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div className="card card-glass" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '20px',
        border: '1px solid var(--border-strong)',
        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(129, 140, 248, 0.08) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={26} color="#ffffff" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '4px' }}>
              Explore the Semantic Skill Network Graph
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Inspect how modern AI skills (LangChain, Vector DBs) cluster with classical ML architectures.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/graph" className="btn-secondary" style={{ textDecoration: 'none' }}>
            <span>Explore Network Graph</span>
            <ArrowUpRight size={16} />
          </Link>
          <Link to="/radar" className="btn-primary" style={{ textDecoration: 'none' }}>
            <span>View Drift Radar</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
