import { Contexte } from '@/use-cases/queries/ResoudreContexte'

type MenuItem = Readonly<{
  ariaControls?: string
  customIcon?: string
  icon?: string
  label: string
  sousMenus?: ReadonlyArray<SousMenuItem>
  url(contexte: Contexte): string
  visible?(contexte: Contexte): boolean
}>

type Section = Readonly<{
  badge?: true
  menus: ReadonlyArray<MenuItem>
  titre: string
}>

type SousMenuItem = Readonly<{
  label: string
  url(contexte: Contexte): string
}>

const sectionTableauDeBord: Section = {
  menus: [
    {
      icon: 'dashboard-3-line',
      label: 'Tableau de bord',
      url: () => '/tableau-de-bord',
    },
  ],
  titre: '',
}

const menuMonEquipe: MenuItem = {
  icon: 'team-line',
  label: 'Mon équipe',
  url: () => '/mes-utilisateurs',
}

const menuMaStructure: MenuItem = {
  icon: 'building-line',
  label: 'Ma structure',
  url: (contexte) => `/structure/${contexte.idStructure()}`,
}

function codeTerritoireOuPremierDepartement(contexte: Contexte): string {
  const code = contexte.codeTerritoire()
  return code === 'France' ? '01' : code
}

const sectionAVenir: Section = {
  badge: true,
  menus: [
    {
      icon: 'pen-nib-line',
      label: 'Financements',
      url: (contexte) => `/gouvernance/${codeTerritoireOuPremierDepartement(contexte)}/financements`,
    },
    {
      icon: 'community-line',
      label: 'Bénéficiaires',
      url: (contexte) => `/gouvernance/${codeTerritoireOuPremierDepartement(contexte)}/beneficiaires`,
    },
  ],
  titre: 'à venir',
}

const sectionRapportsEtStatistiques: Section = {
  menus: [
    {
      icon: 'line-chart-line',
      label: 'Statistiques',
      url: () => '/statistiques',
    },
  ],
  titre: 'RAPPORTS ET STATISTIQUES',
}

export function sectionsParContexte(contexte: Contexte): ReadonlyArray<Section> {
  const sections: Array<Section> = [sectionTableauDeBord, sectionOrganisationParContexte(contexte)]

  sections.push(sectionPilotageParContexte(contexte))

  if (contexte.estSuperAdmin()) {
    sections.push(sectionRapportsEtStatistiques)
  }

  sections.push(sectionAVenir)
  return sections
}

function sectionOrganisationParContexte(contexte: Contexte): Section {
  const menus: Array<MenuItem> = []
  if (contexte.idStructure() !== 0) {
    menus.push(menuMaStructure)
  }
  menus.push(menuMonEquipe)
  return { menus, titre: 'ORGANISATION' }
}

function menuGouvernanceParContexte(contexte: Contexte): MenuItem | undefined {
  if (contexte.aCesRoles('administrateur_dispositif')) {
    return {
      icon: 'compass-3-line',
      label: 'Gouvernances',
      url: () => '/gouvernances',
    }
  }

  const nb = contexte.nbGouvernances()
  if (nb === 0) {
    return undefined
  }
  if (nb === 1) {
    return {
      ariaControls: 'fr-sidemenu-gouvernance',
      icon: 'compass-3-line',
      label: 'Gouvernance',
      sousMenus: [
        {
          label: 'Membres',
          url: (ctx) => `/gouvernance/${ctx.codeTerritoire()}/membres`,
        },
        {
          label: 'Feuilles de route',
          url: (ctx) => `/gouvernance/${ctx.codeTerritoire()}/feuilles-de-route`,
        },
      ],
      url: (ctx) => `/gouvernance/${ctx.codeTerritoire()}`,
    }
  }

  return {
    icon: 'compass-3-line',
    label: 'Gouvernances',
    url: () => '/gouvernances/list',
  }
}

function sectionPilotageParContexte(contexte: Contexte): Section {
  const menus: Array<MenuItem> = []

  const menuGouvernance = menuGouvernanceParContexte(contexte)
  if (menuGouvernance !== undefined) {
    menus.push(menuGouvernance)
  }

  const nb = contexte.nbGouvernances()
  const estAdmin = contexte.aCesRoles('administrateur_dispositif')
  const nestPasGestionnaireStructure = !contexte.aCesRoles('gestionnaire_structure')
  const estCoporteur = contexte.estCoporteur()

  if (estAdmin) {
    menus.push({
      icon: 'group-line',
      label: 'Aidants et médiateurs',
      url: () => '/aidants-mediateurs',
    })
    menus.push({
      icon: 'map-pin-2-line',
      label: "Lieux d'inclusion",
      url: () => '/lieux-inclusion',
    })
  } else if (nb === 1) {
    menus.push({
      icon: 'group-line',
      label: 'Aidants et médiateurs',
      url: (ctx) => `/gouvernance/${ctx.codeTerritoire()}/aidants-mediateurs`,
    })
    menus.push({
      icon: 'map-pin-2-line',
      label: "Lieux d'inclusion",
      url: () => '/liste-lieux-inclusion',
    })
  } else {
    menus.push({
      icon: 'group-line',
      label: 'Aidants et médiateurs',
      url: () => '/liste-aidants-mediateurs',
    })
    menus.push({
      icon: 'map-pin-2-line',
      label: "Lieux d'inclusion",
      url: () => '/liste-lieux-inclusion',
    })
  }

  if (nestPasGestionnaireStructure || estCoporteur) {
    menus.push({
      customIcon: `${process.env.NEXT_PUBLIC_HOST}/conum-full.svg`,
      label: 'Suivi des postes CoNum',
      url: () => '/postes-conseiller-numerique',
    })
  }

  return { menus, titre: estAdmin ? 'ADMINISTRATION' : 'PILOTAGE' }
}
