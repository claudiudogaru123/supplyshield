import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { suppliersApi } from '../utils/api'
import type { Supplier } from '../types'
import { getRiskBadgeClass, getScoreColor } from '../utils/helpers'
import {
  Plus, Search, Trash2, ClipboardList, LayoutGrid, LayoutList,
  ChevronDown, ChevronUp, Loader2, AlertTriangle, Clock,
  CheckCircle, Download, Shield, ChevronRight, Users, Activity
} from 'lucide-react'
import SupplierForm from '../components/suppliers/SupplierForm'

function getAssessmentStatus(s: Supplier): 'overdue' | 'due-soon' | 'ok' | 'never' {
  if (!s.assessment_count) return 'never'
  if (s.risk_category === 'CRITICAL' && s.assessment_count < 2) return 'overdue'
  if (s.risk_score > 60) return 'due-soon'
  return 'ok'
}

function TypePill({ type }: { type: string }) {
  const cfg: Record<string, { bg: string; color: string; border: string }> = {
    IT:     { bg: 'rgba(34,211,238,0.12)',  color: '#22d3ee', border: 'rgba(34,211,238,0.3)' },
    OT:     { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: 'rgba(167,139,250,0.3)' },
    HYBRID: { bg: 'rgba(57,231,95,0.12)',   color: '#39e75f', border: 'rgba(57,231,95,0.3)' },
  }
  const c = cfg[type] || cfg.IT
  return (
    <span style={{
      fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.62rem',
      letterSpacing: '0.1em', padding: '3px 9px', borderRadius: '5px',
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>{type}</span>
  )
}

function StatusBadge({ status }: { status: ReturnType<typeof getAssessmentStatus> }) {
  const cfg = {
    never:    { icon: AlertTriangle, color: '#ff2d55', label: 'NEVER',    bg: 'rgba(255,45,85,0.1)'  },
    overdue:  { icon: Clock,         color: '#ff6b35', label: 'OVERDUE',  bg: 'rgba(255,107,53,0.1)' },
    'due-soon':{ icon: Clock,        color: '#ffd60a', label: 'DUE SOON', bg: 'rgba(255,214,10,0.1)' },
    ok:       { icon: CheckCircle,   color: '#39e75f', label: 'OK',       bg: 'rgba(57,231,95,0.1)'  },
  }[status]
  const Icon = cfg.icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '5px', background: cfg.bg }}>
      <Icon style={{ width: 11, height: 11, color: cfg.color, flexShrink: 0 }} />
      <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.1em', color: cfg.color }}>{cfg.label}</span>
    </span>
  )
}

function SupplierCard({ s, onAssess, onDelete, onClick }: {
  s: Supplier; onAssess: () => void; onDelete: () => void; onClick: () => void
}) {
  const status = getAssessmentStatus(s)
  const sc = getScoreColor(s.risk_score || 0)
  return (
    <div onClick={onClick} style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px', padding: '1.25rem',
      cursor: 'pointer', transition: 'all 0.25s', position: 'relative', overflow: 'hidden',
      backdropFilter: 'blur(10px)',
    }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = `${sc}50`
        el.style.transform = 'translateY(-3px)'
        el.style.boxShadow = `0 12px 40px rgba(0,0,0,0.3), 0 0 24px ${sc}15`
        el.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'rgba(255,255,255,0.08)'
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
        el.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)'
      }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${sc}, transparent)`, opacity: 0.8 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <TypePill type={s.supplier_type} />
            <StatusBadge status={status} />
          </div>
          <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{s.country} · {s.sector}</div>
        </div>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0, border: `2px solid ${sc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${sc}12`, marginLeft: '10px' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.8rem', color: sc }}>{(s.risk_score || 0).toFixed(0)}</span>
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(s.risk_score || 0, 100)}%`, background: sc, borderRadius: '2px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)' }}>RISK</span>
          <span className={getRiskBadgeClass(s.risk_category)}>{s.risk_category}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
        <button onClick={onAssess} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '6px', fontSize: '0.7rem' }}>
          <ClipboardList style={{ width: 12, height: 12 }} /> Assess
        </button>
        <button onClick={() => {}} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(34,211,238,0.2)', background: 'rgba(34,211,238,0.08)', color: '#22d3ee', cursor: 'pointer', lineHeight: 0 }}>
          <ChevronRight style={{ width: 13, height: 13 }} />
        </button>
        <button onClick={onDelete} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,45,85,0.2)', background: 'rgba(255,45,85,0.08)', color: '#ff6b8a', cursor: 'pointer', lineHeight: 0 }}>
          <Trash2 style={{ width: 13, height: 13 }} />
        </button>
      </div>
    </div>
  )
}

