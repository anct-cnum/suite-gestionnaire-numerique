import prisma from '../../prisma/prismaClient'
import {
  RejoindreUneGouvernanceLoader,
  RejoindreUneGouvernanceReadModel,
} from '@/use-cases/queries/RecupererRejoindreUneGouvernance'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaRejoindreUneGouvernanceLoader implements RejoindreUneGouvernanceLoader {
  readonly #gouvernanceDataResource = prisma.gouvernanceRecord
  readonly #nafDataResource = prisma.naf
  readonly #structureDataResource = prisma.main_structure_administrative

  async get(structureId: number): Promise<ErrorReadModel | RejoindreUneGouvernanceReadModel> {
    const structure = await this.#structureDataResource.findUnique({
      include: {
        adresse: true,
        categories_juridiques: true,
      },
      where: {
        id: structureId,
      },
    })

    if (!structure) {
      return {
        message: 'La structure est introuvable',
        type: 'error',
      }
    }

    const naf = structure.code_activite_principale
      ? await this.#nafDataResource.findUnique({
          where: {
            code: structure.code_activite_principale,
          },
        })
      : null

    const gouvernances = await this.#gouvernanceDataResource.findMany({
      include: {
        relationDepartement: true,
      },
      orderBy: {
        departementCode: 'asc',
      },
      where: {
        departementCode: {
          not: 'zzz',
        },
        membres: {
          none: {
            structureId,
          },
        },
      },
    })

    return {
      departementsDisponibles: gouvernances.map((gouvernance) => ({
        code: gouvernance.relationDepartement.code,
        nom: gouvernance.relationDepartement.nom,
      })),
      structure: {
        activitePrincipaleCode: structure.code_activite_principale,
        activitePrincipaleLibelle: naf?.intitule_long ?? null,
        adresse: this.#formaterAdresse(structure.adresse),
        categorieJuridiqueCode: structure.categorie_juridique,
        categorieJuridiqueLibelle: structure.categories_juridiques?.nom ?? null,
        nom: structure.denomination_antenne ?? structure.denomination_sirene ?? '',
        siret: structure.siret ?? structure.ridet ?? '',
      },
    }
  }

  #formaterAdresse(
    adresse: null | Readonly<{
      code_postal: string
      nom_commune: string
      nom_voie: null | string
      numero_voie: null | number
      repetition: null | string
    }>
  ): string {
    if (!adresse) {
      return ''
    }

    return [adresse.numero_voie, adresse.repetition, adresse.nom_voie, adresse.code_postal, adresse.nom_commune]
      .filter((partie) => partie !== null && partie !== '')
      .join(' ')
  }
}
