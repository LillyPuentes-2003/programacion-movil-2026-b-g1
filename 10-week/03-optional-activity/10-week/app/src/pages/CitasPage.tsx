import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react'
import { ApiError, citasApi, formatearFecha, type Cita, type NuevaCita } from '../api/citasApi'

const FORM_VACIO: NuevaCita = { cliente: '', servicio: '', fecha: '', hora: '' }

export default function CitasPage() {
  // Estado de la lista (GET)
  const [citas, setCitas] = useState<Cita[]>([])
  const [cargando, setCargando] = useState(true)
  const [errorLista, setErrorLista] = useState<string | null>(null)
  const [servicios, setServicios] = useState<string[]>([])

  // Estado del formulario (POST)
  const [form, setForm] = useState<NuevaCita>(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState<string | null>(null)
  const [erroresCampo, setErroresCampo] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setErrorLista(null)
    try {
      const [listaCitas, listaServicios] = await Promise.all([citasApi.listar(), citasApi.servicios()])
      setCitas(listaCitas)
      setServicios(listaServicios)
    } catch (e) {
      setErrorLista(e instanceof ApiError ? e.message : 'Ocurrió un error inesperado.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const cambiar = (campo: keyof NuevaCita, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }))
    setErroresCampo((prev) => ({ ...prev, [campo]: '' }))
  }

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    setErrorForm(null)
    setErroresCampo({})
    try {
      const creada = await citasApi.crear({ ...form, cliente: form.cliente.trim() })
      // Se agrega a la lista sin volver a pedirla y se mantiene el orden por fecha/hora
      setCitas((prev) =>
        [...prev, creada].sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`))
      )
      setForm(FORM_VACIO)
      setToast(`Cita de ${creada.cliente} agendada`)
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorForm(err.message)
        setErroresCampo(err.errores)
      } else {
        setErrorForm('Ocurrió un error inesperado.')
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>ManiCita · Citas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* ---------- Lista ---------- */}
        <h2>Próximas citas</h2>

        {cargando && (
          <div className="ion-text-center">
            <IonSpinner />
          </div>
        )}

        {!cargando && errorLista && (
          <IonCard color="light">
            <IonCardContent>
              <IonText color="danger">
                <p>{errorLista}</p>
              </IonText>
              <IonButton size="small" onClick={cargar}>
                Reintentar
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {!cargando && !errorLista && citas.length === 0 && <p>Todavía no hay citas agendadas.</p>}

        {!cargando && !errorLista && citas.length > 0 && (
          <IonList inset>
            {citas.map((cita) => (
              <IonItem key={cita.id} routerLink={`/citas/${cita.id}`} detail>
                <IonLabel>
                  <h3>{cita.cliente}</h3>
                  <p>{cita.servicio}</p>
                </IonLabel>
                <IonNote slot="end" className="ion-text-end">
                  {formatearFecha(cita.fecha)}
                  <br />
                  {cita.hora}
                </IonNote>
              </IonItem>
            ))}
          </IonList>
        )}

        {/* ---------- Formulario ---------- */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Agendar cita</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <form onSubmit={enviar} noValidate>
              <IonInput
                label="Nombre de la clienta"
                labelPlacement="stacked"
                value={form.cliente}
                onIonInput={(e) => cambiar('cliente', e.detail.value ?? '')}
                errorText={erroresCampo.cliente}
                className={erroresCampo.cliente ? 'ion-invalid ion-touched' : ''}
              />
              <IonSelect
                label="Servicio"
                labelPlacement="stacked"
                placeholder={servicios.length ? 'Elige un servicio' : 'Sin conexión'}
                value={form.servicio}
                onIonChange={(e) => cambiar('servicio', e.detail.value)}
                disabled={servicios.length === 0}
              >
                {servicios.map((s) => (
                  <IonSelectOption key={s} value={s}>
                    {s}
                  </IonSelectOption>
                ))}
              </IonSelect>
              {erroresCampo.servicio && (
                <IonText color="danger">
                  <small>{erroresCampo.servicio}</small>
                </IonText>
              )}
              <IonInput
                label="Fecha"
                labelPlacement="stacked"
                type="date"
                value={form.fecha}
                onIonInput={(e) => cambiar('fecha', e.detail.value ?? '')}
                errorText={erroresCampo.fecha}
                className={erroresCampo.fecha ? 'ion-invalid ion-touched' : ''}
              />
              <IonInput
                label="Hora (08:00 a 18:00)"
                labelPlacement="stacked"
                type="time"
                value={form.hora}
                onIonInput={(e) => cambiar('hora', e.detail.value ?? '')}
                errorText={erroresCampo.hora}
                className={erroresCampo.hora ? 'ion-invalid ion-touched' : ''}
              />

              {errorForm && (
                <IonText color="danger">
                  <p>{errorForm}</p>
                </IonText>
              )}

              <IonButton type="submit" expand="block" disabled={guardando} className="ion-margin-top">
                {guardando ? <IonSpinner name="dots" /> : 'Agendar'}
              </IonButton>
            </form>
          </IonCardContent>
        </IonCard>

        <IonToast isOpen={toast !== null} message={toast ?? ''} duration={2500} onDidDismiss={() => setToast(null)} />
      </IonContent>
    </IonPage>
  )
}
