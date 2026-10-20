import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import esCO from './es-CO.json'
import en from './en.json'

// es-CO es el idioma real de las usuarias (i18n.md); en es la red de seguridad si el
// dispositivo está en inglés.
i18next.use(initReactI18next).init({
  resources: {
    'es-CO': { translation: esCO },
    en: { translation: en },
  },
  lng: 'es-CO',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export { i18next }
