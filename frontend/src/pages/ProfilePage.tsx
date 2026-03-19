import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { User, Mail, Building, Shield, Save, Key, Bell, Moon, Sun, Lock, CheckCircle, AlertTriangle } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', organization: user?.organization || '' })
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile')
  const [darkMode, setDarkMode] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [twoFA, setTwoFA] = useState(false)

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = () => {
    updateProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const TABS = [
    { id: 'profile',     label: 'Profile',     icon: User   },
    { id: 'security',    label: 'Security',    icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Bell   },
  ]

  return (
    <div className="page-wrapper">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '0.5rem' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #2abc4a, #39e75f)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(57,231,95,0.3)', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.4rem', color: 'black' }}>
            {user?.name?.charAt(0) || 'U'}
          </span>
        </div>
        <div>
          <h1 className="page-title">{user?.name}</h1>
          <div className="page-subtitle">{user?.email} · {user?.organization}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em', padding: '4px 12px', borderRadius: '6px', background: 'rgba(57,231,95,0.1)', color: '#39e75f', border: '1px solid rgba(57,231,95,0.2)', textTransform: 'uppercase' }}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px 8px 0 0',
            border: 'none', cursor: 'pointer',
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase',
            background: activeTab === tab.id ? 'rgba(57,231,95,0.1)' : 'transparent',
            color: activeTab === tab.id ? '#39e75f' : 'rgba(255,255,255,0.3)',
            borderBottom: activeTab === tab.id ? '2px solid #39e75f' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>
            <tab.icon style={{ width: 13, height: 13 }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="section-title">Personal Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ width: 14, height: 14, position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                  <input name="name" value={form.name} onChange={handle} className="input" style={{ paddingLeft: '36px' }} placeholder="Full name" />
                </div>
              </div>
              <div>
                <label className="label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ width: 14, height: 14, position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                  <input name="email" value={form.email} onChange={handle} className="input" style={{ paddingLeft: '36px' }} placeholder="email@org.com" />
                </div>
              </div>
              <div>
                <label className="label">Organization</label>
                <div style={{ position: 'relative' }}>
                  <Building style={{ width: 14, height: 14, position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
                  <input name="organization" value={form.organization} onChange={handle} className="input" style={{ paddingLeft: '36px' }} placeholder="Organization name" />
                </div>
              </div>
              <div>
                <label className="label">Role</label>
                <input value={user?.role || ''} disabled className="input" style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
            </div>
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={handleSave} className="btn-primary">
                <Save style={{ width: 14, height: 14 }} />
                {saved ? 'Saved ✓' : 'Save Changes'}
              </button>
              {saved && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle style={{ width: 14, height: 14, color: '#39e75f' }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#39e75f' }}>Profile updated</span>
                </div>
              )}
            </div>
          </div>

          {/* Account stats */}
          <div className="card">
            <div className="section-title">Account Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Member Since', value: 'March 2026' },
                { label: 'Last Login',   value: 'Today, 10:15' },
                { label: 'Active Sessions', value: '1 session' },
                { label: 'Role',         value: user?.role || 'viewer' },
                { label: 'Organization', value: user?.organization || '—' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)' }}>{item.label}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div className="card" style={{ borderColor: 'rgba(255,45,85,0.15)' }}>
            <div className="section-title" style={{ color: '#ff7a95' }}>Danger Zone</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, marginBottom: '4px' }}>
                These actions are irreversible. Please be certain before proceeding.
              </p>
              <button className="btn-danger" style={{ fontSize: '0.75rem', justifyContent: 'center', opacity: 0.7 }}>
                <AlertTriangle style={{ width: 13, height: 13 }} /> Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECURITY TAB ── */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card">
            <div className="section-title">Authentication</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

              {/* Change password */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Key style={{ width: 16, height: 16, color: '#39e75f' }} />
                  <div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Change Password</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>Last changed 30 days ago</div>
                  </div>
                </div>
                <button className="btn-secondary" style={{ fontSize: '0.72rem' }}>Update</button>
              </div>

              {/* 2FA */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', background: twoFA ? 'rgba(57,231,95,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${twoFA ? 'rgba(57,231,95,0.15)' : 'rgba(255,255,255,0.06)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Shield style={{ width: 16, height: 16, color: twoFA ? '#39e75f' : '#64748b' }} />
                  <div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Two-Factor Authentication</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: twoFA ? '#39e75f' : 'rgba(255,255,255,0.25)' }}>
                      {twoFA ? 'Enabled — your account is protected' : 'Not enabled — recommended for security'}
                    </div>
                  </div>
                </div>
                <button onClick={() => setTwoFA(v => !v)} className={twoFA ? 'btn-secondary' : 'btn-primary'} style={{ fontSize: '0.72rem' }}>
                  {twoFA ? 'Disable' : 'Enable 2FA'}
                </button>
              </div>

              {/* Session info */}
              <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <Lock style={{ width: 16, height: 16, color: '#22d3ee' }} />
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Active Sessions</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', background: 'rgba(57,231,95,0.05)', border: '1px solid rgba(57,231,95,0.1)' }}>
                  <div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Current Session</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>Chrome · Windows · 192.168.1.10</div>
                  </div>
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.1em', color: '#39e75f', background: 'rgba(57,231,95,0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(57,231,95,0.2)' }}>ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PREFERENCES TAB ── */}
      {activeTab === 'preferences' && (
        <div className="card">
          <div className="section-title">Application Preferences</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { icon: darkMode ? Moon : Sun, label: 'Dark Mode',         sub: 'Dark interface theme',                value: darkMode,      toggle: () => setDarkMode(v => !v)      },
              { icon: Bell,                  label: 'Email Alerts',       sub: 'Risk notifications via email',         value: emailAlerts,   toggle: () => setEmailAlerts(v => !v)   },
              { icon: AlertTriangle,         label: 'Critical Alerts Only', sub: 'Only CRITICAL risk events',          value: criticalOnly,  toggle: () => setCriticalOnly(v => !v)  },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <item.icon style={{ width: 16, height: 16, color: item.value ? '#39e75f' : '#64748b' }} />
                  <div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{item.label}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>{item.sub}</div>
                  </div>
                </div>
                {/* Toggle */}
                <button onClick={item.toggle} style={{
                  width: '42px', height: '22px', borderRadius: '11px',
                  background: item.value ? 'linear-gradient(135deg, #2abc4a, #39e75f)' : 'rgba(255,255,255,0.1)',
                  border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', flexShrink: 0,
                  boxShadow: item.value ? '0 0 12px rgba(57,231,95,0.3)' : 'none',
                }}>
                  <div style={{
                    position: 'absolute', top: '3px',
                    left: item.value ? 'calc(100% - 19px)' : '3px',
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: 'white', transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}