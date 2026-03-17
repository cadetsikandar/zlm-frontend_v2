import React, { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import { Bell, RefreshCw, CheckCircle2, Clock, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock alerts — in production this comes from evidence_alerts table (Phase 7)
const MOCK_ALERTS = [
  {
    id:'1', type:'BOARD_EXAM_CHANGE', severity:'CRITICAL',
    title:'ANCC PMHNP-BC Blueprint Updated',
    description:'The ANCC PMHNP-BC exam blueprint was updated in Q1 2026. New weightings add Trauma-Informed Care (8%) and reduce Psychopharmacology weighting from 24% to 20%.',
    affectedBooks: ['PMHNP Book 1', 'PMHNP Book 2', 'PMHNP Book 3', 'PMHNP Book 4'],
    affectedChapters: 14,
    source:'ANCC.org',
    detectedAt:'2026-03-10',
    status:'PENDING',
  },
  {
    id:'2', type:'CLINICAL_EVIDENCE', severity:'WARNING',
    title:'New FDA Black Box Warning — Quetiapine',
    description:'FDA issued updated black box warning for quetiapine regarding increased mortality risk in elderly patients with dementia-related psychosis. All PMHNP medication chapters require update.',
    affectedBooks: ['PMHNP Book 1'],
    affectedChapters: 3,
    source:'FDA.gov',
    detectedAt:'2026-03-12',
    status:'PENDING',
  },
  {
    id:'3', type:'GUIDELINE_UPDATE', severity:'WARNING',
    title:'ACC/AHA Heart Failure Guidelines 2026',
    description:'Updated heart failure management guidelines from ACC/AHA with new SGLT2 inhibitor recommendations for HFpEF patients.',
    affectedBooks: ['FNP Book 1', 'AGPCNP Book 1'],
    affectedChapters: 5,
    source:'ACC.org / AHA.org',
    detectedAt:'2026-03-14',
    status:'PENDING',
  },
  {
    id:'4', type:'BOARD_EXAM_CHANGE', severity:'INFO',
    title:'NCLEX-RN Next Generation Format Reminder',
    description:'All RN content must align with the NGN (Next Generation NCLEX) format introduced in April 2023. Clinical judgment measurement model now required.',
    affectedBooks: [],
    affectedChapters: 0,
    source:'NCSBN.org',
    detectedAt:'2026-03-01',
    status:'APPROVED',
  },
];

const SEVERITY_CFG = {
  CRITICAL: { badge:'badge-rose',   icon: AlertTriangle, label:'Critical' },
  WARNING:  { badge:'badge-amber',  icon: AlertTriangle, label:'Warning'  },
  INFO:     { badge:'badge-blue',   icon: ShieldCheck,   label:'Info'     },
};
const TYPE_LABEL = {
  BOARD_EXAM_CHANGE: 'Board Exam Change',
  CLINICAL_EVIDENCE: 'Clinical Evidence',
  GUIDELINE_UPDATE:  'Guideline Update',
};

export default function EvidenceAlerts() {
  const [alerts, setAlerts]   = useState(MOCK_ALERTS);
  const [filter, setFilter]   = useState('ALL');

  const pending  = alerts.filter(a => a.status === 'PENDING').length;
  const approved = alerts.filter(a => a.status === 'APPROVED').length;

  const filtered = alerts.filter(a => {
    if (filter === 'PENDING')  return a.status === 'PENDING';
    if (filter === 'APPROVED') return a.status === 'APPROVED';
    return true;
  });

  const handleApprove = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status:'APPROVED' } : a));
    toast.success('Alert approved — regeneration queued for affected chapters');
  };

  const handleDismiss = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status:'DISMISSED' } : a));
    toast('Alert dismissed');
  };

  return (
    <div>
      <TopBar
        title="Evidence Alerts"
        subtitle="Board exam changes & clinical evidence updates that affect your books"
        actions={
          <button className="btn btn-ghost btn-sm" onClick={() => toast('Evidence monitor runs daily at 2:00 AM UTC')}>
            <RefreshCw size={13}/> Check Now
          </button>
        }
      />
      <div className="page-content">
        {/* Summary */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12, marginBottom:20 }}>
          <SumCard label="Pending Review" value={pending} color={pending > 0 ? 'var(--rose)' : 'var(--ink-500)'}/>
          <SumCard label="Approved / Queued" value={approved} color="var(--sage)"/>
          <SumCard label="Total Alerts" value={alerts.length} color="var(--cobalt)"/>
        </div>

        {/* Phase 7 notice */}
        <div style={{ display:'flex', gap:10, padding:'12px 16px', background:'rgba(245,166,35,0.07)', border:'1px solid rgba(245,166,35,0.18)', borderRadius:'var(--r-md)', marginBottom:18 }}>
          <Clock size={14} style={{ color:'var(--amber)', flexShrink:0, marginTop:1 }}/>
          <div style={{ fontSize:'0.76rem', color:'var(--ink-700)', lineHeight:1.5 }}>
            <strong style={{ color:'var(--amber)' }}>Phase 7 feature — currently showing mock data.</strong>
            {' '}The Evidence Monitor Agent will run as a daily cron job, scanning ANCC, NCSBN, FDA, ACC/AHA, and other sources for changes that affect your generated content. Alerts will populate the <code style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', background:'rgba(255,255,255,0.06)', padding:'1px 5px', borderRadius:3 }}>evidence_alerts</code> table automatically.
          </div>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          {['ALL','PENDING','APPROVED'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`btn btn-sm ${filter===f?'btn-primary':'btn-ghost'}`}>
              {f === 'ALL' ? 'All Alerts' : f === 'PENDING' ? `Pending (${pending})` : `Approved (${approved})`}
            </button>
          ))}
        </div>

        {/* Alert cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {filtered.length === 0 && (
            <div className="empty-state"><Bell size={32}/><h3>No alerts</h3><p>All clear — no pending evidence updates</p></div>
          )}
          {filtered.map(alert => {
            const sev = SEVERITY_CFG[alert.severity] || SEVERITY_CFG.INFO;
            const SevIcon = sev.icon;
            const isDone = alert.status === 'APPROVED' || alert.status === 'DISMISSED';
            return (
              <div key={alert.id} className="card" style={{ opacity: isDone ? 0.65 : 1, transition:'opacity 0.2s' }}>
                <div className="card-pad">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                        <SevIcon size={14} style={{ color: alert.severity==='CRITICAL'?'var(--rose)':alert.severity==='WARNING'?'var(--amber)':'var(--cobalt)', flexShrink:0 }}/>
                        <span className={`badge ${sev.badge}`} style={{ fontSize:'0.62rem' }}>{sev.label}</span>
                        <span style={{ fontSize:'0.68rem', color:'var(--ink-400)', padding:'2px 7px', background:'var(--surface-2)', borderRadius:3 }}>
                          {TYPE_LABEL[alert.type] || alert.type}
                        </span>
                        {alert.status === 'APPROVED' && (
                          <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.68rem', color:'var(--sage)' }}>
                            <CheckCircle2 size={11}/> Approved
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize:'0.9rem', fontWeight:600, color:'var(--ink-900)', marginBottom:5 }}>{alert.title}</div>
                      <p style={{ fontSize:'0.78rem', color:'var(--ink-600)', lineHeight:1.55, marginBottom:10 }}>{alert.description}</p>

                      <div style={{ display:'flex', gap:16, flexWrap:'wrap', fontSize:'0.72rem', color:'var(--ink-500)' }}>
                        <span>
                          <strong style={{ color:'var(--ink-700)' }}>Affected books:</strong>{' '}
                          {alert.affectedBooks.length > 0 ? alert.affectedBooks.join(', ') : 'None identified'}
                        </span>
                        {alert.affectedChapters > 0 && (
                          <span><strong style={{ color:'var(--ink-700)' }}>Chapters to update:</strong> {alert.affectedChapters}</span>
                        )}
                        <span><strong style={{ color:'var(--ink-700)' }}>Source:</strong> {alert.source}</span>
                        <span><strong style={{ color:'var(--ink-700)' }}>Detected:</strong> {alert.detectedAt}</span>
                      </div>
                    </div>

                    {alert.status === 'PENDING' && (
                      <div style={{ display:'flex', flexDirection:'column', gap:7, flexShrink:0 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleApprove(alert.id)}>
                          <Zap size={12}/> Approve & Queue
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDismiss(alert.id)}>
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SumCard({ label, value, color }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'14px 18px' }}>
      <div style={{ fontSize:'1.6rem', fontWeight:800, fontFamily:'var(--font-display)', color, marginBottom:3 }}>{value}</div>
      <div style={{ fontSize:'0.7rem', fontWeight:600, color:'var(--ink-500)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</div>
    </div>
  );
}
