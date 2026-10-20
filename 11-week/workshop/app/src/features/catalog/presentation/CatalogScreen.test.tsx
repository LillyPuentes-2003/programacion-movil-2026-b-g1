import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

import '../../../locales/i18n'
import { DIContext } from '@core/di/DIContext'
import type { Service } from '@core/domain/Service'

import { CATALOG_REPOSITORY_KEY } from '../data/catalogRepositoryProvider'
import type { CatalogRepository } from '../domain/CatalogRepository'
import { CatalogScreen } from './CatalogScreen'
import { useCatalogStore } from './useCatalogStore'

const manicure: Service = {
  id: 'svc_1',
  name: 'Manicure tradicional',
  type: 'traditional',
  priceCop: 25000,
  durationMinutes: 45,
  professional: { id: 'pro_1', name: 'Diana' },
  business: { id: 'biz_1', name: 'Uñas Bonitas Neiva', address: 'Cra. 5 # 10-20' },
}

function renderCatalog(repository: CatalogRepository) {
  return render(
    <DIContext.Provider value={{ [CATALOG_REPOSITORY_KEY]: repository }}>
      <MemoryRouter initialEntries={['/services']}>
        <CatalogScreen />
      </MemoryRouter>
    </DIContext.Provider>,
  )
}

describe('CatalogScreen', () => {
  beforeEach(() => {
    useCatalogStore.setState({ status: 'loading', items: [], selectedType: undefined })
  })

  it('CatalogScreen_whenServicesFail_showsErrorMessageWithRetry', async () => {
    const repository: CatalogRepository = {
      getPublishedServices: vi.fn().mockRejectedValue(new Error('Network Error')),
      getServiceDetail: vi.fn(),
    }

    renderCatalog(repository)

    expect(await screen.findByText('No se pudo cargar el catálogo')).toBeInTheDocument()
    expect(screen.getByText('Revisa tu conexión a internet e intenta de nuevo.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('CatalogScreen_whenRetryIsPressed_requestsServicesAgainAndShowsThem', async () => {
    const getPublishedServices = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce({ items: [manicure], isOffline: false })
    const repository: CatalogRepository = { getPublishedServices, getServiceDetail: vi.fn() }

    renderCatalog(repository)
    await userEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))

    expect(getPublishedServices).toHaveBeenCalledTimes(2)
    expect(await screen.findByText('Manicure tradicional')).toBeInTheDocument()
    expect(screen.queryByText('No se pudo cargar el catálogo')).not.toBeInTheDocument()
  })
})
