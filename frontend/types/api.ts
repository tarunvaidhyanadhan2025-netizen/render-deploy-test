// ── Upload ─────────────────────────────────────────────────────────────────
export type ApiStatus = 'idle' | 'uploading' | 'analysing' | 'success' | 'error'

export interface UploadResponse {
  prescription_id: string
  filename: string
  file_path: string
  raw_text: string
  detected_medicines: string[]
  patient_age: number | null
  language: string
  ocr_confidence: number
  message: string
}

// ── Analysis ───────────────────────────────────────────────────────────────
export interface DosageSafetyAssessment {
  is_safe: boolean
  prescribed_dose: string
  standard_dose: string
  notes: string[]
}

export interface MedicineAnalysis {
  medicine_name: string
  dosage: string
  frequency: string
  duration: string
  use_case: string
  side_effects: string[]
  serious_side_effects: string[]
  alternatives: string[]
  age_warnings: string[]
  causes_drowsiness: boolean
  lifestyle_recommendations: string[]
  dosage_safety_assessment: DosageSafetyAssessment
  severity_level: 'low' | 'medium' | 'high' | 'critical'
}

export interface AnalysisResponse {
  prescription_id: string
  patient_age: number | null
  language: string
  medicines: MedicineAnalysis[]
  overall_drowsiness_warning: boolean
  overall_dosage_concern: boolean
  overall_age_warning: boolean
  overall_severity: string
  total_medicines_analysed: number
  summary: string
}

export interface ApiError {
  error: string
  message: string
  path?: string
}
