import { describe, expect, it } from 'vitest'

import { buildFiltresLieuxInclusion } from './filtresLieuxInclusionUtils'
import { epochTime } from '@/shared/testHelper'
import { ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

const scopeNational: ScopeFiltre = { type: 'national' }

describe('filtres de la liste des lieux d’inclusion', () => {
  it('quand les paramètres contiennent une recherche par nom, alors les filtres la reprennent sans espaces superflus', () => {
    // WHEN
    const filtres = buildFiltresLieuxInclusion(
      { nom: '  France Services ' },
      scopeNational,
      'Administrateur dispositif',
      epochTime
    )

    // THEN
    expect(filtres.nom).toBe('France Services')
  })

  it("quand les paramètres ne contiennent pas de recherche ou une recherche vide, alors les filtres n'ont pas de nom", () => {
    // WHEN
    const filtres = buildFiltresLieuxInclusion({ nom: '   ' }, scopeNational, 'Administrateur dispositif', epochTime)

    // THEN
    expect(filtres.nom).toBeUndefined()
  })

  it('quand les paramètres contiennent une recherche et d’autres filtres, alors ils sont cumulés', () => {
    // WHEN
    const filtres = buildFiltresLieuxInclusion(
      { nom: 'médiathèque', qpv: 'true', statut: 'archives' },
      scopeNational,
      'Administrateur dispositif',
      epochTime
    )

    // THEN
    expect(filtres.nom).toBe('médiathèque')
    expect(filtres.qpv).toBe(true)
    expect(filtres.statut).toBe('archive')
  })

  it('quand les paramètres contiennent un statut de fraîcheur valide, alors le filtre porte la couleur et la date de référence', () => {
    // WHEN
    const filtres = buildFiltresLieuxInclusion(
      { fraicheur: 'a-actualiser' },
      scopeNational,
      'Administrateur dispositif',
      epochTime
    )

    // THEN
    expect(filtres.fraicheur).toStrictEqual({ couleur: 'red', now: epochTime })
  })

  it('quand les paramètres contiennent un statut de fraîcheur inconnu, alors le filtre est ignoré', () => {
    // WHEN
    const filtres = buildFiltresLieuxInclusion(
      { fraicheur: 'nimporte-quoi' },
      scopeNational,
      'Administrateur dispositif',
      epochTime
    )

    // THEN
    expect(filtres.fraicheur).toBeUndefined()
  })

  it('pour un gestionnaire région, le département est accepté s’il appartient à son scope', () => {
    // GIVEN
    const scopeDepartemental: ScopeFiltre = { codes: ['01', '69'], type: 'departemental' }

    // WHEN
    const filtres = buildFiltresLieuxInclusion(
      { codeDepartement: '69' },
      scopeDepartemental,
      'Gestionnaire région',
      epochTime
    )

    // THEN
    expect(filtres.geographique).toStrictEqual({ code: '69', type: 'departement' })
  })

  it('pour un gestionnaire région, le département hors scope est ignoré', () => {
    // GIVEN
    const scopeDepartemental: ScopeFiltre = { codes: ['01', '69'], type: 'departemental' }

    // WHEN
    const filtres = buildFiltresLieuxInclusion(
      { codeDepartement: '75' },
      scopeDepartemental,
      'Gestionnaire région',
      epochTime
    )

    // THEN
    expect(filtres.geographique).toBeUndefined()
  })

  it('pour un gestionnaire région, l’EPCI est accepté et prime sur le département', () => {
    // GIVEN
    const scopeDepartemental: ScopeFiltre = { codes: ['01', '69'], type: 'departemental' }

    // WHEN
    const filtres = buildFiltresLieuxInclusion(
      { codeDepartement: '69', codeEpci: '246900575' },
      scopeDepartemental,
      'Gestionnaire région',
      epochTime
    )

    // THEN
    expect(filtres.geographique).toStrictEqual({ code: '246900575', type: 'epci' })
  })

  it('pour un gestionnaire département, le filtre géographique est ignoré', () => {
    // GIVEN
    const scopeDepartemental: ScopeFiltre = { codes: ['75'], type: 'departemental' }

    // WHEN
    const filtres = buildFiltresLieuxInclusion(
      { codeDepartement: '75' },
      scopeDepartemental,
      'Gestionnaire département',
      epochTime
    )

    // THEN
    expect(filtres.geographique).toBeUndefined()
  })
})
