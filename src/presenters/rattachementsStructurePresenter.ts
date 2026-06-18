import { RattachementsStructureReadModel } from '@/use-cases/queries/RecupererRattachementsStructure'

export function rattachementsStructurePresenter(
  readModel: RattachementsStructureReadModel
): RattachementsStructureViewModel {
  return [
    { label: 'Utilisateurs', nombre: readModel.utilisateurs },
    { label: 'Membres de gouvernance', nombre: readModel.membres },
    { label: 'Postes', nombre: readModel.postes },
    { label: 'Contrats', nombre: readModel.contrats },
    { label: 'Affectations emploi', nombre: readModel.affectations },
    { label: 'Contacts référents', nombre: readModel.contacts },
    { label: 'Lieux d’inclusion', nombre: readModel.lieux },
  ]
}

export type RattachementsStructureViewModel = ReadonlyArray<RattachementLigneViewModel>

export type RattachementLigneViewModel = Readonly<{
  label: string
  nombre: number
}>
