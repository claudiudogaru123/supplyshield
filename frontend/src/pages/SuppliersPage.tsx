import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { suppliersApi } from '../utils/api'
import type { Supplier } from '../types'
import { getRiskBadgeClass } from '../utils/helpers'
import {
  Plus, Search, Trash2, ClipboardList, LayoutGrid, LayoutList,
  ChevronDown, ChevronUp, Loader2, AlertTriangle, Clock,
  CheckCircle, Download, Shield, ChevronRight, Users, Activity
} from 'lucide-react'
import SupplierForm from '../components/suppliers/SupplierForm'

// ── Helpers ───────────────────────────────────────────────
function getAssessmentStatus(s: Supplier): 'overdue' | 'due-soon' | 'ok' | 'never' {
  if (!s.assessment_count) return 'never'
  if (s.risk_category === 'CRITICAL' && s.assessment_count < 2) return 'overdue'
  if (s.risk_score > 60) return 'due-soon'
  return 'ok'
}

function scoreColor(score: number) {
  if (score >= 75) return '#FF453A'
  if (score >= 50) return '#FF9F0A'
  if (score >= 25) return '#CC8800'
  return '#25A244'
}

// ── Type Pill ─────────────────────────────────────────────
function TypePill({ type }: { type: string }) {
  const cfg: Record<string, { bg: string; color: string; border: string }> = {
    IT:     { bg: 'rgba(10,132,255,0.09)',  color: '#0A84FF', border: 'rgba(10,132,255,0.22)' },
    OT:     { bg: 'rgba(191,90,242,0.09)',  color: '#BF5AF2', border: 'rgba(191,90,242,0.22)' },
    HYBRID: { bg: 'rgba(90,200,250,0.09)',  color: '#0082A8', border: 'rgba(90,200,250,0.30)' },
  }
  const c = cfg[type] || cfg.IT
  return (
    <span style={{
      fontWeight: 600, fontSize: '0.68rem', letterSpacing: '0.04em',
      padding: '3px 9px', borderRadius: 7,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>{type}</span>
  )
}

// ── Status Badge ──────────────────────────────────────────
function StatusBadge({ status }: { status: ReturnType<typeof getAssessmentStatus> }) {
  const cfg = {
    never:     { icon: AlertTriangle, color: '#FF453A', label: 'Never',    bg: 'rgba(255,69,58,0.09)'  },
    overdue:   { icon: Clock,         color: '#FF9F0A', label: 'Overdue',  bg: 'rgba(255,159,10,0.09)' },
    'due-soon':{ icon: Clock,         color: '#CC8800', label: 'Due Soon', bg: 'rgba(255,214,10,0.12)' },
    ok:        { icon: CheckCircle,   color: '#25A244', label: 'OK',       bg: 'rgba(48,209,88,0.09)'  },
  }[status]
  const Icon = cfg.icon
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 7, background: cfg.bg,
    }}>
      <Icon style={{ width: 11, height: 11, color: cfg.color, flexShrink: 0 }} />
      <span style={{ fontWeight: 600, fontSize: '0.68rem', color: cfg.color }}>{cfg.label}</span>
    </span>
  )
}

