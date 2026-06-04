'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePrescription } from '@/hooks/usePrescription'
import type { AnalysisResponse, MedicineAnalysis } from '@/types/api'
import {
  UploadCloud, Download, Printer, RefreshCw, FileText,
  ChevronDown, AlertTriangle, ShieldAlert, Activity,
  CheckCircle, XCircle, AlertCircle, Pill, Clock,
  Repeat, Calendar, Info, Moon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'drowsy' | 'unsafe'

function SeverityBadge({ level }: { level: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    low:      { bg: 'rgba(13,205,170,0.1)',  text: '#0DCDAA' },
    medium:   { bg: 'rgba(245,158,11,0.1)',  text: '#F59E0B' },
    high:     { bg: 'rgba(249,115,22,0.12)', text: '#F97316' },
    critical: { bg: 'rgba(239,68,68,0.12)',  text: '#EF4444' },
  }
  const s = map[level] ?? map.low
  return (
    <span
      className="label-mono px-2 py-0.5 rounded-full"
      style={{ fontSize: '0.55rem', background: s.bg, color: s.text }}
    >
      {level.toUpperCase()}
    </span>
  )
}

function MedicineCard({ med, index }: { med: MedicineAnalysis; index: number }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: 'hsl(var(--border)/0.6)', background: 'hsl(var(--card))' }}
    >
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(13,205,170,0.1)' }}
          >
            <Pill className="w-4 h-4 text-[#0DCDAA]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base" style={{ color: 'hsl(var(--foreground))' }}>
                {med.medicine_name}
              </span>
              <SeverityBadge level={med.severity_level} />
              {med.causes_drowsiness && (
                <span
                  className="label-mono px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ fontSize: '0.55rem', background: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}
                >
                  <Moon className="w-2.5 h-2.5" /> DROWSY
                </span>
              )}
              {!med.dosage_safety_assessment.is_safe && (
                <span
                  className="label-mono px-2 py-0.5 rounded-full"
                  style={{ fontSize: '0.55rem', background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
                >
                  ⚠ DOSAGE CONCERN
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {med.dosage && (
                <span className="flex items-center gap-1 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  <Pill className="w-3 h-3" /> {med.dosage}
                </span>
              )}
              {med.frequency && (
                <span className="flex items-center gap-1 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  <Repeat className="w-3 h-3" /> {med.frequency}
                </span>
              )}
              {med.duration && (
                <span className="flex items-center gap-1 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  <Calendar className="w-3 h-3" /> {med.duration}
                </span>
              )}
            </div>
          </div>
        </div>
        <ChevronDown
          className={cn('w-4 h-4 shrink-0 transition-transform', open && 'rotate-180')}
          style={{ color: 'hsl(var(--muted-foreground))' }}
        />
      </button>

      {/* Body */}
      {open && (
        <div
          className="px-5 pb-5 space-y-4 border-t"
          style={{ borderColor: 'hsl(var(--border)/0.4)' }}
        >
          {/* Use case */}
          {med.use_case && (
            <div className="pt-4">
              <p className="label-mono mb-1.5" style={{ fontSize: '0.58rem', color: 'hsl(var(--muted-foreground))' }}>
                USED FOR
              </p>
              <p className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>{med.use_case}</p>
            </div>
          )}

          {/* Dosage safety */}
          <div
            className="rounded-xl p-3.5 flex items-start gap-3"
            style={{
              background: med.dosage_safety_assessment.is_safe
                ? 'rgba(13,205,170,0.06)' : 'rgba(239,68,68,0.06)',
              borderLeft: `3px solid ${med.dosage_safety_assessment.is_safe ? '#0DCDAA' : '#EF4444'}`,
            }}
          >
            {med.dosage_safety_assessment.is_safe
              ? <CheckCircle className="w-4 h-4 text-[#0DCDAA] shrink-0 mt-0.5" />
              : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            }
            <div>
              <p className="label-mono mb-1" style={{
                fontSize: '0.58rem',
                color: med.dosage_safety_assessment.is_safe ? '#0DCDAA' : '#EF4444',
              }}>
                DOSAGE {med.dosage_safety_assessment.is_safe ? 'SAFE' : 'CONCERN'}
              </p>
              <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Prescribed: <strong style={{ color: 'hsl(var(--foreground))' }}>
                  {med.dosage_safety_assessment.prescribed_dose || med.dosage}
                </strong>
                {med.dosage_safety_assessment.standard_dose && (
                  <> · Standard: <strong style={{ color: 'hsl(var(--foreground))' }}>
                    {med.dosage_safety_assessment.standard_dose}
                  </strong></>
                )}
              </p>
              {med.dosage_safety_assessment.notes.map((n, i) => (
                <p key={i} className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>• {n}</p>
              ))}
            </div>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Side effects */}
            {med.side_effects.length > 0 && (
              <div>
                <p className="label-mono mb-2" style={{ fontSize: '0.58rem', color: 'hsl(var(--muted-foreground))' }}>
                  COMMON SIDE EFFECTS
                </p>
                <div className="space-y-1">
                  {med.side_effects.map((se, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                      <span className="text-xs" style={{ color: 'hsl(var(--foreground))' }}>{se}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Serious side effects */}
            {med.serious_side_effects.length > 0 && (
              <div>
                <p className="label-mono mb-2" style={{ fontSize: '0.58rem', color: '#EF4444' }}>
                  SERIOUS SIDE EFFECTS
                </p>
                <div className="space-y-1">
                  {med.serious_side_effects.map((se, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <AlertCircle className="w-2.5 h-2.5 text-red-400 shrink-0" />
                      <span className="text-xs" style={{ color: 'hsl(var(--foreground))' }}>{se}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternatives */}
            {med.alternatives.length > 0 && (
              <div>
                <p className="label-mono mb-2" style={{ fontSize: '0.58rem', color: 'hsl(var(--muted-foreground))' }}>
                  ALTERNATIVES
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {med.alternatives.map((alt, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))', border: '0.5px solid hsl(var(--border))' }}
                    >
                      {alt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Age warnings */}
            {med.age_warnings.length > 0 && (
              <div>
                <p className="label-mono mb-2" style={{ fontSize: '0.58rem', color: '#F59E0B' }}>
                  AGE WARNINGS
                </p>
                <div className="space-y-1">
                  {med.age_warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <AlertTriangle className="w-2.5 h-2.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-xs" style={{ color: 'hsl(var(--foreground))' }}>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lifestyle recommendations */}
          {med.lifestyle_recommendations.length > 0 && (
            <div
              className="rounded-xl p-3.5"
              style={{ background: 'hsl(var(--secondary)/0.3)', border: '0.5px solid hsl(var(--border)/0.4)' }}
            >
              <p className="label-mono mb-2" style={{ fontSize: '0.58rem', color: 'hsl(var(--muted-foreground))' }}>
                LIFESTYLE RECOMMENDATIONS
              </p>
              <div className="space-y-1.5">
                {med.lifestyle_recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Info className="w-3 h-3 text-[#3A7FD4] shrink-0 mt-0.5" />
                    <span className="text-xs" style={{ color: 'hsl(var(--foreground))' }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ResultsPage() {
  const { analysis, uploadResponse, status } = usePrescription()
  const [showRaw, setShowRaw] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')

  // Guard: if no analysis in state (e.g. page refresh), show empty state
  if (!analysis || status !== 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center space-y-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border"
          style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }}
        >
          <FileText className="w-7 h-7" style={{ color: 'hsl(var(--muted-foreground))' }} />
        </div>
        <h2 className="text-xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>No Analysis Found</h2>
        <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Upload a prescription first to see your safety report here.
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
          style={{ background: '#0DCDAA', color: '#071A14' }}
        >
          <UploadCloud className="w-4 h-4" /> Upload Prescription
        </Link>
      </div>
    )
  }

  const filtered = analysis.medicines.filter((m) => {
    if (filter === 'drowsy') return m.causes_drowsiness
    if (filter === 'unsafe') return !m.dosage_safety_assessment.is_safe
    return true
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      {/* Header */}
      <div className="space-y-1.5">
        <p className="label-mono text-[#0DCDAA]" style={{ fontSize: '0.62rem' }}>ANALYSIS COMPLETE</p>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
          Prescription Safety Report
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="label-mono" style={{ fontSize: '0.6rem', color: 'hsl(var(--muted-foreground))' }}>
            🦙 Analysed by Ollama locally
          </span>
          {analysis.patient_age && (
            <>
              <span style={{ color: 'hsl(var(--border))' }}>·</span>
              <span className="label-mono" style={{ fontSize: '0.6rem', color: 'hsl(var(--muted-foreground))' }}>
                AGE: {analysis.patient_age}Y
              </span>
            </>
          )}
          <span style={{ color: 'hsl(var(--border))' }}>·</span>
          <span className="label-mono" style={{ fontSize: '0.6rem', color: 'hsl(var(--muted-foreground))' }}>
            {analysis.summary}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { value: analysis.total_medicines_analysed, label: 'Medicines',        color: '#0DCDAA', Icon: Activity      },
          { value: analysis.medicines.filter(m => m.causes_drowsiness).length,   label: 'Drowsiness Risk', color: '#8B5CF6', Icon: Moon },
          { value: analysis.medicines.filter(m => !m.dosage_safety_assessment.is_safe).length, label: 'Dosage Concerns', color: '#F97316', Icon: ShieldAlert },
          { value: analysis.medicines.filter(m => m.age_warnings.length > 0).length, label: 'Age Warnings', color: '#F59E0B', Icon: AlertTriangle },
        ].map(({ value, label, color, Icon }) => (
          <div
            key={label}
            className="rounded-xl border p-4 space-y-2"
            style={{ borderColor: 'hsl(var(--border)/0.6)', background: 'hsl(var(--card))' }}
          >
            <Icon className="w-4 h-4" style={{ color }} />
            <p className="text-2xl font-extrabold font-mono" style={{ color }}>{value}</p>
            <p className="label-mono" style={{ fontSize: '0.58rem', color: 'hsl(var(--muted-foreground))' }}>
              {label.toUpperCase()}
            </p>
          </div>
        ))}
      </div>

      {/* Global flags */}
      {(analysis.overall_drowsiness_warning || analysis.overall_dosage_concern || analysis.overall_age_warning) && (
        <div className="space-y-2">
          <p className="label-mono text-amber-400" style={{ fontSize: '0.62rem' }}>OVERALL WARNINGS</p>
          {analysis.overall_drowsiness_warning && (
            <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.06)' }}>
              <Moon className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <p className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>One or more medicines cause drowsiness. Avoid driving or operating machinery.</p>
            </div>
          )}
          {analysis.overall_dosage_concern && (
            <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ borderColor: 'rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.06)' }}>
              <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <p className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>A dosage concern was detected. Consult your pharmacist before taking.</p>
            </div>
          )}
          {analysis.overall_age_warning && (
            <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.06)' }}>
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>Age-specific warnings are present. Review the medicine cards below.</p>
            </div>
          )}
        </div>
      )}

      {/* Filter + actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="label-mono" style={{ fontSize: '0.58rem', color: 'hsl(var(--muted-foreground))' }}>FILTER:</span>
        {([
          { id: 'all' as Filter,    label: `All (${analysis.medicines.length})` },
          { id: 'drowsy' as Filter, label: 'Drowsy Risk' },
          { id: 'unsafe' as Filter, label: 'Dosage Concern' },
        ]).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className="label-mono px-3 py-1.5 rounded-lg border transition-colors"
            style={{
              fontSize: '0.6rem',
              background: filter === id ? 'rgba(13,205,170,0.1)' : 'hsl(var(--secondary))',
              borderColor: filter === id ? 'rgba(13,205,170,0.3)' : 'hsl(var(--border)/0.6)',
              color: filter === id ? '#0DCDAA' : 'hsl(var(--muted-foreground))',
            }}
          >
            {label.toUpperCase()}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowRaw(s => !s)}
            className="flex items-center gap-1.5 label-mono px-3 py-1.5 rounded-lg border"
            style={{ fontSize: '0.6rem', borderColor: 'hsl(var(--border)/0.6)', color: 'hsl(var(--muted-foreground))' }}
          >
            <FileText className="w-3 h-3" /> RAW OCR
            <ChevronDown className={cn('w-3 h-3 transition-transform', showRaw && 'rotate-180')} />
          </button>
          <Link href="/upload" className="flex items-center gap-1.5 label-mono px-3 py-1.5 rounded-lg border"
            style={{ fontSize: '0.6rem', borderColor: 'hsl(var(--border)/0.6)', color: 'hsl(var(--muted-foreground))' }}>
            <RefreshCw className="w-3 h-3" /> NEW
          </Link>
        </div>
      </div>

      {/* Raw OCR */}
      {showRaw && uploadResponse?.raw_text && (
        <div className="rounded-xl border p-4" style={{ borderColor: 'hsl(var(--border)/0.5)', background: '#0D0F14' }}>
          <p className="label-mono text-[#0DCDAA] mb-2" style={{ fontSize: '0.6rem' }}>EXTRACTED OCR TEXT</p>
          <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-auto" style={{ color: 'rgba(13,205,170,0.7)' }}>
            {uploadResponse.raw_text}
          </pre>
        </div>
      )}

      {/* Medicine cards */}
      <div className="space-y-4">
        <p className="label-mono" style={{ fontSize: '0.6rem', color: 'hsl(var(--muted-foreground))' }}>
          {filtered.length} MEDICINE{filtered.length !== 1 ? 'S' : ''} FOUND
        </p>
        {filtered.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border"
            style={{ borderColor: 'hsl(var(--border)/0.4)', background: 'hsl(var(--secondary)/0.15)' }}>
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>No medicines match this filter.</p>
          </div>
        ) : (
          filtered.map((med, i) => <MedicineCard key={med.medicine_name + i} med={med} index={i} />)
        )}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl border"
        style={{ borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)' }}>
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
          <strong className="text-amber-400">Medical Disclaimer: </strong>
          This analysis is generated by a local AI model for informational purposes only and does not constitute medical advice.
          Always consult your doctor or pharmacist before making any changes to your medication regimen.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pb-4">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border"
          style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
        >
          <Printer className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} /> Print Report
        </button>
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = `rx-report-${analysis.prescription_id}.json`; a.click()
            URL.revokeObjectURL(url)
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border"
          style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
        >
          <Download className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} /> Download JSON
        </button>
        <Link
          href="/upload"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm active:scale-95"
          style={{ background: '#0DCDAA', color: '#071A14' }}
        >
          <UploadCloud className="w-4 h-4" /> Analyse Another
        </Link>
      </div>
    </div>
  )
}
