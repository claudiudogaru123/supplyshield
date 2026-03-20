import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Shield, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, Lock, Cpu, Globe, FileCheck } from 'lucide-react'

const DEMO_ACCOUNTS = [
  { email: 'admin@supplyshield.ro',   password: 'admin123',   role: 'Administrator', tag: 'Admin' },
  { email: 'analyst@supplyshield.ro', password: 'analyst123', role: 'Analyst',       tag: 'Analyst' },
]

export default function LoginPage() {
  const navigate  = useNavigate()
  const login     = useAuthStore(s => s.login)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const doLogin = async (e = email, p = password) => {
    if (!e || !p) { setError('Please fill in all fields.'); return }
    setLoading(true); setError('')
    const ok = await login(e, p)
    setLoading(false)
    if (ok) navigate('/dashboard')
    else setError('Invalid credentials. Use the demo accounts below.')
  }

  return (
    <>
      <style>{`
        .login-root {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background: #f5f5f7;
          position: relative;
          overflow: hidden;
        }

        /* Subtle background blobs */
        .login-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 15% 10%, rgba(10,132,255,0.07) 0%, transparent 65%),
            radial-gradient(ellipse 55% 40% at 85% 90%, rgba(48,209,88,0.05)  0%, transparent 60%),
            radial-gradient(ellipse 40% 35% at 90% 5%,  rgba(94,92,230,0.04)  0%, transparent 55%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── 2-column on desktop ── */
        .login-inner {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          flex-direction: row;
          align-items: stretch;
        }

        /* Hero left panel */
        .login-hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(2.5rem, 6vw, 5rem);
          min-width: 0;
        }

        /* Form right panel */
        .login-form-panel {
          width: min(460px, 46vw);
          min-width: 360px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 2rem;
          background: rgba(255,255,255,0.75);
          border-left: 1px solid var(--border);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
        }

        /* ── Mobile: single column ── */
        @media (max-width: 768px) {
          .login-inner       { flex-direction: column; }
          .login-hero        { display: none; }
          .login-form-panel  {
            width: 100%;
            min-width: unset;
            border-left: none;
            border-top: none;
            background: transparent;
            backdrop-filter: none;
            padding: 2rem 1.25rem 3rem;
            flex: 1;
          }
        }

        /* Demo button hover */
        .demo-btn {
          display: flex; align-items: center; gap: 12px;
          padding: 13px 16px; border-radius: 12px; cursor: pointer;
          background: var(--surface); border: 1px solid var(--border);
          transition: all 0.18s ease; width: 100%; text-align: left;
        }
        .demo-btn:hover {
          background: rgba(10,132,255,0.06);
          border-color: rgba(10,132,255,0.22);
          transform: translateX(3px);
          box-shadow: var(--shadow-sm);
        }
      `}</style>

      <div className="login-root">
        <div className="login-inner">

          {/* ══ LEFT HERO ══ */}
          <div className="login-hero">

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '3rem' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: 'var(--blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(10,132,255,0.28)',
              }}>
                <Shield style={{ width: 22, height: 22, color: 'white' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                  SupplyShield
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-ghost)', fontWeight: 500, marginTop: 2 }}>
                  Cyber Risk Management Platform
                </div>
              </div>
            </div>

            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(48,209,88,0.09)', border: '1px solid rgba(48,209,88,0.22)',
              borderRadius: 20, padding: '5px 14px', marginBottom: '1.5rem',
              width: 'fit-content',
            }}>
              <div className="animate-pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--green)', letterSpacing: '0.03em' }}>
                System Online — All services operational
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1,
              color: 'var(--text-primary)', marginBottom: '1.25rem',
              maxWidth: 500,
            }}>
              Protect Your<br />
              <span style={{ color: 'var(--blue)' }}>Supply Chain</span><br />
              From Cyber Threats
            </h1>

            <p style={{
              fontSize: '0.95rem', lineHeight: 1.75, color: 'var(--text-muted)',
              maxWidth: 480, marginBottom: '2.5rem',
            }}>
              Real-time IT/OT supplier risk assessment, adaptive scoring engine, and automated
              remediation for critical infrastructure operators.
            </p>

            {/* Feature pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '2.5rem' }}>
              {[
                { icon: Cpu,       text: 'Adaptive Assessment Engine' },
                { icon: Globe,     text: 'IT & OT Coverage' },
                { icon: FileCheck, text: 'NIS2 / IEC 62443 Ready' },
              ].map(f => (
                <div key={f.text} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: 'rgba(255,255,255,0.70)', border: '1px solid var(--border)',
                  borderRadius: 20, padding: '6px 14px',
                  backdropFilter: 'blur(8px)',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <f.icon style={{ width: 13, height: 13, color: 'var(--blue)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '2rem' }}>
              {[
                { val: 'NIS2',      sub: 'Compliant' },
                { val: 'IEC 62443', sub: 'OT Standard' },
                { val: 'ISO 27001', sub: 'Aligned' },
              ].map(s => (
                <div key={s.val} style={{ borderLeft: '2px solid var(--border)', paddingLeft: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--blue)', letterSpacing: '-0.01em' }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-ghost)', fontWeight: 500, marginTop: 2 }}>
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ RIGHT FORM PANEL ══ */}
          <div className="login-form-panel">
            <div style={{ width: '100%', maxWidth: 380 }}>

              {/* Mobile logo (only shown on mobile) */}
              <div style={{
                display: 'none', alignItems: 'center', gap: 10,
                marginBottom: '2rem',
              }} className="mobile-logo">
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'var(--blue)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 3px 10px rgba(10,132,255,0.25)',
                }}>
                  <Shield style={{ width: 18, height: 18, color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>SupplyShield</div>
                  <div style={{ fontSize: '0.67rem', color: 'var(--text-ghost)', fontWeight: 500 }}>Cyber Risk Management</div>
                </div>
              </div>
              <style>{`@media(max-width:768px){ .mobile-logo { display:flex !important; } }`}</style>

              {/* Form header */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: 'rgba(10,132,255,0.10)', border: '1px solid rgba(10,132,255,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Lock style={{ width: 14, height: 14, color: 'var(--blue)' }} />
                  </div>
                  <h2 style={{ fontWeight: 700, fontSize: '1.3rem', letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1 }}>
                    Sign in
                  </h2>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: 42 }}>
                  Secure access to your risk management platform
                </p>
              </div>

              {/* Email */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Email Address</label>
                <input
                  type="email" className="input"
                  placeholder="your@organization.ro"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && doLogin()}
                  style={{ height: 46 }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'} className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && doLogin()}
                    style={{ paddingRight: '2.75rem', height: 46 }}
                  />
                  <button
                    onClick={() => setShowPass(v => !v)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: 0, lineHeight: 0,
                    }}>
                    {showPass
                      ? <EyeOff style={{ width: 15, height: 15 }} />
                      : <Eye    style={{ width: 15, height: 15 }} />
                    }
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.22)',
                  marginBottom: '1rem',
                }}>
                  <AlertCircle style={{ width: 14, height: 14, color: 'var(--red)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--red)', fontSize: '0.8rem' }}>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={() => doLogin()} disabled={loading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', height: 46, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {loading
                  ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 0.85s linear infinite' }} /> Signing in…</>
                  : <><Shield  style={{ width: 16, height: 16 }} /> Access Platform <ArrowRight style={{ width: 14, height: 14 }} /></>
                }
              </button>

              {/* Divider */}
              <div className="separator-label" style={{ marginBottom: '1rem' }}>
                Quick Demo Access
              </div>

              {/* Demo accounts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.email}
                    className="demo-btn"
                    onClick={() => { setEmail(acc.email); setPassword(acc.password); doLogin(acc.email, acc.password) }}
                  >
                    {/* Role tag */}
                    <div style={{
                      padding: '4px 10px', borderRadius: 8, flexShrink: 0,
                      background: 'rgba(10,132,255,0.09)', border: '1px solid rgba(10,132,255,0.18)',
                    }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--blue)' }}>
                        {acc.tag}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {acc.email}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-ghost)' }}>
                        Sign in automatically
                      </div>
                    </div>
                    <ArrowRight style={{ width: 14, height: 14, color: 'var(--blue)', flexShrink: 0, opacity: 0.7 }} />
                  </button>
                ))}
              </div>

              {/* Footer */}
              <p style={{
                textAlign: 'center', fontSize: '0.68rem', color: 'var(--text-ghost)',
                marginTop: '2rem', letterSpacing: '0.02em',
              }}>
                SupplyShield v1.0 · InfoSec Center © 2026
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}