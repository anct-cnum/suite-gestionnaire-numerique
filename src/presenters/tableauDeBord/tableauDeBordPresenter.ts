
import { formaterEnNombreFrancais } from '../shared/number'

export function tableauDeBordPresenter(departementCode: string):  TableauDeBordViewModel {
  return {
    aidant: {
      details: [
        {
          color: 'dot-green-tilleul-verveine-850',
          label: 'Aidants habilités Aidants Connect',
          total: 65,
        },
        {
          color: 'dot-green-tilleul-verveine-950',
          label: 'Aidants numériques formés sur AC 2024 Etat',
          total: 20,
        },
      ],
      graphique: {
        backgroundColor: ['#E2CF58', '#FCEEAC'],
      },
      total: 85,
    },
    beneficiaire: {
      collectivite: formaterEnNombreFrancais(1_256),
      details: [
        {
          color: 'dot-purple-glycine-main-494',
          label: 'Conseiller Numérique - 2024 - État',
          total: 20,
        },
        {
          color: 'dot-purple-glycine-850-200',
          label: 'Conseiller Numérique - Plan France Relance - État',
          total: 16,
        },
        {
          color: 'dot-green-tilleul-verveine-925',
          label: 'Formation Aidant Numérique/Aidants Connect - 2024 - État',
          total: 15,
        },
        {
          color: 'dot-orange-terre-battue-850-200',
          label: 'Ingénierie France Numérique Ensemble - 2024 - État',
          total: 15,
        },
      ],
      graphique: {
        backgroundColor: ['#A558A0', '#FBB8F6', '#FBE769', '#fcc0b0'],
      },
      total: 66,
    },
    departement: departementCode,
    gouvernance: {
      collectivite: {
        membre: 9,
        total: 3,
      },
      feuilleDeRoute: {
        action: 3,
        total: 1,
      },
      membre: {
        coporteur: 3,
        total: 9,
      },
    },
    liens: {
      beneficiaires: `/gouvernance/${departementCode}/beneficiaires`,
      financements: `/gouvernance/${departementCode}/financements`,
      gouvernance: `/gouvernance/${departementCode}`,
    },
    mediateur: {
      details: [
        {
          color: 'dot-purple-glycine-sun-319-moon-630',
          label: 'Coordinateurs',
          total: 1,
        },
        {
          color: 'dot-purple-glycine-main-494',
          label: 'Coordinateurs Conseillers numériques',
          total: 1,
        },
        {
          color: 'dot-purple-glycine-950-100',
          label: 'Conseillers numériques',
          total: 41,
        },
        {
          color: 'dot-purple-glycine-850-200',
          label: 'Conseillers numériques habilités Aidants Connect',
          total: 5,
        },
        {
          color: 'dot-purple-glycine-925-125',
          label: 'Médiateurs non-habilités Aidants Connect',
          total: 5,
        },
      ],
      graphique: {
        backgroundColor: ['#6E445A', '#A558A0', '#fee7fc', '#FBB8F6', '#FDDBFA'],
      },
      total: 63,
    },
    taches: [
      {
        context: 'Conseillers Numériques',
        label: '7 demandes de postes à traiter',
        lien: 'Traiter les demandes',
      },
      {
        context: 'Gouvernance',
        label: 'Renseigner les actions et budget 2025',
        lien: 'Compléter les actions',
      },
      {
        context: 'Conseillers Numériques',
        label: '8 postes vacants à traiter',
        lien: 'Les postes vacants',
      },
    ],
  }
}

export type TableauDeBordViewModel = Readonly<{
  aidant: Readonly<{
    details: ReadonlyArray<{
      color: string
      label: string
      total: number
    }>
    graphique: Readonly<{
      backgroundColor: ReadonlyArray<string>
    }>
    total: number
  }>
  beneficiaire: Readonly<{
    collectivite: string
    details: ReadonlyArray<{
      color: string
      label: string
      total: number
    }>
    graphique: Readonly<{
      backgroundColor: ReadonlyArray<string>
    }>
    total: number
  }>
  departement: string
  // financements: Readonly<{
  //   budget: Readonly<{
  //     feuillesDeRoute: number
  //     total: string
  //   }>
  //   credit: Readonly<{
  //     pourcentage: number
  //     total: string
  //   }>
  //   nombreDeFinancementsEngagesParLEtat: number
  //   ventilationSubventionsParEnveloppe: ReadonlyArray<{
  //     color: string
  //     label: string
  //     total: string
  //   }>
  // }>
  
  gouvernance: Readonly<{
    collectivite: Readonly<{
      membre: number
      total: number
    }>
    feuilleDeRoute: Readonly<{
      action: number
      total: number
    }>
    membre: Readonly<{
      coporteur: number
      total: number
    }>
  }>
  liens: Readonly<{
    beneficiaires: string
    financements: string
    gouvernance: string
  }>
  mediateur: Readonly<{
    details: ReadonlyArray<{
      color: string
      label: string
      total: number
    }>
    graphique: Readonly<{
      backgroundColor: ReadonlyArray<string>
    }>
    total: number
  }>
  taches: ReadonlyArray<{
    context: string
    label: string
    lien: string
  }>
}>

