import { useState } from 'react'
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/react'

interface SaludoProps {
  /** Nombre que se muestra en el saludo */
  nombre: string
  /** Texto opcional debajo del nombre */
  rol?: string
}

// Componente reutilizable: recibe el nombre por props y tiene un botón
// que alterna entre el saludo y la despedida (estado local con useState).
export default function Saludo({ nombre, rol }: SaludoProps) {
  const [saludando, setSaludando] = useState(true)

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{saludando ? `¡Hola, ${nombre}!` : `¡Hasta luego, ${nombre}!`}</IonCardTitle>
        {rol && <IonCardSubtitle>{rol}</IonCardSubtitle>}
      </IonCardHeader>
      <IonCardContent>
        <IonButton expand="block" onClick={() => setSaludando(!saludando)}>
          {saludando ? 'Despedirme' : 'Saludar otra vez'}
        </IonButton>
      </IonCardContent>
    </IonCard>
  )
}
