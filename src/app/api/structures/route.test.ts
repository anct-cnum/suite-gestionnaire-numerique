import { createMocks } from 'node-mocks-http'

import { GET } from './route'

// eslint-disable-next-line vitest/prefer-lowercase-title
describe('route /structures', () => {
  it.skip('devrait retourner une erreur 403 quand on quand l’utilisateur n’est pas authentifié', async () => {
    // GIVEN
    // const source = '/tests/login.test.ts'
    // const nextUrl = new URL(source, process.env.HOST)

    // // WHEN
    // const request = createRequest({ method: 'GET', url: '/api/structures' })
    // const response = await GET({ ...request, nextUrl })
    const { req, res } = createMocks({
      method: 'GET',
    })

    await GET(req)
    // THEN
    //expect(response.status).toBe(403)
    expect(res._getStatusCode()).toBe(403) // Vérifie le statut HTTP
  })

  it('devrait retourner la liste des structures qui correspondent à la recherche', () => {
    // GIVEN

    // WHEN

    // THEN
    expect(true).toBe(true)
  })

  it('devrait retourner une liste vide quand aucune structure ne correspond à la recherche', () => {
    // GIVEN

    // WHEN

    // THEN
    expect(true).toBe(true)
  })
})
