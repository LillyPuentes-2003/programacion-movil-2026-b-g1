interface TarjetaServicioProps {
  name: string
  priceCop: number
  durationMinutes: number
  salonName: string
  imageUrl?: string
  badge?: 'publicado' | 'pausado'
  onPress: () => void
}

// Accesibilidad completa (rol anunciado como una sola unidad) queda para la segunda pasada —
// por ahora es un <button> real, que ya da rol y foco de teclado correctos gratis.
export function TarjetaServicio({
  name,
  priceCop,
  durationMinutes,
  salonName,
  imageUrl,
  badge,
  onPress,
}: TarjetaServicioProps) {
  const price = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(priceCop)

  return (
    <button className="mc-card" onClick={onPress} type="button">
      {imageUrl ? (
        <img className="mc-thumb" src={imageUrl} alt="" />
      ) : (
        <div className="mc-thumb" aria-hidden="true" />
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <p className="mc-text-label" style={{ margin: '0 0 3px' }}>
          {name}
        </p>
        <span className="mc-card-price">{price}</span>
        <p className="mc-text-caption" style={{ margin: '2px 0 0' }}>
          {durationMinutes} min · {salonName}
        </p>
        {badge && (
          <p className="mc-text-caption" style={{ margin: '4px 0 0' }}>
            {badge === 'publicado' ? 'Publicado' : 'Pausado'}
          </p>
        )}
      </div>
    </button>
  )
}
