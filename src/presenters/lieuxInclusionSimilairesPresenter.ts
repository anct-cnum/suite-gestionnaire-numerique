import { LieuInclusionSimilaireReadModel } from '@/use-cases/queries/RechercherLieuxInclusionSimilaires'

export function lieuxInclusionSimilairesPresenter(
  lieux: ReadonlyArray<LieuInclusionSimilaireReadModel>
): ReadonlyArray<LieuInclusionSimilaireViewModel> {
  return lieux.map((lieu) => ({
    adresse: lieu.adresse,
    estLieuCoop: lieu.estLieuCoop,
    href: `/lieu/${lieu.id}`,
    libelleMotif: libellesMotif[lieu.motif],
    nom: lieu.nom,
  }))
}

export type LieuInclusionSimilaireViewModel = Readonly<{
  adresse: string
  estLieuCoop: boolean
  href: string
  libelleMotif: string
  nom: string
}>

const libellesMotif: Readonly<Record<LieuInclusionSimilaireReadModel['motif'], string>> = {
  adresse: 'Même adresse',
  nom: 'Nom proche, même commune',
  siret: 'Même SIRET',
}
