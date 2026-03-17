import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff, User, Shield, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { register } from '../api';

const ROLES = [
  { value: 'CONTENT_MANAGER', label: 'Content Manager', desc: 'Generate & manage manuscripts' },
  { value: 'QA_REVIEWER',     label: 'QA Reviewer',     desc: 'Audit & compliance review' },
  { value: 'DESIGNER',        label: 'Designer',        desc: 'Template & design pipeline' },
];

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'CONTENT_MANAGER',
  });

  const setField = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(form.password);

  return (
    <div style={styles.root}>
      <div style={styles.glow1} />
      <div style={styles.grid} />

      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}><Zap size={20} color="#fff" strokeWidth={2.5} /></div>
          <div>
            <div style={styles.logoTitle}>ZLM</div>
            <div style={styles.logoSub}>Textbook Engine</div>
          </div>
        </div>

        <div style={styles.card}>
          <h1 style={styles.heading}>Create your account</h1>
          <p style={styles.subheading}>Join the ZLM textbook automation system</p>

          <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            {/* Name */}
            <FieldGroup label="Full Name" focused={focused === 'name'}>
              <InputWithIcon
                Icon={User}
                type="text"
                value={form.name}
                onChange={setField('name')}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused('')}
                placeholder="Mrs. Shakira"
                required
                focused={focused === 'name'}
              />
            </FieldGroup>

            {/* Email */}
            <FieldGroup label="Email Address" focused={focused === 'email'}>
              <InputWithIcon
                Icon={Mail}
                type="email"
                value={form.email}
                onChange={setField('email')}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                placeholder="you@example.com"
                required
                focused={focused === 'email'}
              />
            </FieldGroup>

            {/* Role */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Shield size={11} style={{ marginRight: 4, display: 'inline' }} />
                Role
              </label>
              <div style={styles.roleGrid}>
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    style={{
                      ...styles.roleBtn,
                      borderColor: form.role === r.value ? 'var(--cobalt)' : 'var(--border)',
                      background: form.role === r.value ? 'rgba(59,111,245,0.08)' : 'var(--surface-2)',
                    }}
                  >
                    {form.role === r.value && (
                      <CheckCircle2 size={12} style={{ color: 'var(--cobalt)', position: 'absolute', top: 8, right: 8 }} />
                    )}
                    <div style={styles.roleName}>{r.label}</div>
                    <div style={styles.roleDesc}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <FieldGroup label="Password" focused={focused === 'pass'}>
              <div style={{ position: 'relative' }}>
                <InputWithIcon
                  Icon={Lock}
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={setField('password')}
                  onFocus={() => setFocused('pass')}
                  onBlur={() => setFocused('')}
                  placeholder="Min 8 characters"
                  required
                  focused={focused === 'pass'}
                  extraPadRight
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: 6 }}>
                  <div style={styles.strengthBar}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i < strength.level ? strength.color : 'var(--surface-3)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </FieldGroup>

            {/* Confirm */}
            <FieldGroup label="Confirm Password" focused={focused === 'confirm'}>
              <InputWithIcon
                Icon={Lock}
                type="password"
                value={form.confirmPassword}
                onChange={setField('confirmPassword')}
                onFocus={() => setFocused('confirm')}
                onBlur={() => setFocused('')}
                placeholder="Re-enter password"
                required
                focused={focused === 'confirm'}
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p style={{ fontSize: '0.7rem', color: 'var(--rose)', marginTop: 4 }}>Passwords don't match</p>
              )}
            </FieldGroup>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : (
                <><span>Create Account</span><ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <div style={styles.loginLink}>
            <span style={{ color: 'var(--ink-500)' }}>Already have an account? </span>
            <Link to="/login" style={{ color: 'var(--cobalt)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block',
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--ink-500)',
        marginBottom: 7,
      }}>{label}</label>
      {children}
    </div>
  );
}

