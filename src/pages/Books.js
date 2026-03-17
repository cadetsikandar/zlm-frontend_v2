import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import { getBooks } from '../api';
import { BookOpen, ArrowRight, Loader2, RefreshCw, GitBranch, CheckCircle2, Clock, Zap, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const TRACK_META = {
  PMHNP:  { color:'#9B6FFF', bg:'rgba(155,111,255,0.1)',  label:'Psychiatric Mental Health NP' },
  FNP:    { color:'#3B6FF5', bg:'rgba(59,111,245,0.1)',   label:'Family NP' },
  AGPCNP: { color:'#34C97A', bg:'rgba(52,201,122,0.1)',   label:'Adult-Gero Primary Care NP' },
  WHNP:   { color:'#F5A623', bg:'rgba(245,166,35,0.1)',   label:"Women's Health NP" },
  AGACNP: { color:'#F5516A', bg:'rgba(245,81,106,0.1)',   label:'Adult-Gero Acute Care NP' },
  PNP:    { color:'#00C4C4', bg:'rgba(0,196,196,0.1)',    label:'Pediatric NP' },
  ANP:    { color:'#7FA8FF', bg:'rgba(127,168,255,0.1)',  label:'Adult NP' },
};
const STATUS_CFG = {
  DRAFT:         { label:'Draft',          badge:'badge-muted'   },
  GENERATING:    { label:'Generating',     badge:'badge-amber'   },
  QA_PENDING:    { label:'QA Pending',     badge:'badge-violet'  },
  QA_IN_PROGRESS:{ label:'QA Running',    badge:'badge-violet'  },
  QA_PASSED:     { label:'QA Passed',     badge:'badge-green'   },
  DESIGN_PENDING:{ label:'Design Pending', badge:'badge-blue'    },
  DESIGN_READY:  { label:'Design Ready',  badge:'badge-blue'    },
  KDP_READY:     { label:'KDP Ready',     badge:'badge-teal'    },
  PUBLISHED:     { label:'Published',     badge:'badge-green'   },
};

export default function Books() {
  const navigate = useNavigate();
  const [books, setBooks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterTrack, setFilterTrack] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch]           = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getBooks();
      setBooks(data?.books||data||[]);
    } catch { toast.error('Failed to load books'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const filtered = books.filter(b => {
    if (filterTrack!=='ALL' && b.certificationTrack!==filterTrack) return false;
    if (filterStatus!=='ALL' && b.status!==filterStatus) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <TopBar
        title="All Books"
        subtitle={`${books.length} books · 7 certification tracks`}
        actions={
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
              {loading?<Loader2 size={13} className="animate-spin"/>:<RefreshCw size={13}/>} Refresh
            </button>
            <button className="btn btn-primary btn-sm" onClick={()=>navigate('/book-setup')}>
              <Plus size={13}/> New Book
            </button>
          </div>
        }
      />

      <div className="page-content">
        {/* Filters */}
        <div style={{display:'flex',gap:10,marginBottom:18,flexWrap:'wrap'}}>
          <input className="input" placeholder="Search books…" value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:220}}/>
          <select className="input select" value={filterTrack} onChange={e=>setFilterTrack(e.target.value)} style={{maxWidth:180}}>
            <option value="ALL">All Tracks</option>
            {Object.keys(TRACK_META).map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          <select className="input select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{maxWidth:180}}>
            <option value="ALL">All Statuses</option>
            {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
          {(filterTrack!=='ALL'||filterStatus!=='ALL'||search) && (
            <button className="btn btn-ghost btn-sm" onClick={()=>{setFilterTrack('ALL');setFilterStatus('ALL');setSearch('');}}>Clear</button>
          )}
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:60}}><Loader2 size={28} className="animate-spin" style={{color:'var(--cobalt)'}}/></div>
        ) : filtered.length===0 ? (
          <div className="empty-state">
            <BookOpen size={36}/>
            <h3>No books found</h3>
            <p>{books.length===0?'Set up your catalog first':'Try adjusting filters'}</p>
            {books.length===0&&<button className="btn btn-primary btn-sm" onClick={()=>navigate('/book-setup')}><Zap size={13}/> Book Setup</button>}
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',gap:14}}>
            {filtered.map(book=><BookCard key={book.id} book={book} onClick={()=>navigate(`/books/${book.id}`)}/>)}
          </div>
        )}
      </div>
    </div>
  );
}

