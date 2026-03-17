import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import { createBook } from '../api';
import {
  ArrowLeft, Check, Loader2, Zap,
  BookOpen, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Provider matrix (Bible §2.1) ────────────────────────────────────────────
const PROVIDERS = [
  { category: 'Advanced Nursing', items: [
    { value:'FNP',    label:'Family NP',                      credential:'FNP'     },
    { value:'AGPCNP', label:'Adult-Gero Primary Care NP',     credential:'AGPCNP'  },
    { value:'PMHNP',  label:'Psychiatric Mental Health NP',   credential:'PMHNP'   },
    { value:'PNP',    label:'Pediatric NP',                   credential:'PNP'     },
    { value:'WHNP',   label:"Women's Health NP",              credential:'WHNP'    },
    { value:'NNP',    label:'Neonatal NP',                    credential:'NNP'     },
    { value:'AGACNP', label:'Adult-Gero Acute Care NP',       credential:'AGACNP'  },
    { value:'CRNA',   label:'Certified Nurse Anesthetist',    credential:'CRNA'    },
    { value:'CNM',    label:'Certified Nurse Midwife',        credential:'CNM'     },
    { value:'ANP',    label:'Adult NP',                       credential:'ANP'     },
  ]},
  { category: 'Nursing', items: [
    { value:'RN',     label:'Registered Nurse',               credential:'RN'      },
    { value:'LPN',    label:'Practical/Vocational Nurse',     credential:'LPN/LVN' },
  ]},
  { category: 'Medicine', items: [
    { value:'MD',     label:'Doctor of Medicine',             credential:'MD'      },
    { value:'DO',     label:'Doctor of Osteopathic Medicine', credential:'DO'      },
  ]},
  { category: 'Physician Assistant', items: [
    { value:'PA',     label:'Physician Assistant',            credential:'PA-C'    },
  ]},
  { category: 'Pharmacy & Dentistry', items: [
    { value:'PHARMD', label:'Doctor of Pharmacy',             credential:'PharmD'  },
    { value:'DDS',    label:'Dentist',                        credential:'DDS/DMD' },
    { value:'RDH',    label:'Dental Hygienist',               credential:'RDH'     },
  ]},
  { category: 'Behavioral Health', items: [
    { value:'PHD',    label:'Psychologist',                   credential:'PhD/PsyD'},
    { value:'LCSW',   label:'Clinical Social Worker',         credential:'LCSW'    },
    { value:'LPC',    label:'Professional Counselor',         credential:'LPC'     },
    { value:'LMFT',   label:'Marriage & Family Therapist',    credential:'LMFT'    },
    { value:'BCBA',   label:'Behavior Analyst',               credential:'BCBA'    },
  ]},
  { category: 'Allied Health', items: [
    { value:'DPT',    label:'Physical Therapist',             credential:'DPT'     },
    { value:'OT',     label:'Occupational Therapist',         credential:'OT'      },
    { value:'SLP',    label:'Speech-Language Pathologist',    credential:'SLP'     },
    { value:'RD',     label:'Registered Dietitian',           credential:'RD'      },
    { value:'RRT',    label:'Respiratory Therapist',          credential:'RRT/CRT' },
    { value:'MLS',    label:'Medical Lab Scientist',          credential:'MLS/MLT' },
  ]},
  { category: 'Specialty Nursing', items: [
    { value:'CCRN',   label:'Critical Care RN',               credential:'CCRN'    },
    { value:'CEN',    label:'Emergency Nurse',                 credential:'CEN'     },
    { value:'OCN',    label:'Oncology Nurse',                  credential:'OCN'     },
  ]},
];

// ── Country / Exam matrix (Bible §2.2) ───────────────────────────────────────
const COUNTRIES = [
  { value:'USA',     label:'United States', flag:'🇺🇸' },
  { value:'CANADA',  label:'Canada',        flag:'🇨🇦' },
  { value:'UK',      label:'United Kingdom',flag:'🇬🇧' },
  { value:'HAITI',   label:'Haiti',         flag:'🇭🇹' },
  { value:'UAE',     label:'UAE',           flag:'🇦🇪' },
  { value:'SAUDI',   label:'Saudi Arabia',  flag:'🇸🇦' },
  { value:'EGYPT',   label:'Egypt',         flag:'🇪🇬' },
  { value:'JORDAN',  label:'Jordan',        flag:'🇯🇴' },
];

const EXAM_MAP = {
  'RN-USA':    { exam:'NCLEX-RN',           body:'NCSBN',  notes:'National standard' },
  'LPN-USA':   { exam:'NCLEX-PN',           body:'NCSBN',  notes:'Practical nursing' },
  'FNP-USA':   { exam:'ANCC / AANP',        body:'ANCC / AANP', notes:'Both accepted' },
  'AGPCNP-USA':{ exam:'ANCC / AANP',        body:'ANCC / AANP', notes:'Adult-gero PC' },
  'PMHNP-USA': { exam:'ANCC PMHNP-BC',      body:'ANCC',   notes:'Psychiatric specialty' },
  'PNP-USA':   { exam:'ANCC / PNCB',        body:'ANCC / PNCB', notes:'Pediatric' },
  'WHNP-USA':  { exam:'NCC WHNP-BC',        body:'NCC',    notes:"Women's health" },
  'NNP-USA':   { exam:'NCC NNP-BC',         body:'NCC',    notes:'Neonatal' },
  'AGACNP-USA':{ exam:'ANCC / AANP',        body:'ANCC',   notes:'Acute care' },
  'CRNA-USA':  { exam:'NCE',                body:'NBCRNA', notes:'Anesthesia' },
  'CNM-USA':   { exam:'AMCB',               body:'AMCB',   notes:'Midwifery' },
  'ANP-USA':   { exam:'ANCC ANP-BC',        body:'ANCC',   notes:'Adult NP' },
  'MD-USA':    { exam:'USMLE Steps 1–3',    body:'NBME / FSMB', notes:'3-step licensing exam' },
  'DO-USA':    { exam:'COMLEX-USA',         body:'NBOME',  notes:'Osteopathic' },
  'PA-USA':    { exam:'PANCE / PANRE',      body:'NCCPA',  notes:'Initial cert / recert' },
  'PHARMD-USA':{ exam:'NAPLEX + MPJE',      body:'NABP',   notes:'Two exams required' },
  'DDS-USA':   { exam:'INBDE',              body:'ADEX',   notes:'Dentistry' },
  'PHD-USA':   { exam:'EPPP',               body:'ASPPB',  notes:'Psychology' },
  'LCSW-USA':  { exam:'ASWB Clinical',      body:'ASWB',   notes:'Social work' },
  'LPC-USA':   { exam:'NCE / NCMHCE',       body:'NBCC',   notes:'Counseling' },
  'DPT-USA':   { exam:'NPTE',               body:'FSBPT',  notes:'Physical therapy' },
  'OT-USA':    { exam:'NBCOT',              body:'NBCOT',  notes:'Occupational therapy' },
  'SLP-USA':   { exam:'Praxis SLP',         body:'ETS',    notes:'Speech-language' },
  'CCRN-USA':  { exam:'CCRN',              body:'AACN',   notes:'Critical care cert' },
  'RN-CANADA': { exam:'NCLEX-RN',           body:'NCSBN',  notes:'Canada adopted NCLEX 2015' },
  'MD-CANADA': { exam:'MCCQE Part I & II',  body:'MCC',    notes:'Medical Council of Canada' },
  'PHARMD-CANADA':{ exam:'PEBC Qualifying', body:'PEBC',   notes:'Pharmacy Examining Board' },
  'PA-CANADA': { exam:'CASPA',              body:'CASPA',  notes:'Canadian cert pathway' },
  'RN-UK':     { exam:'NMC CBT + OSCE',     body:'NMC',    notes:'Nursing & Midwifery Council' },
  'MD-UK':     { exam:'PLAB 1 & 2',         body:'GMC',    notes:'For international medical grads' },
  'PHARMD-UK': { exam:'GPhC Registration',  body:'GPhC',   notes:'General Pharmaceutical Council' },
  'MD-HAITI':  { exam:'National Board Exam',body:'Haiti MoH',notes:'Faculté de Médecine Haiti' },
  'RN-HAITI':  { exam:'National Nursing Board',body:'Haiti MoH',notes:'Ministry of Health Haiti' },
  'MD-UAE':    { exam:'DHA / HAAD / MOH',   body:'Multiple',notes:'3 separate licensing bodies — UAE sub-selector required' },
  'RN-UAE':    { exam:'DHA / HAAD / MOH',   body:'Multiple',notes:'Choose licensing emirate' },
  'MD-SAUDI':  { exam:'SLE / SCFHS',        body:'SCFHS',  notes:'Saudi Licensing Exam' },
  'RN-SAUDI':  { exam:'SCFHS',              body:'SCFHS',  notes:'Saudi Council' },
  'MD-EGYPT':  { exam:'Egyptian Medical Syndicate',body:'EMS',notes:'National licensing' },
  'MD-JORDAN': { exam:'Jordan Medical Council',body:'JMC',  notes:'JMC licensing' },
  'RN-JORDAN': { exam:'Jordan Nursing Council',body:'JNC', notes:'Jordan nursing board' },
};

const TRACK_MAP = {
  FNP:'FNP', AGPCNP:'AGPCNP', PMHNP:'PMHNP', WHNP:'WHNP',
  AGACNP:'AGACNP', PNP:'PNP', ANP:'ANP',
  RN:'RN', LPN:'LPN', MD:'MD', DO:'DO', PA:'PA',
  PHARMD:'PHARMD', DDS:'DDS', PHD:'PHD', LCSW:'LCSW', LPC:'LPC',
  DPT:'DPT', OT:'OT', SLP:'SLP', CCRN:'CCRN', NNP:'NNP',
  CRNA:'CRNA', CNM:'CNM', RDH:'RDH', LMFT:'LMFT', BCBA:'BCBA',
  RRT:'RRT', MLS:'MLS', RD:'RD', CEN:'CEN', OCN:'OCN',
};

const STEPS = ['Provider', 'Country', 'Exam Confirm', 'Book Details'];
const STEP_COLORS = ['var(--cobalt)', 'var(--sage)', 'var(--violet)', 'var(--amber)'];

export default function NewBook() {
  const navigate = useNavigate();
  const [step, setStep]           = useState(0);
  const [provider, setProvider]   = useState(null);
  const [country, setCountry]     = useState(null);
  const [saving, setSaving]       = useState(false);
  const [bookDetails, setBookDetails] = useState({ title:'', subtitle:'', trackNumber: 1 });
  const [search, setSearch]       = useState('');
  const [overrideExam, setOverrideExam] = useState(null); // from /api/match-exam

  const examKey  = provider && country ? `${provider.value}-${country.value}` : null;
  const examInfo = overrideExam || (examKey ? EXAM_MAP[examKey] : null);

  const allProviders = PROVIDERS.flatMap(g => g.items);
  const filteredProviders = search
    ? allProviders.filter(p => p.label.toLowerCase().includes(search.toLowerCase()) || p.credential.toLowerCase().includes(search.toLowerCase()))
    : null;

  const handleCreate = async () => {
    if (!bookDetails.title.trim()) { toast.error('Book title required'); return; }
    setSaving(true);
    try {
      const trackVal = TRACK_MAP[provider.value] || provider.value;
      const res = await createBook({
        title: bookDetails.title.trim(),
        subtitle: bookDetails.subtitle.trim() || undefined,
        certificationTrack: trackVal,
        trackNumber: parseInt(bookDetails.trackNumber),
        country: country.value,
        boardExam: examInfo?.exam || '',
      });
      toast.success('Book created successfully!');
      const bookId = res.data?.book?.id || res.data?.id;
      if (bookId) navigate(`/books/${bookId}`);
      else navigate('/books');
    } catch (e) {
      toast.error(e.response?.data?.message || e.response?.data?.error || 'Failed to create book');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <TopBar
        title="New Book"
        subtitle="Select provider type, country, and confirm board exam — then generate"
        actions={
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/books')}>
            <ArrowLeft size={13}/> Back to Books
          </button>
        }
      />

      <div className="page-content">
        {/* Step indicator */}
        <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:28 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{
                  width:28, height:28, borderRadius:'50%',
                  background: i < step ? 'var(--sage)' : i === step ? STEP_COLORS[i] : 'var(--surface-2)',
                  border: `1.5px solid ${i < step ? 'var(--sage)' : i === step ? STEP_COLORS[i] : 'var(--border)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  transition:'all 0.2s',
                }}>
                  {i < step
                    ? <Check size={13} color="#fff"/>
                    : <span style={{ fontSize:'0.72rem', fontWeight:700, color: i===step?'#fff':'var(--ink-300)' }}>{i+1}</span>
                  }
                </div>
                <span style={{ fontSize:'0.75rem', fontWeight: i===step?600:400, color: i===step?'var(--ink-900)':i<step?'var(--sage)':'var(--ink-400)' }}>
                  {s}
                </span>
              </div>
              {i < STEPS.length-1 && (
                <div style={{ flex:1, height:1.5, background: i < step ? 'var(--sage)' : 'var(--border)', margin:'0 10px', minWidth:20, transition:'background 0.3s' }}/>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── Step 0: Provider ── */}
        {step === 0 && (
          <div className="animate-fade">
            <div className="card" style={{ marginBottom:16 }}>
              <div className="card-pad" style={{ paddingBottom:12 }}>
                <h3 style={{ fontSize:'1rem', marginBottom:4 }}>Select Healthcare Provider Type</h3>
                <p className="text-xs text-muted">Choose the profession this book will be written for</p>
                <input
                  className="input mt-2"
                  placeholder="Search provider types…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ maxWidth:300 }}
                />
              </div>
              <div className="divider"/>
              <div style={{ padding:'12px 18px', maxHeight:440, overflowY:'auto' }}>
                {(search ? [{ category:'Search Results', items: filteredProviders }] : PROVIDERS).map(group => (
                  group.items?.length > 0 && (
                    <div key={group.category} style={{ marginBottom:16 }}>
                      <div style={{ fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-300)', marginBottom:7 }}>
                        {group.category}
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:7 }}>
                        {group.items.map(p => (
                          <button key={p.value} onClick={() => { setProvider(p); setStep(1); setSearch(''); }}
                            style={{
                              padding:'10px 14px', textAlign:'left',
                              background: provider?.value===p.value ? 'rgba(59,111,245,0.1)' : 'var(--surface-2)',
                              border:`1px solid ${provider?.value===p.value?'var(--cobalt)':'var(--border)'}`,
                              borderRadius:'var(--r-md)', cursor:'pointer', transition:'all 0.15s',
                            }}
                            onMouseEnter={e=>{ if(provider?.value!==p.value){ e.currentTarget.style.borderColor='var(--border-strong)'; e.currentTarget.style.background='var(--surface-3)'; }}}
                            onMouseLeave={e=>{ if(provider?.value!==p.value){ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface-2)'; }}}
                          >
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                              <span style={{ fontSize:'0.82rem', fontWeight:500, color:'var(--ink-900)' }}>{p.label}</span>
                              <span style={{ fontSize:'0.62rem', fontFamily:'var(--font-mono)', color:'var(--cobalt)', background:'rgba(59,111,245,0.1)', padding:'1px 6px', borderRadius:3 }}>
                                {p.credential}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Country ── */}
        {step === 1 && (
          <div className="animate-fade">
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, padding:'12px 16px', background:'rgba(59,111,245,0.06)', border:'1px solid rgba(59,111,245,0.15)', borderRadius:'var(--r-md)' }}>
              <BookOpen size={14} style={{ color:'var(--cobalt)', flexShrink:0 }}/>
              <span style={{ fontSize:'0.8rem', color:'var(--ink-700)' }}>
                Provider: <strong style={{ color:'var(--cobalt)' }}>{provider?.label}</strong>
                <span style={{ marginLeft:8, fontSize:'0.72rem', fontFamily:'var(--font-mono)', color:'var(--cobalt)', background:'rgba(59,111,245,0.1)', padding:'1px 7px', borderRadius:3 }}>{provider?.credential}</span>
              </span>
              <button className="btn btn-ghost btn-xs" style={{ marginLeft:'auto' }} onClick={() => { setStep(0); setCountry(null); }}>Change</button>
            </div>
            <div className="card">
              <div className="card-pad" style={{ paddingBottom:12 }}>
                <h3 style={{ fontSize:'1rem', marginBottom:4 }}>Select Target Country</h3>
                <p className="text-xs text-muted">The board exam and content standards are determined by country</p>
              </div>
              <div className="divider"/>
              <div style={{ padding:'16px 18px', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:10 }}>
                {COUNTRIES.map(c => {
                  const eKey = `${provider?.value}-${c.value}`;
                  const hasMapping = !!EXAM_MAP[eKey];
                  return (
                    <button key={c.value} onClick={async () => {
                        if (!hasMapping) { toast.error(`No exam mapping yet for ${provider?.label} in ${c.label}`); return; }
                        setCountry(c);
                        // Try backend /api/match-exam (Phase 3 feature), fall back to local EXAM_MAP
                        try {
                          const apiModule = await import('../api');
                          const res = await apiModule.default.post('/api/match-exam', { providerType: provider.value, country: c.value });
                          if (res.data?.exam) setOverrideExam({ exam: res.data.exam, body: res.data.body || '', notes: res.data.notes || '' });
                        } catch { /* Phase 3 backend not ready — local EXAM_MAP used */ }
                        setStep(2);
                      }}
                      style={{
                        padding:'14px 16px', textAlign:'left',
                        background: country?.value===c.value ? 'rgba(52,201,122,0.08)' : hasMapping ? 'var(--surface-2)' : 'var(--surface)',
                        border:`1px solid ${country?.value===c.value?'var(--sage)':hasMapping?'var(--border)':'var(--border)'}`,
                        borderRadius:'var(--r-md)', cursor: hasMapping?'pointer':'not-allowed',
                        opacity: hasMapping ? 1 : 0.45, transition:'all 0.15s',
                      }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ fontSize:'1.4rem', lineHeight:1 }}>{c.flag}</span>
                        <div>
                          <div style={{ fontSize:'0.83rem', fontWeight:600, color:'var(--ink-900)' }}>{c.label}</div>
                          {hasMapping
                            ? <div style={{ fontSize:'0.67rem', color:'var(--sage)', marginTop:2 }}>{EXAM_MAP[eKey]?.exam}</div>
                            : <div style={{ fontSize:'0.67rem', color:'var(--ink-400)', marginTop:2 }}>Mapping coming soon</div>
                          }
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <button className="btn btn-ghost btn-sm mt-4" onClick={() => setStep(0)}><ArrowLeft size={13}/> Back</button>
          </div>
        )}

        {/* ── Step 2: Exam Confirmation ── */}
        {step === 2 && examInfo && (
          <div className="animate-fade">
            <div className="card" style={{ marginBottom:16, borderTop:'2px solid var(--violet)' }}>
              <div className="card-pad">
                <h3 style={{ fontSize:'1rem', marginBottom:4 }}>Confirm Board Exam</h3>
                <p className="text-xs text-muted mb-4">Review the automatically matched board exam before proceeding</p>

                {/* Receipt card */}
                <div style={{ background:'var(--surface-2)', border:'1px solid var(--border-strong)', borderRadius:'var(--r-lg)', padding:'20px 22px', marginBottom:16 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:18, marginBottom:16 }}>
                    <ReceiptItem label="Provider" value={provider?.label} sub={provider?.credential}/>
                    <ReceiptItem label="Country" value={`${country?.flag} ${country?.label}`}/>
                    <ReceiptItem label="Board Exam" value={examInfo.exam} highlight/>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
                    <ReceiptItem label="Certifying Body" value={examInfo.body}/>
                    <ReceiptItem label="Notes" value={examInfo.notes}/>
                  </div>
                </div>

                {/* UAE warning */}
                {country?.value === 'UAE' && (
                  <div style={{ display:'flex', gap:10, padding:'10px 14px', background:'rgba(245,166,35,0.08)', border:'1px solid rgba(245,166,35,0.2)', borderRadius:'var(--r-md)', marginBottom:16 }}>
                    <AlertCircle size={14} style={{ color:'var(--amber)', flexShrink:0, marginTop:1 }}/>
                    <span style={{ fontSize:'0.75rem', color:'var(--ink-700)', lineHeight:1.5 }}>
                      UAE has 3 separate licensing bodies: DHA (Dubai), HAAD (Abu Dhabi), MOH (Other Emirates). Make sure to note the specific authority in the book subtitle.
                    </span>
                  </div>
                )}

                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}><ArrowLeft size={13}/> Back</button>
                  <button className="btn btn-primary btn-md" onClick={() => { setStep(3); }}>
                    <Check size={14}/> Confirm — Proceed to Book Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Book Details ── */}
        {step === 3 && (
          <div className="animate-fade">
            {/* Summary banner */}
            <div style={{ display:'flex', gap:12, marginBottom:16, padding:'12px 16px', background:'rgba(52,201,122,0.06)', border:'1px solid rgba(52,201,122,0.15)', borderRadius:'var(--r-md)', flexWrap:'wrap' }}>
              <span style={{ fontSize:'0.78rem', color:'var(--ink-700)' }}>
                <strong style={{ color:'var(--sage)' }}>{provider?.label}</strong>
                {' · '}
                <strong style={{ color:'var(--sage)' }}>{country?.flag} {country?.label}</strong>
                {' · '}
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--violet)' }}>{examInfo?.exam}</span>
              </span>
            </div>

            <div className="card">
              <div className="card-pad" style={{ paddingBottom:12 }}>
                <h3 style={{ fontSize:'1rem', marginBottom:4 }}>Book Details</h3>
                <p className="text-xs text-muted">Enter the title and select book number within the series</p>
              </div>
              <div className="divider"/>
              <div style={{ padding:'18px 20px' }}>
                <div className="form-group">
                  <label className="input-label">Book Title *</label>
                  <input className="input" value={bookDetails.title}
                    onChange={e => setBookDetails(d => ({ ...d, title:e.target.value }))}
                    placeholder={`${provider?.label} Core Textbook Volume 1`}
                  />
                </div>
                <div className="form-group">
                  <label className="input-label">Subtitle (optional)</label>
                  <input className="input" value={bookDetails.subtitle}
                    onChange={e => setBookDetails(d => ({ ...d, subtitle:e.target.value }))}
                    placeholder="A Comprehensive Board Review"
                  />
                </div>
                <div className="form-group" style={{ maxWidth:200 }}>
                  <label className="input-label">Book # in Series (1–4)</label>
                  <select className="input select" value={bookDetails.trackNumber}
                    onChange={e => setBookDetails(d => ({ ...d, trackNumber:e.target.value }))}>
                    {[1,2,3,4].map(n => <option key={n} value={n}>Book {n} of 4</option>)}
                  </select>
                </div>

                <div style={{ display:'flex', gap:10, marginTop:8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)}><ArrowLeft size={13}/> Back</button>
                  <button className="btn btn-primary btn-md" onClick={handleCreate} disabled={saving || !bookDetails.title.trim()}>
                    {saving ? <Loader2 size={14} className="animate-spin"/> : <Zap size={14}/>}
                    Create Book & Start Generation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReceiptItem({ label, value, sub, highlight }) {
  return (
    <div>
      <div style={{ fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color:'var(--ink-400)', marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:'0.87rem', fontWeight:600, color: highlight ? 'var(--violet)' : 'var(--ink-900)', lineHeight:1.3 }}>{value}</div>
      {sub && <div style={{ fontSize:'0.7rem', color:'var(--ink-500)', marginTop:2 }}>{sub}</div>}
    </div>
  );
}
