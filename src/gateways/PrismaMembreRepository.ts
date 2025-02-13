import prisma from '../../prisma/prismaClient'
import { Membre, MembreState } from '@/domain/Membre'
import { membreFactory, StatutFactory } from '@/domain/MembreFactory'
import { MembreRepository } from '@/use-cases/commands/shared/MembreRepository'

export class PrismaMembreRepository implements MembreRepository {
  readonly #membreDataResource = prisma.membreRecord

  async get(uid: MembreState['uid']['value']): Promise<Membre> {
    const record = await this.#membreDataResource.findUniqueOrThrow({
      include: {
        membresGouvernanceCommune: true,
        membresGouvernanceDepartement: {
          include: {
            relationDepartement: true,
          },
        },
        membresGouvernanceEpci: true,
        membresGouvernanceSgar: {
          include: {
            relationSgar: true,
          },
        },
        membresGouvernanceStructure: true,
      },
      where: {
        id: uid,
      },
    })

    let nom: string
    let roles: ReadonlyArray<string>
    if (record.membresGouvernanceDepartement.length > 0) {
      nom = record.membresGouvernanceDepartement[0].relationDepartement.nom
      roles = record.membresGouvernanceDepartement.map((departement) => departement.role)
    } else if (record.membresGouvernanceSgar.length > 0) {
      nom = record.membresGouvernanceSgar[0].relationSgar.nom
      roles = record.membresGouvernanceSgar.map((departement) => departement.role)
    } else if (record.membresGouvernanceCommune.length > 0) {
      nom = record.membresGouvernanceCommune[0].commune
      roles = record.membresGouvernanceCommune.map((departement) => departement.role)
    } else if (record.membresGouvernanceEpci.length > 0) {
      nom = record.membresGouvernanceEpci[0].epci
      roles = record.membresGouvernanceEpci.map((departement) => departement.role)
    } else {
      nom = record.membresGouvernanceStructure[0].structure
      roles = record.membresGouvernanceStructure.map((departement) => departement.role)
    }

    return membreFactory({
      nom,
      roles,
      statut: record.statut as StatutFactory,
      uid: {
        value: record.id,
      },
      uidGouvernance: {
        value: record.gouvernanceDepartementCode,
      },
    }) as Membre
  }

  async update(membre: Membre): Promise<void> {
    await this.#membreDataResource.update({
      data: {
        statut: membre.state.statut,
      },
      where: {
        id: membre.state.uid.value,
      },
    })
  }
}
