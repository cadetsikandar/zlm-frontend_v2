import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    const result = await login(email.trim(), password);
    if (result.success) { toast.success('Welcome back!'); navigate('/dashboard'); }
    else toast.error(result.error || 'Login failed');
  };

  const inputStyle = (field) => ({
    width:'100%', background:'var(--surface-2)',
    border:`1px solid ${focused===field?'var(--cobalt)':'var(--border)'}`,
    borderRadius:'var(--r-sm)', color:'var(--ink-900)',
    fontFamily:'var(--font-body)', fontSize:'0.87rem',
    padding:'10px 13px 10px 38px', outline:'none',
    boxShadow: focused===field?'0 0 0 3px var(--cobalt-glow)':'none',
    transition:'border-color 0.15s, box-shadow 0.15s',
  });

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative', overflow:'hidden' }}>
      {/* Background effects */}
      <div style={{ position:'absolute', top:'-20%', left:'50%', transform:'translateX(-50%)', width:700, height:500, background:'radial-gradient(ellipse, rgba(59,111,245,0.12) 0%, transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(59,111,245,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,111,245,0.04) 1px, transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32, justifyContent:'center' }}>
          <div style={{ width:44, height:44, background:'linear-gradient(135deg, var(--cobalt), var(--electric))', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-cobalt)' }}>
            <Zap size={20} color="#fff" strokeWidth={2.5}/>
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:800, color:'var(--ink-900)', letterSpacing:'0.04em' }}>ZLM</div>
            <div style={{ fontSize:'0.62rem', color:'var(--ink-500)', letterSpacing:'0.06em', textTransform:'uppercase' }}>Textbook Engine</div>
          </div>
        </div>

        {/* Card */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border-strong)', borderRadius:'var(--r-xl)', padding:'32px 28px', boxShadow:'var(--shadow-lg)' }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:700, color:'var(--ink-900)', marginBottom:6 }}>Sign in to your account</h1>
          <p style={{ fontSize:'0.8rem', color:'var(--ink-500)', marginBottom:26 }}>NP/DNP textbook automation system</p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:'0.72rem', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--ink-500)', marginBottom:8 }}>Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:focused==='email'?'var(--cobalt)':'var(--ink-300)', pointerEvents:'none', transition:'color 0.15s' }}/>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onFocus={()=>setFocused('email')} onBlur={()=>setFocused('')}
                  placeholder="admin@zlm-publishing.com" required style={inputStyle('email')}/>
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:'0.72rem', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--ink-500)', marginBottom:8 }}>Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:focused==='pass'?'var(--cobalt)':'var(--ink-300)', pointerEvents:'none', transition:'color 0.15s' }}/>
                <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} onFocus={()=>setFocused('pass')} onBlur={()=>setFocused('')}
                  placeholder="••••••••••" required style={{ ...inputStyle('pass'), paddingRight:42 }}/>
                <button type="button" onClick={()=>setShowPass(!showPass)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--ink-300)', cursor:'pointer', padding:4, display:'flex', alignItems:'center' }}>
                  {showPass?<EyeOff size={14}/>:<Eye size={14}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading||!email||!password}
              style={{ width:'100%', padding:'12px 20px', background:'var(--cobalt)', color:'#fff', border:'none', borderRadius:'var(--r-sm)', fontFamily:'var(--font-body)', fontSize:'0.9rem', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.15s', boxShadow:'var(--shadow-cobalt)', opacity:(loading||!email||!password)?0.6:1 }}>
              {loading ? <Loader2 size={16} className="animate-spin"/> : <><span>Sign In</span><ArrowRight size={15}/></>}
            </button>
          </form>

          <div style={{ textAlign:'center', fontSize:'0.8rem', marginTop:20 }}>
            <span style={{ color:'var(--ink-500)' }}>No account? </span>
            <Link to="/register" style={{ color:'var(--cobalt)', fontWeight:600, textDecoration:'none' }}>Create one</Link>
          </div>
        </div>

        {/* Demo hint */}
        <div style={{ marginTop:18, padding:'10px 14px', background:'rgba(59,111,245,0.05)', border:'1px solid rgba(59,111,245,0.12)', borderRadius:'var(--r-md)' }}>
          <span style={{ fontSize:'0.67rem', fontWeight:700, color:'var(--cobalt)', background:'rgba(59,111,245,0.15)', padding:'2px 7px', borderRadius:4, marginRight:8 }}>Admin</span>
          <span style={{ fontSize:'0.67rem', color:'var(--ink-500)', fontFamily:'var(--font-mono)' }}>admin@zlm-publishing.com · Admin@ZLM2026!</span>
        </div>
      </div>
    </div>
  );
}
