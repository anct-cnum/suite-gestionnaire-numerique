import { Prisma } from '@prisma/client'

import { fromTypologieRole, toTypologieRole, UtilisateurEtSesRelationsRecord } from './shared/RoleMapper'
import { DepartementState } from '@/domain/Departement'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'
import { UtilisateurFactory } from '@/domain/UtilisateurFactory'
import { UtilisateurRepository } from '@/use-cases/commands/shared/UtilisateurRepository'

export class PrismaUtilisateurRepository implements UtilisateurRepository {
  readonly #dataResource: Prisma.UtilisateurRecordDelegate

  constructor(dataResource: Prisma.UtilisateurRecordDelegate) {
    this.#dataResource = dataResource
  }

  async add(utilisateur: Utilisateur): Promise<boolean> {
    const utilisateurState = utilisateur.state

    try {
      const utilisateurExistant = await this.#dataResource.findUnique({
        where: {
          ssoEmail: utilisateurState.uid.email,
        },
      })
      if(utilisateurExistant?.isSupprime ?? false){
        return await this.#undrop(utilisateurState.uid.email)
      }

      await this.#dataResource.create({
        data: {
          dateDeCreation: utilisateurState.inviteLe,
          departementCode: utilisateurState.departement?.code,
          emailDeContact: utilisateurState.emailDeContact,
          groupementId: utilisateurState.groupementUid?.value,
          inviteLe: utilisateurState.inviteLe,
          isSuperAdmin: utilisateurState.isSuperAdmin,
          isSupprime: false,
          nom: utilisateurState.nom,
          prenom: utilisateurState.prenom,
          regionCode: utilisateurState.region?.code,
          role: fromTypologieRole(utilisateurState.role.nom),
          ssoEmail: utilisateurState.uid.email,
          ssoId: utilisateurState.uid.value,
          structureId: utilisateurState.structureUid?.value,
          telephone: '',
        },
      })
      return true
    } catch (error: unknown) {
      /*
       * https://www.prisma.io/docs/orm/reference/error-reference#p2002
       * Unique constraint failed on the {constraint}.
       */
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return false
      }
      throw error
    }
  }

  async drop(utilisateur: Utilisateur): Promise<boolean> {
    return this.#drop(utilisateur.state.uid.value)
  }
  
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    const record = await this.#dataResource.findUnique({
      include: {
        relationDepartement: true,
        relationGroupement: true,
        relationRegion: true,
        relationStructure: true,
      },
      where: {
        isSupprime: false,
        ssoId: uid,
      },
    })
    if (!record) {
      throw new Error('Utilisateur non trouvé')
    }
    return new UtilisateurFactory({
      departement: mapDepartement(record.relationDepartement),
      derniereConnexion: record.derniereConnexion ?? undefined,
      emailDeContact: record.emailDeContact,
      groupementUid: record.relationGroupement?.id,
      inviteLe: record.inviteLe,
      isSuperAdmin: record.isSuperAdmin,
      nom: record.nom,
      prenom: record.prenom,
      region: record.relationRegion ?? undefined,
      structureUid: record.relationStructure?.id,
      telephone: record.telephone,
      uid: { email: record.ssoEmail, value: record.ssoId },
    }).create(toTypologieRole(record.role))
  }

  async update(utilisateur: Utilisateur): Promise<void> {
    const utilisateurState = utilisateur.state

    await this.#dataResource.update({
      data: {
        derniereConnexion: utilisateurState.derniereConnexion,
        emailDeContact: utilisateurState.emailDeContact,
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
    const utilisateurState = utilisateur.state

    await this.#dataResource.update({
      data: {
        ssoId: utilisateurState.uid.value,
      },
      where: {
        ssoId: utilisateurState.uid.email,
      },
    })
  }

  async #drop(ssoId: string): Promise<boolean> {
    return this.#dataResource
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
        /*
         * https://www.prisma.io/docs/orm/reference/error-reference#p2025
         * An operation failed because it depends on one or more records that were required but not found.
         */
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          return false
        }
        throw error
      })
  }

  async #undrop(ssoEmail: string): Promise<boolean> {
    try {
      await this.#dataResource.update({
        data: {
          isSupprime: false,
        },
        where: {
          ssoEmail,
        },
      })
      return true
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false
      }
      throw error
    }
  }
}

function mapDepartement(relationDepartement: UtilisateurEtSesRelationsRecord['relationDepartement']): DepartementState | undefined {
  if (relationDepartement) {
    return {
      code: relationDepartement.code,
      codeRegion: relationDepartement.regionCode,
      nom: relationDepartement.nom,
    }
  }
  return undefined
}
