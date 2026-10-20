import { IonSpinner } from '@ionic/react'

interface BotonPrimarioProps {
  label: string
  // Texto mientras se envía, p. ej. "Creando cuenta…" (W11 CP6)
  loadingLabel?: string
  onPress: () => void
  isLoading?: boolean
  isDisabled?: boolean
  disabledReason?: string
  fullWidth?: boolean
}

export function BotonPrimario({
  label,
  loadingLabel,
  onPress,
  isLoading = false,
  isDisabled = false,
  disabledReason,
  fullWidth = true,
}: BotonPrimarioProps) {
  return (
    <button
      className="mc-btn"
      style={fullWidth ? undefined : { width: 'auto' }}
      onClick={onPress}
      disabled={isDisabled || isLoading}
      aria-busy={isLoading}
      aria-label={isDisabled && disabledReason ? `${label}. ${disabledReason}` : undefined}
    >
      {isLoading ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <IonSpinner name="crescent" aria-hidden="true" style={{ width: 18, height: 18 }} />
          {loadingLabel ?? label}
        </span>
      ) : (
        label
      )}
    </button>
  )
}
