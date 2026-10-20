import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonPage,
  IonToolbar,
} from '@ionic/react'

import { useIsOnline } from '@core/network/useIsOnline'
import { routes } from '@core/routing/routes'
import { BotonPrimario } from '@shared/components/BotonPrimario'
import { CampoFormulario } from '@shared/components/CampoFormulario'

import { useAuthRepository, useSessionStorage } from '../data/authProviders'
import { emailFrom, homeFor, safeReturnTo, type AuthLocationState } from './authNavigation'
import { useLoginStore } from './useLoginStore'

// login.md · HU-09
export function LoginScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const repository = useAuthRepository()
  const storage = useSessionStorage()
  const isOnline = useIsOnline()
  const { status, failure, submit, reset } = useLoginStore()

  const [email, setEmail] = useState(() => emailFrom(location.state))
  const [password, setPassword] = useState('')

  const returnTo = safeReturnTo(location.state)
  const isSubmitting = status === 'submitting'
  const canSubmit = email.trim() !== '' && password !== '' && isOnline

  useEffect(() => {
    reset()
  }, [reset])

  async function handleSubmit() {
    if (!canSubmit || isSubmitting) return
    const user = await submit(repository, storage, { email, password })
    if (user) {
      navigate(returnTo ?? homeFor(user.role), { replace: true })
    }
  }

  function goToSignUp() {
    const state: AuthLocationState = { from: returnTo }
    navigate(routes.signUp.path, { state })
  }

  const emailError =
    failure?.kind === 'fields' ? failure.fieldErrors.email : undefined
  const passwordError =
    failure?.kind === 'credentials'
      ? failure.message || t('login.error.credenciales')
      : failure?.kind === 'fields'
        ? failure.fieldErrors.password
        : undefined

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={routes.catalog.path} text="" aria-label="Volver al catálogo" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="mc-content-bg">
        {/* Sin botón de envío dentro del formulario (el visible está en el pie), así que la tecla
            "ir" del teclado se atiende aquí. */}
        <form
          className="mc-form"
          noValidate
          onSubmit={(event) => event.preventDefault()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
              event.preventDefault()
              handleSubmit()
            }
          }}
        >
          <h1 className="mc-text-display" style={{ margin: 0 }}>
            {t('login.titulo')}
          </h1>
          <p className="mc-text-body mc-form-intro">{t('login.subtitulo')}</p>

          {!isOnline && (
            <div className="mc-banner" role="status">
              {t('auth.sinConexion.login')}
            </div>
          )}

          {failure?.kind === 'network' && (
            <div className="mc-banner mc-banner-error" role="alert">
              <span>{t('auth.error.red')}</span>
              <button type="button" className="mc-link" onClick={handleSubmit}>
                {t('auth.error.reintentar')}
              </button>
            </div>
          )}

          {failure?.kind === 'unexpected' && (
            <div className="mc-banner mc-banner-error" role="alert">
              {failure.message || t('auth.error.inesperado')}
            </div>
          )}

          <CampoFormulario
            label={t('login.campo.correo')}
            value={email}
            onChangeText={setEmail}
            keyboardKind="correo"
            autoComplete="email"
            error={emailError}
            isDisabled={isSubmitting}
          />
          <CampoFormulario
            label={t('login.campo.clave')}
            value={password}
            onChangeText={setPassword}
            keyboardKind="clave"
            autoComplete="current-password"
            error={passwordError}
            isDisabled={isSubmitting}
          />
        </form>
      </IonContent>
      <IonFooter className="ion-no-border mc-form-footer">
        <BotonPrimario
          label={t('login.boton.entrar')}
          onPress={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={!canSubmit}
          disabledReason={!isOnline ? t('auth.sinConexion.login') : undefined}
        />
        <p className="mc-text-body mc-form-alt">
          {t('login.sinCuenta')}{' '}
          <button type="button" className="mc-link" onClick={goToSignUp}>
            {t('login.crearCuenta')}
          </button>
        </p>
      </IonFooter>
    </IonPage>
  )
}
