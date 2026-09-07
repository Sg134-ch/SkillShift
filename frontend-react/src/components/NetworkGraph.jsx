import React, { useState, useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';
import { 
  Share2, 
  Search, 
  Maximize2, 
  Pause, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { fetchSkillGraph } from '../services/api';

const CLUSTERS = [
  { id: 'all', label: 'All Domains', color: '#94a3b8' },
  { id: 'Generative AI', label: 'Generative AI & LLMs', color: '#38bdf8' },
  { id: 'Data Science', label: 'Classical Data Science', color: '#818cf8' },
  { id: 'DevOps & MLOps', label: 'Cloud & MLOps', color: '#34d399' },
  { id: 'Web & FullStack', label: 'Modern Web & FullStack', color: '#fbbf24' },
];

const NetworkGraph = ({ isBackendLive }) => {
  const [rawGraphData, setRawGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [physicsActive, setPhysicsActive] = useState(true);

  const containerRef = useRef(null);
  const networkInstanceRef = useRef(null);

  useEffect(() => {
    const loadGraph = async () => {
      setLoading(true);
      const res = await fetchSkillGraph();
      setRawGraphData(res.data);
      if (res.data.nodes && res.data.nodes.length > 0) {
        setSelectedNode(res.data.nodes[0]);
      }
      setLoading(false);
    };
    loadGraph();
  }, [isBackendLive]);

  useEffect(() => {
    if (!containerRef.current || rawGraphData.nodes.length === 0) return;

    // Filter nodes by cluster if applicable
    const filteredNodes = rawGraphData.nodes.filter(n => {
      if (selectedCluster === 'all') return true;
      return n.cluster === selectedCluster;
    });

    const activeNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = rawGraphData.edges.filter(e => 
      activeNodeIds.has(e.from) && activeNodeIds.has(e.to)
    );

    // Style nodes based on theme & group
    const styledNodes = filteredNodes.map(node => {
      let colorBg = '#818cf8';
      let colorBorder = '#6366f1';
      
      if (node.cluster === 'Generative AI' || node.isOOD) {
        colorBg = '#38bdf8';
        colorBorder = '#0284c7';
      } else if (node.cluster === 'DevOps & MLOps') {
        colorBg = '#34d399';
        colorBorder = '#059669';
      } else if (node.cluster === 'Web & FullStack') {
        colorBg = '#fbbf24';
        colorBorder = '#d97706';
      }

      return {
        ...node,
        size: Math.max(14, Math.min(32, (node.value || 25))),
        color: {
          background: colorBg,
          border: colorBorder,
          highlight: {
            background: '#ffffff',
            border: colorBg
          }
        },
        font: {
          color: 'var(--text-primary)',
          size: 13,
          face: 'Plus Jakarta Sans',
          strokeWidth: 3,
          strokeColor: 'var(--bg-canvas)'
        },
        borderWidth: 2,
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.3)',
          size: 6
        }
      };
    });

    const options = {
      nodes: {
        shape: 'dot'
      },
      edges: {
        color: {
          color: 'rgba(148, 163, 184, 0.3)',
          highlight: '#38bdf8'
        },
        smooth: {
          type: 'continuous',
          roundness: 0.2
        },
        width: 1.5
      },
      physics: {
        enabled: physicsActive,
        barnesHut: {
          gravitationalConstant: -3500,
          centralGravity: 0.3,
          springLength: 110,
          springConstant: 0.04,
          damping: 0.09
        },
        stabilization: {
          iterations: 120
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        zoomView: true
      }
    };

    const network = new Network(containerRef.current, { nodes: styledNodes, edges: filteredEdges }, options);
    networkInstanceRef.current = network;

    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const clickedId = params.nodes[0];
        const found = rawGraphData.nodes.find(n => n.id === clickedId);
        if (found) setSelectedNode(found);
      }
    });

    return () => {
      if (networkInstanceRef.current) {
        networkInstanceRef.current.destroy();
      }
    };
  }, [rawGraphData, selectedCluster, physicsActive]);

  // Handle Search Input
  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!networkInstanceRef.current || !q.trim()) return;

    const matched = rawGraphData.nodes.find(n => 
      n.label.toLowerCase().includes(q.toLowerCase())
    );

    if (matched) {
      setSelectedNode(matched);
      networkInstanceRef.current.focus(matched.id, {
        scale: 1.4,
        animation: { duration: 600, easingFunction: 'easeInOutQuad' }
      });
      networkInstanceRef.current.selectNodes([matched.id]);
    }
  };

  const handleZoomFit = () => {
    if (networkInstanceRef.current) {
      networkInstanceRef.current.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
    }
  };

  // Find connected neighbors for the selected node
  const connectedEdges = rawGraphData.edges.filter(
    e => selectedNode && (e.from === selectedNode.id || e.to === selectedNode.id)
  );

  const neighborNodes = connectedEdges.map(e => {
    const neighborId = e.from === selectedNode.id ? e.to : e.from;
    const nodeObj = rawGraphData.nodes.find(n => n.id === neighborId);
    return { ...nodeObj, weight: e.value };
  }).filter(Boolean);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Skill Co-occurrence Network</h2>
            <span className="badge badge-cyan">
              <Share2 size={13} />
              Semantic Graph
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '750px', fontSize: '0.9375rem' }}>
            Visualizing semantic affinity and multi-hop co-occurrence between skills extracted from job postings. 
            Notice how modern Generative AI clusters (cyan) bridge with classical Python and MLOps tools.
          </p>
        </div>

        {/* Global Controls: Fit & Physics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="btn-secondary" 
            onClick={() => setPhysicsActive(!physicsActive)}
            title={physicsActive ? "Freeze Physics" : "Unfreeze Physics"}
          >
            {physicsActive ? <Pause size={16} /> : <Play size={16} />}
            <span>{physicsActive ? 'Freeze' : 'Resume'}</span>
          </button>
          <button className="btn-secondary" onClick={handleZoomFit} title="Zoom to Fit">
            <Maximize2 size={16} />
            <span>Fit View</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Cluster Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '4px' }}>
            Filter:
          </span>
          {CLUSTERS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCluster(c.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: selectedCluster === c.id ? c.color : 'var(--bg-surface-elevated)',
                color: selectedCluster === c.id ? '#ffffff' : 'var(--text-primary)',
                border: `1px solid ${selectedCluster === c.id ? c.color : 'var(--border-subtle)'}`,
                transition: 'all 0.15s ease'
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search Node */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search skill (e.g. LangChain)..."
            style={{ paddingLeft: '38px', fontSize: '0.875rem' }}
          />
        </div>

      </div>

      {/* Main Graph Grid: Interactive Canvas + Node Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', minHeight: '620px' }}>
        
        {/* Vis-Network Canvas */}
        <div className="card" style={{ padding: '4px', position: 'relative', overflow: 'hidden', minHeight: '620px' }}>
          <div ref={containerRef} style={{ width: '100%', height: '620px', borderRadius: '12px' }} />
          
          {/* Canvas Bottom Legend */}
          <div style={{ 
            position: 'absolute', 
            bottom: '16px', 
            left: '16px', 
            background: 'var(--bg-glass)', 
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
              <span>Out-of-Distribution (GenAI)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#818cf8' }} />
              <span>Data Science Core</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#34d399' }} />
              <span>Cloud / MLOps</span>
            </div>
          </div>
        </div>

        {/* Node Inspector Sidebar */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
            <Info size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Skill Inspector</h3>
          </div>

          {selectedNode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Target Node
                </span>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedNode.label}
                </h4>
              </div>

              {/* Status Pill */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Distribution Classification
                </span>
                {selectedNode.isOOD ? (
                  <span className="badge badge-amber" style={{ padding: '6px 12px' }}>
                    <AlertTriangle size={14} />
                    Emergent Out-of-Distribution (2024)
                  </span>
                ) : (
                  <span className="badge badge-emerald" style={{ padding: '6px 12px' }}>
                    <CheckCircle2 size={14} />
                    Historical Baseline Core (2021)
                  </span>
                )}
              </div>

              {/* Attributes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Cluster</span>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{selectedNode.cluster || 'General'}</strong>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Centrality</span>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--accent-cyan)' }}>{selectedNode.value || 30} pts</strong>
                </div>
              </div>

              {/* Connected Neighbors */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Top Co-occurring Skills ({neighborNodes.length})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                  {neighborNodes.length > 0 ? (
                    neighborNodes.map((nbr, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          setSelectedNode(nbr);
                          if (networkInstanceRef.current) {
                            networkInstanceRef.current.focus(nbr.id, { scale: 1.2, animation: true });
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: 'var(--bg-surface-elevated)',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s'
                        }}
                      >
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{nbr.label}</span>
                        <span className="badge badge-cyan" style={{ fontSize: '0.6875rem' }}>
                          w={nbr.weight}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No direct neighbors visible.</p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
              <p>Click on any node in the network to inspect its semantic properties.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default NetworkGraph;
