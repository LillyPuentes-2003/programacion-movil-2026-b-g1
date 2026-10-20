import { useSessionStore } from '@core/session/useSessionStore'

import { FakeAuthRepository, FakeSessionStorage } from '../testing/fakes'
import { resetSessionRestoreForTests, runSessionRestore } from './runSessionRestore'

const ana = { id: 'usr_1', name: 'Ana Gómez', role: 'client' as const }
const neverLogin = () => Promise.reject(new Error('login no se usa al restaurar'))

describe('runSessionRestore', () => {
  beforeEach(() => {
    resetSessionRestoreForTests()
    useSessionStore.setState({ status: 'unknown', user: undefined })
  })

  it('runSessionRestore_whenCalledTwice_refreshesOnlyOnce', async () => {
    const repository = new FakeAuthRepository(neverLogin, async () => ({
      accessToken: 'nuevo',
      refreshToken: 'r2',
    }))
    const storage = new FakeSessionStorage(
      { accessToken: 'vencido', refreshToken: 'r1' },
      {
        vencido: { user: ana, expiresAt: 0 },
        nuevo: { user: ana, expiresAt: Date.now() + 3_600_000 },
      },
    )

    await Promise.all([runSessionRestore(repository, storage), runSessionRestore(repository, storage)])

    expect(repository.refreshCalls).toEqual(['r1'])
    expect(useSessionStore.getState()).toMatchObject({ status: 'authenticated', user: ana })
  })

  it('runSessionRestore_whenNothingStored_leavesUnknownForAnonymous', async () => {
    await runSessionRestore(new FakeAuthRepository(neverLogin), new FakeSessionStorage(null))

    expect(useSessionStore.getState().status).toBe('anonymous')
  })
})
