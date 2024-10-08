import { Prisma, PrismaClient } from '@prisma/client'

import { fromTypologieRole } from './roleMapper'
import { roleMapper } from './shared/RoleMapper'
import { Utilisateur } from '@/domain/Utilisateur'
import { UtilisateurRepository } from '@/use-cases/commands/shared/UtilisateurRepository'
import {
  SuppressionUtilisateurGateway,
} from '@/use-cases/commands/SupprimerMonCompte'

export class PostgreUtilisateurRepository implements UtilisateurRepository {
  readonly #activeRecord: Prisma.UtilisateurRecordDelegate
  readonly #suppressiongateway: SuppressionUtilisateurGateway

  constructor(
    dbClient: PrismaClient,
    suppressionGateway: SuppressionUtilisateurGateway = new NullSuppressionUtilisateurGateway()
  ) {
    this.#activeRecord = dbClient.utilisateurRecord
    this.#suppressiongateway = suppressionGateway
  }

  async find(uid: string): Promise<Utilisateur | null> {
    const record = await this.#activeRecord.findUnique({
      include: {
        relationDepartements: true,
        relationGroupements: true,
        relationRegions: true,
        relationStructures: true,
      },
      where: {
        isSupprime: false,
        ssoId: uid,
      },
    })
    if (!record) {
      return null
    }
    return Utilisateur.create({
      email: record.email,
      isSuperAdmin: record.isSuperAdmin,
      nom: record.nom,
      organisation: roleMapper(record)[record.role].territoireOuStructure,
      prenom: record.prenom,
      role: roleMapper(record)[record.role].nom,
      uid: record.ssoId,
    })
  }

  async drop(utilisateur: Utilisateur): Promise<boolean> {
    return this.#suppressiongateway.delete(utilisateur.state().uid)
  }

  async update(utilisateur: Utilisateur): Promise<void> {
    const utilisateurState = utilisateur.state()
    await this.#activeRecord.update({
      data: {
        email: utilisateurState.email,
        nom: utilisateurState.nom,
        prenom: utilisateurState.prenom,
        role: fromTypologieRole(utilisateurState.role.nom),
      },
      where: {
        ssoId: utilisateurState.uid,
      },
    })
  }
}

class NullSuppressionUtilisateurGateway implements SuppressionUtilisateurGateway {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async delete(): Promise<boolean> {
    return Promise.resolve(false)
  }
}
