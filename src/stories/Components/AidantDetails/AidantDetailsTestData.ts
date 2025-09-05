import { 
  AidantDetailsData,
  AidantDetailsHeaderData,
  InformationsPersonnellesData,
  LieuActiviteData,
  StatistiquesActivitesData,
  StructureEmployeuseData, 
} from '@/components/AidantDetails/AidantDetails'

export function createDefaultHeaderData(): AidantDetailsHeaderData {
  return {
    modificationAuther: 'Jean Martin',
    modificationDate: '15/12/2024 14:30',
    nom: 'Dupont',
    prenom: 'Marie',
    tags: ['Médiateur numérique', 'Actif', 'Formation certifiée'],
  }
}

export function createDefaultInformationsPersonnellesData(): InformationsPersonnellesData {
  return {
    email: 'marie.dupont@mairie01.paris.fr',
    nom: 'Dupont',
    prenom: 'Marie',
    telephone: '06 12 34 56 78',
  }
}

export function createDefaultStatistiquesActivitesData(): StatistiquesActivitesData {
  return {
    accompagnements: {
      avecAidantsConnect: 5,
      total: 120,
    },
    beneficiaires: {
      anonymes: 15,
      suivis: 45,
      total: 60,
    },
    graphique: {
      backgroundColor: ['#009099', '#009099', '#009099', '#009099', '#009099', '#009099', '#009099', '#009099', '#009099'],
      data: [24, 93, 31, 75, 71, 60, 82, 90, 80],
      labels: ['Avr.', 'Mai', 'Juin', 'Juillet', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
    },
  }
}

export function createDefaultStructureEmployeuseData(): StructureEmployeuseData {
  return {
    adresse: '10 Place de la Mairie, 75001 Paris',
    departement: 'Paris (75)',
    nom: 'Mairie du 1er arrondissement',
    referent: {
      email: 'jean.martin@mairie01.paris.fr',
      nom: 'Martin',
      post: 'Coordinateur inclusion numérique',
      prenom: 'Jean',
      telephone: '01 42 76 40 40',
    },
    region: 'Île-de-France',
    siret: '12345678912345',
    type: 'Collectivité territoriale',
  }
}

export function createDefaultLieuxActiviteData(): Array<LieuActiviteData> {
  return [
    {
      adresse: '19 Rue Proudhon, 01500 Belleville',
      nom: 'Association Connect 01',
      nombreAccompagnements: 5,
      nombreAccompagnementsTotal: 30,
    },
    {
      adresse: '19 Rue Proudhon, 01500 Belleville',
      nom: 'CD de l\'Ain',
      nombreAccompagnements: 20,
      nombreAccompagnementsTotal: 30,
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