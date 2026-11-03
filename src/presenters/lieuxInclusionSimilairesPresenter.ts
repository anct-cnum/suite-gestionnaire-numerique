import { libelleTypologie } from '@/presenters/shared/typologie'
import { LieuInclusionSimilaireReadModel } from '@/use-cases/queries/RechercherLieuxInclusionSimilaires'

export function lieuxInclusionSimilairesPresenter(
  lieux: ReadonlyArray<LieuInclusionSimilaireReadModel>,
  enModification: boolean
): ReadonlyArray<LieuInclusionSimilaireViewModel> {
  return lieux.map((lieu) => ({
    adresse: lieu.adresse,
    // Le bandeau « déjà enregistré » (maquette V6-3) n'a de sens qu'à la création.
    href: enModification ? `/lieu/${lieu.id}` : `/lieu/${lieu.id}?dejaEnregistre=1`,
    libellePersonnesRattachees: libellePersonnesRattachees(lieu.nombrePersonnesRattachees),
    libelleSiret: lieu.siret === null ? 'Sans SIRET' : `SIRET ${formaterSiret(lieu.siret)}`,
    nom: lieu.nom,
    typologies:
      lieu.typologies.length === 0
        ? 'Non renseigné'
        : lieu.typologies.map((typologie) => libelleTypologie(typologie)).join(', '),
  }))
}

export type LieuInclusionSimilaireViewModel = Readonly<{
  adresse: string
  href: string
  libellePersonnesRattachees: string
  libelleSiret: string
  nom: string
  typologies: string
}>

function libellePersonnesRattachees(nombre: number): string {
  return nombre > 1 ? `${nombre} personnes rattachées` : `${nombre} personne rattachée`
}

// Groupement SIREN / NIC tel qu'il apparaît sur les maquettes : 200 069 497 00013.
function formaterSiret(siret: string): string {
  if (siret.length !== 14) {
    return siret
  }
  return `${siret.slice(0, 3)} ${siret.slice(3, 6)} ${siret.slice(6, 9)} ${siret.slice(9)}`
}
