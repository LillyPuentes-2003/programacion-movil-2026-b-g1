import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
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

import {
  ApiError,
  SERVICE_TYPE_LABELS,
  formatPrice,
  servicesApi,
  type Service,
  type ServiceType,
} from '../api/servicesApi'

const EMPTY_FORM = { name: '', type: '' as ServiceType | '', price: '', durationMinutes: '' }

export default function ServiceListPage() {
  const navigate = useNavigate()

  // Estado de la lista (GET)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Estado del formulario (POST)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)

  const loadServices = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      setServices(await servicesApi.list())
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadServices()
  }, [loadServices])

  const updateField = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    setFieldErrors({})
    try {
      const created = await servicesApi.create({
        name: form.name,
        type: form.type as ServiceType,
        price: Number(form.price),
        durationMinutes: Number(form.durationMinutes),
      })
      setServices((prev) => [...prev, created])
      setForm(EMPTY_FORM)
      setToast(`Servicio "${created.name}" creado.`)
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setFormError('Ocurrió un error inesperado.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>ManiCita · Servicios</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* ---------- Listado (GET) ---------- */}
        <h2>Servicios disponibles</h2>

        {loading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
            <p>Cargando servicios…</p>
          </div>
        )}

        {!loading && loadError && (
          <IonCard color="danger">
            <IonCardContent>
              <p>{loadError}</p>
              <IonButton fill="outline" color="light" onClick={loadServices}>
                Reintentar
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {!loading && !loadError && services.length === 0 && (
          <IonText color="medium">
            <p>Aún no hay servicios. Crea el primero con el formulario.</p>
          </IonText>
        )}

        {!loading && !loadError && services.length > 0 && (
          <IonList inset>
            {services.map((service) => (
              <IonItem key={service.id} button detail onClick={() => navigate(`/services/${service.id}`)}>
                <IonLabel>
                  <h3>{service.name}</h3>
                  <p>
                    {SERVICE_TYPE_LABELS[service.type]} · {service.durationMinutes} min
                  </p>
                </IonLabel>
                <IonNote slot="end">{formatPrice(service.price)}</IonNote>
              </IonItem>
            ))}
          </IonList>
        )}

        {/* ---------- Formulario (POST) ---------- */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Nuevo servicio</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <form onSubmit={handleSubmit} noValidate>
              <IonInput
                label="Nombre"
                labelPlacement="stacked"
                placeholder="Ej: Manicure francesa"
                value={form.name}
                onIonInput={(e) => updateField('name', e.detail.value ?? '')}
                className={fieldErrors.name ? 'ion-invalid ion-touched' : ''}
                errorText={fieldErrors.name}
              />
              <IonSelect
                label="Tipo"
                labelPlacement="stacked"
                placeholder="Selecciona un tipo"
                value={form.type}
                onIonChange={(e) => updateField('type', e.detail.value)}
              >
                {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                  <IonSelectOption key={value} value={value}>
                    {label}
                  </IonSelectOption>
                ))}
              </IonSelect>
              {fieldErrors.type && (
                <IonText color="danger">
                  <small>{fieldErrors.type}</small>
                </IonText>
              )}
              <IonInput
                label="Precio (COP)"
                labelPlacement="stacked"
                type="number"
                inputmode="numeric"
                placeholder="Ej: 30000"
                value={form.price}
                onIonInput={(e) => updateField('price', e.detail.value ?? '')}
                className={fieldErrors.price ? 'ion-invalid ion-touched' : ''}
                errorText={fieldErrors.price}
              />
              <IonInput
                label="Duración (minutos)"
                labelPlacement="stacked"
                type="number"
                inputmode="numeric"
                placeholder="Ej: 60"
                value={form.durationMinutes}
                onIonInput={(e) => updateField('durationMinutes', e.detail.value ?? '')}
                className={fieldErrors.durationMinutes ? 'ion-invalid ion-touched' : ''}
                errorText={fieldErrors.durationMinutes}
              />

              {formError && (
                <IonText color="danger">
                  <p>{formError}</p>
                </IonText>
              )}

              <IonButton type="submit" expand="block" className="ion-margin-top" disabled={saving}>
                {saving ? <IonSpinner name="dots" /> : 'Crear servicio'}
              </IonButton>
            </form>
          </IonCardContent>
        </IonCard>

        <IonToast isOpen={toast !== null} message={toast ?? ''} duration={2000} onDidDismiss={() => setToast(null)} />
      </IonContent>
    </IonPage>
  )
}
