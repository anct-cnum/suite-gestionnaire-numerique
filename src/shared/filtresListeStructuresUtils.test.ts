import { describe, expect, it } from 'vitest'

import {
  buildFiltresListeStructures,
  buildFiltresListeStructuresForExport,
  buildURLSearchParamsFromStructuresFilters,
  getActiveStructuresFilters,
  removeStructuresFilterFromParams,
} from './filtresListeStructuresUtils'
import { ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

describe('filtres liste structures', () => {
  describe(buildFiltresListeStructures, () => {
    it('sans paramètre, retourne les filtres par défaut avec pagination page 1', () => {
      // WHEN
      const filtres = buildFiltresListeStructures({}, scopeNational, 'Administrateur dispositif')

      // THEN
      expect(filtres).toStrictEqual({
        geographique: undefined,
        labellisation: undefined,
        pagination: { limite: 10, page: 1 },
        recherche: undefined,
        scopeFiltre: scopeNational,
      })
    })

    it('en scope national, la région prime sur le département pour le filtre géographique', () => {
      // WHEN
      const filtres = buildFiltresListeStructures(
        { codeDepartement: '69', codeRegion: '84' },
        scopeNational,
        'Administrateur dispositif'
      )

      // THEN
      expect(filtres.geographique).toStrictEqual({ code: '84', type: 'region' })
    })

    it('en scope national, le département est utilisé quand aucune région n’est fournie', () => {
      // WHEN
      const filtres = buildFiltresListeStructures({ codeDepartement: '69' }, scopeNational, 'Administrateur dispositif')

      // THEN
      expect(filtres.geographique).toStrictEqual({ code: '69', type: 'departement' })
    })

    it('hors scope national, le filtre géographique est ignoré pour un gestionnaire département', () => {
      // GIVEN
      const scopeDepartemental: ScopeFiltre = { codes: ['75'], type: 'departemental' }

      // WHEN
      const filtres = buildFiltresListeStructures(
        { codeDepartement: '69' },
        scopeDepartemental,
        'Gestionnaire département'
      )

      // THEN
      expect(filtres.geographique).toBeUndefined()
    })

    it('pour un gestionnaire région, le département est accepté s’il appartient à son scope', () => {
      // GIVEN
      const scopeDepartemental: ScopeFiltre = { codes: ['01', '69'], type: 'departemental' }

      // WHEN
      const filtres = buildFiltresListeStructures({ codeDepartement: '69' }, scopeDepartemental, 'Gestionnaire région')

      // THEN
      expect(filtres.geographique).toStrictEqual({ code: '69', type: 'departement' })
    })

    it('pour un gestionnaire région, le département hors scope est ignoré', () => {
      // GIVEN
      const scopeDepartemental: ScopeFiltre = { codes: ['01', '69'], type: 'departemental' }

      // WHEN
      const filtres = buildFiltresListeStructures({ codeDepartement: '75' }, scopeDepartemental, 'Gestionnaire région')

      // THEN
      expect(filtres.geographique).toBeUndefined()
    })

    it('pour un gestionnaire région, l’EPCI est accepté et prime sur le département', () => {
      // GIVEN
      const scopeDepartemental: ScopeFiltre = { codes: ['01', '69'], type: 'departemental' }

      // WHEN
      const filtres = buildFiltresListeStructures(
        { codeDepartement: '69', codeEpci: '246900575' },
        scopeDepartemental,
        'Gestionnaire région'
      )

      // THEN
      expect(filtres.geographique).toStrictEqual({ code: '246900575', type: 'epci' })
    })

    it('la labellisation invalide est ignorée, la recherche est nettoyée et la page convertie', () => {
      // WHEN
      const filtres = buildFiltresListeStructures(
        { labellisation: 'nimporte-quoi', page: '3', recherche: '  Emmaüs  ' },
        scopeNational,
        'Administrateur dispositif'
      )

      // THEN
      expect(filtres.labellisation).toBeUndefined()
      expect(filtres.recherche).toBe('Emmaüs')
      expect(filtres.pagination).toStrictEqual({ limite: 10, page: 3 })
    })

    it('la labellisation valide est conservée', () => {
      // WHEN
      const filtres = buildFiltresListeStructures(
        { labellisation: 'aidants-connect' },
        scopeNational,
        'Administrateur dispositif'
      )

      // THEN
      expect(filtres.labellisation).toBe('aidants-connect')
    })
  })

  describe(buildFiltresListeStructuresForExport, () => {
    it('conserve les filtres mais neutralise la pagination', () => {
      // WHEN
      const filtres = buildFiltresListeStructuresForExport(
        { labellisation: 'conseiller-numerique', page: '3', recherche: 'connect' },
        scopeNational,
        'Administrateur dispositif'
      )

      // THEN
      expect(filtres.labellisation).toBe('conseiller-numerique')
      expect(filtres.recherche).toBe('connect')
      expect(filtres.pagination).toStrictEqual({ limite: 999999, page: 1 })
    })
  })

  describe(buildURLSearchParamsFromStructuresFilters, () => {
    it('convertit region/departement en codeRegion/codeDepartement et garde la labellisation valide', () => {
      // GIVEN
      const params = new URLSearchParams('region=84&departement=69&labellisation=conseiller-numerique&autre=x')

      // WHEN
      const converted = buildURLSearchParamsFromStructuresFilters(params)

      // THEN
      expect(converted.toString()).toBe('codeRegion=84&codeDepartement=69&labellisation=conseiller-numerique')
    })

    it('ignore les valeurs vides ou invalides', () => {
      // GIVEN
      const params = new URLSearchParams('region=&labellisation=invalide')

      // WHEN
      const converted = buildURLSearchParamsFromStructuresFilters(params)

      // THEN
      expect(converted.toString()).toBe('')
    })
  })

  describe(getActiveStructuresFilters, () => {
    it('affiche le nom du département et le libellé de labellisation', () => {
      // GIVEN
      const params = new URLSearchParams('codeDepartement=69&labellisation=conseiller-numerique')

      // WHEN
      const filtres = getActiveStructuresFilters(params)

      // THEN
      expect(filtres).toStrictEqual([
        { label: 'Rhône (69)', paramKey: 'codeDepartement', paramValue: '69' },
        { label: 'Conseiller Numérique', paramKey: 'labellisation', paramValue: 'conseiller-numerique' },
      ])
    })

    it('affiche le nom de la région quand aucun département n’est sélectionné', () => {
      // GIVEN
      const params = new URLSearchParams('codeRegion=84&labellisation=aidants-connect')

      // WHEN
      const filtres = getActiveStructuresFilters(params)

      // THEN
      expect(filtres).toStrictEqual([
        { label: 'Auvergne-Rhône-Alpes', paramKey: 'codeRegion', paramValue: '84' },
        { label: 'Aidants Connect', paramKey: 'labellisation', paramValue: 'aidants-connect' },
      ])
    })

    it('sans filtre, retourne une liste vide', () => {
      // WHEN
      const filtres = getActiveStructuresFilters(new URLSearchParams())

      // THEN
      expect(filtres).toStrictEqual([])
    })
  })

  describe(removeStructuresFilterFromParams, () => {
    it('supprime les deux paramètres géographiques quand l’un est retiré', () => {
      // GIVEN
      const params = new URLSearchParams('codeRegion=84&codeDepartement=69&labellisation=aidants-connect')

      // WHEN
      const newParams = removeStructuresFilterFromParams(params, 'codeDepartement')

      // THEN
      expect(newParams.toString()).toBe('labellisation=aidants-connect')
    })

    it('supprime la labellisation sans toucher au reste', () => {
      // GIVEN
      const params = new URLSearchParams('codeDepartement=69&labellisation=aidants-connect')

      // WHEN
      const newParams = removeStructuresFilterFromParams(params, 'labellisation')

      // THEN
      expect(newParams.toString()).toBe('codeDepartement=69')
    })
  })
})

const scopeNational: ScopeFiltre = { type: 'national' }
