import { describe, expect, it } from 'vitest'

import { buildFiltresLieuxInclusion } from './filtresLieuxInclusionUtils'
import { ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

const scopeNational: ScopeFiltre = { type: 'national' }

describe('filtres de la liste des lieux d’inclusion', () => {
  it('quand les paramètres contiennent une recherche par nom, alors les filtres la reprennent sans espaces superflus', () => {
    // WHEN
    const filtres = buildFiltresLieuxInclusion({ nom: '  France Services ' }, scopeNational)

    // THEN
    expect(filtres.nom).toBe('France Services')
  })

  it("quand les paramètres ne contiennent pas de recherche ou une recherche vide, alors les filtres n'ont pas de nom", () => {
    // WHEN
    const filtres = buildFiltresLieuxInclusion({ nom: '   ' }, scopeNational)

    // THEN
    expect(filtres.nom).toBeUndefined()
  })

  it('quand les paramètres contiennent une recherche et d’autres filtres, alors ils sont cumulés', () => {
    // WHEN
    const filtres = buildFiltresLieuxInclusion({ nom: 'médiathèque', qpv: 'true', statut: 'archives' }, scopeNational)

    // THEN
    expect(filtres.nom).toBe('médiathèque')
    expect(filtres.qpv).toBe(true)
    expect(filtres.statut).toBe('archive')
  })
})
