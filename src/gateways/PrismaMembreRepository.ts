import { Prisma } from '@prisma/client'

import { membreInclude, toMembre } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import { Membre, MembreState } from '@/domain/Membre'
import { membreFactory, StatutFactory } from '@/domain/MembreFactory'
import { ContactData, EntrepriseData, MembreRepository } from '@/use-cases/commands/shared/MembreRepository'

export class PrismaMembreRepository implements MembreRepository {
  async create(
    membre: Membre,
    entrepriseData: EntrepriseData,
    contactData?: ContactData,
    contactTechniqueData?: ContactData,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const client = tx ?? prisma

    const structureId = membre.state.uidStructure.value

    if (contactData) {
      const contact = await client.main_contact.create({
        data: {
          email: contactData.email,
          est_referent_fne: true,
          fonction: contactData.fonction,
          nom: contactData.nom,
          prenom: contactData.prenom,
        },
      })

      await client.contact_structure.create({
        data: {
          contact_id: contact.id,
          structure_id: structureId,
        },
      })
    } else {
      const contact = await client.main_contact.create({
        data: {
          email: `temp-${membre.state.uid.value}@example.com`,
          est_referent_fne: true,
          fonction: '',
          nom: '',
          prenom: '',
        },
      })

      await client.contact_structure.create({
        data: {
          contact_id: contact.id,
          structure_id: structureId,
        },
      })
    }

    if (contactTechniqueData) {
      const contactTechnique = await client.main_contact.create({
        data: {
          email: contactTechniqueData.email,
          est_referent_fne: true,
          fonction: contactTechniqueData.fonction,
          nom: contactTechniqueData.nom,
          prenom: contactTechniqueData.prenom,
        },
      })

      await client.contact_structure.create({
        data: {
          contact_id: contactTechnique.id,
          structure_id: structureId,
        },
      })
    }

    await client.membreRecord.create({
      data: {
        categorieMembre: entrepriseData.categorieJuridiqueCode,
        gouvernanceDepartementCode: membre.state.uidGouvernance.value,
        id: membre.state.uid.value,
        isCoporteur: membre.state.roles.includes('coporteur'),
        oldUUID: crypto.randomUUID(),
        siretRidet: entrepriseData.siret,
        statut: membre.state.statut,
        structureId: membre.state.uidStructure.value,
        type: entrepriseData.categorieJuridiqueUniteLegale,
      },
    })
  }

  async get(uid: MembreState['uid']['value'], tx?: Prisma.TransactionClient): Promise<Membre> {
    const client = tx ?? prisma
    const record = await client.membreRecord.findUniqueOrThrow({
      include: membreInclude,
      where: {
        id: uid,
      },
    })

    const membre = toMembre(record)

    return membreFactory({
      nom: membre.nom,
      roles: membre.roles,
      statut: membre.statut as StatutFactory,
      uid: {
        value: membre.id,
      },
      uidGouvernance: {
        value: record.gouvernanceDepartementCode,
      },
      uidStructure: { value: record.structureId },
    }) as Membre
  }

  async getContacts(uid: MembreState['uid']['value'], tx?: Prisma.TransactionClient): Promise<ReadonlyArray<ContactData>> {
    const client = tx ?? prisma
    const record = await client.membreRecord.findUniqueOrThrow({
      select: {
        structureId: true,
      },
      where: {
        id: uid,
      },
    })

    const contactStructures = await client.contact_structure.findMany({
      include: {
        contact: true,
      },
      where: {
        structure_id: record.structureId,
      },
    })

    return contactStructures.map((cs) => ({
      email: cs.contact.email,
      fonction: cs.contact.fonction,
      nom: cs.contact.nom,
      prenom: cs.contact.prenom,
    }))
  }

  async getStructureId(uid: MembreState['uid']['value']): Promise<number> {
    const record = await prisma.membreRecord.findUniqueOrThrow({
      select: {
        structureId: true,
      },
      where: {
        id: uid,
      },
    })

    return record.structureId
  }

  async update(membre: Membre, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx ?? prisma
    await client.membreRecord.update({
      data: {
        dateSuppression: membre.state.dateSuppression,
        isCoporteur: membre.state.roles.includes('coporteur'),
        statut: membre.state.statut,
      },
      where: {
        id: membre.state.uid.value,
      },
    })
  }
}
