import { StructureLabelReadModel } from '@/use-cases/queries/RecupererStructureLabel'

export function labellisationEtape1Presenter(readModel: StructureLabelReadModel): LabellisationEtape1ViewModel {
  return {
    contacts: readModel.contacts,
    identite: {
      adresse: ouTiret(readModel.identite.adresse),
      departement: ouTiret(readModel.identite.departement),
      nom: ouTiret(readModel.identite.nom),
      region: ouTiret(readModel.identite.region),
      siret: readModel.identite.siret,
      typologie: ouTiret(readModel.identite.typologie),
    },
    structureId: readModel.structureId,
  }
}

export function labellisationEtape2Presenter(readModel: StructureLabelReadModel): LabellisationEtape2ViewModel {
  return {
    structure: {
      adresse: ouTiret(readModel.identite.adresse),
      nom: ouTiret(readModel.identite.nom),
      siret: readModel.identite.siret,
    },
    structureId: readModel.structureId,
  }
}

export type LabellisationEtape1ViewModel = Readonly<{
  contacts: ReadonlyArray<
    Readonly<{
      email: string
      estReferentFNE: boolean
      fonction: string
      id: number
      nom: string
      prenom: string
      telephone: string
    }>
  >
  identite: Readonly<{
    adresse: string
    departement: string
    nom: string
    region: string
    siret: string
    typologie: string
  }>
  structureId: number
}>

export type LabellisationEtape2ViewModel = Readonly<{
  structure: Readonly<{
    adresse: string
    nom: string
    siret: string
  }>
  structureId: number
}>

function ouTiret(valeur: string): string {
  return valeur === '' ? '-' : valeur
}
