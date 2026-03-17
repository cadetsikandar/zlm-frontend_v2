import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import { getBooks, createBook, getBookChapters, generateChapter, runChapterQA, downloadChapter, deleteChapter, clearChapter, addChapter } from '../api';
import { Plus, Loader2, Trash2, Check, Play, ShieldCheck, Download, RefreshCw, BookOpen, RotateCcw, ChevronDown, ChevronUp, X } from 'lucide-react';
import toast from 'react-hot-toast';

const TRACKS = ['FNP','AGPCNP','PMHNP','WHNP','AGACNP','PNP','ANP'];
const TRACK_LABELS = { FNP:'Family NP', AGPCNP:'Adult-Gero PC NP', PMHNP:'Psychiatric MH NP', WHNP:"Women's Health NP", AGACNP:'Adult-Gero AC NP', PNP:'Pediatric NP', ANP:'Adult NP' };
const TRACK_COLOR  = { FNP:'#3B6FF5', AGPCNP:'#34C97A', PMHNP:'#9B6FFF', WHNP:'#F5A623', AGACNP:'#F5516A', PNP:'#00C4C4', ANP:'#7FA8FF' };
const STATUS_CFG = {
  PENDING:     { label:'Pending',    badge:'badge-muted',  canGen:true,  canQA:false, canDl:false },
  GENERATING:  { label:'Generating', badge:'badge-amber',  canGen:false, canQA:false, canDl:false },
  GENERATED:   { label:'Generated',  badge:'badge-blue',   canGen:true,  canQA:true,  canDl:true  },
  QA_PENDING:  { label:'QA Pending', badge:'badge-violet', canGen:false, canQA:false, canDl:false },
  QA_PASSED:   { label:'QA Passed',  badge:'badge-green',  canGen:false, canQA:true,  canDl:true  },
  QA_FAILED:   { label:'QA Failed',  badge:'badge-rose',   canGen:true,  canQA:true,  canDl:true  },
  DESIGN_READY:{ label:'Design Ready',badge:'badge-teal',  canGen:false, canQA:true,  canDl:true  },
};
const getCfg = s => STATUS_CFG[(s||'').toUpperCase()]||{label:s||'?',badge:'badge-muted',canGen:false,canQA:false,canDl:false};

export default function BookSetup() {
  const navigate = useNavigate();
  const [books, setBooks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter]   = useState('ALL');
  const [search, setSearch]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await getBooks(); setBooks(data?.books||data||[]); }
    catch { toast.error('Failed to load books'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const needs = books.some(b=>['GENERATING','QA_PENDING','QA_IN_PROGRESS'].includes(b.status));
    if (!needs) return;
    const t = setInterval(load, 8000); return () => clearInterval(t);
  }, [books, load]);

  const filtered = books.filter(b => {
    if (filter!=='ALL' && b.certificationTrack!==filter) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <TopBar
        title="Book Setup"
        subtitle="Configure books, manage chapters, run generation & QA"
        actions={
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>{loading?<Loader2 size={13} className="animate-spin"/>:<RefreshCw size={13}/>} Refresh</button>
            <button className="btn btn-primary btn-sm" onClick={()=>setShowAdd(true)}><Plus size={13}/> New Book</button>
          </div>
        }
      />
      <div className="page-content">
        <div style={{display:'flex',gap:10,marginBottom:18,flexWrap:'wrap'}}>
          <input className="input" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:200}}/>
          <select className="input select" value={filter} onChange={e=>setFilter(e.target.value)} style={{maxWidth:180}}>
            <option value="ALL">All Tracks</option>
            {TRACKS.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {loading ? <div style={{textAlign:'center',padding:60}}><Loader2 size={28} className="animate-spin" style={{color:'var(--cobalt)'}}/></div>
        : filtered.length===0 ? (
          <div className="empty-state"><BookOpen size={36}/><h3>No books</h3><p>Create your first book</p>
            <button className="btn btn-primary btn-sm" onClick={()=>setShowAdd(true)}><Plus size={13}/> Add Book</button></div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {filtered.map(b=><BookPanel key={b.id} book={b} onUpdated={load} onNavigate={()=>navigate(`/books/${b.id}`)}/>)}
          </div>
        )}

        {books.length>0&&(
          <div style={{marginTop:20,padding:'10px 14px',background:'var(--surface)',borderRadius:'var(--r-lg)',border:'1px solid var(--border)',fontSize:'0.68rem',color:'var(--ink-400)',lineHeight:1.9}}>
            <strong style={{color:'var(--ink-600)',display:'block',marginBottom:3}}>Action Guide</strong>
            <span style={{marginRight:14}}><strong style={{color:'var(--cobalt)'}}>Gen</strong> — AI pipeline</span>
            <span style={{marginRight:14}}><strong style={{color:'var(--electric)'}}>QA</strong> — compliance audit</span>
            <span style={{marginRight:14}}><strong style={{color:'var(--sage)'}}>.docx</strong> — download</span>
            <span style={{marginRight:14}}><strong style={{color:'var(--ink-500)'}}>↺</strong> — clear content</span>
            <span><strong style={{color:'var(--rose)'}}>🗑</strong> — delete slot</span>
          </div>
        )}
      </div>
      {showAdd&&<AddBookModal onClose={()=>setShowAdd(false)} onCreated={()=>{setShowAdd(false);load();}}/>}
    </div>
  );
}

