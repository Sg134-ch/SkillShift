import React, { useState } from 'react';
import { 
  Radio, 
  Search, 
  Filter, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Flame, 
  Zap, 
  ArrowDownRight, 
  Compass,
  FileSpreadsheet
} from 'lucide-react';
import { mockDriftRadarSkills } from '../data/mockData';

const DriftRadar = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [oodOnly, setOodOnly] = useState(false);

  const categories = ['All', 'Generative AI', 'Modern Web', 'Cloud & MLOps', 'Data Science', 'Backend Legacy'];

  const filteredSkills = mockDriftRadarSkills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(search.toLowerCase()) || 
                          skill.coOccurrences.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || skill.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesOod = !oodOnly || skill.status.startsWith('OOD');
    return matchesSearch && matchesCategory && matchesOod;
  });

  const getStatusBadge = (status) => {
    if (status.includes('Critical')) return 'badge-amber';
    if (status.includes('High')) return 'badge-amber';
    if (status.includes('Moderate')) return 'badge-cyan';
    if (status.includes('Baseline')) return 'badge-emerald';
    if (status.includes('Assimilated')) return 'badge-indigo';
    return 'badge-rose';
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Skill Drift Radar</h2>
            <span className="badge badge-amber">
              <Radio size={13} />
              Out-of-Distribution Catalog
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '750px', fontSize: '0.9375rem' }}>
            Catalog of emergent vs baseline competencies detected by the IsolationForest anomaly detector. Anomaly score represents normalized semantic distance from the 2021 baseline embedding cluster.
          </p>
        </div>

        {/* Quick Highlights */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="card" style={{ padding: '12px 18px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Peak Anomaly</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--accent-amber)' }}>0.94</strong>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}> (LangChain)</span>
          </div>
          <div className="card" style={{ padding: '12px 18px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Active OOD Count</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--accent-cyan)' }}>7 Skills</strong>
            <span style={{ fontSize: '0.6875rem', color: 'var(--accent-emerald)' }}> High Velocity</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '4px' }}>
            Domain:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                background: selectedCategory === cat ? 'var(--accent-cyan)' : 'var(--bg-surface-elevated)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-primary)',
                border: `1px solid ${selectedCategory === cat ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right Filter & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
            <input 
              type="checkbox" 
              checked={oodOnly}
              onChange={(e) => setOodOnly(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent-amber)' }}
            />
            <span>Show OOD Only</span>
          </label>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skill catalog..."
              style={{ paddingLeft: '38px', fontSize: '0.875rem' }}
            />
          </div>

        </div>

      </div>

      {/* Radar Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Skill Name</th>
                <th>Domain Category</th>
                <th>First Detected</th>
                <th>Anomaly / OOD Score</th>
                <th>Market Trend</th>
                <th>Top Co-occurrences</th>
                <th>Engine Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkills.map((skill) => (
                <tr key={skill.id}>
                  <td>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                      {skill.name}
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {skill.category}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {skill.firstDetected}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '80px', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${skill.anomalyScore * 100}%`, 
                          height: '100%', 
                          backgroundColor: skill.anomalyScore > 0.8 ? 'var(--accent-amber)' : skill.anomalyScore > 0.4 ? 'var(--accent-cyan)' : 'var(--accent-emerald)',
                          borderRadius: '3px'
                        }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600 }}>
                        {skill.anomalyScore.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 500 }}>
                      <span>{skill.trendIcon}</span>
                      <span>{skill.trend}</span>
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {skill.coOccurrences}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(skill.status)}`}>
                      {skill.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diagnostic Context Note */}
      <div className="card" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', padding: '20px' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9375rem' }}>
          <Compass size={18} color="var(--accent-cyan)" />
          <span>How Out-of-Distribution (OOD) Scoring Works</span>
        </h4>
        <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
          The drift detection pipeline embeds skill terminology using <code>sentence-transformers/all-MiniLM-L6-v2</code> into a 384-dimensional latent space. 
          An <code>IsolationForest</code> fitted on the historical 2021 job baseline assigns an anomaly score. 
          Skills scoring above <strong>0.70</strong> are isolated as Out-of-Distribution candidates, signaling rapid market emergence before classical ATS screening models adapt.
        </p>
      </div>

    </div>
  );
};

export default DriftRadar;
