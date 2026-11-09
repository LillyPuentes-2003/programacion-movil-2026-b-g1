import { IonIcon, IonText } from '@ionic/react'
import { cloudOfflineOutline } from 'ionicons/icons'

import { useOnline } from '../core/useOnline'

/** Franja visible en todas las pantallas mientras el dispositivo no tenga red. */
export default function OfflineBanner() {
  const online = useOnline()
  if (online) return null
  return (
    <div className="offline-banner" role="status" aria-live="polite">
      <IonIcon icon={cloudOfflineOutline} aria-hidden="true" />
      <IonText>Sin conexión. Algunas acciones no estarán disponibles.</IonText>
    </div>
  )
}
