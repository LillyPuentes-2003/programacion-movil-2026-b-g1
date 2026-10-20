interface BotonPrimarioProps {
  label: string
  onPress: () => void
  isLoading?: boolean
  isDisabled?: boolean
  disabledReason?: string
  fullWidth?: boolean
}

export function BotonPrimario({
  label,
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
      {isLoading ? '…' : label}
    </button>
  )
}
