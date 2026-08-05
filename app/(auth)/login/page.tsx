import { ShoppingBag } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Connexion Administration — Campus Market',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header Logo */}
        <div className="flex items-center gap-3 justify-center">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <ShoppingBag size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-lg leading-none">Campus Market</p>
            <p className="text-slate-400 text-xs mt-1 font-medium">Panel d&apos;administration</p>
          </div>
        </div>

        <LoginForm />

        <p className="text-center text-xs text-slate-400">
          Campus Market © {new Date().getFullYear()} — Accès sécurisé sans mot de passe
        </p>
      </div>
    </div>
  )
}
