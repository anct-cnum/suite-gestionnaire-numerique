import { formaterLeRoleViewModel } from './shared/role'
import { MesMembresReadModel, MembreReadModel } from '@/use-cases/queries/RecupererMesMembres'

export function mesMembresPresenter(mesMembresReadModel: MesMembresReadModel): MesMembresViewModel {
  return {
    autorisations: mesMembresReadModel.autorisations,
    candidatsOuSuggeres: toCandidatsOuSuggeresViewModel(mesMembresReadModel.candidats, mesMembresReadModel.suggeres),
    membres: mesMembresReadModel.membres.map(toMembreViewModel),
    roles: mesMembresReadModel.roles.map(formaterLeRoleViewModel),
    titre: `Gérer les membres · ${mesMembresReadModel.departement}`,
    typologies: mesMembresReadModel.typologies,
    uidGouvernance: mesMembresReadModel.uidGouvernance,
  }
}

function toMembreViewModel(membre: MembreReadModel): MembreViewModel {
  return {
    ...membre,
    contactReferent: membre.contactReferent ? `${membre.contactReferent.prenom} ${membre.contactReferent.nom}` : '-',
    roles: membre.roles.map(formaterLeRoleViewModel),
  }
}

function toCandidatsOuSuggeresViewModel(candidats: ReadonlyArray<MembreReadModel>, suggeres: ReadonlyArray<MembreReadModel>): MesMembresViewModel['candidatsOuSuggeres'] {
  return [
    ...candidats.map((candidat) => buildCandidatsOuSuggeres(candidat, 'Candidat')),
    ...suggeres.map((suggere) => buildCandidatsOuSuggeres(suggere, 'Suggéré')),
  ].toSorted((lMembre, rMembre) => lMembre.nom.localeCompare(rMembre.nom))
}

function buildCandidatsOuSuggeres(membre: MembreReadModel, statut: string): CandidatOuSuggereViewModel {
  return {
    adresse: membre.adresse,
    contactReferent:
      membre.contactReferent ? `${membre.contactReferent.prenom} ${membre.contactReferent.nom}, ${membre.contactReferent.fonction} ${membre.contactReferent.email}` : 'Donnée non fournie',
    nom: membre.nom,
    siret: membre.siret,
    statut,
    typologie: membre.typologie ? membre.typologie : 'Donnée non fournie',
    uidMembre: membre.uidMembre,
  }
}

export type MesMembresViewModel = Readonly<{
  titre: string
  autorisations: Readonly<{
    ajouterUnMembre: boolean
    supprimerUnMembre: boolean
    accesMembreConfirme: boolean
  }>
  typologies: ReadonlyArray<string>
  roles: ReadonlyArray<string>
  membres: ReadonlyArray<MembreViewModel>
  candidatsOuSuggeres: ReadonlyArray<CandidatOuSuggereViewModel>
  uidGouvernance: string
}>

type MembreViewModel = Readonly<{
  adresse: string
  contactReferent?: string
  nom: string
  roles: ReadonlyArray<string>
  siret: string
  suppressionDuMembreAutorise: boolean
  typologie?: string
  uidMembre: string
}>

type CandidatOuSuggereViewModel = Readonly<{
  adresse: string
  contactReferent?: string
  nom: string
  siret: string
  statut: string
  typologie?: string
  uidMembre: string
}>
