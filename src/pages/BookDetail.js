import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import { getBook, getBookChapters, generateToc, generateChapter, runChapterQA, getChapterQaReport, downloadChapter, clearChapter, deleteChapter } from '../api';
import {
  Loader2, RefreshCw, Play, ShieldCheck, Download,
  Trash2, FileText, ArrowLeft, GitBranch, AlertCircle,
  Zap, RotateCcw, ChevronDown, ChevronUp, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const TRACK_META = {
  PMHNP:  { color: '#9B6FFF' }, FNP:    { color: '#3B6FF5' },
  AGPCNP: { color: '#34C97A' }, WHNP:   { color: '#F5A623' },
  AGACNP: { color: '#F5516A' }, PNP:    { color: '#00C4C4' },
  ANP:    { color: '#7FA8FF' },
};

const STATUS_CFG = {
  PENDING:      { label: 'Pending',      badge: 'badge-muted'   },
  GENERATING:   { label: 'Generating',   badge: 'badge-amber'   },
  GENERATED:    { label: 'Generated',    badge: 'badge-blue'    },
  QA_PENDING:   { label: 'QA Pending',   badge: 'badge-violet'  },
  QA_PASSED:    { label: 'QA Passed',    badge: 'badge-green'   },
  QA_FAILED:    { label: 'QA Failed',    badge: 'badge-rose'    },
  DESIGN_READY: { label: 'Design Ready', badge: 'badge-teal'    },
};
const BOOK_STATUS_CFG = {
  DRAFT: 'badge-muted', GENERATING: 'badge-amber', QA_PENDING: 'badge-violet',
  QA_IN_PROGRESS: 'badge-violet', QA_PASSED: 'badge-green', DESIGN_PENDING: 'badge-blue',
  DESIGN_READY: 'badge-blue', KDP_READY: 'badge-teal', PUBLISHED: 'badge-green',
};

const canGenerate = s => ['PENDING','QA_FAILED'].includes((s||'').toUpperCase());
const canQA       = s => ['GENERATED','QA_FAILED','QA_PASSED'].includes((s||'').toUpperCase());
const canDownload = s => ['GENERATED','QA_PENDING','QA_PASSED','QA_FAILED','DESIGN_READY'].includes((s||'').toUpperCase());
const isActive    = s => ['GENERATING','QA_PENDING'].includes((s||'').toUpperCase());

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook]         = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tocLoading, setTocLoading] = useState(false);
  const [genRunning, setGenRunning] = useState({});
  const [qaRunning, setQaRunning]   = useState({});
  const [drawer, setDrawer]         = useState(null);
  const [expanded, setExpanded]     = useState({});

  const load = useCallback(async () => {
    try {
      const [bookRes, chapRes] = await Promise.all([getBook(id), getBookChapters(id)]);
      setBook(bookRes.data?.book || bookRes.data);
      setChapters(chapRes.data?.chapters || chapRes.data || []);
    } catch { toast.error('Failed to load book'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!chapters.some(c => isActive(c.status))) return;
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [chapters, load]);

  const handleGenerateToc = async () => {
    setTocLoading(true);
    try {
      await generateToc(id, { certificationTrack: book.certificationTrack, trackNumber: book.trackNumber });
      toast.success('TOC generation queued!');
      setTimeout(load, 3000);
    } catch (e) { toast.error(e.response?.data?.message || 'TOC generation failed'); }
    finally { setTocLoading(false); }
  };

  const handleGenerate = async (ch) => {
    setGenRunning(r => ({ ...r, [ch.id]: true }));
    try {
      await generateChapter(ch.id);
      toast.success(`Chapter ${ch.chapterNumber} queued`);
      setTimeout(load, 2000);
    } catch (e) { toast.error(e.response?.data?.message || 'Generation failed'); }
    finally { setGenRunning(r => ({ ...r, [ch.id]: false })); }
  };

  const handleQA = async (ch) => {
    setQaRunning(r => ({ ...r, [ch.id]: true }));
    try {
      await runChapterQA(ch.id, { strictMode: true });
      toast.success(`QA started for Chapter ${ch.chapterNumber}`);
      setTimeout(load, 2000);
    } catch (e) { toast.error(e.response?.data?.message || 'QA failed to start'); }
    finally { setQaRunning(r => ({ ...r, [ch.id]: false })); }
  };

  const handleDownload = async (ch) => {
    try {
      const res = await downloadChapter(ch.id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `chapter-${String(ch.chapterNumber).padStart(2,'0')}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  const handleClear = async (ch) => {
    if (!window.confirm(`Clear chapter "${ch.title}"? Removes content but keeps the slot.`)) return;
    try { await clearChapter(ch.id); toast.success('Cleared'); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (ch) => {
    if (!window.confirm(`Permanently delete chapter slot "${ch.title}"?`)) return;
    try { await deleteChapter(ch.id); toast.success('Deleted'); load(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <Loader2 size={28} className="animate-spin" style={{ color:'var(--cobalt)' }} />
    </div>
  );

  if (!book) return (
    <div className="page-content">
      <div className="empty-state"><AlertCircle size={32}/><h3>Book not found</h3></div>
    </div>
  );

  const trackColor = (TRACK_META[book.certificationTrack]||{}).color || '#3B6FF5';
  const progress   = book.totalChapters ? Math.round((book.completedChapters/book.totalChapters)*100) : 0;
  const qaPassedCh = chapters.filter(c => c.status === 'QA_PASSED').length;

  return (
    <div>
      <TopBar
        breadcrumb={`Books / ${book.certificationTrack} Track`}
        title={book.title}
        subtitle={book.subtitle || `Book ${book.trackNumber} · ${book.certificationTrack}`}
        actions={
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/books')}><ArrowLeft size={13}/> Back</button>
            <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={13}/> Refresh</button>
            {chapters.length === 0 && (
              <button className="btn btn-primary btn-sm" onClick={handleGenerateToc} disabled={tocLoading}>
                {tocLoading ? <Loader2 size={13} className="animate-spin"/> : <Zap size={13}/>} Generate TOC
              </button>
            )}
          </div>
        }
      />

      <div className="page-content stagger">
        {/* Book info */}
        <div className="card animate-fade mb-4" style={{ borderTop:`2px solid ${trackColor}` }}>
          <div className="card-pad">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:16 }}>
              <InfoItem label="Track"    value={book.certificationTrack} mono />
              <InfoItem label="Book #"   value={`${book.trackNumber} of 4`} />
              <InfoItem label="Status"   value={<span className={`badge ${BOOK_STATUS_CFG[book.status]||'badge-muted'}`} style={{fontSize:'0.62rem'}}>{book.status?.replace(/_/g,' ')}</span>} />
              <InfoItem label="Chapters" value={`${book.completedChapters||0} / ${book.totalChapters||'?'}`} />
              <InfoItem label="QA Passed" value={`${qaPassedCh} chaps`} />
              {book.overallQaScore != null && (
                <InfoItem label="Avg QA" value={
                  <span style={{color: book.overallQaScore>=80?'var(--sage)':book.overallQaScore>=70?'var(--amber)':'var(--rose)'}}>
                    {Math.round(book.overallQaScore)}%
                  </span>
                }/>
              )}
            </div>
            <div style={{ marginTop:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:'0.72rem', color:'var(--ink-500)' }}>Progress</span>
                <span style={{ fontSize:'0.72rem', fontFamily:'var(--font-mono)', color:trackColor }}>{progress}%</span>
              </div>
              <div className="progress-bar" style={{ height:7 }}>
                <div className="progress-fill" style={{ width:`${progress}%`, background:trackColor }}/>
              </div>
            </div>
          </div>
        </div>


        {/* Editor Flag Panel - auto checklist issues (Exec Plan Dashboard Fix) */}
        {chapters.length > 0 && (() => {
          const flags = [];
          chapters.forEach(ch => {
            if (['GENERATED','QA_PASSED','QA_FAILED'].includes(ch.status)) {
              if (ch.wordCount && ch.wordCount < 4000)
                flags.push({ chap:`Ch ${ch.chapterNumber}`, issue:`Only ${ch.wordCount.toLocaleString()} words — minimum 4,000 required`, sev:'WARNING' });
              if (ch.qaScore != null && ch.qaScore < 70)
                flags.push({ chap:`Ch ${ch.chapterNumber}`, issue:`QA score ${Math.round(ch.qaScore)}% — below 70% pass threshold`, sev:'CRITICAL' });
              if (ch.status === 'QA_FAILED')
                flags.push({ chap:`Ch ${ch.chapterNumber}`, issue:'QA failed — requires regeneration or manual fix', sev:'CRITICAL' });
            }
            if (ch.status === 'PENDING' && chapters.some(c => c.status !== 'PENDING'))
              flags.push({ chap:`Ch ${ch.chapterNumber}`, issue:'Chapter not yet generated while others are complete', sev:'WARNING' });
          });

          if (flags.length === 0) return (
            <div className="card animate-fade mb-4" style={{borderLeft:'3px solid var(--sage)'}}>
              <div className="card-pad" style={{display:'flex',alignItems:'center',gap:10,paddingTop:14,paddingBottom:14}}>
                <span style={{fontSize:'1rem'}}>✅</span>
                <span style={{fontSize:'0.82rem',color:'var(--sage)',fontWeight:600}}>Editor Checklist — No issues detected in generated chapters</span>
              </div>
            </div>
          );

          const critCount = flags.filter(f=>f.sev==='CRITICAL').length;
          const warnCount = flags.filter(f=>f.sev==='WARNING').length;
          return (
            <div className="card animate-fade mb-4" style={{borderLeft:'3px solid var(--rose)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 18px 8px'}}>
                <div>
                  <h3 style={{fontSize:'0.88rem',marginBottom:1}}>
                    🚩 Editor Checklist — Flag Panel
                    {critCount > 0 && <span style={{marginLeft:8,padding:'2px 7px',background:'rgba(245,81,106,0.15)',color:'var(--rose)',borderRadius:'var(--r-pill)',fontSize:'0.62rem',fontWeight:700}}>{critCount} critical</span>}
                    {warnCount > 0 && <span style={{marginLeft:6,padding:'2px 7px',background:'rgba(245,166,35,0.12)',color:'var(--amber)',borderRadius:'var(--r-pill)',fontSize:'0.62rem',fontWeight:700}}>{warnCount} warning</span>}
                  </h3>
                  <p className="text-xs text-muted">Auto-detected issues in generated chapters</p>
                </div>
              </div>
              <div className="divider"/>
              <div style={{padding:'6px 0'}}>
                {flags.map((flag, i) => (
                  <div key={i} style={{
                    display:'flex', alignItems:'center', gap:12, padding:'7px 18px',
                    borderBottom: i < flags.length-1 ? '1px solid var(--border)' : 'none',
                    background: flag.sev==='CRITICAL' ? 'rgba(245,81,106,0.02)' : 'transparent',
                  }}>
                    <span style={{fontSize:'0.9rem'}}>{flag.sev==='CRITICAL'?'❌':'⚠️'}</span>
                    <span style={{fontSize:'0.72rem',fontWeight:600,color:'var(--ink-500)',minWidth:60,flexShrink:0}}>{flag.chap}:</span>
                    <span style={{fontSize:'0.78rem',color:flag.sev==='CRITICAL'?'var(--rose)':'var(--amber)',flex:1}}>{flag.issue}</span>
                    <span style={{fontSize:'0.62rem',padding:'2px 7px',borderRadius:'var(--r-pill)',fontWeight:700,
                      background:flag.sev==='CRITICAL'?'rgba(245,81,106,0.12)':'rgba(245,166,35,0.1)',
                      color:flag.sev==='CRITICAL'?'var(--rose)':'var(--amber)',flexShrink:0}}>
                      {flag.sev}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Chapters */}
        <div className="card animate-fade">
          <div className="card-pad" style={{ paddingBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <h3 style={{ fontSize:'0.95rem' }}>Chapters — {chapters.length} total</h3>
                <p className="text-xs text-muted mt-1">Click a row to expand · Actions on the right</p>
              </div>
              {chapters.length > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={() => {
                  const pending = chapters.filter(c => canGenerate(c.status));
                  if (!pending.length) { toast('No pending chapters'); return; }
                  pending.forEach(c => handleGenerate(c));
                  toast.success(`Queued ${pending.length} chapters`);
                }}>
                  <Play size={12}/> Generate All Pending
                </button>
              )}
            </div>
          </div>
          <div className="divider"/>

          {chapters.length === 0 ? (
            <div className="empty-state">
              <FileText size={28}/>
              <h3>No chapters yet</h3>
              <p>Generate a TOC first</p>
              <button className="btn btn-primary btn-sm" onClick={handleGenerateToc} disabled={tocLoading}>
                {tocLoading ? <Loader2 size={13} className="animate-spin"/> : <Zap size={13}/>} Generate TOC
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{width:40}}>#</th>
                  <th>Title</th>
                  <th style={{width:120}}>Status</th>
                  <th style={{width:90}}>Words</th>
                  <th style={{width:80}}>QA</th>
                  <th style={{width:190}}>Actions</th>
                  <th style={{width:28}}/>
                </tr>
              </thead>
              <tbody>
                {chapters.map(ch => (
                  <React.Fragment key={ch.id}>
                    <tr style={{cursor:'pointer'}} onClick={() => setExpanded(e => ({...e,[ch.id]:!e[ch.id]}))}>
                      <td><span className="font-mono" style={{fontSize:'0.72rem',color:'var(--ink-400)'}}>{String(ch.chapterNumber).padStart(2,'0')}</span></td>
                      <td>
                        <span style={{fontWeight:500,fontSize:'0.82rem'}}>{ch.title}</span>
                        {isActive(ch.status) && <span style={{marginLeft:8,fontSize:'0.62rem',color:'var(--amber)'}} className="animate-pulse">● live</span>}
                      </td>
                      <td>
                        <span className={`badge ${(STATUS_CFG[ch.status]||STATUS_CFG.PENDING).badge}`} style={{fontSize:'0.62rem'}}>
                          {(STATUS_CFG[ch.status]||STATUS_CFG.PENDING).label}
                        </span>
                      </td>
                      <td><span className="font-mono" style={{fontSize:'0.72rem',color:'var(--ink-500)'}}>{ch.wordCount?ch.wordCount.toLocaleString():'—'}</span></td>
                      <td>
                        {ch.qaScore!=null ? (
                          <span style={{fontFamily:'var(--font-mono)',fontSize:'0.75rem',fontWeight:600,color:ch.qaScore>=80?'var(--sage)':ch.qaScore>=70?'var(--amber)':'var(--rose)'}}>
                            {Math.round(ch.qaScore)}%
                          </span>
                        ) : <span style={{color:'var(--ink-300)',fontSize:'0.72rem'}}>—</span>}
                      </td>
                      <td onClick={e=>e.stopPropagation()}>
                        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                          {canGenerate(ch.status) && (
                            <button className="btn btn-primary btn-xs" onClick={()=>handleGenerate(ch)} disabled={genRunning[ch.id]}>
                              {genRunning[ch.id]?<Loader2 size={10} className="animate-spin"/>:<Play size={10}/>} Gen
                            </button>
                          )}
                          {ch.status==='GENERATED' && (
                            <button className="btn btn-warning btn-xs" onClick={()=>handleGenerate(ch)} disabled={genRunning[ch.id]}>
                              <RotateCcw size={10}/> Regen
                            </button>
                          )}
                          {canQA(ch.status) && (
                            <button className="btn btn-info btn-xs" onClick={()=>handleQA(ch)} disabled={qaRunning[ch.id]}>
                              {qaRunning[ch.id]?<Loader2 size={10} className="animate-spin"/>:<ShieldCheck size={10}/>} QA
                            </button>
                          )}
                          {canDownload(ch.status) && (
                            <button className="btn btn-success btn-xs" onClick={()=>handleDownload(ch)}>
                              <Download size={10}/> .docx
                            </button>
                          )}
                          {canDownload(ch.status) && (
                            <button className="btn btn-ghost btn-xs" onClick={()=>handleClear(ch)} title="Clear content">
                              <RotateCcw size={10}/>
                            </button>
                          )}
                          <button className="btn btn-danger btn-xs" onClick={()=>handleDelete(ch)} title="Delete slot">
                            <Trash2 size={10}/>
                          </button>
                        </div>
                      </td>
                      <td>{expanded[ch.id]?<ChevronUp size={12} style={{color:'var(--ink-400)'}}/>:<ChevronDown size={12} style={{color:'var(--ink-300)'}}/>}</td>
                    </tr>
                    {expanded[ch.id] && (
                      <tr>
                        <td colSpan={7} style={{background:'var(--surface-2)',padding:'10px 14px'}}>
                          <div style={{display:'flex',gap:20,fontSize:'0.73rem',flexWrap:'wrap'}}>
                            <span style={{color:'var(--ink-500)'}}>ID: <span className="font-mono" style={{color:'var(--ink-700)'}}>{ch.id.slice(0,8)}…</span></span>
                            {ch.generatedAt && <span style={{color:'var(--ink-500)'}}>Generated: <span style={{color:'var(--ink-700)'}}>{new Date(ch.generatedAt).toLocaleString()}</span></span>}
                            {ch.githubCommitSha && <span style={{color:'var(--ink-500)'}}><GitBranch size={10} style={{display:'inline',marginRight:3}}/>Commit: <span className="font-mono" style={{color:'var(--ink-700)'}}>{ch.githubCommitSha.slice(0,7)}</span></span>}
                            {ch.retryCount>0 && <span style={{color:'var(--amber)'}}>Retried {ch.retryCount}×</span>}
                            {(canQA(ch.status)||ch.qaScore!=null) && (
                              <button className="btn btn-ghost btn-xs" onClick={()=>setDrawer(ch)}>
                                <FileText size={10}/> QA Report
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {drawer && <QAReportDrawer chapter={drawer} onClose={()=>setDrawer(null)}/>}
    </div>
  );
}

function InfoItem({ label, value, mono }) {
  return (
    <div>
      <div style={{fontSize:'0.63rem',fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--ink-400)',marginBottom:4}}>{label}</div>
      <div style={{fontSize:'0.82rem',color:'var(--ink-900)',fontFamily:mono?'var(--font-mono)':'inherit'}}>{value}</div>
    </div>
  );
}

function QAReportDrawer({ chapter, onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChapterQaReport(chapter.id)
      .then(r => setReport(r.data?.report||r.data))
      .catch(()=>toast.error('Failed to load report'))
      .finally(()=>setLoading(false));
  }, [chapter.id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:600,maxHeight:'85vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
          <div>
            <div className="modal-title">QA Report</div>
            <div className="modal-subtitle">Ch {chapter.chapterNumber}: {chapter.title}</div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={14}/></button>
        </div>
        {loading ? (
          <div style={{textAlign:'center',padding:40}}><Loader2 size={24} className="animate-spin" style={{color:'var(--cobalt)'}}/></div>
        ) : !report ? (
          <div className="empty-state"><AlertCircle size={24}/><h3>No report found</h3></div>
        ) : (
          <div>
            <div style={{
              display:'flex',gap:16,marginBottom:18,padding:'14px 16px',
              background:report.passed?'rgba(52,201,122,0.08)':'rgba(245,81,106,0.08)',
              border:`1px solid ${report.passed?'rgba(52,201,122,0.2)':'rgba(245,81,106,0.2)'}`,
              borderRadius:'var(--r-md)',
            }}>
              <div style={{textAlign:'center',minWidth:64}}>
                <div style={{fontSize:'2rem',fontWeight:800,fontFamily:'var(--font-display)',color:report.passed?'var(--sage)':'var(--rose)'}}>
                  {report.overallScore!=null?Math.round(report.overallScore):'?'}
                </div>
                <div style={{fontSize:'0.62rem',color:'var(--ink-500)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Score</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:'0.85rem',fontWeight:600,color:report.passed?'var(--sage)':'var(--rose)',marginBottom:4}}>
                  {report.passed?'✓ QA Passed':'✗ QA Failed'}
                </div>
                {report.executiveSummary && <p style={{fontSize:'0.73rem',color:'var(--ink-700)',lineHeight:1.5}}>{report.executiveSummary}</p>}
              </div>
            </div>

            {report.apaViolations?.length>0 && <ViolationSection title="APA Violations" items={report.apaViolations} color="var(--amber)"/>}
            {report.boldGovernanceIssues?.length>0 && <ViolationSection title="Bold Governance" items={report.boldGovernanceIssues} color="var(--rose)"/>}
            {report.redundancyFlags?.length>0 && <ViolationSection title="Redundancy" items={report.redundancyFlags} color="var(--violet)"/>}

            {report.recommendedFixes?.length>0 && (
              <div style={{marginTop:14}}>
                <div style={{fontSize:'0.7rem',fontWeight:700,color:'var(--ink-500)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>Fixes</div>
                {report.recommendedFixes.map((fix,i)=>(
                  <div key={i} style={{display:'flex',gap:8,marginBottom:5}}>
                    <span style={{fontSize:'0.7rem',color:'var(--cobalt)',fontWeight:700,flexShrink:0}}>{i+1}.</span>
                    <span style={{fontSize:'0.73rem',color:'var(--ink-700)',lineHeight:1.5}}>{fix}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ViolationSection({ title, items, color }) {
  return (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:'0.7rem',fontWeight:700,color,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:6}}>{title} ({items.length})</div>
      <div style={{display:'flex',flexDirection:'column',gap:4}}>
        {items.slice(0,4).map((item,i)=>(
          <div key={i} style={{padding:'6px 10px',background:'var(--surface-2)',borderRadius:'var(--r-sm)',borderLeft:`2px solid ${color}`}}>
            <div style={{fontSize:'0.72rem',fontWeight:600,color:'var(--ink-700)',marginBottom:2}}>{item.issue||item.term||item.content}</div>
            {item.suggestion && <div style={{fontSize:'0.67rem',color:'var(--ink-500)'}}>→ {item.suggestion}</div>}
          </div>
        ))}
        {items.length>4 && <div style={{fontSize:'0.67rem',color:'var(--ink-400)'}}>+{items.length-4} more</div>}
      </div>
    </div>
  );
}
