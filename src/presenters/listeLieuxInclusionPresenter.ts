import { formaterEnDateFrancaise } from '@/presenters/shared/date'
import { RecupererLieuxInclusionReadModel } from '@/use-cases/queries/RecupererLieuxInclusion'

export function listeLieuxInclusionPresenter(
  readModel: RecupererLieuxInclusionReadModel,
  now: Date
): ListeLieuxInclusionViewModel {
  const lieux = readModel.lieux.map((lieu) => ({
    adresse: formatAdresse(lieu),
    derniereMiseAJour: getDerniereMiseAJour(lieu.updated_at, now),
    estActif: lieu.est_actif,
    id: lieu.id,
    idCartographieNationale: lieu.structure_cartographie_nationale_id,
    nbAccompagnements: lieu.nb_accompagnements_coop + lieu.nb_accompagnements_ac,
    nbMandatsAC: lieu.nb_mandats_ac,
    nom: lieu.nom,
    siret: lieu.siret,
    tags: getTags(lieu),
    typeStructure: lieu.categorie_juridique ?? 'Non renseigné',
    visiblePourCartographie: lieu.visible_pour_cartographie_nationale ?? false,
  }))

  return {
    displayPagination: readModel.total > readModel.limite,
    lieux,
    limite: readModel.limite,
    nombreDePages: Math.ceil(readModel.total / readModel.limite),
    page: readModel.page,
    total: readModel.total,
    totalConseillerNumerique: readModel.totalConseillerNumerique,
    totalLabellise: readModel.totalLabellise,
  }
}

export interface ListeLieuxInclusionViewModel {
  displayPagination: boolean
  lieux: Array<LieuInclusionViewModel>
  limite: number
  nombreDePages: number
  page: number
  total: number
  totalConseillerNumerique: number
  totalLabellise: number
}

export interface LieuInclusionViewModel {
  adresse: string
  derniereMiseAJour: DerniereMiseAJourViewModel | null
  estActif: boolean
  id: string
  idCartographieNationale: null | string
  nbAccompagnements: number
  nbMandatsAC: number
  nom: string
  siret: null | string
  tags: Array<Tag>
  typeStructure: string
  visiblePourCartographie: boolean
}

export type CouleurFraicheur = 'blue' | 'orange' | 'red' | 'yellow'

interface DerniereMiseAJourViewModel {
  couleur: CouleurFraicheur
  date: string
}

interface Tag {
  couleur: 'green-emeraude' | 'yellow-tournesol'
  libelle: string
}

function formatAdresse(lieu: {
  code_postal: string
  nom_commune: string
  nom_voie: null | string
  numero_voie: null | string
}): string {
  const voie = [lieu.numero_voie, lieu.nom_voie].filter(Boolean).join(' ')
  const adresse = [voie, lieu.code_postal, lieu.nom_commune].filter(Boolean).join(' ')
  return adresse || 'Adresse non renseignée'
}

function getTags(lieu: { est_frr: boolean; est_qpv: boolean }): Array<Tag> {
  const tags: Array<Tag> = []

  if (lieu.est_frr) {
    tags.push({ couleur: 'yellow-tournesol' as const, libelle: 'FRR' })
  }

  if (lieu.est_qpv) {
    tags.push({ couleur: 'green-emeraude' as const, libelle: 'QPV' })
  }

  return tags
}

function getDerniereMiseAJour(updatedAt: Date | null, now: Date): DerniereMiseAJourViewModel | null {
  if (updatedAt === null) {
    return null
  }

  const diffMs = now.getTime() - updatedAt.getTime()
  const diffMois = diffMs / (1000 * 60 * 60 * 24 * 30.44)
  const date = formaterEnDateFrancaise(updatedAt)

  if (diffMois < 6) {
    return { couleur: 'blue', date }
  }

  if (diffMois < 12) {
    return { couleur: 'yellow', date }
  }

  if (diffMois < 18) {
    return { couleur: 'orange', date }
  }

  return { couleur: 'red', date }
}
