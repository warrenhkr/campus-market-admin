'use client'

import { useState, useTransition, useRef } from 'react'
import { requestAdminOTP, verifyAdminOTP } from '@/actions/auth'
import { Mail, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react'

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()
  // Guard contre les doubles soumissions (React 19 dev mode / hot-reload)
  const submittingRef = useRef(false)

  const handleRequestOTP = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submittingRef.current || isPending) return   // double-submit guard
    setErrors({})
    setMessage(null)

    if (!email.trim()) {
      setErrors({ email: 'Veuillez saisir votre adresse email.' })
      return
    }

    submittingRef.current = true
    startTransition(async () => {
      try {
        const result = await requestAdminOTP(email)
        if (result.success) {
          setMessage(result.message)
          setStep('OTP')
        } else {
          setErrors(result.errors)
        }
      } finally {
        submittingRef.current = false
      }
    })
  }

  const handleVerifyOTP = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submittingRef.current || isPending) return  // double-submit guard
    setErrors({})

    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setErrors({ code: 'Veuillez saisir le code complet à 6 chiffres.' })
      return
    }

    submittingRef.current = true
    startTransition(async () => {
      try {
        const result = await verifyAdminOTP(email, otpCode)
        if (!result.success) {
          setErrors(result.errors)
        }
      } finally {
        submittingRef.current = false
      }
    })
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      {step === 'EMAIL' ? (
        <form onSubmit={handleRequestOTP} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Adresse email administrateur
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                placeholder="admin@campusmarket.bj"
                className={`w-full border rounded-xl px-3.5 py-2.5 pl-10 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                  errors.email ? 'border-red-300 bg-red-50/50' : 'border-slate-200 bg-white'
                }`}
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-500/30 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Envoi du code...
              </>
            ) : (
              'Recevoir mon code d\'accès'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="otpCode" className="block text-sm font-medium text-slate-700">
                Code d&apos;accès à 6 chiffres
              </label>
              <button
                type="button"
                onClick={() => {
                  setStep('EMAIL')
                  setErrors({})
                }}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Changer d&apos;email
              </button>
            </div>
            <div className="relative">
              <input
                id="otpCode"
                name="otpCode"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoFocus
                placeholder="123456"
                maxLength={6}
                className={`w-full border rounded-xl px-3.5 py-2.5 pl-10 text-center tracking-[0.4em] font-mono text-lg text-slate-900 placeholder-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                  errors.code ? 'border-red-300 bg-red-50/50' : 'border-slate-200 bg-white'
                }`}
              />
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            {errors.code && <p className="mt-1.5 text-xs text-red-600">{errors.code}</p>}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-emerald-500/30 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Vérification...
              </>
            ) : (
              'Valider et accéder au panel'
            )}
          </button>
        </form>
      )}
    </div>
  )
}