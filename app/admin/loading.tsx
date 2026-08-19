export default function AdminLoading() {
  return (
    <div
      className="flex h-screen w-full items-center justify-center"
      style={{ background: 'var(--background)' }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinner violet */}
        <div
          className="w-10 h-10 rounded-full border-4 animate-spin"
          style={{
            borderColor: 'var(--primary-border)',
            borderTopColor: 'var(--primary)',
          }}
        />
        <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
          Chargement du panneau admin…
        </p>
      </div>
    </div>
  )
}
