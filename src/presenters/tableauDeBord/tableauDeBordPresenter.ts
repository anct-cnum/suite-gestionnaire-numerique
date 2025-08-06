export function tableauDeBordPresenter(territoire: string):  TableauDeBordViewModel {
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
    departement: territoire,
    liens: {
      beneficiaires:  territoire === 'France' ? '/beneficiaires' : `/gouvernance/${territoire}/beneficiaires`,
      financements: territoire === 'France' ? '/convetions' : `/gouvernance/${territoire}/financements`,
      gouvernance: territoire === 'France' ? '/gouvernances' : `/gouvernance/${territoire}`,
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
  departement: string
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

