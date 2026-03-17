import React, { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import { getPrompts, updatePrompt } from '../api';
import {
  Loader2,
  RefreshCw,
  Edit2,
  Save,
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const PROMPT_TYPES = ['TOC','TERMINOLOGY','CHAPTER','PEARL','REFERENCE','QA'];
const TYPE_META = {
  TOC:         { color:'var(--cobalt)',  label:'Table of Contents', desc:'Generates the chapter structure for a book' },
  TERMINOLOGY: { color:'var(--sage)',    label:'Terminology Section', desc:'Creates 3,000+ word terminology glossary' },
  CHAPTER:     { color:'var(--violet)', label:'Chapter Generator', desc:'Main content generation — uses 3-part AI call' },
  PEARL:       { color:'var(--amber)',  label:'Exam-Relevant Pearls', desc:'High-yield ANCC board exam bullet points' },
  REFERENCE:   { color:'var(--teal)',   label:'References', desc:'APA 7th edition reference list builder' },
  QA:          { color:'var(--rose)',   label:'QA Audit Engine', desc:'Compliance checker prompt for ChatGPT #2' },
};

export default function Prompts() {
  const [prompts, setPrompts]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving]       = useState(false);
  const [selected, setSelected]   = useState('CHAPTER');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getPrompts();
      setPrompts(data?.prompts || data || []);
    } catch { toast.error('Failed to load prompts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const activePrompts = prompts.filter(p => p.isActive);
  const current = activePrompts.find(p => p.type === selected);

  const startEdit = () => {
    if (!current) return;
    setEditing(current.id);
    setEditContent(current.content);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditContent('');
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updatePrompt(editing, { content: editContent });
      toast.success('Prompt updated!');
      setEditing(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const wordCount = editContent ? editContent.split(/\s+/).filter(Boolean).length : (current?.content?.split(/\s+/).filter(Boolean).length || 0);

  return (
    <div>
      <TopBar
        title="Prompt Manager"
        subtitle="Master prompts for the 5-prompt AI pipeline"
        actions={
          <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
            {loading?<Loader2 size={13} className="animate-spin"/>:<RefreshCw size={13}/>} Refresh
          </button>
        }
      />
      <div className="page-content">
        {loading ? (
          <div style={{textAlign:'center',padding:60}}><Loader2 size={28} className="animate-spin" style={{color:'var(--cobalt)'}}/></div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:16,alignItems:'start'}}>
            {/* Sidebar: prompt types */}
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {PROMPT_TYPES.map(type => {
                const meta = TYPE_META[type];
                const found = activePrompts.find(p=>p.type===type);
                return (
                  <button key={type} onClick={()=>{ setSelected(type); setEditing(null); }}
                    style={{
                      display:'flex',flexDirection:'column',alignItems:'flex-start',gap:3,
                      padding:'10px 12px',background:selected===type?'var(--surface-2)':'var(--surface)',
                      border:`1px solid ${selected===type?meta.color+'50':'var(--border)'}`,
                      borderRadius:'var(--r-md)',cursor:'pointer',transition:'all 0.15s',textAlign:'left',
                      borderLeft: selected===type?`3px solid ${meta.color}`:`3px solid transparent`,
                    }}>
                    <div style={{display:'flex',alignItems:'center',gap:7,width:'100%'}}>
                      <span style={{fontSize:'0.7rem',fontWeight:700,color:meta.color,padding:'1px 6px',borderRadius:3,background:`${meta.color}15`}}>{type}</span>
                      <span style={{marginLeft:'auto',fontSize:'0.62rem',color:found?'var(--sage)':'var(--rose)'}}>
                        {found?<CheckCircle2 size={10}/>:<AlertCircle size={10}/>}
                      </span>
                    </div>
                    <span style={{fontSize:'0.7rem',color:selected===type?'var(--ink-700)':'var(--ink-500)',lineHeight:1.3}}>{meta.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main: prompt editor */}
            <div>
              {!current ? (
                <div className="card">
                  <div className="empty-state">
                    <AlertCircle size={28}/>
                    <h3>No active {selected} prompt</h3>
                    <p>This prompt type has not been seeded yet. Run the database seed to create it.</p>
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="card-pad" style={{paddingBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                      <div>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                          <span style={{fontFamily:'var(--font-display)',fontSize:'1rem',fontWeight:700}}>{TYPE_META[current.type]?.label||current.type}</span>
                          <span style={{fontSize:'0.63rem',fontWeight:700,color:TYPE_META[current.type]?.color||'var(--cobalt)',padding:'2px 7px',borderRadius:3,background:`${TYPE_META[current.type]?.color||'var(--cobalt)'}15`}}>
                            v{current.version||1}
                          </span>
                          {current.isActive && <span className="badge badge-green" style={{fontSize:'0.6rem'}}>Active</span>}
                        </div>
                        <p style={{fontSize:'0.73rem',color:'var(--ink-500)'}}>{TYPE_META[current.type]?.desc}</p>
                      </div>
                      <div style={{display:'flex',gap:8}}>
                        {editing ? (
                          <>
                            <button className="btn btn-ghost btn-sm" onClick={cancelEdit}><X size={13}/> Cancel</button>
                            <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>
                              {saving?<Loader2 size={13} className="animate-spin"/>:<Save size={13}/>} Save
                            </button>
                          </>
                        ) : (
                          <button className="btn btn-ghost btn-sm" onClick={startEdit}><Edit2 size={13}/> Edit</button>
                        )}
                      </div>
                    </div>

                    {/* Variable legend */}
                    <div style={{marginTop:12,display:'flex',gap:6,flexWrap:'wrap'}}>
                      {['{{certificationTrack}}','{{chapterNumber}}','{{chapterTitle}}','{{trackNumber}}','{{subheadings}}'].map(v=>(
                        <span key={v} style={{fontSize:'0.63rem',fontFamily:'var(--font-mono)',padding:'2px 7px',background:'rgba(59,111,245,0.08)',color:'var(--cobalt)',borderRadius:3,border:'1px solid rgba(59,111,245,0.15)'}}>
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="divider"/>
                  <div style={{padding:'14px 18px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                      <span style={{fontSize:'0.68rem',color:'var(--ink-400)'}}>
                        Last updated: {current.updatedAt?new Date(current.updatedAt).toLocaleString():current.createdAt?new Date(current.createdAt).toLocaleString():'—'}
                        &nbsp;·&nbsp;By: {current.createdBy||'system'}
                      </span>
                      <span style={{fontSize:'0.68rem',fontFamily:'var(--font-mono)',color:'var(--ink-500)'}}>{wordCount.toLocaleString()} words</span>
                    </div>
                    {editing ? (
                      <textarea
                        value={editContent}
                        onChange={e=>setEditContent(e.target.value)}
                        style={{
                          width:'100%',height:520,background:'var(--surface-2)',border:'1px solid var(--cobalt)',
                          borderRadius:'var(--r-sm)',color:'var(--ink-900)',fontFamily:'var(--font-mono)',
                          fontSize:'0.78rem',padding:'12px 14px',outline:'none',resize:'vertical',lineHeight:1.6,
                          boxShadow:'0 0 0 3px var(--cobalt-glow)',
                        }}
                      />
                    ) : (
                      <pre style={{
                        background:'var(--surface-2)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',
                        padding:'12px 14px',fontFamily:'var(--font-mono)',fontSize:'0.76rem',color:'var(--ink-700)',
                        whiteSpace:'pre-wrap',wordBreak:'break-word',lineHeight:1.6,maxHeight:520,overflow:'auto',
                        margin:0,
                      }}>
                        {current.content}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* All prompts mini-list */}
              {activePrompts.length > 0 && (
                <div className="card mt-4">
                  <div className="card-pad" style={{paddingBottom:8}}>
                    <h3 style={{fontSize:'0.85rem'}}>All Active Prompts</h3>
                    <p className="text-xs text-muted mt-1">{activePrompts.length} prompts loaded</p>
                  </div>
                  <div className="divider"/>
                  <table className="data-table">
                    <thead><tr><th>Type</th><th>Version</th><th>Words</th><th>Updated</th></tr></thead>
                    <tbody>
                      {activePrompts.map(p=>{
                        const wc = p.content?.split(/\s+/).filter(Boolean).length||0;
                        const meta = TYPE_META[p.type];
                        return (
                          <tr key={p.id} style={{cursor:'pointer'}} onClick={()=>setSelected(p.type)}>
                            <td><span style={{fontSize:'0.7rem',fontWeight:700,color:meta?.color||'var(--cobalt)',padding:'2px 7px',borderRadius:3,background:`${meta?.color||'var(--cobalt)'}15`}}>{p.type}</span></td>
                            <td><span className="font-mono" style={{fontSize:'0.72rem',color:'var(--ink-500)'}}>v{p.version||1}</span></td>
                            <td><span className="font-mono" style={{fontSize:'0.72rem',color:'var(--ink-500)'}}>{wc.toLocaleString()}</span></td>
                            <td><span style={{fontSize:'0.7rem',color:'var(--ink-400)'}}>{p.updatedAt?new Date(p.updatedAt).toLocaleDateString():'—'}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
