import type {
  AidantDetailsData,
  AidantDetailsHeaderData,
  InformationsPersonnellesData,
  LieuActiviteData,
  StructureEmployeuseData,
} from '@/components/AidantDetails/AidantDetails'

export function createDefaultHeaderData(): AidantDetailsHeaderData {
  return {
    modificationAutheur: 'Marie Dupont',
    modificationDate: '15/03/2024',
    nom: 'Martin',
    prenom: 'Jean',
    tags: ['Aidant Connect', 'France Services', 'ANCT'],
  }
}

export function createDefaultInformationsPersonnellesData(): InformationsPersonnellesData {
  return {
    emails: ['jean.martin@example.com', 'j.martin@coop.fr'],
    nom: 'Martin',
    prenom: 'Jean',
    telephone: '01 23 45 67 89',
  }
}

export function createDefaultLieuxActiviteData(): ReadonlyArray<LieuActiviteData> {
  return [
    {
      adresse: '123 Rue de la République, 75001 Paris',
      idCoopCarto: null,
      nom: 'Mairie de Paris 1er',
    },
    {
      adresse: '45 Avenue des Champs-Élysées, 75008 Paris',
      idCoopCarto: 'testCarto',
      nom: 'France Services Champs-Élysées',
    },
    {
      adresse: '78 Rue de Rivoli, 75004 Paris',
      idCoopCarto: null,
      nom: 'Point Numérique Rivoli',
    },
  ]
}

export function createDefaultAidantDetailsData(): AidantDetailsData {
  return {
    header: createDefaultHeaderData(),
    informationsPersonnelles: createDefaultInformationsPersonnellesData(),
    lieuxActivite: createDefaultLieuxActiviteData(),
    structuresEmployeuses: [createDefaultStructureEmployeuseData()],
  }
}

function createDefaultStructureEmployeuseData(): StructureEmployeuseData {
  return {
    adresse: '123 Rue de la République, 75001 Paris',
    contacts: [
      {
        email: 'marie.dupont@paris.fr',
        estReferentFNE: true,
        fonction: 'Responsable numérique',
        id: 1,
        nom: 'Dupont',
        prenom: 'Marie',
        telephone: '01 42 76 40 40',
      },
    ],
    departement: 'Paris',
    nom: 'Mairie de Paris 1er',
    region: 'Île-de-France',
    siret: '12345678901234',
    type: 'Collectivité territoriale',
  }
}
