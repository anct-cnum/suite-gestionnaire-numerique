import { DoublonsProfessionnelsReadModel, SourceDoublon } from '@/use-cases/queries/RecupererDoublonsProfessionnels'

const libelles: Readonly<Record<SourceDoublon, string>> = {
  'aidants-connect': 'Aidants Connect',
  'conseiller-numerique': 'Conseiller numérique',
  coop: 'Coop',
}

const ordreSources: ReadonlyArray<SourceDoublon> = ['aidants-connect', 'coop', 'conseiller-numerique']

export function doublonsProfessionnelsPresenter(
  readModel: DoublonsProfessionnelsReadModel
): DoublonsProfessionnelsViewModel {
  return {
    sections: ordreSources
      .map((source) => {
        const doublons = readModel.filter((doublon) => doublon.source === source)
        return {
          doublons: doublons.map((doublon) => ({
            idsPersonne: `${doublon.personneId1} / ${doublon.personneId2}`,
            idsSource: `${doublon.sourceId1} / ${doublon.sourceId2}`,
            nomComplet: `${doublon.prenom} ${doublon.nom}`,
            structure: doublon.structure,
          })),
          libelle: libelles[source],
          source,
        }
      })
      .filter((section) => section.doublons.length > 0),
    total: readModel.length,
  }
}

export type DoublonsProfessionnelsViewModel = Readonly<{
  sections: ReadonlyArray<
    Readonly<{
      doublons: ReadonlyArray<
        Readonly<{
          idsPersonne: string
          idsSource: string
          nomComplet: string
          structure: string
        }>
      >
      libelle: string
      source: SourceDoublon
    }>
  >
  total: number
}>
