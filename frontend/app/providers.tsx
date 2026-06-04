'use client'

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { ApiStatus, UploadResponse, AnalysisResponse } from '@/types/api'
import { uploadPrescription, analysePrescription } from '@/services/api'

interface PrescriptionState {
  status: ApiStatus
  file: File | null
  previewUrl: string | null
  uploadResponse: UploadResponse | null
  analysis: AnalysisResponse | null
  uploadProgress: number
  error: string | null
  processingStep: string
}

const INITIAL: PrescriptionState = {
  status: 'idle', file: null, previewUrl: null,
  uploadResponse: null, analysis: null,
  uploadProgress: 0, error: null, processingStep: '',
}

const STEPS = [
  'Uploading image…', 'Running OCR on prescription…',
  'Identifying medicines…', 'Sending to Ollama LLM…',
  'Generating safety report…', 'Almost done…',
]

interface Ctx extends PrescriptionState {
  processFile: (file: File, age?: number, lang?: string) => Promise<void>
  reset: () => void
}

const PrescriptionContext = createContext<Ctx | null>(null)

export function PrescriptionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrescriptionState>(INITIAL)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const router = useRouter()

  const update = useCallback((patch: Partial<PrescriptionState>) =>
    setState(prev => ({ ...prev, ...patch })), [])

  const startSteps = useCallback(() => {
    let i = 0
    update({ processingStep: STEPS[0] })
    timerRef.current = setInterval(() => {
      i = Math.min(i + 1, STEPS.length - 1)
      update({ processingStep: STEPS[i] })
    }, 2500)
  }, [update])

  const stopSteps = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const processFile = useCallback(async (file: File, age?: number, lang = 'en') => {
    const previewUrl = URL.createObjectURL(file)
    update({ status: 'uploading', file, previewUrl, error: null, uploadProgress: 0, analysis: null, uploadResponse: null })

    try {
      const up = await uploadPrescription(file, age, lang, pct => update({ uploadProgress: pct }))
      update({ uploadResponse: up, uploadProgress: 100, status: 'analysing' })
      startSteps()
      const res = await analysePrescription(up.prescription_id, age, lang)
      stopSteps()
      update({ status: 'success', analysis: res, processingStep: '' })
      router.push('/results')
    } catch (err) {
      stopSteps()
      update({ status: 'error', error: err instanceof Error ? err.message : 'Error', processingStep: '' })
    }
  }, [update, startSteps, stopSteps, router])

  const reset = useCallback(() => {
    stopSteps()
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl)
    setState(INITIAL)
  }, [state.previewUrl, stopSteps])

  return (
    <PrescriptionContext.Provider value={{ ...state, processFile, reset }}>
      {children}
    </PrescriptionContext.Provider>
  )
}

export function usePrescription() {
  const ctx = useContext(PrescriptionContext)
  if (!ctx) throw new Error('usePrescription must be used within PrescriptionProvider')
  return ctx
}
