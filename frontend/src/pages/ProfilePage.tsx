import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { User, Mail, Building, Shield, Save, Key, Bell, Moon, Sun, Lock, CheckCircle, AlertTriangle } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()
  const [form, setForm] = useState({
    name:         user?.name         || '',
    email:        user?.email        || '',
    organization: user?.organization || '',
  })
  const [saved,        setSaved]        = useState(false)
  const [activeTab,    setActiveTab]    = useState<'profile' | 'security' | 'preferences'>('profile')
  const [darkMode,     setDarkMode]     = useState(false)
  const [emailAlerts,  setEmailAlerts]  = useState(true)
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [twoFA,        setTwoFA]        = useState(false)

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

  // iOS-style toggle component
  const Toggle = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      style={{
        width: 44, height: 26, borderRadius: 13, flexShrink: 0,
        background: value ? 'var(--blue)' : 'rgba(0,0,0,0.12)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.22s ease',
        boxShadow: value ? '0 2px 6px rgba(10,132,255,0.35)' : 'none',
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: value ? 'calc(100% - 23px)' : 3,
        width: 20, height: 20, borderRadius: '50%',
        background: 'white', transition: 'left 0.22s ease',
        boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
      }} />
    </button>
  )

  return (
    <>
      <style>{`
        .profile-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .profile-form  { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .tab-btn-prof  {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border: none; cursor: pointer;
          font-weight: 600; font-size: 0.82rem; letter-spacing: -0.01em;
          background: transparent; color: var(--text-muted);
          border-bottom: 2px solid transparent; transition: all 0.15s ease;
        }
        .tab-btn-prof:hover  { color: var(--text-secondary); }
        .tab-btn-prof.active { color: var(--blue); border-bottom-color: var(--blue); background: rgba(10,132,255,0.06); border-radius: 8px 8px 0 0; }

        .pref-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-radius: 12px;
          background: var(--surface); border: 1px solid var(--border);
          transition: background 0.15s ease;
        }
        .pref-row:hover { background: var(--surface-hover); }

        .info-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 9px 0; border-bottom: 1px solid var(--border);
        }
        .info-row:last-child { border-bottom: none; }

        @media (max-width: 768px) {
          .profile-grid { grid-template-columns: 1fr; }
          .profile-form { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page-wrapper">

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 16, flexShrink: 0,
            background: 'var(--blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(10,132,255,0.30)',
          }}>
            <span style={{ fontWeight: 700, fontSize: '1.4rem', color: 'white' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {user?.name}
            </h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3 }}>
              {user?.email} · {user?.organization}
            </div>
          </div>
          <span style={{
            fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em',
            padding: '4px 12px', borderRadius: 20,
            background: 'rgba(10,132,255,0.09)', color: 'var(--blue)',
            border: '1px solid rgba(10,132,255,0.22)', textTransform: 'capitalize',
          }}>
            {user?.role}
          </span>
        </div>

        {/* ── TABS ── */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn-prof${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <tab.icon style={{ width: 13, height: 13 }} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Personal info */}
            <div className="card">
              <div className="section-title">Personal Information</div>
              <div className="profile-form">
                {[
                  { name: 'name',         label: 'Full Name',       icon: User,     placeholder: 'Full name',        disabled: false },
                  { name: 'email',        label: 'Email Address',   icon: Mail,     placeholder: 'email@org.com',    disabled: false },
                  { name: 'organization', label: 'Organization',    icon: Building, placeholder: 'Organization name', disabled: false },
                  { name: 'role',         label: 'Role',            icon: Shield,   placeholder: user?.role || '',   disabled: true  },
                ].map(field => (
                  <div key={field.name}>
                    <label className="label">{field.label}</label>
                    <div style={{ position: 'relative' }}>
                      <field.icon style={{ width: 14, height: 14, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)', pointerEvents: 'none' }} />
                      <input
                        name={field.name}
                        value={field.disabled ? (user?.role || '') : form[field.name as keyof typeof form]}
                        onChange={field.disabled ? undefined : handle}
                        disabled={field.disabled}
                        className="input"
                        placeholder={field.placeholder}
                        style={{ paddingLeft: 36, opacity: field.disabled ? 0.5 : 1, cursor: field.disabled ? 'not-allowed' : 'text' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1.25rem', display: 'flex', gap: 10, alignItems: 'center' }}>
                <button onClick={handleSave} className="btn-primary">
                  <Save style={{ width: 14, height: 14 }} />
                  {saved ? 'Saved!' : 'Save Changes'}
                </button>
                {saved && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle style={{ width: 15, height: 15, color: '#25A244' }} />
                    <span style={{ fontSize: '0.78rem', color: '#25A244', fontWeight: 600 }}>Profile updated</span>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-grid">
              {/* Account details */}
              <div className="card">
                <div className="section-title">Account Details</div>
                <div>
                  {[
                    { label: 'Member Since',     value: 'March 2026'         },
                    { label: 'Last Login',        value: 'Today, 10:15'       },
                    { label: 'Active Sessions',   value: '1 session'          },
                    { label: 'Role',              value: user?.role || 'Viewer' },
                    { label: 'Organization',      value: user?.organization || '—' },
                  ].map(item => (
                    <div key={item.label} className="info-row">
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div className="card" style={{ borderColor: 'rgba(255,69,58,0.20)' }}>
                <div className="section-title" style={{ color: 'var(--red)' }}>Danger Zone</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  These actions are irreversible. Please be certain before proceeding.
                </p>
                <button className="btn-danger" style={{ fontSize: '0.8rem', justifyContent: 'center', width: '100%', opacity: 0.75 }}>
                  <AlertTriangle style={{ width: 13, height: 13 }} /> Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SECURITY TAB ── */}
        {activeTab === 'security' && (
          <div className="card">
            <div className="section-title">Authentication & Sessions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

              {/* Change password */}
              <div className="pref-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(10,132,255,0.09)', border: '1px solid rgba(10,132,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Key style={{ width: 15, height: 15, color: 'var(--blue)' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Change Password</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>Last changed 30 days ago</div>
                  </div>
                </div>
                <button className="btn-secondary" style={{ fontSize: '0.78rem' }}>Update</button>
              </div>

              {/* 2FA */}
              <div className="pref-row" style={{
                background: twoFA ? 'rgba(48,209,88,0.06)' : 'var(--surface)',
                borderColor: twoFA ? 'rgba(48,209,88,0.20)' : 'var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: twoFA ? 'rgba(48,209,88,0.10)' : 'var(--surface-hover)',
                    border: `1px solid ${twoFA ? 'rgba(48,209,88,0.22)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Shield style={{ width: 15, height: 15, color: twoFA ? '#25A244' : 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Two-Factor Authentication</div>
                    <div style={{ fontSize: '0.72rem', color: twoFA ? '#25A244' : 'var(--text-muted)', marginTop: 1 }}>
                      {twoFA ? 'Enabled — your account is protected' : 'Not enabled — recommended for security'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setTwoFA(v => !v)}
                  className={twoFA ? 'btn-secondary' : 'btn-primary'}
                  style={{ fontSize: '0.78rem' }}
                >
                  {twoFA ? 'Disable' : 'Enable 2FA'}
                </button>
              </div>

              {/* Active sessions */}
              <div className="pref-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(10,132,255,0.09)', border: '1px solid rgba(10,132,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock style={{ width: 15, height: 15, color: 'var(--blue)' }} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Active Sessions</div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(48,209,88,0.06)', border: '1px solid rgba(48,209,88,0.18)',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>Current Session</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>Chrome · Windows · 192.168.1.10</div>
                  </div>
                  <span style={{
                    fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.04em',
                    color: '#25A244', background: 'rgba(48,209,88,0.10)',
                    padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(48,209,88,0.22)',
                  }}>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PREFERENCES TAB ── */}
        {activeTab === 'preferences' && (
          <div className="card">
            <div className="section-title">Application Preferences</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { icon: darkMode ? Moon : Sun,  label: 'Dark Mode',           sub: 'Switch to dark interface theme',       value: darkMode,      toggle: () => setDarkMode(v => !v)      },
                { icon: Bell,                    label: 'Email Alerts',         sub: 'Receive risk notifications via email', value: emailAlerts,   toggle: () => setEmailAlerts(v => !v)   },
                { icon: AlertTriangle,            label: 'Critical Alerts Only', sub: 'Only show CRITICAL severity events',  value: criticalOnly,  toggle: () => setCriticalOnly(v => !v)  },
              ].map(item => (
                <div key={item.label} className="pref-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: item.value ? 'rgba(10,132,255,0.09)' : 'var(--surface-hover)',
                      border: `1px solid ${item.value ? 'rgba(10,132,255,0.20)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <item.icon style={{ width: 15, height: 15, color: item.value ? 'var(--blue)' : 'var(--text-muted)' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{item.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>{item.sub}</div>
                    </div>
                  </div>
                  <Toggle value={item.value} onToggle={item.toggle} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  )
}