export default function SuppliersPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [sortField, setSortField] = useState<'risk_score' | 'name'>('risk_score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const { data: suppliers = [], isLoading } = useQuery({ queryKey: ['suppliers'], queryFn: suppliersApi.getAll })

  const deleteMutation = useMutation({
    mutationFn: suppliersApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  })

  const stats = {
    total: suppliers.length,
    critical: suppliers.filter((s: Supplier) => s.risk_category === 'CRITICAL').length,
    high: suppliers.filter((s: Supplier) => s.risk_category === 'HIGH').length,
    unassessed: suppliers.filter((s: Supplier) => !s.assessment_count).length,
    overdue: suppliers.filter((s: Supplier) => getAssessmentStatus(s) === 'overdue').length,
  }

  const filtered = (suppliers as Supplier[])
    .filter(s => {
      const q = search.toLowerCase()
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

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const exportCSV = () => {
    const csv = ['Name,Type,Country,Sector,Criticality,Risk Score,Risk Category,Assessments',
      ...filtered.map(s => [s.name, s.supplier_type, s.country, s.sector, s.criticality, s.risk_score?.toFixed(1), s.risk_category, s.assessment_count].join(','))
    ].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `suppliers-${new Date().toISOString().split('T')[0]}.csv`; a.click()
  }

  const RISK_FILTERS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
  const TYPE_FILTERS = ['ALL', 'IT', 'OT', 'HYBRID']
  const RC: Record<string, string> = { CRITICAL: '#ff2d55', HIGH: '#ff6b35', MEDIUM: '#ffd60a', LOW: '#39e75f', ALL: '#39e75f' }

  // Shared glass card style
  const glassCard = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    backdropFilter: 'blur(12px)',
  }

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(57,231,95,0.15)', border: '1px solid rgba(57,231,95,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users style={{ width: 16, height: 16, color: '#39e75f' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'white', lineHeight: 1 }}>
                Supplier Registry
              </h1>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em', marginTop: '2px' }}>
                {stats.total} suppliers · {stats.critical} critical · {stats.unassessed} unassessed
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={exportCSV} className="btn-secondary" style={{ fontSize: '0.75rem' }}>
            <Download style={{ width: 13, height: 13 }} /> Export
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ fontSize: '0.8rem' }}>
            <Plus style={{ width: 14, height: 14 }} /> Add Supplier
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
        {[
          { label: 'Total',       value: stats.total,       color: '#39e75f', icon: Users },
          { label: 'Critical',    value: stats.critical,    color: '#ff2d55', icon: AlertTriangle },
          { label: 'High Risk',   value: stats.high,        color: '#ff6b35', icon: Activity },
          { label: 'Unassessed',  value: stats.unassessed,  color: '#ffd60a', icon: Clock },
          { label: 'Overdue',     value: stats.overdue,     color: '#ff6b35', icon: Clock },
        ].map(item => (
          <div key={item.label} style={{ ...glassCard, padding: '0.875rem 1rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${item.color}, transparent)`, opacity: 0.5 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.5rem', color: item.color, lineHeight: 1 }}>{item.value}</div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{item.label}</div>
              </div>
              <item.icon style={{ width: 16, height: 16, color: item.color, opacity: 0.5 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search style={{ width: 13, height: 13, position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
          <input className="input" placeholder="Search suppliers, sector, country..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '34px', fontSize: '0.82rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {RISK_FILTERS.map(f => (
            <button key={f} onClick={() => setRiskFilter(f)} style={{
              padding: '5px 10px', borderRadius: '7px', cursor: 'pointer',
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.1em',
              border: `1px solid ${riskFilter === f ? RC[f] + '50' : 'rgba(255,255,255,0.08)'}`,
              background: riskFilter === f ? `${RC[f]}15` : 'rgba(255,255,255,0.03)',
              color: riskFilter === f ? RC[f] : 'rgba(255,255,255,0.35)',
              transition: 'all 0.15s',
            }}>{f}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {TYPE_FILTERS.map(f => (
            <button key={f} onClick={() => setTypeFilter(f)} style={{
              padding: '5px 10px', borderRadius: '7px', cursor: 'pointer',
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.1em',
              border: `1px solid ${typeFilter === f ? 'rgba(34,211,238,0.5)' : 'rgba(255,255,255,0.08)'}`,
              background: typeFilter === f ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.03)',
              color: typeFilter === f ? '#22d3ee' : 'rgba(255,255,255,0.35)',
              transition: 'all 0.15s',
            }}>{f}</button>
          ))}
        </div>

        <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[{ mode: 'table', icon: LayoutList }, { mode: 'grid', icon: LayoutGrid }].map(({ mode, icon: Icon }) => (
            <button key={mode} onClick={() => setViewMode(mode as 'table' | 'grid')} style={{
              padding: '6px 11px', border: 'none', cursor: 'pointer', lineHeight: 0,
              background: viewMode === mode ? 'rgba(57,231,95,0.15)' : 'rgba(255,255,255,0.03)',
              color: viewMode === mode ? '#39e75f' : 'rgba(255,255,255,0.3)', transition: 'all 0.15s',
            }}>
              <Icon style={{ width: 14, height: 14 }} />
            </button>
          ))}
        </div>
      </div>

      {/* Results info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>
          {filtered.length} of {suppliers.length} suppliers{(riskFilter !== 'ALL' || typeFilter !== 'ALL' || search) ? ' · filtered' : ''}
        </span>
        {selected.size > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: '#39e75f' }}>{selected.size} selected</span>
            <button onClick={() => { if (confirm(`Delete ${selected.size} suppliers?`)) { selected.forEach(id => deleteMutation.mutate(id)); setSelected(new Set()) } }}
              className="btn-danger" style={{ fontSize: '0.7rem', padding: '4px 10px' }}>
              <Trash2 style={{ width: 12, height: 12 }} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 style={{ width: 28, height: 28, color: '#39e75f', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...glassCard, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', gap: '1rem' }}>
          <Shield style={{ width: 44, height: 44, color: 'rgba(255,255,255,0.1)' }} />
          <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)' }}>NO SUPPLIERS FOUND</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.15)' }}>
            {search || riskFilter !== 'ALL' || typeFilter !== 'ALL' ? 'Try adjusting your filters' : 'Add your first supplier to get started'}
          </div>
          {!search && riskFilter === 'ALL' && typeFilter === 'ALL' && (
            <button onClick={() => setShowForm(true)} className="btn-primary" style={{ marginTop: '8px' }}>
              <Plus style={{ width: 14, height: 14 }} /> Add First Supplier
            </button>
          )}
        </div>

      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', paddingBottom: '1rem' }}>
          {filtered.map(s => (
            <SupplierCard key={s.id} s={s}
              onClick={() => navigate(`/suppliers/${s.id}`)}
              onAssess={() => navigate(`/assessment/${s.id}`)}
              onDelete={() => { if (confirm(`Delete ${s.name}?`)) deleteMutation.mutate(s.id) }} />
          ))}
        </div>

      ) : (
        <div style={{ ...glassCard, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ width: '36px', padding: '11px 14px' }}>
                    <input type="checkbox"
                      onChange={e => setSelected(e.target.checked ? new Set(filtered.map(s => s.id)) : new Set())}
                      checked={selected.size === filtered.length && filtered.length > 0}
                      style={{ accentColor: '#39e75f', cursor: 'pointer' }} />
                  </th>
                  {[
                    { label: 'Supplier',    field: 'name' as const,       sortable: true  },
                    { label: 'Type',        field: null,                   sortable: false },
                    { label: 'Country',     field: null,                   sortable: false },
                    { label: 'Sector',      field: null,                   sortable: false },
                    { label: 'Criticality', field: null,                   sortable: false },
                    { label: 'Risk Score',  field: 'risk_score' as const,  sortable: true  },
                    { label: 'Category',    field: null,                   sortable: false },
                    { label: 'Status',      field: null,                   sortable: false },
                    { label: 'Assessments', field: null,                   sortable: false },
                    { label: 'Actions',     field: null,                   sortable: false },
                  ].map(col => (
                    <th key={col.label}
                      onClick={() => col.sortable && col.field && toggleSort(col.field)}
                      style={{
                        fontFamily: 'Rajdhani, sans-serif', fontSize: '0.62rem', fontWeight: 700,
                        letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
                        padding: '11px 10px 11px 0', textAlign: 'left', whiteSpace: 'nowrap',
                        cursor: col.sortable ? 'pointer' : 'default',
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
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
                  const sc = getScoreColor(s.risk_score || 0)
                  const isSel = selected.has(s.id)
                  return (
                    <tr key={s.id} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: isSel ? 'rgba(57,231,95,0.04)' : 'transparent',
                      transition: 'background 0.15s', cursor: 'pointer',
                    }}
                      onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)' }}
                      onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>

                      <td style={{ padding: '12px 14px' }} onClick={e => { e.stopPropagation(); toggleSelect(s.id) }}>
                        <input type="checkbox" checked={isSel} onChange={() => toggleSelect(s.id)}
                          style={{ accentColor: '#39e75f', cursor: 'pointer' }} />
                      </td>

                      <td style={{ padding: '12px 10px 12px 0' }} onClick={() => navigate(`/suppliers/${s.id}`)}>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.82rem', color: '#39e75f', marginBottom: '2px' }}>{s.name}</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.57rem', color: 'rgba(255,255,255,0.2)' }}>{s.contact_email || '—'}</div>
                      </td>

                      <td style={{ padding: '12px 10px 12px 0' }}><TypePill type={s.supplier_type} /></td>

                      <td style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', padding: '12px 10px 12px 0', whiteSpace: 'nowrap' }}>{s.country}</td>

                      <td style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', padding: '12px 10px 12px 0' }}>{s.sector}</td>

                      <td style={{ padding: '12px 10px 12px 0' }}>
                        <span className={getRiskBadgeClass(s.criticality)}>{s.criticality}</span>
                      </td>

                      <td style={{ padding: '12px 10px 12px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '60px', height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(s.risk_score || 0, 100)}%`, background: sc, borderRadius: '2px' }} />
                          </div>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.78rem', color: sc, minWidth: '32px' }}>
                            {(s.risk_score || 0).toFixed(1)}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '12px 10px 12px 0' }}>
                        <span className={getRiskBadgeClass(s.risk_category)}>{s.risk_category || 'N/A'}</span>
                      </td>

                      <td style={{ padding: '12px 10px 12px 0' }}>
                        <StatusBadge status={status} />
                      </td>

                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', padding: '12px 10px 12px 0', textAlign: 'center' }}>
                        {s.assessment_count || 0}
                      </td>

                      <td style={{ padding: '12px 10px 12px 0' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {[
                            { icon: ClipboardList, color: '#39e75f', bg: 'rgba(57,231,95,0.1)',  hoverBg: 'rgba(57,231,95,0.2)',  action: () => navigate(`/assessment/${s.id}`), title: 'Assess' },
                            { icon: ChevronRight,  color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', hoverBg: 'rgba(34,211,238,0.2)', action: () => navigate(`/suppliers/${s.id}`),  title: 'Detail' },
                            { icon: Trash2,        color: '#ff6b8a', bg: 'rgba(255,45,85,0.08)', hoverBg: 'rgba(255,45,85,0.18)', action: () => { if (confirm(`Delete ${s.name}?`)) deleteMutation.mutate(s.id) }, title: 'Delete' },
                          ].map(btn => (
                            <button key={btn.title} onClick={btn.action} title={btn.title}
                              style={{ padding: '5px 7px', borderRadius: '6px', border: `1px solid ${btn.color}25`, background: btn.bg, color: btn.color, cursor: 'pointer', lineHeight: 0, transition: 'all 0.15s' }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = btn.hoverBg}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = btn.bg}>
                              <btn.icon style={{ width: 12, height: 12 }} />
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
  )
}