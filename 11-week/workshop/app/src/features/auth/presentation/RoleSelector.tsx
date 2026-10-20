import { useTranslation } from 'react-i18next'
import { IonIcon } from '@ionic/react'
import { calendarOutline, storefrontOutline } from 'ionicons/icons'

import type { UserRole } from '@core/domain/Session'

interface RoleSelectorProps {
  value?: UserRole
  onChange: (role: UserRole) => void
  isDisabled?: boolean
}

const OPTIONS: { role: UserRole; icon: string; labelKey: string; helpKey: string }[] = [
  { role: 'client', icon: calendarOutline, labelKey: 'registro.rol.clienta', helpKey: 'registro.rol.clientaAyuda' },
  { role: 'business', icon: storefrontOutline, labelKey: 'registro.rol.negocio', helpKey: 'registro.rol.negocioAyuda' },
]

// registro.md: la primera decisión del formulario. Se anuncia como grupo de opciones con la elegida
// marcada, y cada opción tiene texto e ícono: el rol no se distingue solo por color. Solo lo usa
// auth, así que vive en su presentation/ y no en shared/.
export function RoleSelector({ value, onChange, isDisabled = false }: RoleSelectorProps) {
  const { t } = useTranslation()

  return (
    <div role="radiogroup" aria-label={t('registro.rol.pregunta')} className="mc-role-group">
      {OPTIONS.map((option) => {
        const isSelected = value === option.role
        return (
          <button
            key={option.role}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className="mc-role-option"
            onClick={() => onChange(option.role)}
            disabled={isDisabled}
          >
            <IonIcon icon={option.icon} aria-hidden="true" className="mc-role-icon" />
            <span className="mc-text-label mc-role-label">{t(option.labelKey)}</span>
            <span className="mc-text-caption">{t(option.helpKey)}</span>
          </button>
        )
      })}
    </div>
  )
}
