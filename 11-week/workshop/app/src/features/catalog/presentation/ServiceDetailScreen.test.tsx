import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'

import '../../../locales/i18n'
import { DIContext } from '@core/di/DIContext'
import type { Service } from '@core/domain/Service'
import { NotFoundError } from '@core/network/errors'

import { CATALOG_REPOSITORY_KEY } from '../data/catalogRepositoryProvider'
import type { CatalogRepository } from '../domain/CatalogRepository'
import { ServiceDetailScreen } from './ServiceDetailScreen'
import { useServiceDetailStore } from './useServiceDetailStore'

const acrilicas: Service = {
  id: 'svc_3',
  name: 'Uñas acrílicas',
  type: 'acrylic',
  priceCop: 80000,
  durationMinutes: 120,
  professional: { id: 'pro_2', name: 'Camila' },
  business: { id: 'biz_2', name: 'Nail Studio Huila', address: 'Calle 8 # 4-15' },
}

function renderDetail(repository: CatalogRepository, serviceId: string) {
  return render(
    <DIContext.Provider value={{ [CATALOG_REPOSITORY_KEY]: repository }}>
      <MemoryRouter initialEntries={[`/service/${serviceId}`]}>
        <Routes>
          <Route path="/service/:serviceId" element={<ServiceDetailScreen />} />
          <Route path="*" element={<p>catalogo</p>} />
        </Routes>
      </MemoryRouter>
    </DIContext.Provider>,
  )
}

describe('ServiceDetailScreen', () => {
  beforeEach(() => {
    useServiceDetailStore.setState({ status: 'loading', service: null })
  })

  it('ServiceDetailScreen_whenIdDoesNotExist_showsNotFoundWithWayBackToCatalog', async () => {
    const repository: CatalogRepository = {
      getPublishedServices: vi.fn(),
      getServiceDetail: vi.fn().mockRejectedValue(new NotFoundError('404')),
    }

    renderDetail(repository, 'svc_no_existe')

    expect(await screen.findByText('No encontramos este servicio')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Volver al catálogo' }))
    expect(await screen.findByText('catalogo')).toBeInTheDocument()
  })

  it('ServiceDetailScreen_whenRetryAfterError_showsTheService', async () => {
    const getServiceDetail = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce({ service: acrilicas, isOffline: false })
    const repository: CatalogRepository = { getPublishedServices: vi.fn(), getServiceDetail }

    renderDetail(repository, 'svc_3')
    expect(await screen.findByText('Revisa tu conexión a internet e intenta de nuevo.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByText('Uñas acrílicas')).toBeInTheDocument()
    expect(getServiceDetail).toHaveBeenCalledWith('svc_3')
  })
})
