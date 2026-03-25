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

const sectionAdministration: Section = {
  menus: [
    {
      icon: 'compass-3-line',
      label: 'Gouvernances',
      url: () => '/gouvernances',
    },
    {
      icon: 'group-line',
      label: 'Aidants et médiateurs',
      url: () => '/aidants-mediateurs',
    },
    {
      icon: 'map-pin-2-line',
      label: "Lieux d'inclusion",
      url: () => '/lieux-inclusion',
    },
    {
      customIcon: `${process.env.NEXT_PUBLIC_HOST}/conum-full.svg`,
      label: 'Suivi des postes CoNum',
      url: () => '/postes-conseiller-numerique',
    },
  ],
  titre: 'ADMINISTRATION',
}

const sectionPilotage: Section = {
  menus: [
    {
      ariaControls: 'fr-sidemenu-gouvernance',
      icon: 'compass-3-line',
      label: 'Gouvernance',
      sousMenus: [
        {
          label: 'Membres',
          url: (contexte) => `/gouvernance/${contexte.codeTerritoire()}/membres`,
        },
        {
          label: 'Feuilles de route',
          url: (contexte) => `/gouvernance/${contexte.codeTerritoire()}/feuilles-de-route`,
        },
      ],
      url: (contexte) => `/gouvernance/${contexte.codeTerritoire()}`,
    },
    {
      icon: 'group-line',
      label: 'Aidants et médiateurs',
      url: (contexte) => `/gouvernance/${contexte.codeTerritoire()}/aidants-mediateurs`,
    },
    {
      icon: 'map-pin-2-line',
      label: "Lieux d'inclusion",
      url: () => '/lieux-inclusion',
    },
  ],
  titre: 'PILOTAGE',
}

const sectionPilotageMultiGouvernances: Section = {
  menus: [
    {
      icon: 'compass-3-line',
      label: 'Gouvernances',
      url: () => '/gouvernances/list',
    },
    {
      icon: 'group-line',
      label: 'Aidants et médiateurs',
      url: () => '/liste-aidants-mediateurs',
    },
    {
      icon: 'map-pin-2-line',
      label: "Lieux d'inclusion",
      url: () => '/liste-lieux-inclusion',
    },
  ],
  titre: 'PILOTAGE',
}

const sectionAVenir: Section = {
  badge: true,
  menus: [
    {
      icon: 'pen-nib-line',
      label: 'Financements',
      url: (contexte) => `/gouvernance/${contexte.codeTerritoire()}/financements`,
    },
    {
      icon: 'community-line',
      label: 'Bénéficiaires',
      url: (contexte) => `/gouvernance/${contexte.codeTerritoire()}/beneficiaires`,
    },
  ],
  titre: 'à venir',
}

export function sectionsParContexte(contexte: Contexte): ReadonlyArray<Section> {
  const sections: Array<Section> = [sectionTableauDeBord, sectionOrganisationParContexte(contexte)]

  if (contexte.aCesRoles('administrateur_dispositif')) {
    sections.push(sectionAdministration)
  }

  const pilotage = sectionPilotageParContexte(contexte)
  if (pilotage !== undefined) {
    sections.push(pilotage)
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

function sectionPilotageParContexte(contexte: Contexte): Section | undefined {
  if (!contexte.aCesRoles('gestionnaire_departement', 'gestionnaire_structure')) {
    return undefined
  }
  const nb = contexte.nbGouvernances()
  if (nb === 1) {
    return sectionPilotage
  }
  if (nb > 1) {
    return sectionPilotageMultiGouvernances
  }
  return undefined
}
