import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Filter, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Zap,
  ExternalLink,
  Flame,
  Award
} from 'lucide-react';
import { fetchCompanyDemands } from '../services/api';

const DOMAIN_FILTERS = [
  { id: 'all', label: 'All Domains' },
  { id: 'AI', label: 'Frontier AI & LLMs' },
  { id: 'Data', label: 'Data & Lakehouse' },
  { id: 'Cloud', label: 'Cloud & Infrastructure' },
  { id: 'FinTech', label: 'FinTech & Systems' },
  { id: 'Design', label: 'Modern Web & Design' },
];

const TRENDING_SKILLS = [
  'LangChain',
  'Vector Databases',
  'PyTorch',
  'RAG Architecture',
  'Prompt Engineering',
  'FastAPI',
  'Docker',
  'LoRA Fine-Tuning',
  'Kubernetes',
  'Next.js 14',
  'Tailwind CSS',
  'vLLM'
];

const CompanyMarket = ({ isBackendLive }) => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('');

  const loadCompanies = async () => {
    setLoading(true);
    const res = await fetchCompanyDemands(selectedSkill || searchQuery, selectedDomain);
    setCompanies(res.companies || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCompanies();
  }, [selectedDomain, selectedSkill, isBackendLive]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCompanies();
  };

  const handleSkillChipClick = (skill) => {
    if (selectedSkill === skill) {
      setSelectedSkill('');
    } else {
      setSelectedSkill(skill);
      setSearchQuery('');
    }
  };

  const handleTestFit = (company) => {
    navigate('/matcher', {
      state: {
        targetRole: company.roleTitle.includes('Data') ? 'Data Scientist' : 
                    company.roleTitle.includes('Full-Stack') ? 'Software Engineer' : 
                    'Machine Learning Engineer',
        companyName: company.name,
        companySkills: company.requiredSkills
      }
    });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Company Skill Demand & Role Discovery</h2>
            <span className="badge badge-cyan">
              <Sparkles size={13} />
              2024 Market Intelligence
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '820px', fontSize: '0.9375rem' }}>
            Discover top tech companies and AI unicorns actively hiring for your exact skill stack. Identify required modern capabilities, open role specifications, and compensation benchmarks.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '170px' }}>
            <Building2 size={20} color="var(--accent-cyan)" />
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Hiring Companies</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{companies.length} Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Skill Ticker / Quick Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={15} color="var(--accent-amber)" />
            Filter Companies by Trending In-Demand Skills:
          </span>
          {selectedSkill && (
            <button 
              onClick={() => setSelectedSkill('')}
              style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Clear filter ({selectedSkill})
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {TRENDING_SKILLS.map((skill) => {
            const isActive = selectedSkill === skill;
            return (
              <button
                key={skill}
                onClick={() => handleSkillChipClick(skill)}
                className={`badge ${isActive ? 'badge-cyan' : ''}`}
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  border: isActive ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  background: isActive ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-surface-elevated)',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Domain Filter Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        
        {/* Domain Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {DOMAIN_FILTERS.map((df) => {
            const isSelected = selectedDomain === df.id;
            return (
              <button
                key={df.id}
                onClick={() => setSelectedDomain(df.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                  color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                {df.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search companies, roles, skills..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedSkill('');
              }}
              style={{ width: '100%', paddingLeft: '36px', height: '40px', fontSize: '0.875rem' }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '0 16px', height: '40px' }}>
            Filter
          </button>
        </form>

      </div>

      {/* Company Demand Cards Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="status-dot active" style={{ width: '14px', height: '14px' }} />
        </div>
      ) : companies.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <Building2 size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '6px' }}>No Companies Found</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Try clearing the skill search or selecting another domain filter.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '22px' }}>
          {companies.map((comp) => (
            <div 
              key={comp.id} 
              className="card card-interactive"
              style={{ 
                padding: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                borderRadius: '14px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Top Accent Line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: comp.logoColor || 'var(--accent-cyan)' }} />

              {/* Company Logo, Tier & Urgency */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '42px', 
                    height: '42px', 
                    borderRadius: '10px', 
                    background: comp.logoColor || 'var(--accent-cyan)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.125rem',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}>
                    {comp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {comp.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {comp.industry} • <span style={{ color: 'var(--accent-indigo)', fontWeight: 600 }}>{comp.tier}</span>
                    </div>
                  </div>
                </div>

                <span className="badge badge-amber" style={{ fontSize: '0.6875rem', padding: '3px 8px' }}>
                  {comp.hiringUrgency}
                </span>
              </div>

              {/* Target Role & Department */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Primary In-Demand Role
                </div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {comp.roleTitle}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {comp.department}
                </div>
              </div>

              {/* Role Description */}
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0 }}>
                {comp.description}
              </p>

              {/* Emerging Skills & Stack Breakdown */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={13} color="var(--accent-cyan)" />
                  Emerging Skills Actively Demanded:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {comp.emergingSkills.map((sk, idx) => (
                    <span key={idx} className="badge badge-cyan" style={{ fontSize: '0.6875rem' }}>
                      {sk}
                    </span>
                  ))}
                  {comp.requiredSkills.filter(s => !comp.emergingSkills.includes(s)).map((sk, idx) => (
                    <span key={idx} className="badge badge-emerald" style={{ fontSize: '0.6875rem' }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Compensation & Location Footnote */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--accent-emerald)' }}>
                  <DollarSign size={13} />
                  <span>{comp.salaryBand}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} />
                  <span>{comp.location}</span>
                </div>
              </div>

              {/* Action: Test Fit in Matcher */}
              <button 
                onClick={() => handleTestFit(comp)}
                className="btn-primary" 
                style={{ width: '100%', padding: '9px 14px', fontSize: '0.8125rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                <span>Test Fit against this Role</span>
                <ArrowRight size={14} />
              </button>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default CompanyMarket;
