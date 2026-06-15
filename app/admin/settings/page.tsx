import { PasswordChangeForm } from '@/components/admin/PasswordChangeForm'
import { SettingsManager } from '@/components/admin/SettingsManager'
import { getAdminSession } from '@/actions/auth'
import { getSettings } from '@/actions/settings'

export const metadata = { title: 'Settings - Admin' }

export default async function SettingsPage() {
  const [session, settings] = await Promise.all([
    getAdminSession(),
    getSettings(),
  ])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Compte administrateur et configuration marketplace.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Informations du compte
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Nom', value: session?.profile.name ?? '-' },
              { label: 'Email', value: session?.profile.email ?? '-' },
              { label: 'Role', value: session?.profile.role ?? '-' },
              {
                label: 'Membre depuis',
                value: session?.profile.created_at
                  ? new Date(session.profile.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '-',
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-sm text-gray-900 font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        <PasswordChangeForm />
      </div>

      <div className="mt-6">
        <SettingsManager settings={settings} />
      </div>
    </div>
  )
}
