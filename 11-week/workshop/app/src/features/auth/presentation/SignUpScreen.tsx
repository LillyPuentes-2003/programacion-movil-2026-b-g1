import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonPage,
  IonToolbar,
  useIonAlert,
  useIonToast,
} from '@ionic/react'
import { arrowBack } from 'ionicons/icons'

import type { UserRole } from '@core/domain/Session'
import { useIsOnline } from '@core/network/useIsOnline'
import { routes } from '@core/routing/routes'
import { BotonPrimario } from '@shared/components/BotonPrimario'
import { CampoFormulario } from '@shared/components/CampoFormulario'

import { useAuthRepository, useSessionStorage } from '../data/authProviders'
import type { SignUpInput } from '../domain/AuthRepository'
import {
  validateSignUp,
  validateSignUpField,
  type SignUpField,
} from '../domain/validateSignUp'
import { homeFor, safeReturnTo, type AuthLocationState } from './authNavigation'
import { RoleSelector } from './RoleSelector'
import { useSignUpStore } from './useSignUpStore'

type FormValues = Omit<SignUpInput, 'role'>

const EMPTY: Required<FormValues> = {
  name: '',
  phone: '',
  email: '',
  password: '',
  salonName: '',
  address: '',
}

// registro.md · HU-08
export function SignUpScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const repository = useAuthRepository()
  const storage = useSessionStorage()
  const isOnline = useIsOnline()
  const { status, failure, submit, reset } = useSignUpStore()
  const [presentToast] = useIonToast()
  const [presentAlert] = useIonAlert()

  // Todo lo escrito vive aquí: cambiar de rol solo muestra u oculta los campos del salón, y un
  // error de la API no toca este estado.
  const [role, setRole] = useState<UserRole>()
  const [values, setValues] = useState<Required<FormValues>>(EMPTY)
  const [touched, setTouched] = useState<Partial<Record<SignUpField, boolean>>>({})
  // Campos editados después del último envío: su error de la API ya no aplica.
  const [editedSinceSubmit, setEditedSinceSubmit] = useState<Partial<Record<string, boolean>>>({})

  const returnTo = safeReturnTo(location.state)
  const isSubmitting = status === 'submitting'
  const isBusiness = role === 'business'
  // El botón no se habilita mientras falte algo o haya un dato mal escrito (W11 CP6).
  const hasErrors = !role || Object.keys(validateSignUp(input())).length > 0

  useEffect(() => {
    reset()
  }, [reset])

  function input(): SignUpInput {
    return { role: role ?? 'client', ...values }
  }

  function setField(field: SignUpField, text: string) {
    setValues((current) => ({ ...current, [field]: text }))
    setEditedSinceSubmit((current) => ({ ...current, [field]: true }))
  }

  function touch(field: SignUpField) {
    setTouched((current) => ({ ...current, [field]: true }))
  }

  function errorFor(field: SignUpField): string | undefined {
    if (touched[field]) {
      const rule = validateSignUpField(field, input())
      if (rule) return t(`registro.validacion.${rule}`)
    }
    if (editedSinceSubmit[field]) return undefined
    if (field === 'email' && failure?.kind === 'emailTaken') {
      return failure.message || t('registro.error.correoTomado')
    }
    if (failure?.kind === 'fields') return failure.fieldErrors[field]
    return undefined
  }

  async function handleSubmit() {
    if (!role || !isOnline || isSubmitting) return

    const current = input()
    const errors = validateSignUp(current)
    setTouched({ name: true, phone: true, email: true, password: true, salonName: true, address: true })
    if (Object.keys(errors).length > 0) return

    setEditedSinceSubmit({})
    const user = await submit(repository, storage, current)
    if (user) {
      presentToast({ message: t('registro.exito'), duration: 2500, color: 'success', position: 'top' })
      navigate(returnTo ?? homeFor(user.role), { replace: true })
    }
  }

  function goToLogin(withEmail = false) {
    const state: AuthLocationState = { from: returnTo, email: withEmail ? values.email.trim() : undefined }
    navigate(routes.login.path, { state })
  }

  // Salir del registro borra lo escrito: si ya hay algo, se pide confirmación antes.
  function confirmLeave(leave: () => void) {
    if (!Object.values(values).some((value) => value.trim())) return leave()
    presentAlert({
      header: t('registro.salir.titulo'),
      message: t('registro.salir.mensaje'),
      buttons: [
        { text: t('registro.salir.quedarme'), role: 'cancel' },
        { text: t('registro.salir.salir'), role: 'destructive', handler: leave },
      ],
    })
  }

  const showEmailTakenLink = failure?.kind === 'emailTaken' && !editedSinceSubmit.email

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              aria-label="Volver al catálogo"
              onClick={() => confirmLeave(() => navigate(routes.catalog.path))}
            >
              <IonIcon slot="icon-only" icon={arrowBack} aria-hidden="true" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="mc-content-bg">
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
            {t('registro.titulo')}
          </h1>
          <p className="mc-text-body mc-form-intro">{t('registro.rol.pregunta')}</p>

          {/* Se avisa antes de que la persona llene todo, no después (registro.md). */}
          {!isOnline && (
            <div className="mc-banner" role="status">
              {t('auth.sinConexion.registro')}
            </div>
          )}

          <RoleSelector value={role} onChange={setRole} isDisabled={isSubmitting} />

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

          {role && (
            <>
              <CampoFormulario
                label={t('registro.campo.nombre')}
                value={values.name}
                onChangeText={(text) => setField('name', text)}
                onBlur={() => touch('name')}
                autoComplete="name"
                error={errorFor('name')}
                isDisabled={isSubmitting}
              />
              <CampoFormulario
                label={t('registro.campo.celular')}
                value={values.phone}
                onChangeText={(text) => setField('phone', text)}
                onBlur={() => touch('phone')}
                keyboardKind="telefono"
                autoComplete="tel-national"
                helper={t('registro.campo.celularAyuda')}
                error={errorFor('phone')}
                isDisabled={isSubmitting}
              />
              <CampoFormulario
                label={t('registro.campo.correo')}
                value={values.email}
                onChangeText={(text) => setField('email', text)}
                onBlur={() => touch('email')}
                keyboardKind="correo"
                autoComplete="email"
                error={errorFor('email')}
                isDisabled={isSubmitting}
              />
              {showEmailTakenLink && (
                <button type="button" className="mc-link mc-field-link" onClick={() => goToLogin(true)}>
                  {t('registro.error.irALogin')}
                </button>
              )}
              <CampoFormulario
                label={t('registro.campo.clave')}
                value={values.password}
                onChangeText={(text) => setField('password', text)}
                onBlur={() => touch('password')}
                keyboardKind="clave"
                autoComplete="new-password"
                helper={t('registro.campo.claveAyuda')}
                error={errorFor('password')}
                isDisabled={isSubmitting}
              />

              {isBusiness && (
                <>
                  <CampoFormulario
                    label={t('registro.campo.salon')}
                    value={values.salonName}
                    onChangeText={(text) => setField('salonName', text)}
                    onBlur={() => touch('salonName')}
                    autoComplete="organization"
                    error={errorFor('salonName')}
                    isDisabled={isSubmitting}
                  />
                  <CampoFormulario
                    label={t('registro.campo.direccion')}
                    value={values.address}
                    onChangeText={(text) => setField('address', text)}
                    onBlur={() => touch('address')}
                    autoComplete="street-address"
                    error={errorFor('address')}
                    isDisabled={isSubmitting}
                  />
                </>
              )}
            </>
          )}
        </form>
      </IonContent>
      <IonFooter className="ion-no-border mc-form-footer">
        <BotonPrimario
          label={t('registro.boton.crear')}
          onPress={handleSubmit}
          loadingLabel={t('registro.boton.creando')}
          isLoading={isSubmitting}
          isDisabled={!isOnline || hasErrors}
          disabledReason={
            !isOnline
              ? t('auth.sinConexion.registro')
              : !role
                ? t('registro.rol.elegirPrimero')
                : hasErrors
                  ? t('registro.boton.completarCampos')
                  : undefined
          }
        />
        <p className="mc-text-body mc-form-alt">
          {t('registro.conCuenta')}{' '}
          <button type="button" className="mc-link" onClick={() => confirmLeave(() => goToLogin())}>
            {t('registro.iniciarSesion')}
          </button>
        </p>
      </IonFooter>
    </IonPage>
  )
}
