// @vitest-environment node
import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { proxy } from './proxy'

describe('aiguillage entre le site vitrine et MIN', () => {
  it('sur le site vitrine, une page est servie depuis les routes de la vitrine', () => {
    // WHEN
    const reponse = proxy(requete('inclusion-numerique.anct.gouv.fr', '/lieux'))

    // THEN
    expect(reponse.headers.get('x-middleware-rewrite')).toBe('https://inclusion-numerique.anct.gouv.fr/vitrine/lieux')
  })

  it('sur le site vitrine, le questionnaire de mesure d’impact est servi tel quel (#2263)', () => {
    // WHEN
    const reponse = proxy(requete('inclusion-numerique.anct.gouv.fr', '/questionnaire/sicoval'))

    // THEN
    expect(reponse.headers.get('x-middleware-rewrite')).toBeNull()
    expect(reponse.headers.get('x-middleware-next')).toBe('1')
  })

  it('sur MIN, les routes de la vitrine ne sont pas accessibles', () => {
    // WHEN
    const reponse = proxy(requete('min.inclusion-numerique.anct.gouv.fr', '/vitrine/lieux'))

    // THEN
    expect(reponse.headers.get('location')).toBe('https://min.inclusion-numerique.anct.gouv.fr/')
  })
})

function requete(domaine: string, chemin: string): NextRequest {
  return new NextRequest(`https://${domaine}${chemin}`, { headers: { host: domaine } })
}
