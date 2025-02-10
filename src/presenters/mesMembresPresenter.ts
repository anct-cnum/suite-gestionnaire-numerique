import { formaterLeRoleViewModel } from './shared/role'
import { MesMembresReadModel, MembreReadModel, SuggereReadModel, CandidatReadModel } from '@/use-cases/queries/RecupererMesMembres'

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
    contactReferent: `${membre.contactReferent.prenom} ${membre.contactReferent.nom}`,
    roles: membre.roles.map(formaterLeRoleViewModel),
  }
}

function toCandidatsOuSuggeresViewModel(candidats: ReadonlyArray<CandidatReadModel>, suggeres: ReadonlyArray<SuggereReadModel>): MesMembresViewModel['candidatsOuSuggeres'] {
  return [
    ...candidats.map((candidat) => ({
      adresse: candidat.adresse,
      contactReferent: `${candidat.contactReferent.prenom} ${candidat.contactReferent.nom}, ${candidat.contactReferent.fonction} ${candidat.contactReferent.email}`,
      nom: candidat.nom,
      siret: candidat.siret,
      statut: 'Candidat',
      typologie: candidat.typologie,
      uidMembre: candidat.uidMembre,
    })),
    ...suggeres.map((suggere) => ({
      adresse: suggere.adresse,
      contactReferent: `${suggere.contactReferent.prenom} ${suggere.contactReferent.nom}, ${suggere.contactReferent.fonction} ${suggere.contactReferent.email}`,
      nom: suggere.nom,
      siret: suggere.siret,
      statut: 'Suggéré',
      typologie: suggere.typologie,
      uidMembre: suggere.uidMembre,
    })),
  ].toSorted((lMembre, rMembre) => lMembre.nom.localeCompare(rMembre.nom))
}

export type MesMembresViewModel = Readonly<{
  titre: string
  autorisations: Readonly<{
    ajouterUnMembre: boolean
    supprimerUnMembre: boolean
    accesMembreValide: boolean
  }>
  typologies: ReadonlyArray<string>
  roles: ReadonlyArray<string>
  membres: ReadonlyArray<MembreViewModel>
  candidatsOuSuggeres: ReadonlyArray<CandidatOuSuggere>
  uidGouvernance: string
}>

type MembreViewModel = Readonly<{
  suppressionDuMembreAutorise: boolean
  contactReferent: string
  nom: string
  roles: ReadonlyArray<string>
  typologie: string
  uidMembre: string
}>

type CandidatOuSuggere = Readonly<{
  adresse: string
  contactReferent: string
  nom: string
  siret: string
  statut: string
  typologie: string
  uidMembre: string
}>
