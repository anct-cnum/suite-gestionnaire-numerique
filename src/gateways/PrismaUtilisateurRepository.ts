import { Prisma, PrismaClient } from '@prisma/client'

import { fromTypologieRole, organisation, toTypologieRole } from './shared/RoleMapper'
import { Utilisateur, UtilisateurUid } from '@/domain/Utilisateur'
import { UtilisateurRepository } from '@/use-cases/commands/shared/UtilisateurRepository'

export class PrismaUtilisateurRepository implements UtilisateurRepository {
  readonly #activeRecord: Prisma.UtilisateurRecordDelegate

  constructor(dbClient: PrismaClient) {
    this.#activeRecord = dbClient.utilisateurRecord
  }

  async add(utilisateur: Utilisateur): Promise<boolean> {
    const utilisateurState = utilisateur.state()

    try {
      await this.#activeRecord.create({
        data: {
          dateDeCreation: utilisateurState.inviteLe,
          email: utilisateurState.email,
          inviteLe: utilisateurState.inviteLe,
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
      codeOrganisation: organisation(record),
      derniereConnexion: record.derniereConnexion,
      email: record.email,
      inviteLe: record.inviteLe,
      isSuperAdmin: record.isSuperAdmin,
      nom: record.nom,
      prenom: record.prenom,
      role: toTypologieRole(record.role),
      uid: record.ssoId,
    })
  }

  async drop(utilisateur: Utilisateur): Promise<boolean> {
    return this.#drop(utilisateur.state().uid.value)
  }

  async dropByUid(uid: UtilisateurUid): Promise<boolean> {
    return this.#drop(uid.state().value)
  }

  async update(utilisateur: Utilisateur): Promise<void> {
    const utilisateurState = utilisateur.state()

    await this.#activeRecord.update({
      data: {
        email: utilisateurState.email,
        inviteLe: utilisateurState.inviteLe,
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

  async updateUid(utilisateur: Utilisateur): Promise<void> {
    const utilisateurState = utilisateur.state()

    await this.#activeRecord.update({
      data: {
        ssoId: utilisateurState.uid.value,
      },
      where: {
        ssoId: utilisateurState.email,
      },
    })
  }

  async #drop(ssoId: string): Promise<boolean> {
    return this.#activeRecord
      .update({
        data: {
          isSupprime: true,
        },
        where: {
          isSupprime: false,
          ssoId,
        },
      })
      .then(() => true)
      .catch((error: unknown) => {
        // https://www.prisma.io/docs/orm/reference/error-reference#p2025
        // An operation failed because it depends on one or more records that were required but not found.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          return false
        }
        throw error
      })
  }
}
