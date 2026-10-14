import { useEffect, useState } from 'react'
import {
  IonBadge,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonSearchbar,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { checkmarkCircle, ellipseOutline } from 'ionicons/icons'
import { listarTareas, TAREAS_LOCALES, type Tarea } from '../api/tareasApi'

export default function ListaTareasPage() {
  // Estado de la pantalla con useState
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [cargando, setCargando] = useState(true)
  const [aviso, setAviso] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [vecesRecargada, setVecesRecargada] = useState(0) // contador

  // Carga la lista desde la API de la semana 8; si falla, usa la lista local.
  useEffect(() => {
    let activo = true
    setCargando(true)
    listarTareas()
      .then((datos) => {
        if (!activo) return
        setTareas(datos)
        setAviso(null)
      })
      .catch((error: Error) => {
        if (!activo) return
        setTareas(TAREAS_LOCALES)
        setAviso(`${error.message} Se muestran datos locales.`)
      })
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [vecesRecargada])

  const filtradas = tareas.filter((t) => t.titulo.toLowerCase().includes(busqueda.toLowerCase()))
  const hechas = tareas.filter((t) => t.completada).length

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mis tareas</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            placeholder="Buscar tarea"
            value={busqueda}
            onIonInput={(e) => setBusqueda(e.detail.value ?? '')}
          />
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {aviso && (
          <IonText color="warning">
            <p>{aviso}</p>
          </IonText>
        )}

        <p>
          Completadas: <strong>{hechas}</strong> de {tareas.length} · Mostrando {filtradas.length}
        </p>

        {cargando ? (
          <div className="ion-text-center">
            <IonSpinner />
          </div>
        ) : (
          <IonList inset>
            {filtradas.map((tarea) => (
              // routerLink navega a la 2.ª página con el id en la URL
              <IonItem key={tarea.id} routerLink={`/tareas/${tarea.id}`} detail>
                <IonIcon
                  slot="start"
                  icon={tarea.completada ? checkmarkCircle : ellipseOutline}
                  color={tarea.completada ? 'success' : 'medium'}
                />
                <IonLabel>{tarea.titulo}</IonLabel>
                <IonNote slot="end">#{tarea.id}</IonNote>
              </IonItem>
            ))}
            {filtradas.length === 0 && (
              <IonItem>
                <IonLabel color="medium">Ninguna tarea coincide con «{busqueda}».</IonLabel>
              </IonItem>
            )}
          </IonList>
        )}

        <IonButton expand="block" fill="outline" onClick={() => setVecesRecargada(vecesRecargada + 1)}>
          Recargar lista
          <IonBadge slot="end" color="primary" style={{ marginLeft: 8 }}>
            {vecesRecargada}
          </IonBadge>
        </IonButton>
      </IonContent>
    </IonPage>
  )
}
