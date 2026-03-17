import React, { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import { getBooks } from '../api';
import { Loader2, RefreshCw, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TRACK_META = {
  PMHNP:  { color:'#9B6FFF', label:'Psychiatric MH NP'    },
  FNP:    { color:'#3B6FF5', label:'Family NP'             },
  AGPCNP: { color:'#34C97A', label:'Adult-Gero PC NP'      },
  WHNP:   { color:'#F5A623', label:"Women's Health NP"     },
  AGACNP: { color:'#F5516A', label:'Adult-Gero AC NP'      },
  PNP:    { color:'#00C4C4', label:'Pediatric NP'          },
  ANP:    { color:'#7FA8FF', label:'Adult NP'              },
};

// 6 bundle types per book (Bible §3.1)
const BUNDLE_TYPES = [
  { key:'TEXTBOOK',   label:'Textbook',    short:'TX', color:'#3B6FF5', desc:'University-level core reference, Harrison-depth' },
  { key:'REVIEW',     label:'Review Book', short:'RV', color:'#34C97A', desc:'High-yield board prep, clinical vignettes' },
  { key:'MNEMONIC',   label:'Mnemonic',    short:'MN', color:'#9B6FFF', desc:'1,000+ memory aids per program' },
  { key:'PICTURE',    label:'Visual Book', short:'PB', color:'#F5A623', desc:'Diagrams, algorithms, visual tables' },
  { key:'STUDYSHEET', label:'Study Sheet', short:'SS', color:'#00C4C4', desc:'One-page-per-topic quick reference' },
  { key:'QBANK',      label:'Q-Bank',      short:'QB', color:'#F5516A', desc:'500+ board-style questions, auto-updating' },
];

// Mock bundle status — in production this comes from bundle_progress table (Phase 2)
const getMockBundleStatus = (book) => {
  const s = book.status;
  if (s === 'PUBLISHED')    return { TEXTBOOK:'DONE', REVIEW:'DONE',     MNEMONIC:'DONE',     PICTURE:'DONE',     STUDYSHEET:'DONE',        QBANK:'DONE'        };
  if (s === 'KDP_READY')    return { TEXTBOOK:'DONE', REVIEW:'DONE',     MNEMONIC:'DONE',     PICTURE:'IN_PROGRESS', STUDYSHEET:'DONE',     QBANK:'IN_PROGRESS' };
  if (s === 'DESIGN_READY') return { TEXTBOOK:'DONE', REVIEW:'IN_PROGRESS', MNEMONIC:'PENDING', PICTURE:'PENDING',  STUDYSHEET:'PENDING',  QBANK:'PENDING'     };
  if (s === 'QA_PASSED')    return { TEXTBOOK:'DONE', REVIEW:'PENDING',  MNEMONIC:'PENDING',  PICTURE:'PENDING',  STUDYSHEET:'PENDING',     QBANK:'PENDING'     };
  if (s === 'GENERATING' || s === 'QA_PENDING' || s === 'QA_IN_PROGRESS')
                            return { TEXTBOOK:'IN_PROGRESS', REVIEW:'PENDING', MNEMONIC:'PENDING', PICTURE:'PENDING', STUDYSHEET:'PENDING', QBANK:'PENDING'     };
  return                          { TEXTBOOK:'PENDING', REVIEW:'PENDING', MNEMONIC:'PENDING',  PICTURE:'PENDING',  STUDYSHEET:'PENDING',     QBANK:'PENDING'     };
};

const STATUS_DOT = {
  DONE:        { bg:'var(--sage)',    label:'Complete'    },
  IN_PROGRESS: { bg:'var(--amber)',   label:'In Progress' },
  PENDING:     { bg:'var(--surface-3)', label:'Not Started' },
};

export default function BundleTracker() {
  const navigate = useNavigate();
  const [books, setBooks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTrack, setFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getBooks();
      setBooks(data?.books || data || []);
    } catch { toast.error('Failed to load books'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const filtered = filterTrack === 'ALL' ? books : books.filter(b => b.certificationTrack === filterTrack);

  // Summary counts
  const totalPossible = books.length * 6;
  const totalDone = books.reduce((sum, b) => {
    const s = getMockBundleStatus(b);
    return sum + Object.values(s).filter(v => v === 'DONE').length;
  }, 0);
  const totalInProgress = books.reduce((sum, b) => {
    const s = getMockBundleStatus(b);
    return sum + Object.values(s).filter(v => v === 'IN_PROGRESS').length;
  }, 0);

  return (
    <div>
      <TopBar
        title="Bundle Tracker"
        subtitle="6 book types per program — Textbook · Review · Mnemonic · Visual · Study Sheet · Q-Bank"
        actions={
          <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 size={13} className="animate-spin"/> : <RefreshCw size={13}/>} Refresh
          </button>
        }
      />
      <div className="page-content">
        {/* Summary */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12, marginBottom:20 }}>
          <SumCard label="Total Books" value={books.length} color="var(--cobalt)"/>
          <SumCard label="Bundle Slots" value={totalPossible} color="var(--ink-500)" sub="books × 6 types"/>
          <SumCard label="Complete" value={totalDone} color="var(--sage)"/>
          <SumCard label="In Progress" value={totalInProgress} color="var(--amber)"/>
          <SumCard label="Progress" value={totalPossible ? `${Math.round((totalDone/totalPossible)*100)}%` : '—'} color="var(--violet)"/>
        </div>

        {/* Bundle type legend */}
        <div className="card mb-4">
          <div className="card-pad" style={{ paddingBottom:10 }}>
            <h3 style={{ fontSize:'0.88rem', marginBottom:10 }}>Bundle Types</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:8 }}>
              {BUNDLE_TYPES.map(bt => (
                <div key={bt.key} style={{ display:'flex', alignItems:'flex-start', gap:9 }}>
                  <div style={{ width:28, height:28, borderRadius:6, background:`${bt.color}20`, border:`1px solid ${bt.color}40`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:'0.6rem', fontWeight:800, color:bt.color, fontFamily:'var(--font-mono)' }}>{bt.short}</span>
                  </div>
                  <div>
                    <div style={{ fontSize:'0.78rem', fontWeight:600, color:'var(--ink-800)' }}>{bt.label}</div>
                    <div style={{ fontSize:'0.65rem', color:'var(--ink-400)', lineHeight:1.3 }}>{bt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
          <select className="input select" value={filterTrack} onChange={e => setFilter(e.target.value)} style={{ maxWidth:200 }}>
            <option value="ALL">All Tracks</option>
            {Object.keys(TRACK_META).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:60 }}><Loader2 size={28} className="animate-spin" style={{ color:'var(--cobalt)' }}/></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Package size={36}/><h3>No books found</h3><p>Create books first in Book Setup</p></div>
        ) : (
          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th style={{ width:60 }}>Track</th>
                  <th style={{ width:40 }}>#</th>
                  {BUNDLE_TYPES.map(bt => (
                    <th key={bt.key} style={{ width:80, textAlign:'center' }}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                        <span style={{ fontSize:'0.62rem', fontFamily:'var(--font-mono)', fontWeight:700, color:bt.color }}>{bt.short}</span>
                        <span style={{ fontSize:'0.58rem', color:'var(--ink-400)', textTransform:'none', letterSpacing:0 }}>{bt.label}</span>
                      </div>
                    </th>
                  ))}
                  <th style={{ width:80, textAlign:'center' }}>Progress</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(book => {
                  const bundle = getMockBundleStatus(book);
                  const doneCount = Object.values(bundle).filter(v => v === 'DONE').length;
                  const tc = (TRACK_META[book.certificationTrack] || {}).color || '#3B6FF5';
                  return (
                    <tr key={book.id} style={{ cursor:'pointer' }} onClick={() => navigate(`/books/${book.id}`)}>
                      <td>
                        <div style={{ fontWeight:500, fontSize:'0.8rem', color:'var(--ink-900)' }}>{book.title}</div>
                        {book.subtitle && <div style={{ fontSize:'0.67rem', color:'var(--ink-500)' }}>{book.subtitle}</div>}
                      </td>
                      <td>
                        <span style={{ fontSize:'0.63rem', fontWeight:700, color:tc, padding:'2px 6px', borderRadius:3, background:`${tc}15` }}>
                          {book.certificationTrack}
                        </span>
                      </td>
                      <td><span className="font-mono" style={{ fontSize:'0.72rem', color:'var(--ink-400)' }}>B{book.trackNumber}</span></td>
                      {BUNDLE_TYPES.map(bt => {
                        const st = bundle[bt.key] || 'PENDING';
                        const dot = STATUS_DOT[st];
                        return (
                          <td key={bt.key} style={{ textAlign:'center' }}>
                            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                              <div style={{ width:12, height:12, borderRadius:'50%', background:dot.bg, boxShadow: st==='IN_PROGRESS'?`0 0 6px ${dot.bg}`:undefined }}
                                className={st==='IN_PROGRESS'?'animate-pulse':undefined}
                              />
                              <span style={{ fontSize:'0.55rem', color:'var(--ink-400)' }}>
                                {st==='DONE'?'✓':st==='IN_PROGRESS'?'…':'—'}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                      <td style={{ textAlign:'center' }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                          <span style={{ fontSize:'0.72rem', fontWeight:700, fontFamily:'var(--font-mono)', color: doneCount===6?'var(--sage)':doneCount>0?'var(--amber)':'var(--ink-400)' }}>
                            {doneCount}/6
                          </span>
                          <div style={{ width:44, height:4, background:'var(--surface-3)', borderRadius:2, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${(doneCount/6)*100}%`, background: doneCount===6?'var(--sage)':'var(--amber)', transition:'width 0.5s' }}/>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop:16, padding:'10px 14px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', fontSize:'0.7rem', color:'var(--ink-400)', display:'flex', gap:20, flexWrap:'wrap' }}>
          <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:10, height:10, borderRadius:'50%', background:'var(--sage)', display:'inline-block' }}/> Complete</span>
          <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:10, height:10, borderRadius:'50%', background:'var(--amber)', display:'inline-block' }}/> In Progress</span>
          <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:10, height:10, borderRadius:'50%', background:'var(--surface-3)', border:'1px solid var(--border)', display:'inline-block' }}/> Not Started</span>
          <span style={{ color:'var(--cobalt)', marginLeft:'auto' }}>Phase 2 will enable real bundle generation for Review, Mnemonic, Picture, Study Sheet and Q-Bank types</span>
        </div>
      </div>
    </div>
  );
}

function SumCard({ label, value, color, sub }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'14px 18px' }}>
      <div style={{ fontSize:'1.5rem', fontWeight:800, fontFamily:'var(--font-display)', color, marginBottom:3 }}>{value}</div>
      <div style={{ fontSize:'0.7rem', fontWeight:600, color:'var(--ink-500)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</div>
      {sub && <div style={{ fontSize:'0.65rem', color:'var(--ink-400)', marginTop:2 }}>{sub}</div>}
    </div>
  );
}
