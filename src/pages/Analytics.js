import React, { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import { getBooks } from '../api';
import { TrendingUp, DollarSign, Zap, FileText, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const GPT4_COST_PER_1K_INPUT  = 0.01;
const GPT4_COST_PER_1K_OUTPUT = 0.03;
const AVG_TOKENS_PER_CHAPTER  = 12000;
const AVG_TOKENS_OUTPUT        = 8000;

const TRACK_COLOR = { FNP:'#3B6FF5',AGPCNP:'#34C97A',PMHNP:'#9B6FFF',WHNP:'#F5A623',AGACNP:'#F5516A',PNP:'#00C4C4',ANP:'#7FA8FF' };

export default function Analytics() {
  const [books, setBooks]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [booksRes] = await Promise.allSettled([getBooks()]);
      if (booksRes.status === 'fulfilled') setBooks(booksRes.value.data?.books || booksRes.value.data || []);
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const totalChapters  = books.reduce((s,b) => s + (b.completedChapters || 0), 0);
  const totalBooks     = books.length;
  const estInputTokens  = totalChapters * AVG_TOKENS_PER_CHAPTER;
  const estOutputTokens = totalChapters * AVG_TOKENS_OUTPUT;
  const estCost         = ((estInputTokens / 1000) * GPT4_COST_PER_1K_INPUT) + ((estOutputTokens / 1000) * GPT4_COST_PER_1K_OUTPUT);
  const totalTokens     = estInputTokens + estOutputTokens;

  // Per-track chapter data
  const trackData = Object.entries(TRACK_COLOR).map(([track, color]) => {
    const tb = books.filter(b => b.certificationTrack === track);
    const ch = tb.reduce((s,b) => s+(b.completedChapters||0),0);
    return { name:track, chapters:ch, books:tb.length, color };
  });

  // Status distribution for pie
  const statusCounts = {};
  books.forEach(b => { statusCounts[b.status] = (statusCounts[b.status]||0)+1; });
  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.replace(/_/g,' '),
    value: count,
    fill: { DRAFT:'#4A5068', GENERATING:'#F5A623', QA_PENDING:'#9B6FFF', QA_PASSED:'#34C97A',
            DESIGN_READY:'#3B6FF5', KDP_READY:'#00C4C4', PUBLISHED:'#34C97A' }[status] || '#4A5068',
  }));

  // Monthly estimated spend (mock progression)
  const monthlyData = [
    { month:'Nov', spend:0 },
    { month:'Dec', spend:12 },
    { month:'Jan', spend:48 },
    { month:'Feb', spend:86 },
    { month:'Mar', spend: Math.round(estCost) },
  ];

  const budget = 400;
  const budgetPct = Math.min(Math.round((estCost / budget) * 100), 100);

  return (
    <div>
      <TopBar
        title="Analytics"
        subtitle="Token usage, cost tracking, and production output metrics"
        actions={
          <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 size={13} className="animate-spin"/> : <RefreshCw size={13}/>} Refresh
          </button>
        }
      />
      <div className="page-content">

        {/* Cost estimation notice */}
        <div style={{ display:'flex', gap:10, padding:'10px 14px', background:'rgba(59,111,245,0.05)', border:'1px solid rgba(59,111,245,0.12)', borderRadius:'var(--r-md)', marginBottom:18 }}>
          <AlertCircle size={13} style={{ color:'var(--cobalt)', flexShrink:0, marginTop:1 }}/>
          <span style={{ fontSize:'0.72rem', color:'var(--ink-500)' }}>
            Cost estimates based on GPT-4 Turbo pricing ($0.01/1K input · $0.03/1K output). Actual usage may vary. Set up AWS CloudWatch for real token tracking.
          </span>
        </div>

        {/* KPI cards */}
        <div className="stat-grid mb-6">
          <StatCard accent="blue"   Icon={FileText}    color="var(--cobalt)"  label="Chapters Generated" value={totalChapters.toLocaleString()}  sub="all books combined"/>
          <StatCard accent="violet" Icon={Zap}         color="var(--violet)"  label="Est. Total Tokens"  value={`${(totalTokens/1000000).toFixed(1)}M`} sub="input + output"/>
          <StatCard accent="amber"  Icon={DollarSign}  color="var(--amber)"   label="Est. Total Spend"   value={`$${estCost.toFixed(0)}`}           sub="GPT-4 Turbo pricing"/>
          <StatCard accent="green"  Icon={TrendingUp}  color="var(--sage)"    label="Cost Per Chapter"   value={totalChapters ? `$${(estCost/totalChapters).toFixed(2)}` : '—'} sub="avg across all tracks"/>
        </div>

        {/* Budget gauge + monthly chart */}
        <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:16, marginBottom:16 }}>
          <div className="card animate-fade">
            <div className="card-pad" style={{ paddingBottom:10 }}>
              <h3 style={{ fontSize:'0.88rem', marginBottom:2 }}>Monthly Budget</h3>
              <p className="text-xs text-muted">${budget} budget · ${Math.round(estCost)} used</p>
            </div>
            <div className="divider"/>
            <div style={{ padding:'16px 20px' }}>
              <div style={{ position:'relative', marginBottom:14 }}>
                <div style={{ height:16, background:'var(--surface-3)', borderRadius:8, overflow:'hidden' }}>
                  <div style={{
                    height:'100%', width:`${budgetPct}%`,
                    background: budgetPct > 80 ? 'var(--rose)' : budgetPct > 60 ? 'var(--amber)' : 'var(--sage)',
                    borderRadius:8, transition:'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                  }}/>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:5 }}>
                  <span style={{ fontSize:'0.65rem', color:'var(--ink-400)' }}>$0</span>
                  <span style={{ fontSize:'0.72rem', fontFamily:'var(--font-mono)', fontWeight:700, color: budgetPct>80?'var(--rose)':budgetPct>60?'var(--amber)':'var(--sage)' }}>
                    {budgetPct}%
                  </span>
                  <span style={{ fontSize:'0.65rem', color:'var(--ink-400)' }}>${budget}</span>
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <CostRow label="Input tokens"  value={`${(estInputTokens/1000000).toFixed(1)}M`} cost={`$${((estInputTokens/1000)*GPT4_COST_PER_1K_INPUT).toFixed(0)}`} color="var(--cobalt)"/>
                <CostRow label="Output tokens" value={`${(estOutputTokens/1000000).toFixed(1)}M`} cost={`$${((estOutputTokens/1000)*GPT4_COST_PER_1K_OUTPUT).toFixed(0)}`} color="var(--violet)"/>
                <div style={{ borderTop:'1px solid var(--border)', paddingTop:8, display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:'0.72rem', fontWeight:600, color:'var(--ink-700)' }}>Total</span>
                  <span style={{ fontSize:'0.78rem', fontWeight:700, fontFamily:'var(--font-mono)', color:'var(--amber)' }}>${estCost.toFixed(0)}</span>
                </div>
                <div style={{ fontSize:'0.65rem', color:'var(--ink-400)', lineHeight:1.5 }}>
                  Projected to completion (28 books, ~18ch each): <strong style={{ color:'var(--ink-600)' }}>${Math.round((28*18*AVG_TOKENS_PER_CHAPTER/1000*GPT4_COST_PER_1K_INPUT)+(28*18*AVG_TOKENS_OUTPUT/1000*GPT4_COST_PER_1K_OUTPUT))}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="card animate-fade">
            <div className="card-pad" style={{ paddingBottom:8 }}>
              <h3 style={{ fontSize:'0.88rem', marginBottom:2 }}>Monthly Spend Trend</h3>
              <p className="text-xs text-muted">Estimated cumulative spend over time</p>
            </div>
            <div style={{ padding:'4px 8px 16px' }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyData} barCategoryGap="35%">
                  <XAxis dataKey="month" tick={{ fontSize:10, fill:'#8892AA' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:10, fill:'#8892AA' }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`}/>
                  <Tooltip contentStyle={{ background:'#161B2E', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, fontSize:12 }} cursor={{ fill:'rgba(255,255,255,0.04)' }} formatter={v=>[`$${v}`,'Spend']}/>
                  <Bar dataKey="spend" radius={[4,4,0,0]} fill="var(--cobalt)" fillOpacity={0.8}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Per-track + status breakdown */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:16 }}>
          <div className="card animate-fade">
            <div className="card-pad" style={{ paddingBottom:8 }}>
              <h3 style={{ fontSize:'0.88rem', marginBottom:2 }}>Output by Track</h3>
              <p className="text-xs text-muted">Chapters generated per certification track</p>
            </div>
            <div style={{ padding:'4px 8px 16px' }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trackData} barCategoryGap="30%">
                  <XAxis dataKey="name" tick={{ fontSize:10, fill:'#8892AA' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:10, fill:'#8892AA' }} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{ background:'#161B2E', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, fontSize:12 }} cursor={{ fill:'rgba(255,255,255,0.04)' }}/>
                  <Bar dataKey="chapters" radius={[4,4,0,0]}>
                    {trackData.map((e,i) => <Cell key={i} fill={e.color} fillOpacity={0.85}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card animate-fade">
            <div className="card-pad" style={{ paddingBottom:8 }}>
              <h3 style={{ fontSize:'0.88rem', marginBottom:2 }}>Book Status Distribution</h3>
              <p className="text-xs text-muted">{totalBooks} books total</p>
            </div>
            <div style={{ padding:'4px 8px 16px' }}>
              {loading ? <div style={{ padding:40, textAlign:'center' }}><Loader2 size={20} className="animate-spin" style={{ color:'var(--cobalt)' }}/></div>
              : pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.85}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ background:'#161B2E', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, fontSize:11 }}/>
                    <Legend iconSize={8} wrapperStyle={{ fontSize:'0.68rem' }}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ padding:40, textAlign:'center', color:'var(--ink-400)', fontSize:'0.78rem' }}>No data</div>
              )}
            </div>
          </div>
        </div>

        {/* Per-track detail table */}
        <div className="card mt-4 animate-fade">
          <div className="card-pad" style={{ paddingBottom:8 }}>
            <h3 style={{ fontSize:'0.88rem' }}>Per-Track Cost Breakdown</h3>
          </div>
          <div className="divider"/>
          <table className="data-table">
            <thead><tr><th>Track</th><th>Books</th><th>Chapters</th><th>Est. Tokens</th><th>Est. Cost</th><th>Cost/Chapter</th></tr></thead>
            <tbody>
              {trackData.filter(t => t.chapters > 0).map(t => {
                const tokens = t.chapters * (AVG_TOKENS_PER_CHAPTER + AVG_TOKENS_OUTPUT);
                const cost = ((t.chapters * AVG_TOKENS_PER_CHAPTER / 1000) * GPT4_COST_PER_1K_INPUT) + ((t.chapters * AVG_TOKENS_OUTPUT / 1000) * GPT4_COST_PER_1K_OUTPUT);
                return (
                  <tr key={t.name}>
                    <td><span style={{ fontSize:'0.72rem', fontWeight:700, color:t.color, padding:'2px 7px', borderRadius:3, background:`${t.color}15` }}>{t.name}</span></td>
                    <td><span className="font-mono" style={{ fontSize:'0.72rem' }}>{t.books}</span></td>
                    <td><span className="font-mono" style={{ fontSize:'0.72rem' }}>{t.chapters}</span></td>
                    <td><span className="font-mono" style={{ fontSize:'0.72rem', color:'var(--ink-500)' }}>{(tokens/1000000).toFixed(1)}M</span></td>
                    <td><span className="font-mono" style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--amber)' }}>${cost.toFixed(0)}</span></td>
                    <td><span className="font-mono" style={{ fontSize:'0.72rem', color:'var(--ink-500)' }}>{t.chapters ? `$${(cost/t.chapters).toFixed(2)}` : '—'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ accent, Icon, color, label, value, sub }) {
  return (
    <div className={`stat-card accent-${accent}`}>
      <div className="stat-icon" style={{ background:`${color}18` }}><Icon size={16} style={{ color }}/></div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-delta">{sub}</div>}
    </div>
  );
}

function CostRow({ label, value, cost, color }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0 }}/>
        <span style={{ fontSize:'0.72rem', color:'var(--ink-500)' }}>{label}</span>
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <span className="font-mono" style={{ fontSize:'0.7rem', color:'var(--ink-400)' }}>{value}</span>
        <span className="font-mono" style={{ fontSize:'0.72rem', fontWeight:600, color:'var(--ink-700)' }}>{cost}</span>
      </div>
    </div>
  );
}
