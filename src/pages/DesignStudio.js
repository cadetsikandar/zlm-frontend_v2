import React from 'react';
import TopBar from '../components/layout/TopBar';
import { Palette, ExternalLink } from 'lucide-react';

export default function DesignStudio() {
  return (
    <div>
      <TopBar
        title="Design Studio"
        subtitle="Canva integration · Cover generation · Brand settings"
      />
      <div className="page-content">
        <div className="card" style={{ maxWidth:600 }}>
          <div className="card-pad">
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:'rgba(155,111,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Palette size={20} style={{ color:'var(--violet)' }}/>
              </div>
              <div>
                <h3 style={{ fontSize:'1rem', marginBottom:2 }}>Design Studio — Phase 6</h3>
                <p className="text-xs text-muted">Coming in Phase 6 — Branding Engine + KDP Pipeline</p>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
              {[
                { label:'Branding Agent',   desc:'AI auto-selects color palette, fonts, and cover style per provider type',         status:'Phase 6' },
                { label:'Canva Integration',desc:'Auto-populate chapter text into Canva templates via Connect API',                   status:'Phase 4 (Access needed)' },
                { label:'Cover Generator',  desc:'Generate professional book covers with provider-specific branding',                 status:'Phase 6' },
                { label:'SEO Agent',        desc:'Auto-generate KDP title, subtitle, BISAC codes, description, and keywords',        status:'Phase 6' },
                { label:'KDP Metadata',     desc:'Assemble complete KDP metadata package when book reaches PUBLISHED status',        status:'Phase 6' },
              ].map(item => (
                <div key={item.label} style={{ padding:'12px 14px', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                  <div>
                    <div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--ink-800)', marginBottom:3 }}>{item.label}</div>
                    <div style={{ fontSize:'0.73rem', color:'var(--ink-500)', lineHeight:1.4 }}>{item.desc}</div>
                  </div>
                  <span style={{ fontSize:'0.62rem', fontWeight:600, padding:'3px 8px', borderRadius:'var(--r-pill)', background:'rgba(155,111,255,0.12)', color:'var(--violet)', flexShrink:0 }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ padding:'12px 14px', background:'rgba(59,111,245,0.06)', border:'1px solid rgba(59,111,245,0.15)', borderRadius:'var(--r-md)', fontSize:'0.75rem', color:'var(--ink-600)', lineHeight:1.6 }}>
              <strong style={{ color:'var(--cobalt)' }}>Access required:</strong> Canva Developer API access must be enabled for automated template population.
              Visit the <a href="https://www.canva.com/developers/" target="_blank" rel="noreferrer" style={{ color:'var(--cobalt)', textDecoration:'none' }}>Canva Developer Portal <ExternalLink size={10} style={{ display:'inline' }}/></a> to set up API access, then provide the client ID and secret in your backend environment variables.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
