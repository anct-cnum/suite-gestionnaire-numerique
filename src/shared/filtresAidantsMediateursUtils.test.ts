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

  it('pour un gestionnaire région, le département est accepté s’il appartient à son scope', () => {
    // GIVEN
    const scopeDepartemental: ScopeFiltre = { codes: ['01', '69'], type: 'departemental' }

    // WHEN
    const filtres = buildFiltresListeAidants({ codeDepartement: '69' }, scopeDepartemental, 'Gestionnaire région')

    // THEN
    expect(filtres.geographique).toStrictEqual({ code: '69', type: 'departement' })
  })

  it('pour un gestionnaire région, le département hors scope est ignoré', () => {
    // GIVEN
    const scopeDepartemental: ScopeFiltre = { codes: ['01', '69'], type: 'departemental' }

    // WHEN
    const filtres = buildFiltresListeAidants({ codeDepartement: '75' }, scopeDepartemental, 'Gestionnaire région')

    // THEN
    expect(filtres.geographique).toBeUndefined()
  })

  it('pour un gestionnaire région, l’EPCI est accepté et prime sur le département', () => {
    // GIVEN
    const scopeDepartemental: ScopeFiltre = { codes: ['01', '69'], type: 'departemental' }

    // WHEN
    const filtres = buildFiltresListeAidants(
      { codeDepartement: '69', codeEpci: '246900575' },
      scopeDepartemental,
      'Gestionnaire région'
    )

    // THEN
    expect(filtres.geographique).toStrictEqual({ code: '246900575', type: 'epci' })
  })

  it('pour un gestionnaire département, le filtre géographique est ignoré', () => {
    // GIVEN
    const scopeDepartemental: ScopeFiltre = { codes: ['75'], type: 'departemental' }

    // WHEN
    const filtres = buildFiltresListeAidants({ codeDepartement: '75' }, scopeDepartemental, 'Gestionnaire département')

    // THEN
    expect(filtres.geographique).toBeUndefined()
  })

  it("quand je construis les filtres pour l'export avec une recherche, alors la recherche est conservée sans pagination", () => {
    // WHEN
    const filtres = buildFiltresForExport({ recherche: 'Dupont' }, scopeNational, 'Administrateur dispositif')

    // THEN
    expect(filtres.recherche).toBe('Dupont')
    expect(filtres.pagination.limite).toBe(999999)
  })
})