function BookCard({ book, onClick }) {
  const track  = TRACK_META[book.certificationTrack]||{color:'#3B6FF5',bg:'rgba(59,111,245,0.1)'};
  const status = STATUS_CFG[book.status]||{label:book.status,badge:'badge-muted'};
  const progress = book.totalChapters?Math.round((book.completedChapters/book.totalChapters)*100):0;
  const active = ['GENERATING','QA_PENDING','QA_IN_PROGRESS'].includes(book.status);
  return (
    <div onClick={onClick}
      style={{background:'var(--surface)',border:`1px solid ${track.color}25`,borderRadius:'var(--r-lg)',padding:'16px 18px',cursor:'pointer',transition:'all 0.2s',position:'relative',overflow:'hidden'}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=track.color;e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 8px 24px ${track.color}20`;}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=`${track.color}25`;e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg, ${track.color}, transparent)`}}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:5}}>
            <span style={{fontSize:'0.63rem',fontWeight:700,padding:'2px 7px',borderRadius:4,background:track.bg,color:track.color,letterSpacing:'0.04em'}}>{book.certificationTrack}</span>
            <span style={{fontSize:'0.6rem',color:'var(--ink-400)'}}>Book {book.trackNumber}</span>
          </div>
          <div style={{fontSize:'0.85rem',fontWeight:600,color:'var(--ink-900)',lineHeight:1.3}}>{book.title}</div>
          {book.subtitle&&<div style={{fontSize:'0.7rem',color:'var(--ink-500)',marginTop:2}}>{book.subtitle}</div>}
        </div>
        <ArrowRight size={14} style={{color:'var(--ink-300)',marginTop:4,flexShrink:0}}/>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
        <span className={`badge ${status.badge}`} style={{fontSize:'0.61rem'}}>
          {active&&<span className="animate-pulse" style={{width:5,height:5,background:'currentColor',borderRadius:'50%',display:'inline-block',marginRight:4}}/>}
          {status.label}
        </span>
        {book.overallQaScore!=null&&(
          <span style={{fontSize:'0.67rem',color:'var(--ink-500)',fontFamily:'var(--font-mono)'}}>
            QA <span style={{color:book.overallQaScore>=80?'var(--sage)':book.overallQaScore>=70?'var(--amber)':'var(--rose)'}}>{Math.round(book.overallQaScore)}%</span>
          </span>
        )}
      </div>
      <div>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:'0.63rem',color:'var(--ink-500)'}}><CheckCircle2 size={9} style={{display:'inline',marginRight:3}}/>{book.completedChapters||0}/{book.totalChapters||'?'} chapters</span>
          <span style={{fontSize:'0.63rem',fontFamily:'var(--font-mono)',color:'var(--ink-400)'}}>{progress}%</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{width:`${progress}%`,background:track.color}}/></div>
      </div>
      <div style={{display:'flex',gap:12,marginTop:10}}>
        {book.githubBranch&&<span style={{display:'flex',alignItems:'center',gap:3,fontSize:'0.6rem',color:'var(--ink-400)'}}><GitBranch size={9}/>{book.githubBranch}</span>}
        {book.createdAt&&<span style={{display:'flex',alignItems:'center',gap:3,fontSize:'0.6rem',color:'var(--ink-400)'}}><Clock size={9}/>{new Date(book.createdAt).toLocaleDateString()}</span>}
      </div>
    </div>
  );
}
