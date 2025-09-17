import type {
  AidantDetailsData,
  AidantDetailsHeaderData,
  InformationsPersonnellesData,
  LieuActiviteData,
  StatistiquesActivitesData,
  StructureEmployeuseData,
} from '@/components/AidantDetails/AidantDetails'

export function createDefaultHeaderData(): AidantDetailsHeaderData {
  return {
    modificationAutheur: 'Marie Dupont',
    modificationDate: '15/03/2024',
    nom: 'Martin',
    tags: ['Aidant Connect', 'France Services', 'ANCT'],
  }
}

export function createDefaultInformationsPersonnellesData(): InformationsPersonnellesData {
  return {
    email: 'jean.martin@example.com',
    nom: 'Martin',
    prenom: 'Jean',
    telephone: '01 23 45 67 89',
  }
}

export function createDefaultStatistiquesActivitesData(): StatistiquesActivitesData {
  return {
    accompagnements: {
      avecAidantsConnect: 45,
      total: 127,
    },
    beneficiaires: {
      anonymes: 82,
      suivis: 45,
      total: 127,
    },
    graphique: {
      backgroundColor: ['#000091', '#e1000f', '#ff8d7e', '#ffb7ae'],
      data: [45, 35, 30, 17],
      labels: ['Numérique', 'Démarches administratives', 'Mobilité', 'Insertion professionnelle'],
    },
  }
}

export function createDefaultStructureEmployeuseData(): StructureEmployeuseData {
  return {
    adresse: '123 Rue de la République, 75001 Paris',
    departement: 'Paris',
    nom: 'Mairie de Paris 1er',
    referent: {
      email: 'marie.dupont@paris.fr',
      nom: 'Dupont',
      post: 'Responsable numérique',
      prenom: 'Marie',
      telephone: '01 42 76 40 40',
    },
    region: 'Île-de-France',
    siret: '12345678901234',
    type: 'Collectivité territoriale',
  }
}

export function createDefaultLieuxActiviteData(): ReadonlyArray<LieuActiviteData> {
  return [
    {
      adresse: '123 Rue de la République, 75001 Paris',
      idCoopCarto: null,
      nom: 'Mairie de Paris 1er',
      nombreAccompagnements: 67,
    },
    {
      adresse: '45 Avenue des Champs-Élysées, 75008 Paris',
      idCoopCarto: 'testCarto',
      nom: 'France Services Champs-Élysées',
      nombreAccompagnements: 35,
    },
    {
      adresse: '78 Rue de Rivoli, 75004 Paris',
      idCoopCarto: null,
      nom: 'Point Numérique Rivoli',
      nombreAccompagnements: 25,
    },
  ]
}

export function createDefaultAidantDetailsData(): AidantDetailsData {
  return {
    header: createDefaultHeaderData(),
    informationsPersonnelles: createDefaultInformationsPersonnellesData(),
    lieuxActivite: createDefaultLieuxActiviteData(),
    statistiquesActivites: createDefaultStatistiquesActivitesData(),
    structuresEmployeuses: [createDefaultStructureEmployeuseData()],
  }
}
