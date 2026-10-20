import { act, render, screen } from '@testing-library/react'
import { IonReactRouter } from '@ionic/react-router'

import { useSessionStore } from '../session/useSessionStore'
import { RootNavigator } from './RootNavigator'

// PublicStack usa IonRouterOutlet, que solo funciona dentro del router de Ionic.
function renderAt(path: string) {
  window.history.pushState({}, '', path)
  return render(
    <IonReactRouter>
      <RootNavigator
        loading={<p>pantalla-carga</p>}
        login={<p>pantalla-login</p>}
        signUp={<p>pantalla-registro</p>}
        catalog={<p>pantalla-catalogo</p>}
        serviceDetail={<p>pantalla-detalle</p>}
      />
    </IonReactRouter>,
  )
}

describe('RootNavigator', () => {
  it('RootNavigator_whileSessionIsUnknown_showsLoadingNeverLogin', () => {
    useSessionStore.setState({ status: 'unknown', user: undefined })

    renderAt('/login')

    expect(screen.getByText('pantalla-carga')).toBeInTheDocument()
    expect(screen.queryByText('pantalla-login')).not.toBeInTheDocument()
  })

  it('RootNavigator_whenSessionResolves_showsTheRequestedRoute', async () => {
    useSessionStore.setState({ status: 'unknown', user: undefined })
    renderAt('/services')

    act(() => useSessionStore.getState().setAuthenticated({ id: 'usr_1', name: 'Ana', role: 'client' }))

    expect(screen.queryByText('pantalla-carga')).not.toBeInTheDocument()
    expect(await screen.findByText('pantalla-catalogo')).toBeInTheDocument()
  })
})
