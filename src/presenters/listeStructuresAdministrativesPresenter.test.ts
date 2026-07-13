import { describe, expect, it } from 'vitest'

import { listeStructuresAdministrativesPresenter } from './listeStructuresAdministrativesPresenter'
import {
  RecupererStructuresAdministrativesReadModel,
  StructureAdministrativeItem,
} from '@/use-cases/queries/RecupererStructuresAdministratives'

describe('liste structures administratives presenter', () => {
  it('quand une structure est complète, alors elle est transformée en vue', () => {
    // GIVEN
    const readModel = creerReadModel({ structures: [creerStructure()], total: 1 })

    // WHEN
    const viewModel = listeStructuresAdministrativesPresenter(readModel)

    // THEN
    expect(viewModel.structures[0]).toStrictEqual({
      adresse: {
        ligne1: '3 rue des Fleurs',
        ligne2: '75001 Paris',
      },
      antenne: 'Antenne de Paris',
      categorieJuridique: 'Association déclarée',
      dejaFusionnee: true,
      estCanonique: false,
      estGouvernance: true,
      id: 7,
      identifiants: [
        { label: 'Siret', valeur: '12345678901234', valeurCourte: '12345678901234' },
        { label: 'RNA', valeur: 'W123456789', valeurCourte: 'W123456789' },
        {
          label: 'Coop',
          valeur: '0f9d8c7b-6a5e-4d3c-9b1a-098f7e6d5c4b',
          valeurCourte: '0f9d8c7b…',
        },
        { label: 'Idposte', valeur: '77', valeurCourte: '77' },
        { label: 'Aidants Connect', valeur: 'ac-uuid', valeurCourte: 'ac-uuid' },
      ],
      nbPersonnesEmployees: 4,
      nom: 'La Poste',
      rattachements: {
        details: ['3 affectations emploi', '1 contact', '2 lieux d’inclusion', '1 poste'],
        total: 7,
      },
    })
  })

  it('quand des données sont inconnues, alors un tiret est affiché', () => {
    // GIVEN
    const readModel = creerReadModel({
      structures: [
        creerStructure({
          categorie_juridique: null,
          code_postal: null,
          deja_fusionnee: false,
          denomination_antenne: null,
          denomination_sirene: null,
          est_gouvernance: false,
          nb_affectations_emploi: 0,
          nb_associations_lieux: 0,
          nb_contacts: 0,
          nb_postes: 0,
          nom_commune: null,
          nom_voie: null,
          numero_voie: null,
          rna: null,
          siret: null,
          structure_ac_id: null,
          structure_coop_id: null,
          structure_tp_id: null,
        }),
      ],
      total: 1,
    })

    // WHEN
    const viewModel = listeStructuresAdministrativesPresenter(readModel)

    // THEN
    expect(viewModel.structures[0]).toStrictEqual({
      adresse: {
        ligne1: '-',
        ligne2: '',
      },
      antenne: null,
      categorieJuridique: '-',
      dejaFusionnee: false,
      estCanonique: true,
      estGouvernance: false,
      id: 7,
      identifiants: [],
      nbPersonnesEmployees: 4,
      nom: '-',
      rattachements: {
        details: [],
        total: 0,
      },
    })
  })

  it('quand une structure a des rattachements de tous types, alors le détail est ventilé au pluriel', () => {
    // GIVEN
    const readModel = creerReadModel({
      structures: [
        creerStructure({
          nb_affectations_emploi: 2,
          nb_associations_lieux: 2,
          nb_contacts: 2,
          nb_contrats: 2,
          nb_membres_min: 2,
          nb_postes: 2,
          nb_utilisateurs_min: 2,
        }),
      ],
      total: 1,
    })

    // WHEN
    const viewModel = listeStructuresAdministrativesPresenter(readModel)

    // THEN
    expect(viewModel.structures[0].rattachements).toStrictEqual({
      details: [
        '2 affectations emploi',
        '2 contacts',
        '2 contrats',
        '2 lieux d’inclusion',
        '2 membres MIN',
        '2 postes',
        '2 utilisateurs MIN',
      ],
      total: 14,
    })
  })

  it.each([
    { attendu: false, intention: 'inférieur ou égal à la limite', total: 10 },
    { attendu: true, intention: 'supérieur à la limite', total: 11 },
  ])('quand le total est $intention, alors la pagination est affichée : $attendu', ({ attendu, total }) => {
    // GIVEN
    const readModel = creerReadModel({ total })

    // WHEN
    const viewModel = listeStructuresAdministrativesPresenter(readModel)

    // THEN
    expect(viewModel.displayPagination).toBe(attendu)
    expect(viewModel.nombreDePages).toBe(Math.ceil(total / 10))
    expect(viewModel.total).toBe(total)
  })
})

function creerReadModel(
  surcharges?: Partial<RecupererStructuresAdministrativesReadModel>
): RecupererStructuresAdministrativesReadModel {
  return {
    limite: 10,
    page: 0,
    structures: [],
    total: 0,
    ...surcharges,
  }
}

function creerStructure(surcharges?: Partial<StructureAdministrativeItem>): StructureAdministrativeItem {
  return {
    categorie_juridique: 'Association déclarée',
    code_postal: '75001',
    deja_fusionnee: true,
    denomination_antenne: 'Antenne de Paris',
    denomination_sirene: 'La Poste',
    est_gouvernance: true,
    id: 7,
    nb_affectations_emploi: 3,
    nb_associations_lieux: 2,
    nb_contacts: 1,
    nb_contrats: 0,
    nb_membres_min: 0,
    nb_personnes_employees: 4,
    nb_postes: 1,
    nb_utilisateurs_min: 0,
    nom_commune: 'Paris',
    nom_voie: 'rue des Fleurs',
    numero_voie: 3,
    ridet: null,
    rna: 'W123456789',
    siret: '12345678901234',
    structure_ac_id: 'ac-uuid',
    structure_coop_id: '0f9d8c7b-6a5e-4d3c-9b1a-098f7e6d5c4b',
    structure_tp_id: 77,
    ...surcharges,
  }
}
