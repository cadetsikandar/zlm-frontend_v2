import React, { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import { Globe, Search, ShieldCheck } from 'lucide-react';

const MAPPINGS = [
  { country:'USA', flag:'🇺🇸', provider:'RN',      credential:'RN',      exam:'NCLEX-RN',                body:'NCSBN',       notes:'National standard' },
  { country:'USA', flag:'🇺🇸', provider:'LPN',     credential:'LPN/LVN', exam:'NCLEX-PN',                body:'NCSBN',       notes:'Practical nursing' },
  { country:'USA', flag:'🇺🇸', provider:'FNP',     credential:'FNP',     exam:'ANCC / AANP',             body:'ANCC / AANP', notes:'Both accepted for certification' },
  { country:'USA', flag:'🇺🇸', provider:'AGPCNP',  credential:'AGPCNP',  exam:'ANCC / AANP',             body:'ANCC / AANP', notes:'Adult-gero primary care' },
  { country:'USA', flag:'🇺🇸', provider:'PMHNP',   credential:'PMHNP',   exam:'ANCC PMHNP-BC',           body:'ANCC',        notes:'Psychiatric specialty' },
  { country:'USA', flag:'🇺🇸', provider:'PNP',     credential:'PNP',     exam:'ANCC / PNCB',             body:'ANCC / PNCB', notes:'Pediatric NP' },
  { country:'USA', flag:'🇺🇸', provider:'WHNP',    credential:'WHNP',    exam:'NCC WHNP-BC',             body:'NCC',         notes:"Women's health" },
  { country:'USA', flag:'🇺🇸', provider:'NNP',     credential:'NNP',     exam:'NCC NNP-BC',              body:'NCC',         notes:'Neonatal NP' },
  { country:'USA', flag:'🇺🇸', provider:'AGACNP',  credential:'AGACNP',  exam:'ANCC / AANP',             body:'ANCC',        notes:'Acute care NP' },
  { country:'USA', flag:'🇺🇸', provider:'CRNA',    credential:'CRNA',    exam:'NCE',                     body:'NBCRNA',      notes:'Nurse anesthetist' },
  { country:'USA', flag:'🇺🇸', provider:'CNM',     credential:'CNM',     exam:'AMCB',                    body:'AMCB',        notes:'Nurse midwife' },
  { country:'USA', flag:'🇺🇸', provider:'ANP',     credential:'ANP',     exam:'ANCC ANP-BC',             body:'ANCC',        notes:'Adult NP' },
  { country:'USA', flag:'🇺🇸', provider:'MD',      credential:'MD',      exam:'USMLE Steps 1–3',         body:'NBME / FSMB', notes:'3-step licensing exam' },
  { country:'USA', flag:'🇺🇸', provider:'DO',      credential:'DO',      exam:'COMLEX-USA',              body:'NBOME',       notes:'Osteopathic medicine' },
  { country:'USA', flag:'🇺🇸', provider:'PA',      credential:'PA-C',    exam:'PANCE / PANRE',           body:'NCCPA',       notes:'Initial cert / recertification' },
  { country:'USA', flag:'🇺🇸', provider:'PharmD',  credential:'PharmD',  exam:'NAPLEX + MPJE',           body:'NABP',        notes:'Two exams required' },
  { country:'USA', flag:'🇺🇸', provider:'DDS',     credential:'DDS/DMD', exam:'INBDE',                   body:'ADEX',        notes:'Dental licensing' },
  { country:'USA', flag:'🇺🇸', provider:'PhD',     credential:'PhD/PsyD',exam:'EPPP',                    body:'ASPPB',       notes:'Psychology licensing' },
  { country:'USA', flag:'🇺🇸', provider:'LCSW',    credential:'LCSW',    exam:'ASWB Clinical',           body:'ASWB',        notes:'Social work' },
  { country:'USA', flag:'🇺🇸', provider:'LPC',     credential:'LPC',     exam:'NCE / NCMHCE',            body:'NBCC',        notes:'Professional counseling' },
  { country:'USA', flag:'🇺🇸', provider:'DPT',     credential:'DPT',     exam:'NPTE',                    body:'FSBPT',       notes:'Physical therapy' },
  { country:'USA', flag:'🇺🇸', provider:'OT',      credential:'OT',      exam:'NBCOT',                   body:'NBCOT',       notes:'Occupational therapy' },
  { country:'USA', flag:'🇺🇸', provider:'SLP',     credential:'SLP',     exam:'Praxis SLP',              body:'ETS',         notes:'Speech-language pathology' },
  { country:'USA', flag:'🇺🇸', provider:'CCRN',    credential:'CCRN',    exam:'CCRN',                    body:'AACN',        notes:'Critical care certification' },
  { country:'Canada', flag:'🇨🇦', provider:'RN',   credential:'RN',      exam:'NCLEX-RN',                body:'NCSBN',       notes:'Canada adopted NCLEX in 2015' },
  { country:'Canada', flag:'🇨🇦', provider:'MD',   credential:'MD',      exam:'MCCQE Part I & II',       body:'MCC',         notes:'Medical Council of Canada' },
  { country:'Canada', flag:'🇨🇦', provider:'PharmD',credential:'PharmD', exam:'PEBC Qualifying Exam',    body:'PEBC',        notes:'Pharmacy Examining Board of Canada' },
  { country:'Canada', flag:'🇨🇦', provider:'PA',   credential:'PA-C',    exam:'CASPA',                   body:'CASPA',       notes:'Canadian PA cert pathway' },
  { country:'UK',     flag:'🇬🇧', provider:'RN',   credential:'RN',      exam:'NMC CBT + OSCE',          body:'NMC',         notes:'Nursing & Midwifery Council' },
  { country:'UK',     flag:'🇬🇧', provider:'MD',   credential:'MD (IMG)',exam:'PLAB 1 & 2',              body:'GMC',         notes:'For international medical graduates' },
  { country:'UK',     flag:'🇬🇧', provider:'PharmD',credential:'PharmD', exam:'GPhC Registration Exam',  body:'GPhC',        notes:'General Pharmaceutical Council' },
  { country:'Haiti',  flag:'🇭🇹', provider:'MD',   credential:'MD',      exam:'National Board Exam',     body:'Haiti MoH',   notes:'Faculté de Médecine Haiti' },
  { country:'Haiti',  flag:'🇭🇹', provider:'RN',   credential:'RN',      exam:'National Nursing Board',  body:'Haiti MoH',   notes:'Ministry of Health Haiti' },
  { country:'UAE',    flag:'🇦🇪', provider:'MD',   credential:'MD',      exam:'DHA / HAAD / MOH',        body:'Multiple',    notes:'3 separate bodies: Dubai, Abu Dhabi, Other Emirates' },
  { country:'UAE',    flag:'🇦🇪', provider:'RN',   credential:'RN',      exam:'DHA / HAAD / MOH',        body:'Multiple',    notes:'Emirate-specific licensing required' },
  { country:'Saudi Arabia', flag:'🇸🇦', provider:'MD', credential:'MD',  exam:'SLE / SCFHS',             body:'SCFHS',       notes:'Saudi Licensing Exam' },
  { country:'Saudi Arabia', flag:'🇸🇦', provider:'RN', credential:'RN',  exam:'SCFHS',                   body:'SCFHS',       notes:'Saudi Council for Health Specialties' },
  { country:'Egypt',  flag:'🇪🇬', provider:'MD',   credential:'MD',      exam:'Egyptian Medical Syndicate', body:'EMS',      notes:'National licensing authority' },
  { country:'Jordan', flag:'🇯🇴', provider:'MD',   credential:'MD',      exam:'Jordan Medical Council',  body:'JMC',         notes:'JMC licensing exam' },
  { country:'Jordan', flag:'🇯🇴', provider:'RN',   credential:'RN',      exam:'Jordan Nursing Council',  body:'JNC',         notes:'Jordan nursing board' },
];

const COUNTRIES = ['All', 'USA', 'Canada', 'UK', 'Haiti', 'UAE', 'Saudi Arabia', 'Egypt', 'Jordan'];
const COUNTRY_COLOR = { USA:'#3B6FF5', Canada:'#F5516A', UK:'#34C97A', Haiti:'#F5A623', UAE:'#9B6FFF', 'Saudi Arabia':'#00C4C4', Egypt:'#7FA8FF', Jordan:'#FF7B8E' };

export default function CountryExams() {
  const [filterCountry, setFilterCountry] = useState('All');
  const [search, setSearch]               = useState('');

  const filtered = MAPPINGS.filter(m => {
    if (filterCountry !== 'All' && m.country !== filterCountry) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.provider.toLowerCase().includes(q) || m.exam.toLowerCase().includes(q) || m.country.toLowerCase().includes(q) || m.credential.toLowerCase().includes(q);
    }
    return true;
  });

  const countByCountry = {};
  MAPPINGS.forEach(m => { countByCountry[m.country] = (countByCountry[m.country] || 0) + 1; });

  return (
    <div>
      <TopBar
        title="Country & Exam Mapping"
        subtitle={`${MAPPINGS.length} provider-country combinations · ${Object.keys(countByCountry).length} countries`}
      />
      <div className="page-content">

        {/* Country cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:10, marginBottom:20 }}>
          {COUNTRIES.filter(c => c !== 'All').map(c => {
            const color = COUNTRY_COLOR[c] || '#3B6FF5';
            const flag = MAPPINGS.find(m => m.country === c)?.flag || '';
            return (
              <button key={c} onClick={() => setFilterCountry(filterCountry === c ? 'All' : c)}
                style={{
                  padding:'12px 14px', textAlign:'left',
                  background: filterCountry===c ? `${color}15` : 'var(--surface)',
                  border:`1px solid ${filterCountry===c ? color : 'var(--border)'}`,
                  borderRadius:'var(--r-lg)', cursor:'pointer', transition:'all 0.15s',
                }}>
                <div style={{ fontSize:'1.3rem', marginBottom:4 }}>{flag}</div>
                <div style={{ fontSize:'0.78rem', fontWeight:600, color: filterCountry===c ? color : 'var(--ink-900)' }}>{c}</div>
                <div style={{ fontSize:'0.65rem', color:'var(--ink-400)', marginTop:2 }}>{countByCountry[c] || 0} mappings</div>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:1, maxWidth:280 }}>
            <Search size={13} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--ink-400)', pointerEvents:'none' }}/>
            <input className="input" placeholder="Search provider, exam, country…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:32 }}/>
          </div>
          {(filterCountry !== 'All' || search) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setFilterCountry('All'); setSearch(''); }}>Clear</button>
          )}
        </div>

        <div className="card">
          <div style={{ padding:'10px 18px 8px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:'0.78rem', fontWeight:600 }}>Board Exam Mappings</span>
            <span style={{ fontSize:'0.72rem', color:'var(--ink-500)' }}>{filtered.length} results</span>
          </div>
          <div className="divider"/>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width:110 }}>Country</th>
                <th>Provider</th>
                <th style={{ width:90 }}>Credential</th>
                <th>Board Exam</th>
                <th style={{ width:140 }}>Certifying Body</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => {
                const color = COUNTRY_COLOR[m.country] || '#3B6FF5';
                return (
                  <tr key={i}>
                    <td>
                      <span style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <span style={{ fontSize:'1rem' }}>{m.flag}</span>
                        <span style={{ fontSize:'0.78rem', fontWeight:500 }}>{m.country}</span>
                      </span>
                    </td>
                    <td><span style={{ fontSize:'0.8rem', fontWeight:500 }}>{m.provider}</span></td>
                    <td>
                      <span className="font-mono" style={{ fontSize:'0.7rem', fontWeight:700, color, padding:'2px 7px', borderRadius:3, background:`${color}15` }}>
                        {m.credential}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--ink-900)' }}>{m.exam}</span>
                    </td>
                    <td>
                      <span style={{ fontSize:'0.72rem', color:'var(--ink-600)' }}>{m.body}</span>
                    </td>
                    <td>
                      <span style={{ fontSize:'0.7rem', color:'var(--ink-500)' }}>{m.notes}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state"><Globe size={28}/><h3>No mappings found</h3><p>Try a different search or filter</p></div>
          )}
        </div>

        <div style={{ marginTop:14, padding:'10px 14px', background:'rgba(59,111,245,0.05)', border:'1px solid rgba(59,111,245,0.12)', borderRadius:'var(--r-md)', fontSize:'0.72rem', color:'var(--ink-500)' }}>
          <ShieldCheck size={12} style={{ display:'inline', marginRight:6, color:'var(--cobalt)' }}/>
          Phase 3 will add the board_exam_mappings table to the database, enabling the POST /api/match-exam endpoint. Current data is for reference only.
        </div>
      </div>
    </div>
  );
}
