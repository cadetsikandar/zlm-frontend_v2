import React, { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import { getBooks, getBookChapters, generateChapter, runChapterQA, downloadChapter } from '../api';
import { FileText, Loader2, RefreshCw, Play, ShieldCheck, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const STATUS_CFG = {
  PENDING:     { label:'Pending',    badge:'badge-muted'  },
  GENERATING:  { label:'Generating', badge:'badge-amber'  },
  GENERATED:   { label:'Generated',  badge:'badge-blue'   },
  QA_PENDING:  { label:'QA Pending', badge:'badge-violet' },
  QA_PASSED:   { label:'QA Passed',  badge:'badge-green'  },
  QA_FAILED:   { label:'QA Failed',  badge:'badge-rose'   },
  DESIGN_READY:{ label:'Design Ready',badge:'badge-teal'  },
};
const TRACK_COLOR = { FNP:'#3B6FF5',AGPCNP:'#34C97A',PMHNP:'#9B6FFF',WHNP:'#F5A623',AGACNP:'#F5516A',PNP:'#00C4C4',ANP:'#7FA8FF' };

const canGen = s => ['PENDING','QA_FAILED'].includes((s||'').toUpperCase());
const canQA  = s => ['GENERATED','QA_FAILED','QA_PASSED'].includes((s||'').toUpperCase());
const canDl  = s => ['GENERATED','QA_PENDING','QA_PASSED','QA_FAILED','DESIGN_READY'].includes((s||'').toUpperCase());

export default function Chapters() {
  const navigate = useNavigate();
  const [rows, setRows]         = useState([]); // { chapter, book }
  const [loading, setLoading]   = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterTrack, setFilterTrack]   = useState('ALL');
  const [search, setSearch]             = useState('');
  const [genBusy, setGenBusy]           = useState({});
  const [qaBusy, setQaBusy]             = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getBooks();
      const books = data?.books || data || [];
      const allRows = [];
      await Promise.allSettled(books.map(async book => {
        try {
          const { data: chData } = await getBookChapters(book.id);
          const chapters = chData?.chapters || chData || [];
          chapters.forEach(ch => allRows.push({ chapter: ch, book }));
        } catch {}
      }));
      allRows.sort((a,b) => {
        const ta = a.book.certificationTrack; const tb = b.book.certificationTrack;
        if (ta !== tb) return ta.localeCompare(tb);
        if (a.book.trackNumber !== b.book.trackNumber) return a.book.trackNumber - b.book.trackNumber;
        return a.chapter.chapterNumber - b.chapter.chapterNumber;
      });
      setRows(allRows);
    } catch { toast.error('Failed to load chapters'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const doGen = async(ch) => {
    setGenBusy(r=>({...r,[ch.id]:true}));
    try { await generateChapter(ch.id); toast.success(`Ch ${ch.chapterNumber} queued`); setTimeout(load,2000); }
    catch(e){ toast.error(e.response?.data?.message||'Failed'); }
    finally { setGenBusy(r=>({...r,[ch.id]:false})); }
  };
  const doQA = async(ch) => {
    setQaBusy(r=>({...r,[ch.id]:true}));
    try { await runChapterQA(ch.id,{strictMode:true}); toast.success(`QA queued`); setTimeout(load,2000); }
    catch(e){ toast.error(e.response?.data?.message||'Failed'); }
    finally { setQaBusy(r=>({...r,[ch.id]:false})); }
  };
  const doDl = async(ch) => {
    try {
      const res = await downloadChapter(ch.id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href=url; a.download=`ch-${ch.chapterNumber}.docx`; a.click(); URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  const filtered = rows.filter(({chapter, book}) => {
    if (filterStatus!=='ALL' && chapter.status!==filterStatus) return false;
    if (filterTrack!=='ALL' && book.certificationTrack!==filterTrack) return false;
    if (search && !chapter.title.toLowerCase().includes(search.toLowerCase()) && !book.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pendingCount   = rows.filter(r=>r.chapter.status==='PENDING').length;
  const generatedCount = rows.filter(r=>r.chapter.status==='GENERATED').length;
  const qaPassedCount  = rows.filter(r=>r.chapter.status==='QA_PASSED').length;
  const failedCount    = rows.filter(r=>r.chapter.status==='QA_FAILED').length;

  return (
    <div>
      <TopBar
        title="All Chapters"
        subtitle={`${rows.length} chapters across ${[...new Set(rows.map(r=>r.book.id))].length} books`}
        actions={
          <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
            {loading?<Loader2 size={13} className="animate-spin"/>:<RefreshCw size={13}/>} Refresh
          </button>
        }
      />
      <div className="page-content">
        {/* Summary chips */}
        <div style={{display:'flex',gap:8,marginBottom:18,flexWrap:'wrap'}}>
          {[
            {label:'Pending',count:pendingCount,color:'var(--ink-500)'},
            {label:'Generated',count:generatedCount,color:'var(--cobalt)'},
            {label:'QA Passed',count:qaPassedCount,color:'var(--sage)'},
            {label:'QA Failed',count:failedCount,color:'var(--rose)'},
          ].map(chip=>(
            <div key={chip.label} style={{padding:'5px 12px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-pill)',display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:'0.7rem',fontWeight:600,color:chip.color,fontFamily:'var(--font-mono)'}}>{chip.count}</span>
              <span style={{fontSize:'0.68rem',color:'var(--ink-500)'}}>{chip.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap'}}>
          <input className="input" placeholder="Search chapters…" value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:220}}/>
          <select className="input select" value={filterTrack} onChange={e=>setFilterTrack(e.target.value)} style={{maxWidth:160}}>
            <option value="ALL">All Tracks</option>
            {Object.keys(TRACK_COLOR).map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          <select className="input select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{maxWidth:160}}>
            <option value="ALL">All Statuses</option>
            {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
          {(filterTrack!=='ALL'||filterStatus!=='ALL'||search)&&(
            <button className="btn btn-ghost btn-sm" onClick={()=>{setFilterTrack('ALL');setFilterStatus('ALL');setSearch('');}}>Clear</button>
          )}
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:60}}><Loader2 size={28} className="animate-spin" style={{color:'var(--cobalt)'}}/></div>
        ) : filtered.length===0 ? (
          <div className="empty-state"><FileText size={36}/><h3>No chapters found</h3><p>Try adjusting your filters</p></div>
        ) : (
          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{width:36}}>#</th>
                  <th>Chapter Title</th>
                  <th style={{width:110}}>Book / Track</th>
                  <th style={{width:115}}>Status</th>
                  <th style={{width:88}}>Words</th>
                  <th style={{width:75}}>QA</th>
                  <th style={{width:165}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({chapter:ch, book}) => {
                  const cfg = STATUS_CFG[ch.status]||{label:ch.status,badge:'badge-muted'};
                  const tc  = TRACK_COLOR[book.certificationTrack]||'#3B6FF5';
                  return (
                    <tr key={ch.id}>
                      <td><span className="font-mono" style={{fontSize:'0.7rem',color:'var(--ink-400)'}}>{String(ch.chapterNumber).padStart(2,'0')}</span></td>
                      <td>
                        <span style={{fontWeight:500,fontSize:'0.81rem',color:'var(--ink-900)'}}>{ch.title}</span>
                        {['GENERATING','QA_PENDING'].includes(ch.status)&&<span style={{marginLeft:7,fontSize:'0.6rem',color:'var(--amber)'}} className="animate-pulse">● live</span>}
                      </td>
                      <td>
                        <button onClick={()=>navigate(`/books/${book.id}`)} style={{background:'none',border:'none',cursor:'pointer',padding:0,textAlign:'left'}}>
                          <span style={{fontSize:'0.63rem',fontWeight:700,color:tc,padding:'1px 6px',borderRadius:3,background:`${tc}15`}}>{book.certificationTrack}</span>
                          <div style={{fontSize:'0.65rem',color:'var(--ink-500)',marginTop:2}}>B{book.trackNumber}</div>
                        </button>
                      </td>
                      <td><span className={`badge ${cfg.badge}`} style={{fontSize:'0.61rem'}}>{cfg.label}</span></td>
                      <td><span className="font-mono" style={{fontSize:'0.7rem',color:'var(--ink-500)'}}>{ch.wordCount?ch.wordCount.toLocaleString():'—'}</span></td>
                      <td>
                        {ch.qaScore!=null ? <span style={{fontFamily:'var(--font-mono)',fontSize:'0.73rem',fontWeight:600,color:ch.qaScore>=80?'var(--sage)':ch.qaScore>=70?'var(--amber)':'var(--rose)'}}>{Math.round(ch.qaScore)}%</span>
                        : <span style={{color:'var(--ink-300)',fontSize:'0.7rem'}}>—</span>}
                      </td>
                      <td>
                        <div style={{display:'flex',gap:4}}>
                          {canGen(ch.status)&&<button className="btn btn-primary btn-xs" onClick={()=>doGen(ch)} disabled={genBusy[ch.id]}>{genBusy[ch.id]?<Loader2 size={9} className="animate-spin"/>:<Play size={9}/>} Gen</button>}
                          {canQA(ch.status) &&<button className="btn btn-info btn-xs"    onClick={()=>doQA(ch)}  disabled={qaBusy[ch.id]} >{qaBusy[ch.id]? <Loader2 size={9} className="animate-spin"/>:<ShieldCheck size={9}/>} QA</button>}
                          {canDl(ch.status) &&<button className="btn btn-success btn-xs" onClick={()=>doDl(ch)} ><Download size={9}/> .docx</button>}
                        </div>
                      </td>
                    </tr>
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
