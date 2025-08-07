import { RecupererLieuxInclusionReadModel } from '@/use-cases/queries/RecupererLieuxInclusion'

export function listeLieuxInclusionPresenter(
  readModel: RecupererLieuxInclusionReadModel
): ListeLieuxInclusionViewModel {
  const lieux = readModel.lieux.map(lieu => ({
    adresse: formatAdresse(lieu),
    id: lieu.id,
    nbAccompagnements: lieu.nb_accompagnements_coop + lieu.nb_accompagnements_ac,
    nbMandatsAC: lieu.nb_mandats_ac,
    nom: lieu.nom,
    siret: lieu.siret ?? 'Non renseigné',
    tags: getTags(lieu),
    typeStructure: lieu.type_structure ?? 'Non renseigné',
  }))

  return {
    displayPagination: readModel.total > readModel.limite,
    lieux,
    limite: readModel.limite,
    nombreDePages: Math.ceil(readModel.total / readModel.limite),
    page: readModel.page,
    total: readModel.total,
  }
}

export interface LieuInclusionViewModel {
  adresse: string
  id: string
  nbAccompagnements: number
  nbMandatsAC: number
  nom: string
  siret: string
  tags: Array<Tag>
  typeStructure: string
}

export interface ListeLieuxInclusionViewModel {
  displayPagination: boolean
  lieux: Array<LieuInclusionViewModel>
  limite: number
  nombreDePages: number
  page: number
  total: number
}

interface Tag {
  couleur: 'green-emeraude' | 'purple-glycine'
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
    tags.push({ couleur: 'purple-glycine' as const, libelle: 'FRR' })
  }
  
  if (lieu.est_qpv) {
    tags.push({ couleur: 'green-emeraude' as const, libelle: 'QPV' })
  }
  
  return tags
}