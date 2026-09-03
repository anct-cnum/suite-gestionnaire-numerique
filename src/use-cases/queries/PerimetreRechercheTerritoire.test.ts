import { describe, expect, it } from 'vitest'

import { perimetreRechercheDuContexte } from './PerimetreRechercheTerritoire'
import { PerimetreRechercheTerritoires } from './RechercherTerritoires'
import { Contexte, Scope } from './ResoudreContexte'
import { RoleUtilisateur } from './shared/UnUtilisateurReadModel'

describe('périmètre de recherche territoriale du contexte', () => {
  it.each<
    Readonly<{
      intention: string
      perimetreAttendu: null | PerimetreRechercheTerritoires
      role: RoleUtilisateur
      scopes: ReadonlyArray<Scope>
    }>
  >([
    {
      intention: 'un administrateur dispositif a un périmètre complet',
      perimetreAttendu: { type: 'complet' },
      role: 'administrateur_dispositif',
      scopes: [{ type: 'france' }],
    },
    {
      intention: 'un gestionnaire de département est limité à son département',
      perimetreAttendu: { codesDepartement: ['69'], type: 'departements' },
      role: 'gestionnaire_departement',
      scopes: [{ code: '69', type: 'departement' }],
    },
    {
      intention: 'un gestionnaire de département sans département résolu n’a pas de périmètre',
      perimetreAttendu: null,
      role: 'gestionnaire_departement',
      scopes: [],
    },
    {
      intention: 'un coporteur est limité aux départements de ses gouvernances',
      perimetreAttendu: { codesDepartement: ['69', '71'], type: 'departements' },
      role: 'gestionnaire_structure',
      scopes: [
        { code: '10', type: 'structure' },
        { code: '69', type: 'coporteur' },
        { code: '71', type: 'membre' },
      ],
    },
    {
      intention: 'un gestionnaire de structure membre non coporteur n’a pas de périmètre',
      perimetreAttendu: null,
      role: 'gestionnaire_structure',
      scopes: [
        { code: '10', type: 'structure' },
        { code: '69', type: 'membre' },
      ],
    },
    {
      intention: 'un gestionnaire de structure hors gouvernance n’a pas de périmètre',
      perimetreAttendu: null,
      role: 'gestionnaire_structure',
      scopes: [{ code: '10', type: 'structure' }],
    },
    {
      intention: 'un gestionnaire de région est limité aux départements de sa région',
      perimetreAttendu: { codesDepartement: ['01', '69'], type: 'departements' },
      role: 'gestionnaire_region',
      scopes: [
        { code: '84', type: 'region' },
        { code: '01', type: 'membre' },
        { code: '69', type: 'coporteur' },
      ],
    },
    {
      intention: 'un gestionnaire de région sans départements résolus n’a pas de périmètre',
      perimetreAttendu: null,
      role: 'gestionnaire_region',
      scopes: [{ code: '84', type: 'region' }],
    },
  ])('$intention', ({ perimetreAttendu, role, scopes }) => {
    // GIVEN
    const contexte = new Contexte(role, scopes)

    // WHEN
    const perimetre = perimetreRechercheDuContexte(contexte)

    // THEN
    expect(perimetre).toStrictEqual(perimetreAttendu)
  })
})
