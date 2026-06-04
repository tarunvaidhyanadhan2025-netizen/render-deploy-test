import axios from 'axios'
import type { UploadResponse, AnalysisResponse } from '@/types/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 180_000, // 3 min — Ollama can be slow on first run
})

client.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      'Unexpected error'
    return Promise.reject(new Error(msg))
  }
)

// ── Upload prescription image → OCR ───────────────────────────────────────
export async function uploadPrescription(
  file: File,
  patientAge?: number,
  language = 'en',
  onProgress?: (pct: number) => void
): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)
  if (patientAge !== undefined) form.append('patient_age', String(patientAge))
  form.append('language', language)

  const { data } = await client.post<UploadResponse>('/api/v1/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (e.total && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    },
  })
  return data
}

// ── Run Ollama analysis ───────────────────────────────────────────────────
export async function analysePrescription(
  prescriptionId: string,
  patientAge?: number,
  language = 'en'
): Promise<AnalysisResponse> {
  const params: Record<string, string> = { language }
  if (patientAge !== undefined) params.patient_age = String(patientAge)

  const { data } = await client.get<AnalysisResponse>(
    `/api/v1/analysis/${prescriptionId}`,
    { params }
  )
  return data
}

// ── Health check ──────────────────────────────────────────────────────────
export async function healthCheck(): Promise<{ status: string; services: Record<string, unknown> }> {
  const { data } = await client.get('/api/v1/health')
  return data
}

export default client
