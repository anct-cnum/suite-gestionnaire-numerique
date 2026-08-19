import { describe, expect, it } from 'vitest'

import { listeStructuresPresenter, ListeStructuresViewModel } from './listeStructuresPresenter'
import { epochTime, epochTimePlusOneDay } from './testHelper'
import { ListeStructuresReadModel, StructureListeReadModel } from '@/use-cases/queries/RecupererListeStructures'

describe('liste structures presenter', () => {
  it('transforme le read model en view model avec les liens et l’adresse', () => {
    // GIVEN
    const readModel = listeStructuresReadModel({
      structures: [
        structure({
          adresse: '3 BIS AVENUE CHARLES DE GAULLE',
          codePostal: '69002',
          commune: 'LYON',
          id: 12,
          nom: 'Emmaüs Connect',
          siret: '41816609600069',
          typologie: 'Association loi 1901',
        }),
      ],
    })

    // WHEN
    const viewModel = listeStructuresPresenter(readModel, epochTime) as ListeStructuresViewModel

    // THEN
    expect(viewModel.structures[0]).toStrictEqual({
      adresseComplete: '3 BIS AVENUE CHARLES DE GAULLE',
      codePostalCommune: '69002 LYON',
      estHabiliteeAidantsConnect: false,
      estLabelliseeConseillerNumerique: false,
      id: 12,
      lienAnnuaireEntreprises: 'https://annuaire-entreprises.data.gouv.fr/etablissement/41816609600069',
      lienFiche: '/structure/12',
      nom: 'Emmaüs Connect',
      siret: '41816609600069',
      typologie: 'Association loi 1901',
    })
    expect(viewModel).toMatchObject({
      displayPagination: false,
      limite: 10,
      page: 1,
      total: 1,
      totalHabiliteesAidantsConnect: 2,
      totalLabelliseesConseillerNumerique: 3,
      totalPages: 1,
      totalStructures: 4,
    })
  })

  it.each([
    {
      derniereAttestationLabelConum: epochTime,
      estLabelliseeConseillerNumerique: true,
      intention: 'un label attesté il y a moins d’un an est actif',
      now: epochTimePlusOneDay,
      possedePosteConumActif: false,
    },
    {
      derniereAttestationLabelConum: epochTime,
      estLabelliseeConseillerNumerique: false,
      intention: 'un label attesté il y a plus d’un an sans poste actif n’est plus actif',
      now: new Date('1971-01-02'),
      possedePosteConumActif: false,
    },
    {
      derniereAttestationLabelConum: epochTime,
      estLabelliseeConseillerNumerique: true,
      intention: 'un label expiré avec un poste conum actif reste labellisé',
      now: new Date('1971-01-02'),
      possedePosteConumActif: true,
    },
    {
      derniereAttestationLabelConum: null,
      estLabelliseeConseillerNumerique: true,
      intention: 'une structure sans label mais avec un poste conum actif est labellisée',
      now: epochTime,
      possedePosteConumActif: true,
    },
    {
      derniereAttestationLabelConum: null,
      estLabelliseeConseillerNumerique: false,
      intention: 'une structure sans label ni poste actif n’est pas labellisée',
      now: epochTime,
      possedePosteConumActif: false,
    },
  ])(
    '$intention',
    ({ derniereAttestationLabelConum, estLabelliseeConseillerNumerique, now, possedePosteConumActif }) => {
      // GIVEN
      const readModel = listeStructuresReadModel({
        structures: [structure({ derniereAttestationLabelConum, possedePosteConumActif })],
      })

      // WHEN
      const viewModel = listeStructuresPresenter(readModel, now) as ListeStructuresViewModel

      // THEN
      expect(viewModel.structures[0].estLabelliseeConseillerNumerique).toBe(estLabelliseeConseillerNumerique)
    }
  )

  it('sans SIRET, le lien annuaire entreprises est vide', () => {
    // GIVEN
    const readModel = listeStructuresReadModel({ structures: [structure({ siret: '' })] })

    // WHEN
    const viewModel = listeStructuresPresenter(readModel, epochTime) as ListeStructuresViewModel

    // THEN
    expect(viewModel.structures[0].lienAnnuaireEntreprises).toBe('')
  })

  it('propage le read model d’erreur tel quel', () => {
    // WHEN
    const viewModel = listeStructuresPresenter({ message: 'oups', type: 'error' }, epochTime)

    // THEN
    expect(viewModel).toStrictEqual({ message: 'oups', type: 'error' })
  })
})

function listeStructuresReadModel(override: Partial<ListeStructuresReadModel>): ListeStructuresReadModel {
  return {
    displayPagination: false,
    limite: 10,
    page: 1,
    structures: [],
    total: 1,
    totalHabiliteesAidantsConnect: 2,
    totalLabelliseesConseillerNumerique: 3,
    totalPages: 1,
    totalStructures: 4,
    ...override,
  }
}

function structure(override: Partial<StructureListeReadModel>): StructureListeReadModel {
  return {
    adresse: '1 rue de la Paix',
    codePostal: '75001',
    commune: 'Paris',
    derniereAttestationLabelConum: null,
    estHabiliteeAidantsConnect: false,
    id: 1,
    nom: 'Structure',
    possedePosteConumActif: false,
    siret: '11111111111111',
    typologie: 'Association',
    ...override,
  }
}
