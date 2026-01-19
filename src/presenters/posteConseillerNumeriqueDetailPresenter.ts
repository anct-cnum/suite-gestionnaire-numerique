import { formaterEnDateFrancaise } from './shared/date'
import { formatMontant } from './shared/number'
import { PosteConseillerNumeriqueDetailReadModel } from '@/use-cases/queries/RecupererUnPosteConseillerNumerique'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export function posteConseillerNumeriqueDetailPresenter(
  readModel: ErrorReadModel | PosteConseillerNumeriqueDetailReadModel,
  now: Date
): ErrorReadModel | PosteDetailViewModel {
  if ('type' in readModel) {
    return readModel
  }

  return {
    badges: buildBadges(readModel),
    contrats: buildContrats(readModel.contrats, now),
    conventionsEtFinancements: buildConventionsEtFinancements(readModel.conventions, now),
    posteId: readModel.posteConumId,
    structure: {
      adresse: readModel.structure.adresse,
      departement: readModel.structure.departement,
      nom: readModel.structure.nom,
      referent: readModel.structure.referent ?? undefined,
      region: readModel.structure.region,
      siret: readModel.structure.siret,
      structureId: readModel.structure.structureId,
      typologie: readModel.structure.typologie,
    },
  }
}

type PosteDetailViewModel = Readonly<{
  badges: ReadonlyArray<Readonly<{
    color: string
    label: string
  }>>
  contrats: ReadonlyArray<ContratViewModel>
  conventionsEtFinancements: ConventionsViewModel
  posteId: number
  structure: Readonly<{
    adresse: string
    departement: string
    nom: string
    referent?: Readonly<{
      email: string
      fonction: string
      nom: string
      telephone: string
    }>
    region: string
    siret: string
    structureId: number
    typologie: string
  }>
}>

type ContratViewModel = Readonly<{
  contrat: string
  dateDebut: string
  dateFin: string
  dateRupture: string
  mediateur: string
  role: string
  statut: Readonly<{
    libelle: string
    variant: string
  }>
}>

type ConventionDetailViewModel = Readonly<{
  dateDebut: string
  dateFin: string
  id: string
  libelle: string
  montantBonification: string
  montantTotal: string
  montantVerse: string
  statut: Readonly<{
    libelle: string
    variant: string
  }>
}>

type EnveloppeDetailViewModel = Readonly<{
  color: 'france' | 'menthe' | 'tilleul'
  libelle: string
  montant: number
  montantFormate: string
}>

type ConventionsViewModel = Readonly<{
  conventions: ReadonlyArray<ConventionDetailViewModel>
  creditsEngagesParLEtat: string
  enveloppes: ReadonlyArray<EnveloppeDetailViewModel>
}>

function buildBadges(
  readModel: PosteConseillerNumeriqueDetailReadModel
): PosteDetailViewModel['badges'] {
  const badges: Array<{ color: string; label: string }> = []

  // Badge de statut
  const statutBadge = getStatutBadge(readModel.statut)
  badges.push(statutBadge)

  // Badge coordinateur
  if (readModel.estCoordinateur) {
    badges.push({ color: 'info', label: 'Coordinateur' })
  }

  // Badge bonifié
  if (readModel.estBonifie) {
    badges.push({ color: 'warning', label: 'Poste bonifié' })
  }

  return badges
}

function getStatutBadge(statut: string): { color: string; label: string } {
  switch (statut) {
    case 'occupe':
      return { color: 'success', label: 'Occupé' }
    case 'rendu':
      return { color: 'error', label: 'Rendu' }
    case 'vacant':
      return { color: 'info', label: 'Vacant' }
    default:
      return { color: 'info', label: statut }
  }
}

