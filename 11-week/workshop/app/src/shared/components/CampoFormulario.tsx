import { useId, useState, type HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import { IonIcon } from '@ionic/react'
import { alertCircleOutline, eyeOffOutline, eyeOutline } from 'ionicons/icons'

type KeyboardKind = 'texto' | 'correo' | 'telefono' | 'numero' | 'clave'

interface CampoFormularioProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  onBlur?: () => void
  error?: string
  helper?: string
  keyboardKind?: KeyboardKind
  isDisabled?: boolean
  autoComplete?: string
}

interface InputBehavior {
  type: string
  inputMode: HTMLAttributes<HTMLInputElement>['inputMode']
  autoCapitalize?: string
}

const BEHAVIOR: Record<KeyboardKind, InputBehavior> = {
  texto: { type: 'text', inputMode: 'text' },
  correo: { type: 'email', inputMode: 'email', autoCapitalize: 'off' },
  telefono: { type: 'tel', inputMode: 'tel' },
  numero: { type: 'text', inputMode: 'numeric' },
  clave: { type: 'password', inputMode: 'text', autoCapitalize: 'off' },
}

// campo-formulario.md: etiqueta siempre visible, el error siempre en el mismo lugar (bajo el campo,
// con ícono y texto, no solo el borde rojo) y anunciado al aparecer.
export function CampoFormulario({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  helper,
  keyboardKind = 'texto',
  isDisabled = false,
  autoComplete,
}: CampoFormularioProps) {
  const { t } = useTranslation()
  const inputId = useId()
  const messageId = `${inputId}-message`
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const behavior = BEHAVIOR[keyboardKind]
  const isPassword = keyboardKind === 'clave'
  const type = isPassword && isPasswordVisible ? 'text' : behavior.type
  const hasMessage = Boolean(error || helper)

  return (
    <div className="mc-field">
      <label htmlFor={inputId} className="mc-text-label">
        {label}
      </label>
      <div className="mc-field-box" data-invalid={error ? 'true' : undefined}>
        <input
          id={inputId}
          className="mc-field-input"
          type={type}
          inputMode={behavior.inputMode}
          autoCapitalize={behavior.autoCapitalize}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChangeText(event.target.value)}
          onBlur={onBlur}
          disabled={isDisabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
        />
        {isPassword && (
          <button
            type="button"
            className="mc-field-toggle"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-pressed={isPasswordVisible}
            aria-label={isPasswordVisible ? t('campo.clave.ocultar') : t('campo.clave.mostrar')}
            disabled={isDisabled}
          >
            <IonIcon icon={isPasswordVisible ? eyeOffOutline : eyeOutline} aria-hidden="true" />
          </button>
        )}
      </div>
      {error ? (
        <p id={messageId} className="mc-field-error" role="alert">
          <IonIcon icon={alertCircleOutline} aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : (
        helper && (
          <p id={messageId} className="mc-text-caption mc-field-helper">
            {helper}
          </p>
        )
      )}
    </div>
  )
}
