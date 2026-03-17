import React, { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import { RefreshCw, Loader2, CheckCircle2, XCircle, AlertTriangle, Zap, Database, Github, Cloud, Brain } from 'lucide-react';
import api from '../api';

const SERVICES = [
  { key:'api',     label:'API Server',      icon:Zap,           desc:'Express backend health endpoint' },
  { key:'db',      label:'PostgreSQL DB',   icon:Database,      desc:'Prisma connection to PostgreSQL 16' },
  { key:'redis',   label:'Redis / Bull',    icon:Zap,           desc:'Queue processor for AI jobs' },
  { key:'openai',  label:'OpenAI GPT-4',    icon:Brain,         desc:'GPT-4 Turbo content generation' },
  { key:'github',  label:'GitHub',          icon:Github,        desc:'Version control & chapter commits' },
  { key:'s3',      label:'AWS S3',          icon:Cloud,         desc:'Manuscript file storage' },
  { key:'secrets', label:'AWS Secrets Mgr', icon:Cloud,         desc:'Secure API key storage' },
];

const STATUS = {
  online:    { label:'Online',      color:'var(--sage)',    bg:'rgba(52,201,122,0.1)',   Icon:CheckCircle2  },
  degraded:  { label:'Degraded',    color:'var(--amber)',   bg:'rgba(245,166,35,0.1)',   Icon:AlertTriangle },
  offline:   { label:'Offline',     color:'var(--rose)',    bg:'rgba(245,81,106,0.1)',   Icon:XCircle       },
  local:     { label:'Local Mode',  color:'var(--electric)',bg:'rgba(0,212,255,0.08)',   Icon:AlertTriangle },
  unknown:   { label:'Unknown',     color:'var(--ink-400)', bg:'var(--surface-2)',       Icon:AlertTriangle },
  checking:  { label:'Checking…',   color:'var(--cobalt)',  bg:'rgba(59,111,245,0.08)', Icon:Loader2       },
};

export default function SystemStatus() {
  const [statuses, setStatuses] = useState(
    Object.fromEntries(SERVICES.map(s => [s.key, 'checking']))
  );
  const [details, setDetails]  = useState({});
  const [lastChecked, setLastChecked] = useState(null);
  const [checking, setChecking] = useState(false);

  const runChecks = async () => {
    setChecking(true);
    setStatuses(Object.fromEntries(SERVICES.map(s => [s.key, 'checking'])));

    try {
      const res = await api.get('/health');
      const data = res.data;

      const newStatuses = {
        api:     'online',
        db:      data.db      === 'connected' ? 'online' : 'offline',
        redis:   data.redis   === 'connected' ? 'online' : data.redis === 'local' ? 'local' : 'offline',
        openai:  data.openai  === 'configured' ? 'online' : 'offline',
        github:  data.github  === 'configured' ? 'online' : data.github === 'dev' ? 'degraded' : 'offline',
        s3:      data.s3      === 'connected'  ? 'online' : 'local',
        secrets: data.secrets === 'configured' ? 'online' : 'local',
      };

      setStatuses(newStatuses);
      setDetails({
        api:     `v${data.version || '1.0.0'} · uptime ${formatUptime(data.uptime)}`,
        db:      data.dbVersion ? `PostgreSQL ${data.dbVersion}` : data.db,
        redis:   data.redisMode || data.redis,
        openai:  data.openaiModel || 'gpt-4-turbo',
        github:  data.githubRepo || data.github,
        s3:      data.s3Bucket  || data.s3,
        secrets: data.secretsRegion || data.secrets,
      });
    } catch {
      // API itself is down
      setStatuses(Object.fromEntries(SERVICES.map(s => [s.key, s.key === 'api' ? 'offline' : 'unknown'])));
    }

    setLastChecked(new Date());
    setChecking(false);
  };

  useEffect(() => { runChecks(); }, []); // eslint-disable-line

  const allOnline   = Object.values(statuses).every(s => s === 'online');
  const anyOffline  = Object.values(statuses).some(s => s === 'offline');
  const anyDegraded = Object.values(statuses).some(s => s === 'degraded' || s === 'local');

  const overallStatus = anyOffline ? 'offline' : anyDegraded ? 'degraded' : allOnline ? 'online' : 'checking';
  const overall = STATUS[overallStatus];
  const OverallIcon = overall.Icon;

  return (
    <div>
      <TopBar
        title="System Status"
        subtitle="API · Database · Redis · OpenAI · GitHub · AWS S3 · Secrets Manager"
        actions={
          <button className="btn btn-ghost btn-sm" onClick={runChecks} disabled={checking}>
            {checking ? <Loader2 size={13} className="animate-spin"/> : <RefreshCw size={13}/>}
            {checking ? 'Checking…' : 'Check Now'}
          </button>
        }
      />

      <div className="page-content stagger">
        {/* Overall banner */}
        <div className="animate-fade" style={{
          display:'flex', alignItems:'center', gap:14, padding:'16px 20px',
          background: overall.bg, border:`1px solid ${overall.color}30`,
          borderRadius:'var(--r-lg)', marginBottom:20,
        }}>
          <OverallIcon size={22} style={{ color:overall.color, flexShrink:0 }}
            className={overallStatus==='checking'?'animate-spin':undefined}/>
          <div>
            <div style={{ fontSize:'1rem', fontWeight:700, color:overall.color, fontFamily:'var(--font-display)' }}>
              {overallStatus === 'online'   ? 'All Systems Operational'   :
               overallStatus === 'degraded' ? 'Partial Degradation'       :
               overallStatus === 'offline'  ? 'System Issues Detected'    : 'Checking Systems…'}
            </div>
            {lastChecked && (
              <div style={{ fontSize:'0.72rem', color:'var(--ink-500)', marginTop:2 }}>
                Last checked: {lastChecked.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Service grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
          {SERVICES.map(svc => {
            const st = statuses[svc.key] || 'unknown';
            const cfg = STATUS[st] || STATUS.unknown;
            const SvcIcon = svc.icon;
            const StIcon  = cfg.Icon;
            const detail  = details[svc.key];
            const isChecking = st === 'checking';

            return (
              <div key={svc.key} className="card animate-fade" style={{ borderLeft:`3px solid ${cfg.color}` }}>
                <div className="card-pad">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:'var(--r-sm)', background:`${cfg.color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <SvcIcon size={16} style={{ color:cfg.color }}/>
                      </div>
                      <div>
                        <div style={{ fontSize:'0.87rem', fontWeight:600, color:'var(--ink-900)' }}>{svc.label}</div>
                        <div style={{ fontSize:'0.68rem', color:'var(--ink-500)', marginTop:1 }}>{svc.desc}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:'var(--r-pill)', background:cfg.bg }}>
                      <StIcon size={11} style={{ color:cfg.color }} className={isChecking?'animate-spin':undefined}/>
                      <span style={{ fontSize:'0.68rem', fontWeight:700, color:cfg.color }}>{cfg.label}</span>
                    </div>
                  </div>
                  {detail && (
                    <div style={{ fontSize:'0.7rem', fontFamily:'var(--font-mono)', color:'var(--ink-500)', padding:'6px 10px', background:'var(--surface-2)', borderRadius:'var(--r-sm)' }}>
                      {detail}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Config requirements */}
        <div className="card animate-fade mt-4">
          <div className="card-pad" style={{ paddingBottom:10 }}>
            <h3 style={{ fontSize:'0.88rem', marginBottom:2 }}>Required Environment Variables</h3>
            <p className="text-xs text-muted">Backend must have these set for full system operation</p>
          </div>
          <div className="divider"/>
          <table className="data-table">
            <thead>
              <tr><th>Variable</th><th>Purpose</th><th style={{width:120}}>Required for</th></tr>
            </thead>
            <tbody>
              {[
                ['DATABASE_URL',         'PostgreSQL connection string',          'Phase 1+'],
                ['REDIS_URL',            'Redis for Bull job queues',             'Phase 1+'],
                ['JWT_SECRET',           'Access token signing',                  'Auth'],
                ['JWT_REFRESH_SECRET',   'Refresh token signing',                 'Auth'],
                ['OPENAI_API_KEY',       'GPT-4 Turbo — store in AWS Secrets Mgr','Phase 1+'],
                ['AWS_S3_BUCKET_NAME',   'Manuscript file storage',               'Phase 1'],
                ['AWS_REGION',           'AWS region (us-east-1)',                'Phase 1'],
                ['AWS_ACCESS_KEY_ID',    'IAM credentials',                       'Phase 1'],
                ['AWS_SECRET_ACCESS_KEY','IAM credentials',                       'Phase 1'],
                ['GITHUB_TOKEN',         'Per-book branch commits',               'Phase 1'],
                ['GITHUB_REPO_OWNER',    'GitHub org/user',                       'Phase 1'],
                ['GITHUB_REPO_NAME',     'Repository name',                       'Phase 1'],
                ['CANVA_CLIENT_ID',      'Canva Connect API OAuth',               'Phase 6'],
                ['CANVA_CLIENT_SECRET',  'Canva Connect API OAuth',               'Phase 6'],
                ['AIRTABLE_API_KEY',     'Dashboard tracking',                    'Phase 5'],
                ['AIRTABLE_BASE_ID',     'Target Airtable base',                  'Phase 5'],
              ].map(([key, desc, phase]) => (
                <tr key={key}>
                  <td><code style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'var(--cobalt)' }}>{key}</code></td>
                  <td><span style={{ fontSize:'0.78rem', color:'var(--ink-700)' }}>{desc}</span></td>
                  <td><span style={{ fontSize:'0.68rem', color:'var(--ink-500)' }}>{phase}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatUptime(seconds) {
  if (!seconds) return 'unknown';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