function buildContrats(
  contrats: PosteConseillerNumeriqueDetailReadModel['contrats'],
  now: Date
): ReadonlyArray<ContratViewModel> {
  return contrats.map((contrat) => {
    const dateFin = contrat.dateFin
    const isEnCours = dateFin ? dateFin > now : true
    const hasRupture = contrat.dateRupture !== null

    return {
      contrat: contrat.typeContrat,
      dateDebut: contrat.dateDebut ? formaterEnDateFrancaise(contrat.dateDebut) : '-',
      dateFin: contrat.dateFin ? formaterEnDateFrancaise(contrat.dateFin) : '-',
      dateRupture: contrat.dateRupture ? formaterEnDateFrancaise(contrat.dateRupture) : '-',
      mediateur: contrat.mediateur,
      role: contrat.role,
      statut: {
        libelle: hasRupture || !isEnCours ? 'Terminé' : 'En cours',
        variant: hasRupture || !isEnCours ? 'error' : 'success',
      },
    }
  })
}

function buildConventionsEtFinancements(
  conventions: PosteConseillerNumeriqueDetailReadModel['conventions'],
  now: Date
): ConventionsViewModel {
  const conventionsList: Array<ConventionDetailViewModel> = []
  const enveloppes: Array<EnveloppeDetailViewModel> = []

  // Convention V2 (Renouvellement) - affichée en premier si elle existe
  if (conventions.v2 !== null) {
    const conventionV2 = buildConventionV2(conventions.v2, now)
    conventionsList.push(conventionV2.convention)
    enveloppes.push(conventionV2.enveloppe)
  }

  // Convention V1 (Initiale)
  if (conventions.v1 !== null) {
    const conventionV1 = buildConventionV1(conventions.v1, now)
    conventionsList.push(conventionV1.convention)
    enveloppes.push(conventionV1.enveloppe)
  }

  return {
    conventions: conventionsList,
    creditsEngagesParLEtat: formatMontant(conventions.creditsEngagesParLEtat),
    enveloppes,
  }
}

function buildConventionV2(
  v2: NonNullable<PosteConseillerNumeriqueDetailReadModel['conventions']['v2']>,
  now: Date
): { convention: ConventionDetailViewModel; enveloppe: EnveloppeDetailViewModel } {
  const total = v2.subvention + v2.bonification
  const isEnCours = v2.dateFin ? v2.dateFin > now : true

  return {
    convention: {
      dateDebut: v2.dateDebut ? formaterEnDateFrancaise(v2.dateDebut) : '-',
      dateFin: v2.dateFin ? formaterEnDateFrancaise(v2.dateFin) : '-',
      id: 'v2',
      libelle: 'Renouvellement (V2)',
      montantBonification: formatMontant(v2.bonification),
      montantTotal: formatMontant(total),
      montantVerse: formatMontant(v2.versement),
      statut: {
        libelle: isEnCours ? 'En cours' : 'Expirée',
        variant: isEnCours ? 'success' : 'error',
      },
    },
    enveloppe: {
      color: 'menthe',
      libelle: 'Conseiller Numérique - Renouvellement - État',
      montant: total,
      montantFormate: formatMontant(total),
    },
  }
}

function buildConventionV1(
  v1: NonNullable<PosteConseillerNumeriqueDetailReadModel['conventions']['v1']>,
  now: Date
): { convention: ConventionDetailViewModel; enveloppe: EnveloppeDetailViewModel } {
  const total = v1.subvention + v1.bonification
  const isEnCours = v1.dateFin ? v1.dateFin > now : true

  return {
    convention: {
      dateDebut: v1.dateDebut ? formaterEnDateFrancaise(v1.dateDebut) : '-',
      dateFin: v1.dateFin ? formaterEnDateFrancaise(v1.dateFin) : '-',
      id: 'v1',
      libelle: 'Initiale (V1)',
      montantBonification: formatMontant(v1.bonification),
      montantTotal: formatMontant(total),
      montantVerse: formatMontant(v1.versement),
      statut: {
        libelle: isEnCours ? 'En cours' : 'Expirée',
        variant: isEnCours ? 'success' : 'error',
      },
    },
    enveloppe: {
      color: 'france',
      libelle: 'Conseiller Numérique - Plan France Relance - État',
      montant: total,
      montantFormate: formatMontant(total),
    },
  }
}
