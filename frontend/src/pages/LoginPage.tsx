import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Shield, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, Lock, Cpu, Globe, FileCheck } from 'lucide-react'

const DEMO_ACCOUNTS = [
  { email: 'admin@supplyshield.ro', password: 'admin123', role: 'Administrator', tag: 'ADMIN' },
  { email: 'analyst@supplyshield.ro', password: 'analyst123', role: 'Analyst', tag: 'ANALYST' },
]

function AnimatedBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf: number
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const nodes = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.8,
      green: Math.random() > 0.6,
    }))

    let scan = 0
    const tick = () => {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // Richer background — not pure black
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, '#081828')
      bg.addColorStop(0.35, '#0a1f35')
      bg.addColorStop(0.7, '#071525')
      bg.addColorStop(1, '#081220')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Strong center glow — visible!
      const g1 = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, W * 0.5)
      g1.addColorStop(0, 'rgba(57,231,95,0.12)')
      g1.addColorStop(0.4, 'rgba(57,231,95,0.05)')
      g1.addColorStop(1, 'transparent')
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, W, H)

      // Top-left accent glow
      const g2 = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.4)
      g2.addColorStop(0, 'rgba(34,211,238,0.08)')
      g2.addColorStop(1, 'transparent')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, W, H)

      // Bottom-right accent
      const g3 = ctx.createRadialGradient(W, H, 0, W, H, W * 0.4)
      g3.addColorStop(0, 'rgba(57,231,95,0.07)')
      g3.addColorStop(1, 'transparent')
      ctx.fillStyle = g3
      ctx.fillRect(0, 0, W, H)

      // Grid — more visible
      ctx.lineWidth = 0.6
      for (let x = 0; x < W; x += 50) {
        ctx.strokeStyle = 'rgba(57,231,95,0.07)'
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 0; y < H; y += 50) {
        ctx.strokeStyle = 'rgba(57,231,95,0.07)'
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }

      // Scan line
      scan = (scan + 0.7) % H
      const sg = ctx.createLinearGradient(0, scan - 80, 0, scan + 80)
      sg.addColorStop(0, 'transparent')
      sg.addColorStop(0.5, 'rgba(57,231,95,0.05)')
      sg.addColorStop(1, 'transparent')
      ctx.fillStyle = sg
      ctx.fillRect(0, scan - 80, W, 160)

      // Nodes + connections
      nodes.forEach((n, i) => {
        n.x += n.vx; n.y += n.vy
        if (n.x < 0) n.x = W; if (n.x > W) n.x = 0
        if (n.y < 0) n.y = H; if (n.y > H) n.y = 0

        nodes.forEach((m, j) => {
          if (j <= i) return
          const dx = m.x - n.x, dy = m.y - n.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 140) {
            ctx.beginPath()
            ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y)
            const a = (1 - d / 140) * 0.18
            ctx.strokeStyle = `rgba(57,231,95,${a})`
            ctx.lineWidth = 0.7
            ctx.stroke()
          }
        })

        // Glow effect on nodes
        const gn = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4)
        gn.addColorStop(0, n.green ? 'rgba(57,231,95,0.4)' : 'rgba(34,211,238,0.3)')
        gn.addColorStop(1, 'transparent')
        ctx.fillStyle = gn
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2); ctx.fill()

        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = n.green ? 'rgba(57,231,95,0.9)' : 'rgba(34,211,238,0.7)'
        ctx.fill()
      })

      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const doLogin = async (e = email, p = password) => {
    if (!e || !p) { setError('Please fill in all fields'); return }
    setLoading(true); setError('')
    const ok = await login(e, p)
    setLoading(false)
    if (ok) navigate('/dashboard')
    else setError('Invalid credentials. Use demo accounts below.')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      <AnimatedBg />

      {/* ─── LEFT: Hero ─── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: 'clamp(2rem,5vw,5rem)',
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '3.5rem' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
            background: 'linear-gradient(135deg, #2abc4a, #39e75f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(57,231,95,0.5), 0 0 80px rgba(57,231,95,0.2)',
          }}>
            <Shield style={{ width: '26px', height: '26px', color: '#040d18' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '0.08em', color: 'white', lineHeight: 1 }}>
              SUPPLY<span style={{ color: '#39e75f' }}>SHIELD</span>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(57,231,95,0.5)', letterSpacing: '0.18em', marginTop: '3px' }}>
              INFOSEC CENTER · CITADEL PROJECT
            </div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ maxWidth: '520px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(57,231,95,0.1)', border: '1px solid rgba(57,231,95,0.2)',
            borderRadius: '6px', padding: '5px 12px', marginBottom: '1.5rem',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#39e75f', animation: 'pulse-dot 2s infinite' }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: '#39e75f', letterSpacing: '0.15em' }}>
              ADVANCED CYBER RISK MANAGEMENT
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
            fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
            color: 'white', lineHeight: 1.08, marginBottom: '1.25rem',
            letterSpacing: '0.02em',
            textShadow: '0 0 60px rgba(57,231,95,0.15)',
          }}>
            Protect Your<br />
            <span style={{ color: '#39e75f', textShadow: '0 0 40px rgba(57,231,95,0.4)' }}>Supply Chain</span><br />
            From Cyber Threats
          </h1>

          <p style={{
            color: '#7a9ab8', fontSize: '0.92rem', lineHeight: 1.75,
            marginBottom: '2.5rem', fontFamily: 'Inter, sans-serif',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}>
            Real-time IT/OT supplier risk assessment, adaptive scoring engine, and automated remediation recommendations for critical infrastructure.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '2.5rem' }}>
            {[
              { icon: Cpu, text: 'Adaptive Assessment Engine' },
              { icon: Globe, text: 'IT & OT Coverage' },
              { icon: FileCheck, text: 'NIS2 / IEC 62443 Ready' },
            ].map(f => (
              <div key={f.text} style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', padding: '7px 14px',
              }}>
                <f.icon style={{ width: '13px', height: '13px', color: '#39e75f' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#8aabb8', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '2.5rem' }}>
            {[
              { val: 'TRL 6–7', sub: 'Technology Level' },
              { val: 'NIS2', sub: 'Compliant' },
              { val: 'IEC 62443', sub: 'OT Standard' },
            ].map(s => (
              <div key={s.val}>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#39e75f', letterSpacing: '0.04em' }}>{s.val}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: '#3a5570', letterSpacing: '0.08em', marginTop: '2px', textTransform: 'uppercase' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Login Form ─── */}
      <div style={{
        width: 'min(500px, 46vw)', minWidth: '380px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 2.5rem', position: 'relative', zIndex: 1,
        background: 'rgba(8,18,32,0.75)',
        borderLeft: '1px solid rgba(57,231,95,0.12)',
        backdropFilter: 'blur(28px)',
      }}>
        {/* Top accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent 0%, rgba(57,231,95,0.6) 50%, transparent 100%)' }} />

        <div style={{ width: '100%', maxWidth: '380px' }}>
          {/* Form header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(57,231,95,0.12)', border: '1px solid rgba(57,231,95,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock style={{ width: '14px', height: '14px', color: '#39e75f' }} />
              </div>
              <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.4rem', letterSpacing: '0.1em', color: 'white' }}>
                SIGN IN
              </h2>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#4a6680', marginLeft: '42px' }}>
              Secure access to your risk management platform
            </p>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#39e75f', display: 'block', marginBottom: '7px' }}>
              Email Address
            </label>
            <input type="email" className="input" placeholder="your@organization.ro"
              value={email} onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && doLogin()}
              style={{ fontSize: '0.875rem', height: '46px' }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#39e75f', display: 'block', marginBottom: '7px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} className="input" placeholder="••••••••"
                value={password} onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && doLogin()}
                style={{ paddingRight: '2.75rem', fontSize: '0.875rem', height: '46px' }}
              />
              <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#334155', padding: 0, lineHeight: 0 }}>
                {showPass ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.25)', marginBottom: '1rem' }}>
              <AlertCircle style={{ width: '14px', height: '14px', color: '#ff2d55', flexShrink: 0 }} />
              <span style={{ color: '#ff6b8a', fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace' }}>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button onClick={() => doLogin()} disabled={loading} className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '0.9rem', letterSpacing: '0.12em', marginBottom: '1.75rem' }}>
            {loading
              ? <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> AUTHENTICATING...</>
              : <><Shield style={{ width: '16px', height: '16px' }} /> ACCESS PLATFORM</>
            }
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(57,231,95,0.1)' }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: '#1e3a55', letterSpacing: '0.14em', whiteSpace: 'nowrap' }}>DEMO QUICK ACCESS</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(57,231,95,0.1)' }} />
          </div>

          {/* Demo accounts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DEMO_ACCOUNTS.map(acc => (
              <button key={acc.email}
                onClick={() => { setEmail(acc.email); setPassword(acc.password); doLogin(acc.email, acc.password) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                  background: 'rgba(57,231,95,0.05)', border: '1px solid rgba(57,231,95,0.12)',
                  transition: 'all 0.2s', width: '100%', textAlign: 'left',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'rgba(57,231,95,0.1)'
                  el.style.borderColor = 'rgba(57,231,95,0.3)'
                  el.style.transform = 'translateX(4px)'
                  el.style.boxShadow = '0 0 20px rgba(57,231,95,0.08)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'rgba(57,231,95,0.05)'
                  el.style.borderColor = 'rgba(57,231,95,0.12)'
                  el.style.transform = 'translateX(0)'
                  el.style.boxShadow = 'none'
                }}>
                <div style={{
                  padding: '5px 10px', borderRadius: '6px', flexShrink: 0,
                  background: 'rgba(57,231,95,0.12)', border: '1px solid rgba(57,231,95,0.2)',
                }}>
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.1em', color: '#39e75f' }}>
                    {acc.tag}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.82rem', color: '#c0d0e0', marginBottom: '2px' }}>
                    {acc.email}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: '#2a4560' }}>
                    Click to sign in automatically
                  </div>
                </div>
                <ArrowRight style={{ width: '14px', height: '14px', color: '#39e75f', flexShrink: 0, opacity: 0.7 }} />
              </button>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: '#0f1e2e', marginTop: '2rem', letterSpacing: '0.08em' }}>
            SUPPLYSHIELD v1.0 · INFOSEC CENTER © 2026
          </p>
        </div>
      </div>
    </div>
  )
}