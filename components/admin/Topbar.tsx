'use client'

import { useTransition } from 'react'
import { Bell, Search, LogOut, Settings } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { logoutAdmin } from '@/actions/auth'
import Link from 'next/link'

interface TopbarProps {
  profile: {
    email: string
    name: string | null
    avatar_url: string | null
  }
  unreadCount: number
}

export function Topbar({ profile, unreadCount }: TopbarProps) {
  const [isPending, startTransition] = useTransition()

  const initials = (profile.name ?? profile.email)
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAdmin()
    })
  }

  return (
    <header
      className="h-14 flex items-center px-6 gap-4 flex-shrink-0"
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--subtle)' }}
        />
        <Input
          placeholder="Rechercher..."
          className="pl-9 h-8 text-sm"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <Link href="/admin/notifications">
          <button
            className="relative p-2 rounded-lg transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--foreground)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-0.5 -right-0.5 w-4 h-4 p-0 text-[10px]
                  flex items-center justify-center rounded-full"
                style={{ background: 'var(--destructive)', color: '#fff' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </button>
        </Link>

        {/* Separator */}
        <div
          className="w-px h-5 mx-1"
          style={{ background: 'var(--border)' }}
        />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Avatar className="w-7 h-7">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback
                  className="text-xs font-semibold"
                  style={{
                    background: 'var(--primary-dim)',
                    color: 'var(--primary)',
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p
                  className="text-xs font-medium leading-none"
                  style={{ color: 'var(--foreground)' }}
                >
                  {profile.name ?? 'Admin'}
                </p>
                <p
                  className="text-[10px] mt-0.5 truncate max-w-[120px]"
                  style={{ color: 'var(--subtle)' }}
                >
                  {profile.email}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-48"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
            }}
          >
            <DropdownMenuLabel
              className="text-xs font-normal"
              style={{ color: 'var(--subtle)' }}
            >
              {profile.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator style={{ background: 'var(--border)' }} />
            <DropdownMenuItem asChild>
              <Link
                href="/admin/settings"
                className="flex items-center gap-2 cursor-pointer"
                style={{ color: 'var(--foreground)' }}
              >
                <Settings size={14} />
                Paramètres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ background: 'var(--border)' }} />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isPending}
              className="cursor-pointer"
              style={{ color: 'var(--destructive)' }}
            >
              <LogOut size={14} className="mr-2" />
              {isPending ? 'Déconnexion...' : 'Se déconnecter'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}