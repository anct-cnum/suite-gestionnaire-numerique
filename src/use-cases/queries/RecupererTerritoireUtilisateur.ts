import { UnUtilisateurReadModel } from './shared/UnUtilisateurReadModel'

export class RecupererTerritoireUtilisateur {
  readonly #loader: TerritoireDepartementsLoader

  constructor(loader: TerritoireDepartementsLoader) {
    this.#loader = loader
  }

  async handle(utilisateur: UnUtilisateurReadModel): Promise<TerritoireReadModel> {
    if (utilisateur.role.type === 'administrateur_dispositif') {
      return { codes: ['France'], type: 'france' }
    }

    if (utilisateur.role.type === 'gestionnaire_departement') {
      return {
        codes: utilisateur.departementCode === null ? [] : [utilisateur.departementCode],
        type: 'departement',
      }
    }

    if (utilisateur.role.type === 'gestionnaire_region') {
      return {
        codes: utilisateur.regionCode === null ? [] : [utilisateur.regionCode],
        type: 'region',
      }
    }

    if (utilisateur.role.type === 'gestionnaire_structure') {
      if (utilisateur.structureId === null) {
        return { codes: [], type: 'departement' }
      }
      const code = await this.#loader.getDepartementCodeByStructureId(utilisateur.structureId)
      return {
        codes: code === null ? [] : [code],
        type: 'departement',
      }
    }
    // implémenter la logique pour les groupements
    throw new Error('Type utilisateur non géré')
  }
}

export interface TerritoireDepartementsLoader {
  getDepartementCodeByStructureId(structureId: number): Promise<null | string>
}

export type TerritoireReadModel = Readonly<{
  codes: ReadonlyArray<string>
  type: 'departement' | 'france' | 'region'
}>
