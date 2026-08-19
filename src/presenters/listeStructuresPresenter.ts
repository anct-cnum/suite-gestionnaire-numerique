import { estLabelConumActif } from '@/use-cases/commands/AttesterLabellisationStructure'
import { ListeStructuresReadModel } from '@/use-cases/queries/RecupererListeStructures'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export type StructureListeViewModel = Readonly<{
  adresseComplete: string
  codePostalCommune: string
  estHabiliteeAidantsConnect: boolean
  estLabelliseeConseillerNumerique: boolean
  id: number
  lienAnnuaireEntreprises: string
  lienFiche: string
  nom: string
  siret: string
  typologie: string
}>

export type ListeStructuresViewModel = Readonly<{
  displayPagination: boolean
  limite: number
  page: number
  structures: Array<StructureListeViewModel>
  total: number
  totalHabiliteesAidantsConnect: number
  totalLabelliseesConseillerNumerique: number
  totalPages: number
  totalStructures: number
}>

export function listeStructuresPresenter(
  readModel: ErrorReadModel | ListeStructuresReadModel,
  now: Date
): ErrorReadModel | ListeStructuresViewModel {
  if ('type' in readModel) {
    return readModel
  }

  return {
    displayPagination: readModel.displayPagination,
    limite: readModel.limite,
    page: readModel.page,
    structures: readModel.structures.map((structure) => ({
      adresseComplete: structure.adresse,
      codePostalCommune: [structure.codePostal, structure.commune].filter(Boolean).join(' '),
      estHabiliteeAidantsConnect: structure.estHabiliteeAidantsConnect,
      // Label conseiller numérique actif OU poste conum actif (non rendu)
      estLabelliseeConseillerNumerique:
        estLabelConumActif(structure.derniereAttestationLabelConum, now) || structure.possedePosteConumActif,
      id: structure.id,
      lienAnnuaireEntreprises:
        structure.siret === '' ? '' : `https://annuaire-entreprises.data.gouv.fr/etablissement/${structure.siret}`,
      lienFiche: `/structure/${structure.id}`,
      nom: structure.nom,
      siret: structure.siret,
      typologie: structure.typologie,
    })),
    total: readModel.total,
    totalHabiliteesAidantsConnect: readModel.totalHabiliteesAidantsConnect,
    totalLabelliseesConseillerNumerique: readModel.totalLabelliseesConseillerNumerique,
    totalPages: readModel.totalPages,
    totalStructures: readModel.totalStructures,
  }
}
