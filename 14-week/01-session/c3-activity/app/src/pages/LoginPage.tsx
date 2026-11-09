import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'

import OfflineBanner from '../components/OfflineBanner'
import { ApiError } from '../core/apiClient'
import { useSession } from '../session/SessionContext'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const { session, login } = useSession()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/salons'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (session.status === 'authenticated') {
    return <Navigate to={from} replace />
  }

  const validate = () => {
    const errors: typeof fieldErrors = {}
    if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Escribe un correo válido.'
    if (!password) errors.password = 'La contraseña es obligatoria.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validate()) return
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      // Al cambiar la sesión, el <Navigate> de arriba lleva a la pantalla pedida.
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>ManiCita · Iniciar sesión</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <OfflineBanner />

        {session.status === 'anonymous' && session.reason === 'expired' && (
          <IonCard color="warning" role="alert">
            <IonCardContent>Tu sesión expiró. Inicia sesión de nuevo para continuar.</IonCardContent>
          </IonCard>
        )}

        <p>Ingresa para ver los salones de manicura más cercanos a ti.</p>

        <form onSubmit={handleSubmit} noValidate>
          <IonInput
            label="Correo"
            labelPlacement="stacked"
            type="email"
            inputmode="email"
            autocomplete="email"
            placeholder="tu@correo.com"
            value={email}
            onIonInput={(e) => setEmail(e.detail.value ?? '')}
            className={fieldErrors.email ? 'ion-invalid ion-touched' : ''}
            errorText={fieldErrors.email}
          />
          <IonInput
            label="Contraseña"
            labelPlacement="stacked"
            type="password"
            autocomplete="current-password"
            value={password}
            onIonInput={(e) => setPassword(e.detail.value ?? '')}
            className={fieldErrors.password ? 'ion-invalid ion-touched' : ''}
            errorText={fieldErrors.password}
          />

          {error && (
            <IonText color="danger" role="alert">
              <p>{error}</p>
            </IonText>
          )}

          <IonButton type="submit" expand="block" className="ion-margin-top" disabled={submitting}>
            {submitting ? <IonSpinner name="dots" aria-label="Ingresando" /> : 'Ingresar'}
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  )
}
