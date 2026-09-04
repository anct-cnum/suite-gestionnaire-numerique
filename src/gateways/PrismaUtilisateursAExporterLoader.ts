import prisma from '../../prisma/prismaClient'
import {
  UnUtilisateurAExporterReadModel,
  UtilisateursAExporterLoader,
  UtilisateursAExporterReadModel,
} from '@/use-cases/queries/RecupererUtilisateursAExporter'

export class PrismaUtilisateursAExporterLoader implements UtilisateursAExporterLoader {
  readonly #dataResource = prisma.utilisateurRecord

  async get(): Promise<UtilisateursAExporterReadModel> {
    const [gestionnairesDepartement, utilisateursDeStructuresMembres] = await Promise.all([
      this.#gestionnairesDepartement(),
      this.#utilisateursDeStructuresMembres(),
    ])

    return [...gestionnairesDepartement, ...utilisateursDeStructuresMembres].sort(
      (utilisateurA, utilisateurB) =>
        utilisateurA.nom.localeCompare(utilisateurB.nom) || utilisateurA.prenom.localeCompare(utilisateurB.prenom)
    )
  }

  async #gestionnairesDepartement(): Promise<Array<UnUtilisateurAExporterReadModel>> {
    const records = await this.#dataResource.findMany({
      include: {
        relationDepartement: true,
      },
      where: {
        isSupprime: false,
        role: 'gestionnaire_departement',
      },
    })

    return records.map((record) => ({
      departements: record.relationDepartement === null ? [] : [record.relationDepartement.nom],
      derniereConnexion: record.derniereConnexion,
      email: record.emailDeContact,
      // Même règle métier que la vue « Mon équipe » : un utilisateur est activé s’il s’est déjà connecté
      isActive: record.derniereConnexion !== null,
      nom: record.nom,
      prenom: record.prenom,
      role: 'gestionnaire département' as const,
      siret: '',
      structure: '',
      telephone: record.telephone,
    }))
  }

  async #utilisateursDeStructuresMembres(): Promise<Array<UnUtilisateurAExporterReadModel>> {
    const records = await this.#dataResource.findMany({
      include: {
        relationStructureAdministrative: {
          include: {
            membres: {
              select: {
                isCoporteur: true,
                relationGouvernance: {
                  select: {
                    relationDepartement: {
                      select: {
                        nom: true,
                      },
                    },
                  },
                },
              },
              where: {
                statut: 'confirme',
              },
            },
          },
        },
      },
      where: {
        isSupprime: false,
        relationStructureAdministrative: {
          membres: {
            some: {
              statut: 'confirme',
            },
          },
        },
        role: {
          not: 'gestionnaire_departement',
        },
      },
    })

    return records.map((record) => {
      const structure = record.relationStructureAdministrative
      const membres = structure?.membres ?? []
      return {
        departements: [...new Set(membres.map((membre) => membre.relationGouvernance.relationDepartement.nom))],
        derniereConnexion: record.derniereConnexion,
        email: record.emailDeContact,
        isActive: record.derniereConnexion !== null,
        nom: record.nom,
        prenom: record.prenom,
        role: membres.some((membre) => membre.isCoporteur) ? ('coporteur' as const) : ('membre' as const),
        siret: structure?.siret ?? '',
        structure: structure?.denomination_antenne ?? structure?.denomination_sirene ?? '',
        telephone: record.telephone,
      }
    })
  }
}
