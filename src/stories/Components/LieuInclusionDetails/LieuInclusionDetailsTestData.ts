import type {
  InformationsGeneralesData,
  LieuAccueilPublicData,
  LieuInclusionDetailsData,
  LieuInclusionDetailsHeaderData,
  PersonneTravaillantData,
  ServiceInclusionNumeriqueData,
} from '@/components/LieuInclusionDetails/LieuInclusionDetails'

export function createDefaultHeaderData(): LieuInclusionDetailsHeaderData {
  return {
    modificationAuteur: 'Marie Dupont',
    modificationDate: '15/03/2024',
    nom: 'Association Connect 69',
    tags: ['Aidants Connect', 'FRR'],
  }
}

export function createDefaultPersonnesTravaillantData(): ReadonlyArray<PersonneTravaillantData> {
  return [
    {
      email: 'jean.martin@franceservices.gouv.fr',
      id: 1,
      nom: 'Martin',
      prenom: 'Jean',
      role: 'Conseiller numérique',
      telephone: '01 23 45 67 89',
    },
    {
      email: 'marie.durand@franceservices.gouv.fr',
      id: 2,
      nom: 'Durand',
      prenom: 'Marie',
      role: 'Médiateur numérique',
      telephone: '01 23 45 67 90',
    },
    {
      id: 3,
      nom: 'Leroy',
      prenom: 'Pierre',
      role: 'Agent d\'accueil',
    },
  ]
}

export function createDefaultInformationsGeneralesData(): InformationsGeneralesData {
  return {
    adresse: '123 Rue de la République, 75001 Paris',
    complementAdresse: 'Bâtiment A - 2ème étage',
    nomStructure: 'Association Connect 69',
    siret: '12345678901234',
  }
}

export function createDefaultLieuAccueilPublicData(): LieuAccueilPublicData {
  return {
    accessibilite: 'Accès PMR, parking disponible',
    conseillerNumeriqueLabellePhase2: true,
    conseillerNumeriqueLabellePhase3: false,
    horaires: 'Lundi au vendredi : 9h-17h, Samedi : 9h-12h',
    modalitesAccueil: 'Sur rendez-vous et accueil libre. Possibilité de prise de rendez-vous en ligne.',
  }
}

export function createDefaultServicesInclusionNumeriqueData(): ReadonlyArray<ServiceInclusionNumeriqueData> {
  return [
    {
      description: 'Accompagnement personnalisé pour les démarches administratives en ligne',
      modalites: ['Se présenter sur place', 'Téléphone', 'Contacter par mail'],
      nom: 'Aide aux démarches administratives',
      thematiques: [
        'Aide aux démarches administratives',
        'Maîtrise des outils numériques du quotidien',
        'Insertion professionnelle via le numérique',
        'Utilisation sécurisée du numérique',
      ],
    },
    {
      description: 'Formation aux outils bureautiques et Internet',
      modalites: ['Se présenter sur place'],
      nom: 'Formation bureautique',
      thematiques: [
        'Parentalité et éducation avec le numérique',
        'Loisirs et créations numériques',
        'Compréhension du monde numérique',
        'Accès internet et matériel informatique',
      ],
    },
    {
      description: 'Accompagnement pour la recherche d\'emploi en ligne',
      modalites: ['Téléphone', 'Contacter par mail'],
      nom: 'Accompagnement recherche d\'emploi',
      thematiques: [
        'Acquisition de matériel informatique à prix solidaire',
      ],
    },
  ]
}

export function createDefaultLieuInclusionDetailsData(): LieuInclusionDetailsData {
  return {
    header: createDefaultHeaderData(),
    informationsGenerales: createDefaultInformationsGeneralesData(),
    lieuAccueilPublic: createDefaultLieuAccueilPublicData(),
    personnesTravaillant: createDefaultPersonnesTravaillantData(),
    servicesInclusionNumerique: createDefaultServicesInclusionNumeriqueData(),
  }
}
