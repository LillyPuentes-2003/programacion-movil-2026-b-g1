import { mapSession } from './dto'

describe('mapSession', () => {
  it('mapSession_whenPayloadMatchesContract_returnsSession', () => {
    const session = mapSession({
      accessToken: 'a',
      refreshToken: 'r',
      user: { id: 'usr_1', name: 'Ana', role: 'client' },
    })

    expect(session.user.role).toBe('client')
  })

  it('mapSession_whenRoleIsUnknown_throwsInsteadOfGuessing', () => {
    expect(() =>
      mapSession({ accessToken: 'a', refreshToken: 'r', user: { id: 'usr_1', name: 'Ana', role: 'clienta' } }),
    ).toThrow()
  })

  it('mapSession_whenTokenIsMissing_throws', () => {
    expect(() =>
      mapSession({ accessToken: '', refreshToken: 'r', user: { id: 'usr_1', name: 'Ana', role: 'client' } }),
    ).toThrow()
  })
})