// ── Supplier Card (grid view) ─────────────────────────────
function SupplierCard({ s, onAssess, onDelete, onClick }: {
  s: Supplier; onAssess: () => void; onDelete: () => void; onClick: () => void
}) {
  const status = getAssessmentStatus(s)
  const sc = scoreColor(s.risk_score || 0)

  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.85)',
        border: '1px solid var(--border)',
        borderRadius: 16, padding: '1.25rem',
        cursor: 'pointer', transition: 'all 0.2s ease',
        backdropFilter: 'blur(20px)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(-3px)'
        el.style.boxShadow = 'var(--shadow-md)'
        el.style.borderColor = 'var(--border-hover)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'var(--shadow-sm)'
        el.style.borderColor = 'var(--border)'
      }}
    >
      {/* Top color bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${sc}, transparent)`, borderRadius: '16px 16px 0 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            <TypePill type={s.supplier_type} />
            <StatusBadge status={status} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
            {s.name}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {s.country} · {s.sector}
          </div>
        </div>
        <div style={{
          width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${sc}`, background: `${sc}12`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 10,
        }}>
          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: sc }}>
            {(s.risk_score || 0).toFixed(0)}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div className="score-bar-track">
          <div className="score-bar-fill" style={{ width: `${Math.min(s.risk_score || 0, 100)}%`, background: sc }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-ghost)', fontWeight: 500 }}>Risk Score</span>
          <span className={getRiskBadgeClass(s.risk_category)}>{s.risk_category}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 7 }} onClick={e => e.stopPropagation()}>
        <button onClick={onAssess} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '6px', fontSize: '0.75rem' }}>
          <ClipboardList style={{ width: 12, height: 12 }} /> Assess
        </button>
        <button onClick={onClick} style={{
          padding: '6px 10px', borderRadius: 9,
          border: '1px solid rgba(10,132,255,0.22)', background: 'rgba(10,132,255,0.07)',
          color: 'var(--blue)', cursor: 'pointer', lineHeight: 0,
        }}>
          <ChevronRight style={{ width: 13, height: 13 }} />
        </button>
        <button onClick={onDelete} style={{
          padding: '6px 10px', borderRadius: 9,
          border: '1px solid rgba(255,69,58,0.22)', background: 'rgba(255,69,58,0.07)',
          color: 'var(--red)', cursor: 'pointer', lineHeight: 0,
        }}>
          <Trash2 style={{ width: 13, height: 13 }} />
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────
export default function SuppliersPage() {
  const queryClient = useQueryClient()
  const navigate    = useNavigate()
  const [search,     setSearch]     = useState('')
  const [showForm,   setShowForm]   = useState(false)
  const [viewMode,   setViewMode]   = useState<'table' | 'grid'>('table')
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [sortField,  setSortField]  = useState<'risk_score' | 'name'>('risk_score')
  const [sortDir,    setSortDir]    = useState<'asc' | 'desc'>('desc')
  const [selected,   setSelected]   = useState<Set<string>>(new Set())

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'], queryFn: suppliersApi.getAll,
  })

  const deleteMutation = useMutation({
    mutationFn: suppliersApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  })

  const stats = {
    total:      suppliers.length,
    critical:   suppliers.filter((s: Supplier) => s.risk_category === 'CRITICAL').length,
    high:       suppliers.filter((s: Supplier) => s.risk_category === 'HIGH').length,
    unassessed: suppliers.filter((s: Supplier) => !s.assessment_count).length,
    overdue:    suppliers.filter((s: Supplier) => getAssessmentStatus(s) === 'overdue').length,
  }

  const filtered = (suppliers as Supplier[])
    .filter(s => {
      const q  = search.toLowerCase()
      const ms = !q || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q) || s.country.toLowerCase().includes(q)
      const mr = riskFilter === 'ALL' || s.risk_category === riskFilter
      const mt = typeFilter === 'ALL' || s.supplier_type === typeFilter
      return ms && mr && mt
    })
    .sort((a, b) => {
      const av = sortField === 'risk_score' ? (a.risk_score || 0) : a.name.toLowerCase()
      const bv = sortField === 'risk_score' ? (b.risk_score || 0) : b.name.toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const toggleSort = (f: 'risk_score' | 'name') => {
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(f); setSortDir('desc') }
  }

  const toggleSelect = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const exportCSV = () => {
    const csv = [
      'Name,Type,Country,Sector,Criticality,Risk Score,Risk Category,Assessments',
      ...filtered.map(s => [s.name, s.supplier_type, s.country, s.sector, s.criticality, s.risk_score?.toFixed(1), s.risk_category, s.assessment_count].join(',')),
    ].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `suppliers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const RISK_FILTERS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
  const TYPE_FILTERS = ['ALL', 'IT', 'OT', 'HYBRID']

  const riskColor: Record<string, string> = {
    CRITICAL: '#FF453A', HIGH: '#FF9F0A', MEDIUM: '#CC8800', LOW: '#25A244', ALL: 'var(--blue)',
  }

  return (
    <>
      <style>{`
        .sup-stats   { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
        .sup-filters { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .filter-btn  {
          padding: 5px 11px; border-radius: 8px; cursor: pointer;
          font-weight: 600; font-size: 0.72rem; letter-spacing: 0.02em;
          transition: all 0.15s ease; border: 1px solid var(--border);
          background: var(--surface); color: var(--text-muted);
        }
        .filter-btn.active-risk-CRITICAL { background: rgba(255,69,58,0.09);   color: #FF453A; border-color: rgba(255,69,58,0.25);   }
        .filter-btn.active-risk-HIGH     { background: rgba(255,159,10,0.09);  color: #FF9F0A; border-color: rgba(255,159,10,0.25);  }
        .filter-btn.active-risk-MEDIUM   { background: rgba(255,214,10,0.10);  color: #CC8800; border-color: rgba(255,214,10,0.28);  }
        .filter-btn.active-risk-LOW      { background: rgba(48,209,88,0.09);   color: #25A244; border-color: rgba(48,209,88,0.25);   }
        .filter-btn.active-risk-ALL,
        .filter-btn.active-type          { background: rgba(10,132,255,0.09);  color: var(--blue); border-color: rgba(10,132,255,0.25); }
        .filter-btn:hover                { background: var(--surface-hover); color: var(--text-secondary); }

        .view-toggle { display: flex; border-radius: 10px; overflow: hidden; border: 1px solid var(--border); }
        .view-btn    { padding: 6px 11px; border: none; cursor: pointer; line-height: 0; transition: all 0.15s ease; background: transparent; color: var(--text-muted); }
        .view-btn.active { background: rgba(10,132,255,0.10); color: var(--blue); }

        .th { font-weight: 600; font-size: 0.68rem; letter-spacing: 0.07em; text-transform: uppercase; color: var(--text-muted); padding: 11px 10px 11px 0; text-align: left; white-space: nowrap; }
        .th.sortable { cursor: pointer; user-select: none; }
        .th.sortable:hover { color: var(--text-secondary); }

        .td { padding: 11px 10px 11px 0; font-size: 0.82rem; color: var(--text-secondary); vertical-align: middle; }

        .sup-row { border-bottom: 1px solid var(--border); transition: background 0.12s ease; cursor: pointer; }
        .sup-row:hover { background: var(--surface); }
        .sup-row:last-child { border-bottom: none; }
        .sup-row.selected { background: rgba(10,132,255,0.05); }

        .action-btn {
          padding: 5px 8px; border-radius: 7px; cursor: pointer; line-height: 0;
          transition: all 0.15s ease; border: 1px solid var(--border); background: var(--surface);
        }

        @media (max-width: 900px) {
          .sup-stats { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 600px) {
          .sup-stats { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="page-wrapper">

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(10,132,255,0.10)', border: '1px solid rgba(10,132,255,0.20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users style={{ width: 18, height: 18, color: 'var(--blue)' }} />
            </div>
            <div>
              <h1 style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                Supplier Registry
              </h1>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
                {stats.total} suppliers · {stats.critical} critical · {stats.unassessed} unassessed
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={exportCSV} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              <Download style={{ width: 14, height: 14 }} /> Export
            </button>
            <button onClick={() => setShowForm(true)} className="btn-primary" style={{ fontSize: '0.84rem' }}>
              <Plus style={{ width: 14, height: 14 }} /> Add Supplier
            </button>
          </div>
        </div>

        {/* ── STATS BAR ── */}
        <div className="sup-stats">
          {[
            { label: 'Total',      value: stats.total,       color: '#0A84FF', icon: Users,         bg: 'rgba(10,132,255,0.08)',  border: 'rgba(10,132,255,0.18)'  },
            { label: 'Critical',   value: stats.critical,    color: '#FF453A', icon: AlertTriangle,  bg: 'rgba(255,69,58,0.07)',   border: 'rgba(255,69,58,0.18)'   },
            { label: 'High Risk',  value: stats.high,        color: '#FF9F0A', icon: Activity,       bg: 'rgba(255,159,10,0.07)',  border: 'rgba(255,159,10,0.18)'  },
            { label: 'Unassessed', value: stats.unassessed,  color: '#CC8800', icon: Clock,          bg: 'rgba(255,214,10,0.08)',  border: 'rgba(255,214,10,0.22)'  },
            { label: 'Overdue',    value: stats.overdue,     color: '#FF9F0A', icon: Clock,          bg: 'rgba(255,159,10,0.07)',  border: 'rgba(255,159,10,0.18)'  },
          ].map(item => (
            <div key={item.label} style={{
              background: 'rgba(255,255,255,0.80)', border: `1px solid ${item.border}`,
              borderRadius: 14, padding: '1rem 1.1rem',
              backdropFilter: 'blur(16px)', boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.6rem', color: item.color, lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {item.value}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {item.label}
                  </div>
                </div>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon style={{ width: 14, height: 14, color: item.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── FILTERS ── */}
        <div className="sup-filters">
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search style={{ width: 14, height: 14, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)', pointerEvents: 'none' }} />
            <input
              className="input" placeholder="Search suppliers, sector, country…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36, fontSize: '0.84rem' }}
            />
          </div>

          {/* Risk filters */}
          <div style={{ display: 'flex', gap: 4 }}>
            {RISK_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setRiskFilter(f)}
                className={`filter-btn${riskFilter === f ? ` active-risk-${f}` : ''}`}
              >
                {f === 'ALL' ? 'All Risks' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Type filters */}
          <div style={{ display: 'flex', gap: 4 }}>
            {TYPE_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`filter-btn${typeFilter === f ? ' active-type' : ''}`}
              >
                {f === 'ALL' ? 'All Types' : f}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="view-toggle">
            {[{ mode: 'table', icon: LayoutList }, { mode: 'grid', icon: LayoutGrid }].map(({ mode, icon: Icon }) => (
              <button
                key={mode} onClick={() => setViewMode(mode as 'table' | 'grid')}
                className={`view-btn${viewMode === mode ? ' active' : ''}`}
              >
                <Icon style={{ width: 14, height: 14 }} />
              </button>
            ))}
          </div>
        </div>

        {/* ── RESULTS INFO ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {filtered.length} of {suppliers.length} suppliers
            {(riskFilter !== 'ALL' || typeFilter !== 'ALL' || search) ? ' · filtered' : ''}
          </span>
          {selected.size > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--blue)', fontWeight: 600 }}>
                {selected.size} selected
              </span>
              <button
                onClick={() => {
                  if (confirm(`Delete ${selected.size} suppliers?`)) {
                    selected.forEach(id => deleteMutation.mutate(id))
                    setSelected(new Set())
                  }
                }}
                className="btn-danger" style={{ fontSize: '0.75rem', padding: '5px 12px' }}>
                <Trash2 style={{ width: 12, height: 12 }} /> Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* ── CONTENT ── */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 style={{ width: 28, height: 28, color: 'var(--blue)', animation: 'spin 0.85s linear infinite' }} />
          </div>

        ) : filtered.length === 0 ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', gap: '1rem', textAlign: 'center' }}>
            <Shield style={{ width: 44, height: 44, color: 'var(--text-ghost)' }} />
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)' }}>
              No suppliers found
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {search || riskFilter !== 'ALL' || typeFilter !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Add your first supplier to get started'}
            </div>
            {!search && riskFilter === 'ALL' && typeFilter === 'ALL' && (
              <button onClick={() => setShowForm(true)} className="btn-primary" style={{ marginTop: 8 }}>
                <Plus style={{ width: 14, height: 14 }} /> Add First Supplier
              </button>
            )}
          </div>

        ) : viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, paddingBottom: '1rem' }}>
            {filtered.map(s => (
              <SupplierCard
                key={s.id} s={s}
                onClick={() => navigate(`/suppliers/${s.id}`)}
                onAssess={() => navigate(`/assessment/${s.id}`)}
                onDelete={() => { if (confirm(`Delete ${s.name}?`)) deleteMutation.mutate(s.id) }}
              />
            ))}
          </div>

        ) : (
          /* TABLE */
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--surface)' }}>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {/* Checkbox */}
                    <th style={{ width: 40, padding: '11px 14px' }}>
                      <input
                        type="checkbox"
                        onChange={e => setSelected(e.target.checked ? new Set(filtered.map(s => s.id)) : new Set())}
                        checked={selected.size === filtered.length && filtered.length > 0}
                        style={{ accentColor: 'var(--blue)', cursor: 'pointer', width: 15, height: 15 }}
                      />
                    </th>
                    {[
                      { label: 'Supplier',    field: 'name' as const,      sortable: true  },
                      { label: 'Type',        field: null,                  sortable: false },
                      { label: 'Country',     field: null,                  sortable: false },
                      { label: 'Sector',      field: null,                  sortable: false },
                      { label: 'Criticality', field: null,                  sortable: false },
                      { label: 'Risk Score',  field: 'risk_score' as const, sortable: true  },
                      { label: 'Category',    field: null,                  sortable: false },
                      { label: 'Status',      field: null,                  sortable: false },
                      { label: 'Assessed',    field: null,                  sortable: false },
                      { label: 'Actions',     field: null,                  sortable: false },
                    ].map(col => (
                      <th
                        key={col.label}
                        className={`th${col.sortable ? ' sortable' : ''}`}
                        onClick={() => col.sortable && col.field && toggleSort(col.field)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          {col.label}
                          {col.sortable && col.field && sortField === col.field && (
                            sortDir === 'asc'
                              ? <ChevronUp style={{ width: 10, height: 10 }} />
                              : <ChevronDown style={{ width: 10, height: 10 }} />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => {
                    const status = getAssessmentStatus(s)
                    const sc     = scoreColor(s.risk_score || 0)
                    const isSel  = selected.has(s.id)
                    return (
                      <tr
                        key={s.id}
                        className={`sup-row${isSel ? ' selected' : ''}`}
                        onClick={() => navigate(`/suppliers/${s.id}`)}
                      >
                        <td className="td" style={{ padding: '11px 14px' }} onClick={e => { e.stopPropagation(); toggleSelect(s.id) }}>
                          <input type="checkbox" checked={isSel} onChange={() => toggleSelect(s.id)}
                            style={{ accentColor: 'var(--blue)', cursor: 'pointer', width: 15, height: 15 }} />
                        </td>

                        <td className="td">
                          <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>{s.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-ghost)', marginTop: 2 }}>{s.contact_email || '—'}</div>
                        </td>

                        <td className="td"><TypePill type={s.supplier_type} /></td>

                        <td className="td" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{s.country}</td>

                        <td className="td" style={{ color: 'var(--text-secondary)' }}>{s.sector}</td>

                        <td className="td">
                          <span className={getRiskBadgeClass(s.criticality)}>{s.criticality}</span>
                        </td>

                        <td className="td">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 56, height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.min(s.risk_score || 0, 100)}%`, background: sc, borderRadius: 4 }} />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: sc, minWidth: 32 }}>
                              {(s.risk_score || 0).toFixed(1)}
                            </span>
                          </div>
                        </td>

                        <td className="td">
                          <span className={getRiskBadgeClass(s.risk_category)}>{s.risk_category || 'N/A'}</span>
                        </td>

                        <td className="td"><StatusBadge status={status} /></td>

                        <td className="td" style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {s.assessment_count || 0}
                        </td>

                        <td className="td" onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 5 }}>
                            {[
                              { icon: ClipboardList, color: '#25A244', bg: 'rgba(48,209,88,0.09)',  hoverBg: 'rgba(48,209,88,0.18)',  action: () => navigate(`/assessment/${s.id}`), title: 'Assess' },
                              { icon: ChevronRight,  color: '#0A84FF', bg: 'rgba(10,132,255,0.09)', hoverBg: 'rgba(10,132,255,0.18)', action: () => navigate(`/suppliers/${s.id}`),  title: 'Detail' },
                              { icon: Trash2,        color: '#FF453A', bg: 'rgba(255,69,58,0.07)',  hoverBg: 'rgba(255,69,58,0.16)',  action: () => { if (confirm(`Delete ${s.name}?`)) deleteMutation.mutate(s.id) }, title: 'Delete' },
                            ].map(btn => (
                              <button
                                key={btn.title} onClick={btn.action} title={btn.title}
                                style={{ padding: '5px 8px', borderRadius: 7, border: `1px solid ${btn.color}22`, background: btn.bg, color: btn.color, cursor: 'pointer', lineHeight: 0, transition: 'all 0.15s' }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = btn.hoverBg}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = btn.bg}
                              >
                                <btn.icon style={{ width: 13, height: 13 }} />
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showForm && (
          <SupplierForm
            onClose={() => setShowForm(false)}
            onSuccess={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['suppliers'] }) }}
          />
        )}
      </div>
    </>
  )
}