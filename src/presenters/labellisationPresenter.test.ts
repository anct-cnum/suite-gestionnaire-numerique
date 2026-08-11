import { describe, expect, it } from 'vitest'

import { labellisationEtape1Presenter } from './labellisationPresenter'
import { StructureLabelReadModel } from '@/use-cases/queries/RecupererStructureLabel'

describe('labellisation presenter', () => {
  it('les informations de la structure et les contacts sont présentés', () => {
    // GIVEN
    const readModel: StructureLabelReadModel = {
      contacts: [
        {
          email: 'didier.durand@example.com',
          estReferentFNE: true,
          fonction: 'Directeur',
          id: 1,
          nom: 'Durand',
          prenom: 'Didier',
          telephone: '0550594314',
        },
      ],
      identite: {
        adresse: '201 bis rue de la plaine, 69000 Lyon',
        departement: 'Rhône',
        nom: 'La Voie Du Num',
        region: 'Auvergne-Rhône-Alpes',
        siret: '79227291600034',
        typologie: 'Communauté urbaine',
      },
      structureId: 4901,
    }

    // WHEN
    const viewModel = labellisationEtape1Presenter(readModel)

    // THEN
    expect(viewModel).toStrictEqual({
      contacts: [
        {
          email: 'didier.durand@example.com',
          estReferentFNE: true,
          fonction: 'Directeur',
          id: 1,
          nom: 'Durand',
          prenom: 'Didier',
          telephone: '0550594314',
        },
      ],
      identite: {
        adresse: '201 bis rue de la plaine, 69000 Lyon',
        departement: 'Rhône',
        nom: 'La Voie Du Num',
        region: 'Auvergne-Rhône-Alpes',
        siret: '79227291600034',
        typologie: 'Communauté urbaine',
      },
      structureId: 4901,
    })
  })

  it('les valeurs inconnues sont affichées avec un tiret', () => {
    // GIVEN
    const readModel: StructureLabelReadModel = {
      contacts: [],
      identite: {
        adresse: '',
        departement: '',
        nom: '',
        region: '',
        siret: '',
        typologie: '',
      },
      structureId: 4901,
    }

    // WHEN
    const viewModel = labellisationEtape1Presenter(readModel)

    // THEN
    expect(viewModel.identite).toStrictEqual({
      adresse: '-',
      departement: '-',
      nom: '-',
      region: '-',
      siret: '',
      typologie: '-',
    })
  })
})
