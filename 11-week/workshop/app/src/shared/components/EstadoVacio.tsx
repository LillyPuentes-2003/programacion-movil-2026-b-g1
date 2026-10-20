interface EstadoVacioProps {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  icon?: string
}

export function EstadoVacio({ title, message, actionLabel, onAction, icon = '🔎' }: EstadoVacioProps) {
  return (
    <div className="mc-empty">
      <div className="mc-empty-art" aria-hidden="true">
        {icon}
      </div>
      <h4 className="mc-text-title" style={{ margin: '0 0 var(--space-sm)' }}>
        {title}
      </h4>
      {message && (
        <p
          className="mc-text-body"
          style={{
            color: 'var(--color-text-secondary)',
            margin: '0 auto var(--space-lg)',
            maxWidth: '26ch',
          }}
        >
          {message}
        </p>
      )}
      {actionLabel && onAction && (
        <button className="mc-btn" style={{ maxWidth: 220, margin: '0 auto' }} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
