import { Prisma, PrismaClient } from '@prisma/client'

import { fromTypologieRole, organisation, toTypologieRole } from './shared/RoleMapper'
import { Utilisateur, UtilisateurUid } from '@/domain/Utilisateur'
import { UtilisateurRepository } from '@/use-cases/commands/shared/UtilisateurRepository'
import { SuppressionUtilisateurGateway } from '@/use-cases/commands/SupprimerMonCompte'

export class PostgreUtilisateurRepository implements UtilisateurRepository {
  readonly #activeRecord: Prisma.UtilisateurRecordDelegate
  readonly #suppressionGateway: SuppressionUtilisateurGateway
  readonly #dateProvider: () => Date

  constructor(
    dbClient: PrismaClient,
    suppressionGateway: SuppressionUtilisateurGateway = new NullSuppressionUtilisateurGateway(),
    dateProvider: () => Date = () => new Date()
  ) {
    this.#activeRecord = dbClient.utilisateurRecord
    this.#suppressionGateway = suppressionGateway
    this.#dateProvider = dateProvider
  }
  async add(utilisateur: Utilisateur): Promise<boolean> {
    const utilisateurState = utilisateur.state()
    const now = this.#dateProvider()
    try {
      await this.#activeRecord.create({
        data: {
          dateDeCreation: now,
          email: utilisateurState.email,
          inviteLe: now,
          isSuperAdmin: utilisateurState.isSuperAdmin,
          isSupprime: false,
          nom: utilisateurState.nom,
          prenom: utilisateurState.prenom,
          role: fromTypologieRole(utilisateurState.role.nom),
          ssoId: utilisateurState.uid.value,
          telephone: '',
        },
      })
      return true
    } catch (error: unknown) {
      // https://www.prisma.io/docs/orm/reference/error-reference#p2002
      // Unique constraint failed on the {constraint}.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return false
      }
      throw error
    }
  }

  async find(uid: UtilisateurUid): Promise<Utilisateur | null> {
    const record = await this.#activeRecord.findUnique({
      include: {
        relationDepartement: true,
        relationGroupement: true,
        relationRegion: true,
        relationStructure: true,
      },
      where: {
        isSupprime: false,
        ssoId: uid.state().value,
      },
    })
    if (!record) {
      return null
    }
    return Utilisateur.create({
      email: record.email,
      isSuperAdmin: record.isSuperAdmin,
      nom: record.nom,
      organisation: organisation(record),
      prenom: record.prenom,
      role: toTypologieRole(record.role),
      uid: record.ssoId,
    })
  }

  async drop(utilisateur: Utilisateur): Promise<boolean> {
    return this.#suppressionGateway.delete(utilisateur.state().uid.value)
  }

  async update(utilisateur: Utilisateur): Promise<void> {
    const utilisateurState = utilisateur.state()
    await this.#activeRecord.update({
      data: {
        email: utilisateurState.email,
        nom: utilisateurState.nom,
        prenom: utilisateurState.prenom,
        role: fromTypologieRole(utilisateurState.role.nom),
        telephone: utilisateurState.telephone,
      },
      where: {
        ssoId: utilisateurState.uid.value,
      },
    })
  }
}

export class NullSuppressionUtilisateurGateway implements SuppressionUtilisateurGateway {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async delete(): Promise<boolean> {
    return Promise.resolve(false)
  }
}
