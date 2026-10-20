import js from '@eslint/js'
import globals from 'globals'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import importPlugin from 'eslint-plugin-import'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'

// project-structure.md: una feature no importa de otra feature (todo lo compartido va por
// core/ o shared/); shared/ no conoce features/; core/ no depende de features/.
const FEATURES = ['auth', 'catalog', 'booking', 'appointments', 'business']

const noCrossFeatureZones = FEATURES.map((feature) => ({
  target: `./src/features/${feature}/**/*`,
  from: FEATURES.filter((other) => other !== feature).map(
    (other) => `./src/features/${other}/**/*`,
  ),
  message: 'Sin imports entre features: comparte por core/ o shared/ (project-structure.md).',
}))

export default tseslint.config(
  { ignores: ['dist', 'android', 'cypress.config.ts', 'public/assets'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: true,
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            ...noCrossFeatureZones,
            {
              target: './src/shared/**/*',
              from: './src/features/**/*',
              message: 'shared/ no conoce features/ (project-structure.md).',
            },
            {
              target: './src/core/**/*',
              from: './src/features/**/*',
              message: 'core/ no depende de features/ (project-structure.md).',
            },
          ],
        },
      ],
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
  },
  prettierConfig,
)
