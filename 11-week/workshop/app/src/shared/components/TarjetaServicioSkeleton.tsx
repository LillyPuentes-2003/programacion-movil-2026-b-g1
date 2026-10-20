import { IonSkeletonText } from '@ionic/react'

// Misma altura aproximada que TarjetaServicio, para que la lista no salte al pasar de loading a
// loaded (tarjeta-servicio.md).
export function TarjetaServicioSkeleton() {
  return (
    <div className="mc-card" style={{ cursor: 'default' }}>
      <div className="mc-thumb" aria-hidden="true" />
      <div style={{ minWidth: 0, flex: 1 }}>
        <IonSkeletonText animated style={{ width: '60%', height: '1.1rem' }} />
        <IonSkeletonText animated style={{ width: '40%' }} />
      </div>
    </div>
  )
}
