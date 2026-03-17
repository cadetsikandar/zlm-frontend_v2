import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, BookOpen, PlusCircle, Settings2, FileText,
  ShieldCheck, MessageSquare, Users, LogOut, Zap, Globe,
  Package, Bell, TrendingUp, ChevronRight, Palette, Activity
} from 'lucide-react';
import api from '../../api';

const NAV_SECTIONS = [
  {
    label: 'Workspace',
    items: [
      { to:'/dashboard',      icon:LayoutDashboard, label:'Dashboard'      },
      { to:'/books',          icon:BookOpen,        label:'All Books'      },
      { to:'/new-book',       icon:PlusCircle,      label:'New Book'       },
      { to:'/book-setup',     icon:Settings2,       label:'Book Setup'     },
      { to:'/chapters',       icon:FileText,        label:'Chapters'       },
      { to:'/qa',             icon:ShieldCheck,     label:'QA Reports'     },
      { to:'/bundle-tracker', icon:Package,         label:'Bundle Tracker' },
    ]
  },
  {
    label: 'Admin',
    adminOnly: true,
    items: [
      { to:'/prompts',        icon:MessageSquare,   label:'Prompts',        adminOnly: true },
      { to:'/country-exams',  icon:Globe,           label:'Country & Exams',adminOnly: true },
      { to:'/evidence-alerts',icon:Bell,            label:'Evidence Alerts',adminOnly: true },
      { to:'/analytics',      icon:TrendingUp,      label:'Analytics',      adminOnly: true },
      { to:'/design',         icon:Palette,         label:'Design Studio',  adminOnly: true },
      { to:'/system-status',  icon:Activity,        label:'System Status',  adminOnly: true },
      { to:'/users',          icon:Users,           label:'Users',          adminOnly: true },
    ]
  }
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);

  const isAdmin = user?.role === 'ADMIN';
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const roleMeta = {
    ADMIN:           { label:'Admin',           color:'#FF7B8E' },
    CONTENT_MANAGER: { label:'Content Manager', color:'#7FA8FF' },
    QA_REVIEWER:     { label:'QA Reviewer',     color:'#F5C060' },
    DESIGNER:        { label:'Designer',        color:'#52D68A' },
  }[user?.role] || { label:'User', color:'#8892AA' };

  useEffect(() => {
    api.get('/health').then(r => setHealth(r.data)).catch(() => setHealth(null));
  }, []); // eslint-disable-line

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={14} color="#fff" strokeWidth={2.5}/>
        </div>
        <div>
          <div className="sidebar-logo-title">ZLM</div>
          <div className="sidebar-logo-sub">Textbook Engine</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map(section => {
          const visibleItems = section.items.filter(item => !item.adminOnly || isAdmin);
          if (!visibleItems.length) return null;
          return (
            <div key={section.label}>
              <div className="sidebar-section-label" style={{ marginTop:section.label!=='Workspace'?12:0 }}>
                {section.label}
              </div>
              {visibleItems.map(item => {
                const NavIcon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  >
                    <NavIcon size={14} strokeWidth={1.8}/>
                    <span style={{ flex:1 }}>{item.label}</span>
                    <ChevronRight size={10} style={{ opacity:0.3 }}/>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* System health */}
      <div className="sidebar-status">
        <div style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-300)', marginBottom:7 }}>
          System
        </div>
        <StatusRow label="API"      status={health ? 'live'  : 'off'}   value={health ? 'Online'     : 'Offline'}   />
        <StatusRow label="OpenAI"   status="ok"                          value="Active"                               />
        <StatusRow label="S3"       status="local"                       value="Local mode"                           />
        <StatusRow label="GitHub"   status="warn"                        value="Dev"                                  />
        <StatusRow label="Redis"    status={health ? 'ok' : 'off'}      value={health ? 'Connected' : 'Unknown'}    />
      </div>

      {/* User footer */}
      <div className="sidebar-user" onClick={handleLogout} title="Click to sign out">
        <div className="sidebar-avatar">{initials}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:'0.78rem', fontWeight:600, color:'var(--ink-900)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {user?.name || 'User'}
          </div>
          <div style={{ fontSize:'0.63rem', color:roleMeta.color, marginTop:1 }}>
            {roleMeta.label}
          </div>
        </div>
        <LogOut size={12} color="var(--ink-300)"/>
      </div>
    </aside>
  );
}

function StatusRow({ label, status, value }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <div className={`status-dot ${status}`}/>
        <span style={{ fontSize:'0.67rem', color:'var(--ink-500)' }}>{label}</span>
      </div>
      <span style={{ fontSize:'0.63rem', color:'var(--ink-300)', fontFamily:'var(--font-mono)' }}>{value}</span>
    </div>
  );
}
