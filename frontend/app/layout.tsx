import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { PrescriptionProvider } from './providers'

export const metadata: Metadata = {
  title: 'RxExplain — AI Prescription Safety Assistant (Ollama)',
  description:
    'Upload your prescription and get instant AI-powered analysis running 100% locally via Ollama: medicine explanations, side effects, dosage warnings, and lifestyle recommendations.',
  keywords: ['prescription', 'medicine', 'drug interactions', 'side effects', 'healthcare AI', 'ollama', 'local AI'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="rx-bg-mesh antialiased">
        <div aria-hidden="true" className="fixed inset-0 pointer-events-none opacity-50 bg-grid" />
        <div className="relative min-h-screen flex flex-col">
          <Navbar />
          <PrescriptionProvider>
            <main className="flex-1 pt-16">{children}</main>
          </PrescriptionProvider>
          <Footer />
        </div>
      </body>
    </html>
  )
}
