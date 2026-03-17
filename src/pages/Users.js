import React, { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import { getUsers, createUser, updateUser, deleteUser } from '../api';
import { UserPlus, Shield, Edit2, Trash2, Loader2, RefreshCw, X, Save, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const ROLES = ['ADMIN','CONTENT_MANAGER','QA_REVIEWER','DESIGNER'];
const ROLE_META = {
  ADMIN:           { badge:'badge-rose',   label:'Admin',           color:'#FF7B8E' },
  CONTENT_MANAGER: { badge:'badge-blue',   label:'Content Manager', color:'#7FA8FF' },
  QA_REVIEWER:     { badge:'badge-amber',  label:'QA Reviewer',     color:'#F5C060' },
  DESIGNER:        { badge:'badge-green',  label:'Designer',        color:'#52D68A' },
};

const PERMISSIONS = {
  ADMIN:           { generate:true,  qa:true,  prompts:true,  templates:true,  dashboard:true, users:true  },
  CONTENT_MANAGER: { generate:true,  qa:false, prompts:false, templates:false, dashboard:true, users:false },
  QA_REVIEWER:     { generate:false, qa:true,  prompts:false, templates:false, dashboard:true, users:false },
  DESIGNER:        { generate:false, qa:false, prompts:false, templates:true,  dashboard:true, users:false },
};
const PERM_KEYS = ['generate','qa','prompts','templates','dashboard','users'];

export default function Users() {
  const { user: me } = useAuthStore();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [editUser, setEditUser] = useState(null);

  const isAdmin = me?.role === 'ADMIN';

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getUsers();
      setUsers(data?.users || data || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleDelete = async (u) => {
    if (u.id===me?.id) { toast.error("You can't delete yourself"); return; }
    if (!window.confirm(`Remove ${u.name}?`)) return;
    try { await deleteUser(u.id); toast.success('User removed'); load(); }
    catch(e){ toast.error(e.response?.data?.message||'Failed'); }
  };

  return (
    <div>
      <TopBar
        title="User Management"
        subtitle="Role-based access control for the ZLM automation system"
        actions={
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
              {loading?<Loader2 size={13} className="animate-spin"/>:<RefreshCw size={13}/>} Refresh
            </button>
            {isAdmin && (
              <button className="btn btn-primary btn-sm" onClick={()=>setShowAdd(true)}>
                <UserPlus size={13}/> Invite User
              </button>
            )}
          </div>
        }
      />
      <div className="page-content stagger">
        {/* Users table */}
        <div className="card animate-fade mb-4">
          <div className="card-pad" style={{paddingBottom:8}}>
            <h3 style={{fontSize:'0.9rem'}}>Team Members</h3>
            <p className="text-xs text-muted mt-1">{users.length} users · Role-separated workflow</p>
          </div>
          <div className="divider" style={{margin:0}}/>
          {loading ? (
            <div style={{padding:40,textAlign:'center'}}><Loader2 size={22} className="animate-spin" style={{color:'var(--cobalt)'}}/></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th style={{width:90}}>Status</th><th style={{width:130}}>Last Login</th>{isAdmin&&<th style={{width:100}}>Actions</th>}</tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const rm = ROLE_META[u.role]||ROLE_META.CONTENT_MANAGER;
                  const isSelf = u.id===me?.id;
                  return (
                    <tr key={u.id} style={{opacity:u.isActive===false?0.5:1}}>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:9}}>
                          <div className="user-avatar">{u.name?.charAt(0)||'?'}</div>
                          <div>
                            <div style={{fontWeight:500,fontSize:'0.82rem'}}>{u.name}</div>
                            {isSelf&&<div style={{fontSize:'0.62rem',color:'var(--cobalt)'}}>● You</div>}
                          </div>
                        </div>
                      </td>
                      <td><span className="font-mono" style={{fontSize:'0.72rem',color:'var(--ink-700)'}}>{u.email}</span></td>
                      <td><span className={`badge ${rm.badge}`}><Shield size={9}/> {rm.label}</span></td>
                      <td><span className={`badge ${u.isActive!==false?'badge-green':'badge-muted'}`} style={{fontSize:'0.62rem'}}>{u.isActive!==false?'Active':'Inactive'}</span></td>
                      <td><span style={{fontSize:'0.7rem',color:'var(--ink-500)'}}>{u.lastLoginAt?new Date(u.lastLoginAt).toLocaleDateString():'Never'}</span></td>
                      {isAdmin&&(
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>setEditUser(u)} title="Edit"><Edit2 size={12}/></button>
                            {!isSelf&&<button className="btn btn-ghost btn-sm btn-icon" style={{color:'var(--rose)'}} onClick={()=>handleDelete(u)} title="Remove"><Trash2 size={12}/></button>}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Permissions matrix */}
        <div className="card animate-fade">
          <div className="card-pad" style={{paddingBottom:8}}>
            <h3 style={{fontSize:'0.9rem'}}>Role Permissions Matrix</h3>
            <p className="text-xs text-muted mt-1">What each role can access in the system</p>
          </div>
          <div className="divider" style={{margin:0}}/>
          <table className="data-table">
            <thead>
              <tr>
                <th>Role</th>
                {PERM_KEYS.map(p=><th key={p} style={{textAlign:'center',textTransform:'capitalize'}}>{p}</th>)}
              </tr>
            </thead>
            <tbody>
              {ROLES.map(role=>{
                const perms = PERMISSIONS[role];
                const meta  = ROLE_META[role];
                return (
                  <tr key={role}>
                    <td><span className={`badge ${meta.badge}`}><Shield size={9}/> {meta.label}</span></td>
                    {PERM_KEYS.map(p=>(
                      <td key={p} style={{textAlign:'center'}}>
                        {perms[p]
                          ? <CheckCircle2 size={14} style={{color:'var(--sage)'}}/>
                          : <X size={14} style={{color:'var(--border-strong)'}}/>
                        }
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd&&<AddUserModal onClose={()=>setShowAdd(false)} onCreated={()=>{setShowAdd(false);load();}}/>}
      {editUser&&<EditUserModal user={editUser} onClose={()=>setEditUser(null)} onSaved={()=>{setEditUser(null);load();}}/>}
    </div>
  );
}

function AddUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({name:'',email:'',password:'',role:'CONTENT_MANAGER'});
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const handleSubmit = async(e)=>{
    e.preventDefault();
    setSaving(true);
    try {
      await createUser(form);
      toast.success('User created!');
      onCreated();
    } catch(err){ toast.error(err.response?.data?.message||'Failed'); }
    finally { setSaving(false); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
          <div className="modal-title">Invite User</div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={14}/></button>
        </div>
        <p className="modal-subtitle">Create a new team account with role assignment</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="input-label">Full Name</label><input className="input" value={form.name} onChange={set('name')} required/></div>
          <div className="form-group"><label className="input-label">Email</label><input className="input" type="email" value={form.email} onChange={set('email')} required/></div>
          <div className="form-group"><label className="input-label">Temporary Password</label><input className="input" type="password" value={form.password} onChange={set('password')} required minLength={8}/></div>
          <div className="form-group">
            <label className="input-label">Role</label>
            <select className="input select" value={form.role} onChange={set('role')}>
              {ROLES.map(r=><option key={r} value={r}>{ROLE_META[r].label}</option>)}
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving?<Loader2 size={13} className="animate-spin"/>:<UserPlus size={13}/>} Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({name:user.name||'',role:user.role||'CONTENT_MANAGER',isActive:user.isActive!==false});
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const handleSubmit = async(e)=>{
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser(user.id, form);
      toast.success('User updated');
      onSaved();
    } catch(err){ toast.error(err.response?.data?.message||'Failed'); }
    finally { setSaving(false); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
          <div className="modal-title">Edit User</div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={14}/></button>
        </div>
        <p className="modal-subtitle">{user.email}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="input-label">Name</label><input className="input" value={form.name} onChange={set('name')} required/></div>
          <div className="form-group">
            <label className="input-label">Role</label>
            <select className="input select" value={form.role} onChange={set('role')}>
              {ROLES.map(r=><option key={r} value={r}>{ROLE_META[r].label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="input-label">Status</label>
            <select className="input select" value={form.isActive?'1':'0'} onChange={e=>setForm(f=>({...f,isActive:e.target.value==='1'}))}>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving?<Loader2 size={13} className="animate-spin"/>:<Save size={13}/>} Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
