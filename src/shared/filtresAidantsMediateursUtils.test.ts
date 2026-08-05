import { describe, expect, it } from 'vitest'

import { buildFiltresForExport, buildFiltresListeAidants } from './filtresAidantsMediateursUtils'
import { ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

const scopeNational: ScopeFiltre = { type: 'national' }

describe('filtres de la liste des aidants et médiateurs', () => {
  it('quand les paramètres contiennent une recherche, alors les filtres la reprennent sans espaces superflus', () => {
    // WHEN
    const filtres = buildFiltresListeAidants(
      { recherche: '  Jean Dupont ' },
      scopeNational,
      'Administrateur dispositif'
    )

    // THEN
    expect(filtres.recherche).toBe('Jean Dupont')
  })

  it("quand les paramètres contiennent une recherche vide, alors les filtres n'ont pas de recherche", () => {
    // WHEN
    const filtres = buildFiltresListeAidants({ recherche: '   ' }, scopeNational, 'Administrateur dispositif')

    // THEN
    expect(filtres.recherche).toBeUndefined()
  })

  it("quand je construis les filtres pour l'export avec une recherche, alors la recherche est conservée sans pagination", () => {
    // WHEN
    const filtres = buildFiltresForExport({ recherche: 'Dupont' }, scopeNational, 'Administrateur dispositif')

    // THEN
    expect(filtres.recherche).toBe('Dupont')
    expect(filtres.pagination.limite).toBe(999999)
  })
})
