import React, { useState, useEffect } from 'react';
import { getChapters } from '../api'; 
import {
  ShieldCheck,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const TRACK_COLOR = { FNP:'#3B6FF5',AGPCNP:'#34C97A',PMHNP:'#9B6FFF',WHNP:'#F5A623',AGACNP:'#F5516A',PNP:'#00C4C4',ANP:'#7FA8FF' };

export default function QAReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('ALL'); // ALL, PASSED, FAILED
  const [search, setSearch]   = useState('');
  const [expanded, setExpanded] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAllQAReports();
      setReports(data?.reports || data || []);
    } catch { toast.error('Failed to load QA reports'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const filtered = reports.filter(r => {
    if (filter==='PASSED' && !r.passed) return false;
    if (filter==='FAILED' && r.passed) return false;
    if (search) {
      const q = search.toLowerCase();
      const chTitle = r.chapter?.title||r.chapterId||'';
      if (!chTitle.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const passCount = reports.filter(r=>r.passed).length;
  const failCount = reports.filter(r=>!r.passed).length;
  const avgScore  = reports.length ? Math.round(reports.reduce((s,r)=>s+(r.overallScore||0),0)/reports.length) : null;

  return (
    <div>
      <TopBar
        title="QA Reports"
        subtitle="APA 7th edition · Bold governance · Redundancy detection"
        actions={
          <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
            {loading?<Loader2 size={13} className="animate-spin"/>:<RefreshCw size={13}/>} Refresh
          </button>
        }
      />
      <div className="page-content">
        {/* Summary */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))',gap:12,marginBottom:20}}>
          <SummaryCard label="Total Reports" value={reports.length} color="var(--cobalt)" />
          <SummaryCard label="Passed" value={passCount} color="var(--sage)" />
          <SummaryCard label="Failed" value={failCount} color="var(--rose)" />
          <SummaryCard label="Avg Score" value={avgScore!=null?`${avgScore}%`:'—'}
            color={avgScore>=80?'var(--sage)':avgScore>=70?'var(--amber)':'var(--rose)'} />
        </div>

        {/* Filters */}
        <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
          <input className="input" placeholder="Search by chapter…" value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:220}}/>
          {['ALL','PASSED','FAILED'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              className={`btn btn-sm ${filter===f?'btn-primary':'btn-ghost'}`}>
              {f==='ALL'?'All Reports':f==='PASSED'?'Passed Only':'Failed Only'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:60}}><Loader2 size={28} className="animate-spin" style={{color:'var(--cobalt)'}}/></div>
        ) : filtered.length===0 ? (
          <div className="empty-state"><ShieldCheck size={36}/><h3>No QA reports found</h3><p>Run QA on generated chapters to see reports here</p></div>
        ) : (
          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Chapter</th>
                  <th style={{width:120}}>Track / Book</th>
                  <th style={{width:90}}>Score</th>
                  <th style={{width:90}}>Result</th>
                  <th style={{width:80}}>APA</th>
                  <th style={{width:80}}>Bold</th>
                  <th style={{width:80}}>Redundancy</th>
                  <th style={{width:120}}>Date</th>
                  <th style={{width:30}}/>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const tc = TRACK_COLOR[r.chapter?.book?.certificationTrack||'FNP']||'#3B6FF5';
                  const apaCount  = Array.isArray(r.apaViolations)?r.apaViolations.length:0;
                  const boldCount = Array.isArray(r.boldGovernanceIssues)?r.boldGovernanceIssues.length:0;
                  const redCount  = Array.isArray(r.redundancyFlags)?r.redundancyFlags.length:0;
                  return (
                    <React.Fragment key={r.id}>
                      <tr style={{cursor:'pointer'}} onClick={()=>setExpanded(e=>({...e,[r.id]:!e[r.id]}))}>
                        <td>
                          <span style={{fontWeight:500,fontSize:'0.81rem'}}>
                            {r.chapter?.title || `Chapter ${r.chapterId?.slice(0,8)}`}
                          </span>
                        </td>
                        <td>
                          {r.chapter?.book ? (
                            <span style={{fontSize:'0.65rem',fontWeight:700,color:tc,padding:'2px 6px',borderRadius:3,background:`${tc}15`}}>
                              {r.chapter.book.certificationTrack} B{r.chapter.book.trackNumber}
                            </span>
                          ) : <span style={{color:'var(--ink-400)',fontSize:'0.72rem'}}>—</span>}
                        </td>
                        <td>
                          <span style={{fontFamily:'var(--font-mono)',fontSize:'0.8rem',fontWeight:700,
                            color:r.overallScore>=80?'var(--sage)':r.overallScore>=70?'var(--amber)':'var(--rose)'}}>
                            {r.overallScore!=null?Math.round(r.overallScore):'?'}
                          </span>
                        </td>
                        <td>
                          {r.passed ? (
                            <span style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.72rem',color:'var(--sage)',fontWeight:600}}>
                              <CheckCircle2 size={12}/> Passed
                            </span>
                          ) : (
                            <span style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.72rem',color:'var(--rose)',fontWeight:600}}>
                              <XCircle size={12}/> Failed
                            </span>
                          )}
                        </td>
                        <td><CountPill n={apaCount} color={apaCount>0?'var(--amber)':'var(--sage)'}/></td>
                        <td><CountPill n={boldCount} color={boldCount>0?'var(--rose)':'var(--sage)'}/></td>
                        <td><CountPill n={redCount} color={redCount>0?'var(--violet)':'var(--sage)'}/></td>
                        <td><span style={{fontSize:'0.7rem',color:'var(--ink-500)'}}>{r.createdAt?new Date(r.createdAt).toLocaleDateString():'—'}</span></td>
                        <td>{expanded[r.id]?<ChevronUp size={11} style={{color:'var(--ink-400)'}}/>:<ChevronDown size={11} style={{color:'var(--ink-300)'}}/>}</td>
                      </tr>
                      {expanded[r.id] && (
                        <tr>
                          <td colSpan={9} style={{background:'var(--surface-2)',padding:'12px 18px'}}>
                            <div style={{fontSize:'0.75rem',color:'var(--ink-700)',marginBottom:8,lineHeight:1.6}}>
                              {r.executiveSummary||'No executive summary available.'}
                            </div>
                            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                              {apaCount>0 && (
                                <div style={{padding:'6px 10px',background:'rgba(245,166,35,0.08)',border:'1px solid rgba(245,166,35,0.2)',borderRadius:'var(--r-sm)'}}>
                                  <div style={{fontSize:'0.65rem',fontWeight:700,color:'var(--amber)',marginBottom:4}}>APA Violations ({apaCount})</div>
                                  {(r.apaViolations||[]).slice(0,2).map((v,i)=>(
                                    <div key={i} style={{fontSize:'0.68rem',color:'var(--ink-500)',marginBottom:2}}>• {v.issue}</div>
                                  ))}
                                </div>
                              )}
                              {boldCount>0 && (
                                <div style={{padding:'6px 10px',background:'rgba(245,81,106,0.08)',border:'1px solid rgba(245,81,106,0.2)',borderRadius:'var(--r-sm)'}}>
                                  <div style={{fontSize:'0.65rem',fontWeight:700,color:'var(--rose)',marginBottom:4}}>Bold Governance ({boldCount})</div>
                                  {(r.boldGovernanceIssues||[]).slice(0,2).map((v,i)=>(
                                    <div key={i} style={{fontSize:'0.68rem',color:'var(--ink-500)',marginBottom:2}}>• {v.issue||v.term}</div>
                                  ))}
                                </div>
                              )}
                              {r.recommendedFixes?.length>0 && (
                                <div style={{padding:'6px 10px',background:'rgba(59,111,245,0.06)',border:'1px solid rgba(59,111,245,0.15)',borderRadius:'var(--r-sm)',flex:1,minWidth:200}}>
                                  <div style={{fontSize:'0.65rem',fontWeight:700,color:'var(--cobalt)',marginBottom:4}}>Recommended Fixes</div>
                                  {r.recommendedFixes.slice(0,3).map((fix,i)=>(
                                    <div key={i} style={{fontSize:'0.68rem',color:'var(--ink-500)',marginBottom:2}}>• {fix}</div>
                                  ))}
                                </div>
                              )}
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
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-lg)',padding:'14px 18px'}}>
      <div style={{fontSize:'1.5rem',fontWeight:800,fontFamily:'var(--font-display)',color,marginBottom:3}}>{value}</div>
      <div style={{fontSize:'0.7rem',fontWeight:600,color:'var(--ink-500)',textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</div>
    </div>
  );
}
function CountPill({ n, color }) {
  return (
    <span style={{fontFamily:'var(--font-mono)',fontSize:'0.73rem',fontWeight:600,color,padding:'2px 7px',borderRadius:'var(--r-pill)',background:`${color}15`}}>
      {n}
    </span>
  );
}