function InputWithIcon({ Icon, focused, extraPadRight, ...props }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Icon size={15} style={{
        position: 'absolute', left: 13,
        color: focused ? 'var(--cobalt)' : 'var(--ink-300)',
        pointerEvents: 'none', transition: 'color 0.15s',
      }} />
      <input
        {...props}
        style={{
          width: '100%',
          background: 'var(--surface-2)',
          border: `1px solid ${focused ? 'var(--cobalt)' : 'var(--border)'}`,
          borderRadius: 'var(--r-sm)',
          color: 'var(--ink-900)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.87rem',
          padding: `10px 13px 10px 38px`,
          paddingRight: extraPadRight ? 42 : 13,
          outline: 'none',
          boxShadow: focused ? '0 0 0 3px var(--cobalt-glow)' : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      />
    </div>
  );
}

function getPasswordStrength(pass) {
  if (!pass) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pass.length >= 8)  score++;
  if (pass.length >= 12) score++;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
  if (/[0-9!@#$%^&*]/.test(pass)) score++;
  const map = [
    { level: 0, label: '', color: '' },
    { level: 1, label: 'Weak',   color: 'var(--rose)' },
    { level: 2, label: 'Fair',   color: 'var(--amber)' },
    { level: 3, label: 'Good',   color: 'var(--electric)' },
    { level: 4, label: 'Strong', color: 'var(--sage)' },
  ];
  return map[score] || map[1];
}

const styles = {
  root: {
    minHeight: '100vh',
    background: 'var(--bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '30px 20px',
    position: 'relative', overflow: 'hidden',
  },
  glow1: {
    position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
    width: 700, height: 500,
    background: 'radial-gradient(ellipse, rgba(59,111,245,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage: 'linear-gradient(rgba(59,111,245,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,111,245,0.03) 1px, transparent 1px)',
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
  },
  container: { width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 },
  logo: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, justifyContent: 'center' },
  logoIcon: {
    width: 40, height: 40,
    background: 'linear-gradient(135deg, var(--cobalt), var(--electric))',
    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: 'var(--shadow-cobalt)',
  },
  logoTitle: { fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink-900)' },
  logoSub: { fontSize: '0.62rem', color: 'var(--ink-500)', letterSpacing: '0.06em', textTransform: 'uppercase' },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--r-xl)',
    padding: '28px 26px',
    boxShadow: 'var(--shadow-lg)',
  },
  heading: { fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink-900)' },
  subheading: { fontSize: '0.78rem', color: 'var(--ink-500)', marginTop: 4 },
  formGroup: { marginBottom: 16 },
  label: {
    display: 'block', fontSize: '0.72rem', fontWeight: 600,
    letterSpacing: '0.06em', textTransform: 'uppercase',
    color: 'var(--ink-500)', marginBottom: 7,
  },
  roleGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  roleBtn: {
    padding: '10px 10px 10px 10px',
    border: '1px solid',
    borderRadius: 'var(--r-sm)',
    cursor: 'pointer',
    textAlign: 'left',
    position: 'relative',
    transition: 'all 0.15s',
  },
  roleName: { fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-700)', marginBottom: 2 },
  roleDesc: { fontSize: '0.62rem', color: 'var(--ink-500)', lineHeight: 1.3 },
  strengthBar: { display: 'flex', gap: 3, marginBottom: 3 },
  eyeBtn: {
    position: 'absolute', right: 12,
    background: 'none', border: 'none',
    color: 'var(--ink-300)', cursor: 'pointer', padding: 4,
    display: 'flex', alignItems: 'center',
  },
  submitBtn: {
    width: '100%', padding: '12px 20px',
    background: 'var(--cobalt)', color: '#fff',
    border: 'none', borderRadius: 'var(--r-sm)',
    fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 8, transition: 'all 0.15s',
    boxShadow: 'var(--shadow-cobalt)',
  },
  loginLink: { textAlign: 'center', fontSize: '0.8rem', marginTop: 18 },
};