function BookPanel({ book, onUpdated, onNavigate }) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [genBusy, setGenBusy]   = useState({});
  const [qaBusy, setQaBusy]     = useState({});
  const color = TRACK_COLOR[book.certificationTrack]||'#3B6FF5';

  const loadChapters = useCallback(async()=>{
    setLoading(true);
    try { const {data}=await getBookChapters(book.id); setChapters(data?.chapters||data||[]); }
    finally { setLoading(false); }
  },[book.id]);

  const toggle = () => { if(!open) loadChapters(); setOpen(o=>!o); };
  const progress = book.totalChapters?Math.round((book.completedChapters/book.totalChapters)*100):0;

  const doGen = async(ch)=>{
    setGenBusy(r=>({...r,[ch.id]:true}));
    try { await generateChapter(ch.id); toast.success(`Ch ${ch.chapterNumber} queued`); loadChapters(); }
    catch(e){ toast.error(e.response?.data?.message||'Failed'); }
    finally { setGenBusy(r=>({...r,[ch.id]:false})); }
  };
  const doQA = async(ch)=>{
    setQaBusy(r=>({...r,[ch.id]:true}));
    try { await runChapterQA(ch.id,{strictMode:true}); toast.success(`QA started ch ${ch.chapterNumber}`); loadChapters(); }
    catch(e){ toast.error(e.response?.data?.message||'Failed'); }
    finally { setQaBusy(r=>({...r,[ch.id]:false})); }
  };
  const doDl = async(ch)=>{
    try {
      const res=await downloadChapter(ch.id);
      const url=URL.createObjectURL(new Blob([res.data]));
      const a=document.createElement('a'); a.href=url; a.download=`ch-${ch.chapterNumber}.docx`; a.click(); URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };
  const doClear = async(ch)=>{
    if(!window.confirm(`Clear "${ch.title}"?`)) return;
    try { await clearChapter(ch.id); toast.success('Cleared'); loadChapters(); }
    catch(e){ toast.error(e.response?.data?.message||'Failed'); }
  };
  const doDel = async(ch)=>{
    if(!window.confirm(`Delete slot "${ch.title}"?`)) return;
    try { await deleteChapter(ch.id); toast.success('Deleted'); loadChapters(); onUpdated(); }
    catch(e){ toast.error(e.response?.data?.message||'Failed'); }
  };

  return (
    <div className="card" style={{borderLeft:`3px solid ${color}`}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 18px',cursor:'pointer'}} onClick={toggle}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
            <span style={{fontSize:'0.63rem',fontWeight:700,padding:'2px 7px',borderRadius:4,background:`${color}18`,color}}>{book.certificationTrack}</span>
            <span style={{fontSize:'0.6rem',color:'var(--ink-400)'}}>Book {book.trackNumber}</span>
            <span className="badge badge-muted" style={{fontSize:'0.58rem'}}>{book.status?.replace(/_/g,' ')}</span>
          </div>
          <div style={{fontSize:'0.88rem',fontWeight:600,color:'var(--ink-900)'}}>{book.title}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:'0.68rem',color:'var(--ink-500)',marginBottom:3}}>{book.completedChapters||0}/{book.totalChapters||'?'} · {progress}%</div>
            <div style={{width:90}} className="progress-bar"><div className="progress-fill" style={{width:`${progress}%`,background:color}}/></div>
          </div>
          <button className="btn btn-ghost btn-xs" onClick={e=>{e.stopPropagation();onNavigate();}}>Detail</button>
          {open?<ChevronUp size={13} style={{color:'var(--ink-400)',flexShrink:0}}/>:<ChevronDown size={13} style={{color:'var(--ink-300)',flexShrink:0}}/>}
        </div>
      </div>

      {open&&(
        <div style={{borderTop:'1px solid var(--border)'}}>
          {loading ? <div style={{padding:20,textAlign:'center'}}><Loader2 size={18} className="animate-spin" style={{color:'var(--cobalt)'}}/></div> : (
            <>
              <table className="data-table">
                <thead><tr><th style={{width:34}}>#</th><th>Title</th><th style={{width:110}}>Status</th><th style={{width:78}}>Words</th><th style={{width:70}}>QA</th><th style={{width:175}}>Actions</th></tr></thead>
                <tbody>
                  {chapters.length===0 ? (
                    <tr><td colSpan={6} style={{textAlign:'center',padding:'18px',color:'var(--ink-400)',fontSize:'0.76rem'}}>No chapters — generate TOC from Book Detail page</td></tr>
                  ) : chapters.map(ch=>{
                    const cfg=getCfg(ch.status);
                    return (
                      <tr key={ch.id}>
                        <td><span className="font-mono" style={{fontSize:'0.68rem',color:'var(--ink-400)'}}>{String(ch.chapterNumber).padStart(2,'0')}</span></td>
                        <td><span style={{fontSize:'0.79rem',fontWeight:500}}>{ch.title}</span></td>
                        <td><span className={`badge ${cfg.badge}`} style={{fontSize:'0.58rem'}}>{cfg.label}</span></td>
                        <td><span className="font-mono" style={{fontSize:'0.68rem',color:'var(--ink-500)'}}>{ch.wordCount?ch.wordCount.toLocaleString():'—'}</span></td>
                        <td>{ch.qaScore!=null?<span style={{fontFamily:'var(--font-mono)',fontSize:'0.7rem',fontWeight:600,color:ch.qaScore>=80?'var(--sage)':ch.qaScore>=70?'var(--amber)':'var(--rose)'}}>{Math.round(ch.qaScore)}%</span>:<span style={{color:'var(--ink-300)',fontSize:'0.68rem'}}>—</span>}</td>
                        <td>
                          <div style={{display:'flex',gap:3}}>
                            {cfg.canGen&&<button className="btn btn-primary btn-xs" onClick={()=>doGen(ch)} disabled={genBusy[ch.id]}>{genBusy[ch.id]?<Loader2 size={9} className="animate-spin"/>:<Play size={9}/>} Gen</button>}
                            {cfg.canQA &&<button className="btn btn-info btn-xs"    onClick={()=>doQA(ch)}  disabled={qaBusy[ch.id]} >{qaBusy[ch.id]? <Loader2 size={9} className="animate-spin"/>:<ShieldCheck size={9}/>} QA</button>}
                            {cfg.canDl &&<button className="btn btn-success btn-xs" onClick={()=>doDl(ch)} ><Download size={9}/> .docx</button>}
                            {cfg.canDl &&<button className="btn btn-ghost btn-xs"   onClick={()=>doClear(ch)} title="Clear"><RotateCcw size={9}/></button>}
                            <button className="btn btn-danger btn-xs" onClick={()=>doDel(ch)} title="Delete"><Trash2 size={9}/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {chapters.length>0&&<AddChapterInline bookId={book.id} nextNum={(chapters[chapters.length-1]?.chapterNumber||0)+1} onAdded={loadChapters}/>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AddChapterInline({ bookId, nextNum, onAdded }) {
  const [open, setOpen]   = useState(false);
  const [title, setTitle] = useState('');
  const [num, setNum]     = useState(nextNum);
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{ setNum(nextNum); },[nextNum]);
  useEffect(()=>{ if(open&&ref.current) ref.current.focus(); },[open]);

  const handleAdd = async()=>{
    if(!title.trim()){ toast.error('Title required'); return; }
    setSaving(true);
    try { await addChapter(bookId,{title:title.trim(),chapterNumber:parseInt(num)||nextNum}); toast.success('Chapter added'); setTitle(''); setOpen(false); onAdded(); }
    catch(e){ toast.error(e.response?.data?.error||'Failed'); }
    finally { setSaving(false); }
  };

  if(!open) return (
    <div style={{padding:'8px 18px',borderTop:'1px solid var(--border)'}}>
      <button className="btn btn-ghost btn-xs" onClick={()=>setOpen(true)}><Plus size={10}/> Add Chapter</button>
    </div>
  );
  return (
    <div style={{padding:'9px 18px',borderTop:'1px solid var(--border)',background:'var(--surface-2)',display:'flex',gap:7,alignItems:'center',flexWrap:'wrap'}}>
      <input type="number" value={num} onChange={e=>setNum(e.target.value)} style={{width:55,padding:'5px 7px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',color:'var(--ink-900)',fontSize:'0.76rem',outline:'none',fontFamily:'var(--font-mono)'}} min={1} max={99}/>
      <input ref={ref} type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Chapter title…" onKeyDown={e=>{if(e.key==='Enter')handleAdd();if(e.key==='Escape')setOpen(false);}}
        style={{flex:1,minWidth:160,padding:'5px 10px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',color:'var(--ink-900)',fontSize:'0.76rem',outline:'none'}}/>
      <button className="btn btn-primary btn-xs" onClick={handleAdd} disabled={saving||!title.trim()}>{saving?<Loader2 size={9} className="animate-spin"/>:<Check size={9}/>} Add</button>
      <button className="btn btn-ghost btn-xs" onClick={()=>setOpen(false)}><X size={9}/></button>
    </div>
  );
}

function AddBookModal({ onClose, onCreated }) {
  const [form, setForm] = useState({title:'',subtitle:'',certificationTrack:'FNP',trackNumber:1});
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const handleSubmit = async(e)=>{
    e.preventDefault();
    if(!form.title.trim()){ toast.error('Title required'); return; }
    setSaving(true);
    try { await createBook({...form,trackNumber:parseInt(form.trackNumber)}); toast.success('Book created!'); onCreated(); }
    catch(e){ toast.error(e.response?.data?.message||e.response?.data?.error||'Failed to create book'); }
    finally { setSaving(false); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
          <div className="modal-title">New Book</div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={14}/></button>
        </div>
        <p className="modal-subtitle">Create a new book in the 28-book production catalog</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="input-label">Book Title *</label><input className="input" value={form.title} onChange={set('title')} placeholder="FNP Core Textbook Vol 1" required/></div>
          <div className="form-group"><label className="input-label">Subtitle (optional)</label><input className="input" value={form.subtitle} onChange={set('subtitle')} placeholder="A Comprehensive Review"/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div className="form-group">
              <label className="input-label">Certification Track *</label>
              <select className="input select" value={form.certificationTrack} onChange={set('certificationTrack')}>
                {TRACKS.map(t=><option key={t} value={t}>{t} — {TRACK_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Book # (1–4) *</label>
              <select className="input select" value={form.trackNumber} onChange={set('trackNumber')}>
                {[1,2,3,4].map(n=><option key={n} value={n}>Book {n}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving||!form.title.trim()}>
              {saving?<Loader2 size={13} className="animate-spin"/>:<Plus size={13}/>} Create Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
