import React from 'react';

export default function TopBar({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="topbar">
      <div>
        {breadcrumb && (
          <div style={{ fontSize: '0.68rem', color: 'var(--ink-300)', marginBottom: 3, letterSpacing: '0.03em' }}>
            {breadcrumb}
          </div>
        )}
        <div className="topbar-title">{title}</div>
        {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="topbar-actions">{actions}</div>}
    </div>
  );
}
