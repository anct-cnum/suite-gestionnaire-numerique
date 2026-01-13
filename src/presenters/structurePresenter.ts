import { formaterEnDateFrancaise } from './shared/date'
import { formatMontant } from './shared/number'
import { RoleViewModel, toRoleViewModel } from './shared/role'
import { UneStructureReadModel } from '@/use-cases/queries/RecupererUneStructure'

export function structurePresenter(uneStructureReadModel: UneStructureReadModel, now: Date): StructureViewModel {
  return {
    aidantsEtMediateurs: {
      liste: uneStructureReadModel.aidantsEtMediateurs.liste.map(aidant => ({
        fonction: aidant.fonction,
        id: aidant.id,
        lienFiche: aidant.lienFiche,
        logos: aidant.logos,
        nom: `${aidant.prenom} ${aidant.nom}`.trim(),
      })),
      totalAidant: uneStructureReadModel.aidantsEtMediateurs.totalAidant,
      totalCoordinateur: uneStructureReadModel.aidantsEtMediateurs.totalCoordinateur,
      totalMediateur: uneStructureReadModel.aidantsEtMediateurs.totalMediateur,
    },
    contactReferent: uneStructureReadModel.contactReferent,
    contratsRattaches: uneStructureReadModel.contratsRattaches.map(contrat => {
      const dateFin = contrat.dateFin
      const isEnCours = dateFin ? dateFin > now : true
      const dateRupture = contrat.dateRupture

      return {
        contrat: contrat.contrat,
        dateDebut: contrat.dateDebut ? formaterEnDateFrancaise(contrat.dateDebut) : '-',
        dateFin: contrat.dateFin ? formaterEnDateFrancaise(contrat.dateFin) : '-',
        dateRupture: dateRupture ? formaterEnDateFrancaise(dateRupture) : '-',
        mediateur: contrat.mediateur,
        role: contrat.role,
        statut: {
          libelle: isEnCours ? 'En cours' : 'Expirée',
          variant: isEnCours ? 'success' : 'error',
        },
      }
    }),
    conventionsEtFinancements: {
      conventions: uneStructureReadModel.conventionsEtFinancements.conventions.map(convention => {
        const isEnCours = convention.dateFin > now

        return {
          dateDebut: formaterEnDateFrancaise(convention.dateDebut),
          dateFin: formaterEnDateFrancaise(convention.dateFin),
          id: convention.id,
          libelle: convention.libelle,
          montantBonification: formatMontant(convention.montantBonification),
          montantSubvention: formatMontant(convention.montantSubvention),
          montantTotal: formatMontant(convention.montantTotal),
          statut: {
            libelle: isEnCours ? 'En cours' : 'Expirée',
            variant: isEnCours ? 'success' : 'error',
          },
        }
      }),
      creditsEngagesParLEtat: formatMontant(uneStructureReadModel.conventionsEtFinancements.creditsEngagesParLEtat),
      enveloppes: uneStructureReadModel.conventionsEtFinancements.enveloppes.map((enveloppe, index) => {
        // Assigner les couleurs de manière cyclique
        const colors: Array<'france' | 'menthe' | 'tilleul'> = ['france', 'menthe', 'tilleul']
        const color = colors[index % colors.length]

        return {
          color,
          libelle: enveloppe.libelle,
          montant: enveloppe.montant,
          montantFormate: formatMontant(enveloppe.montant),
        }
      }),
      lienConventions: uneStructureReadModel.conventionsEtFinancements.lienConventions,
    },
    identite: {
      adresse: uneStructureReadModel.identite.adresse,
      departement: uneStructureReadModel.identite.departement,
      editeur: uneStructureReadModel.identite.editeur,
      edition: uneStructureReadModel.identite.edition
        ? formaterEnDateFrancaise(uneStructureReadModel.identite.edition)
        : '-',
      identifiant: String(uneStructureReadModel.identite.siret ?? ''),
      nom: uneStructureReadModel.identite.nom,
      region: uneStructureReadModel.identite.region,
      siret: uneStructureReadModel.identite.siret ?? '',
      typologie: uneStructureReadModel.identite.typologie,
    },
    role: {
      feuillesDeRoute: uneStructureReadModel.role.feuillesDeRoute,
      gouvernances: uneStructureReadModel.role.gouvernances.map(gouvernance => ({
        code: gouvernance.code,
        nom: gouvernance.nom,
        roles: gouvernance.roles.map(toRoleViewModel),
      })),
      membreDepuisLe: uneStructureReadModel.role.membreDepuisLe
        ? formaterEnDateFrancaise(uneStructureReadModel.role.membreDepuisLe)
        : '-',
    },
    structureId: uneStructureReadModel.structureId,
  }
}

export type StructureViewModel = Readonly<{
  aidantsEtMediateurs: Readonly<{
    liste: ReadonlyArray<{
      fonction: string
      id: number
      lienFiche: string
      logos: ReadonlyArray<string>
      nom: string
    }>
    totalAidant: number
    totalCoordinateur: number
    totalMediateur: number
  }>
  contactReferent: Readonly<{
    email: string
    fonction: string
    nom: string
    prenom: string
    telephone: string
  }>
  contratsRattaches: ReadonlyArray<{
    contrat: string
    dateDebut: string
    dateFin: string
    dateRupture: string
    mediateur: string
    role: string
    statut: Statut
  }>
  conventionsEtFinancements: Readonly<{
    conventions: ReadonlyArray<{
      dateDebut: string
      dateFin: string
      id: string
      libelle: string
      montantBonification: string
      montantSubvention: string
      montantTotal: string
      statut: Statut
    }>
    creditsEngagesParLEtat: string
    enveloppes: ReadonlyArray<{
      color: 'france' | 'menthe' | 'tilleul'
      libelle: string
      montant: number
      montantFormate: string
    }>
    lienConventions: string
  }>
  identite: Readonly<{
    adresse: string
    departement: string
    editeur: string
    edition: string
    identifiant: string
    nom: string
    region: string
    siret: string
    typologie: string
  }>
  role: Readonly<{
    feuillesDeRoute: ReadonlyArray<{
      libelle: string
      lien: string
    }>
    gouvernances: ReadonlyArray<{
      code: string
      nom: string
      roles: ReadonlyArray<RoleViewModel>
    }>
    membreDepuisLe: string
  }>
  structureId: number
}>

type Statut = Readonly<{
  libelle: 'En cours' | 'Expirée'
  variant: 'error' | 'info' | 'new' | 'success' | 'warning'
}>
