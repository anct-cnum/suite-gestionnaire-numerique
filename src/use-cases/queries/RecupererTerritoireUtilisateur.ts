import { Administrateur } from '@/domain/Administrateur'
import { GestionnaireDepartement } from '@/domain/GestionnaireDepartement'
import { GestionnaireStructure } from '@/domain/GestionnaireStructure'
import { Utilisateur } from '@/domain/Utilisateur'

export class RecupererTerritoireUtilisateur {
  readonly #loader: TerritoireDepartementsLoader

  constructor(loader: TerritoireDepartementsLoader) {
    this.#loader = loader
  }

  async handle(utilisateur: Utilisateur): Promise<TerritoireReadModel> {
    if (utilisateur instanceof Administrateur) {
      return { codes: ['France'], type: 'france' }
    }

    if (utilisateur instanceof GestionnaireDepartement) {
      return {
        codes: [utilisateur.state.departement.code],
        type: 'departement',
      }
    }

    if (utilisateur instanceof GestionnaireStructure) {
      const code = await this.#loader.getDepartementCodeByStructureId(
        utilisateur.state.structureUid.value
      )
      return {
        codes: code === null ? [] : [code],
        type: 'departement',
      }
    }

    throw new Error('Type utilisateur non géré')
  }
}

export interface TerritoireDepartementsLoader {
  getDepartementCodeByStructureId(structureId: number): Promise<null | string>
}

export type TerritoireReadModel = Readonly<{
  codes: ReadonlyArray<string>
  type: 'departement' | 'france'
}>
