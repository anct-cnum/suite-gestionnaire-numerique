import prisma from '../../prisma/prismaClient'
import {
  UnUtilisateurAExporterReadModel,
  UtilisateursAExporterLoader,
  UtilisateursAExporterReadModel,
} from '@/use-cases/queries/RecupererUtilisateursAExporter'

export class PrismaUtilisateursAExporterLoader implements UtilisateursAExporterLoader {
  readonly #dataResource = prisma.utilisateurRecord

  async get(): Promise<UtilisateursAExporterReadModel> {
    const [administrateursEtGestionnaires, utilisateursDeStructuresMembres] = await Promise.all([
      this.#administrateursEtGestionnairesDeTerritoire(),
      this.#utilisateursDeStructuresMembres(),
    ])

    return [...administrateursEtGestionnaires, ...utilisateursDeStructuresMembres].sort(
      (utilisateurA, utilisateurB) =>
        utilisateurA.nom.localeCompare(utilisateurB.nom) || utilisateurA.prenom.localeCompare(utilisateurB.prenom)
    )
  }

  async #administrateursEtGestionnairesDeTerritoire(): Promise<Array<UnUtilisateurAExporterReadModel>> {
    const records = await this.#dataResource.findMany({
      include: {
        relationDepartement: true,
        relationRegion: true,
      },
      where: {
        isSupprime: false,
        role: {
          in: rolesHorsStructure,
        },
      },
    })

    return records.map((record) => ({
      derniereConnexion: record.derniereConnexion,
      email: record.emailDeContact,
      // Même règle métier que la vue « Mon équipe » : un utilisateur est activé s’il s’est déjà connecté
      isActive: record.derniereConnexion !== null,
      nom: record.nom,
      prenom: record.prenom,
      role: libelleParRole[record.role as RoleHorsStructure],
      siret: '',
      statutStructure: '' as const,
      structure: '',
      telephone: record.telephone,
      territoires: territoireGere(record),
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
                statut: true,
              },
              where: {
                statut: {
                  in: statutsMembreExportes,
                },
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
              statut: {
                in: statutsMembreExportes,
              },
            },
          },
        },
        role: {
          notIn: rolesHorsStructure,
        },
      },
    })

    return records.map((record) => {
      const structure = record.relationStructureAdministrative
      const membresConfirmes = structure?.membres.filter((membre) => membre.statut === 'confirme') ?? []
      // Une structure à la fois validée et candidate (plusieurs gouvernances) compte comme validée
      const membres = membresConfirmes.length > 0 ? membresConfirmes : (structure?.membres ?? [])
      return {
        derniereConnexion: record.derniereConnexion,
        email: record.emailDeContact,
        isActive: record.derniereConnexion !== null,
        nom: record.nom,
        prenom: record.prenom,
        role: membres.some((membre) => membre.isCoporteur) ? ('coporteur' as const) : ('membre' as const),
        siret: structure?.siret ?? '',
        statutStructure: membresConfirmes.length > 0 ? ('validée' as const) : ('candidate' as const),
        structure: structure?.denomination_antenne ?? structure?.denomination_sirene ?? '',
        telephone: record.telephone,
        territoires: [...new Set(membres.map((membre) => membre.relationGouvernance.relationDepartement.nom))],
      }
    })
  }
}

const libelleParRole = {
  administrateur_dispositif: 'administrateur dispositif',
  gestionnaire_departement: 'gestionnaire département',
  gestionnaire_region: 'gestionnaire région',
} as const

type RoleHorsStructure = keyof typeof libelleParRole

const rolesHorsStructure: Array<RoleHorsStructure> = [
  'administrateur_dispositif',
  'gestionnaire_departement',
  'gestionnaire_region',
]

const statutsMembreExportes = ['candidat', 'confirme']

function territoireGere(
  record: Readonly<{
    relationDepartement: null | Readonly<{ nom: string }>
    relationRegion: null | Readonly<{ nom: string }>
    role: string
  }>
): ReadonlyArray<string> {
  if (record.role === 'gestionnaire_departement' && record.relationDepartement !== null) {
    return [record.relationDepartement.nom]
  }
  if (record.role === 'gestionnaire_region' && record.relationRegion !== null) {
    return [record.relationRegion.nom]
  }
  return []
}
