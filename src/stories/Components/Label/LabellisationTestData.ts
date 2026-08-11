import { LabellisationEtape1ViewModel } from '@/presenters/labellisationPresenter'

export function createDefaultLabellisationEtape1ViewModel(): LabellisationEtape1ViewModel {
  return {
    contacts: [
      {
        email: 'didier.durand@example.com',
        estReferentFNE: true,
        fonction: 'Directeur',
        id: 1,
        nom: 'Durand',
        prenom: 'Didier',
        telephone: '0102030405',
      },
    ],
    identite: {
      adresse: '172 B route de Lyon, 42300 Roanne',
      departement: 'Loire',
      nom: 'Emmaus Connect',
      region: 'Auvergne-Rhône-Alpes',
      siret: '79227291600034',
      typologie: 'Association déclarée',
    },
    structureId: 978,
  }
}
