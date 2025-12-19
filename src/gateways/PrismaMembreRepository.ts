import { Prisma } from '@prisma/client'

import { membreInclude, toMembre } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import { Membre, MembreState } from '@/domain/Membre'
import { membreFactory, StatutFactory } from '@/domain/MembreFactory'
import { ContactData, EntrepriseData, MembreContacts, MembreRepository } from '@/use-cases/commands/shared/MembreRepository'

export class PrismaMembreRepository implements MembreRepository {
  async create(
    membre: Membre,
    entrepriseData: EntrepriseData,
    contactData?: ContactData,
    contactTechniqueData?: ContactData,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const client = tx ?? prisma
    let email: string
    let contactTechniqueEmail: string | undefined

    if (contactData) {
      // Créer ou récupérer le contact principal
      await prisma.contactMembreGouvernanceRecord.upsert({
        create: {
          email: contactData.email,
          fonction: contactData.fonction,
          nom: contactData.nom,
          prenom: contactData.prenom,
        },
        update: {
          fonction: contactData.fonction,
          nom: contactData.nom,
          prenom: contactData.prenom,
        },
        where: {
          email: contactData.email,
        },
      })
      email = contactData.email
    } else {
      // Fallback temporaire
      email = `temp-${membre.state.uid.value}@example.com`
    }

    if (contactTechniqueData) {
      // Créer ou récupérer le contact technique
      await prisma.contactMembreGouvernanceRecord.upsert({
        create: {
          email: contactTechniqueData.email,
          fonction: contactTechniqueData.fonction,
          nom: contactTechniqueData.nom,
          prenom: contactTechniqueData.prenom,
        },
        update: {
          fonction: contactTechniqueData.fonction,
          nom: contactTechniqueData.nom,
          prenom: contactTechniqueData.prenom,
        },
        where: {
          email: contactTechniqueData.email,
        },
      })
      contactTechniqueEmail = contactTechniqueData.email
    }

    await client.membreRecord.create({
      data: {
        categorieMembre : entrepriseData.categorieJuridiqueCode,
        contact: email,
        contactTechnique: contactTechniqueEmail,
        gouvernanceDepartementCode: membre.state.uidGouvernance.value,
        id: membre.state.uid.value,
        isCoporteur: membre.state.roles.includes('coporteur'),
        oldUUID: crypto.randomUUID(),
        siretRidet: entrepriseData.siret,
        statut: membre.state.statut,
        structureId: membre.state.uidStructure.value,
        type : entrepriseData.categorieJuridiqueUniteLegale,
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

  async getContacts(uid: MembreState['uid']['value'], tx?: Prisma.TransactionClient): Promise<MembreContacts> {
    const client = tx ?? prisma
    const record = await client.membreRecord.findUniqueOrThrow({
      include: {
        relationContact: true,
        relationContactTechnique: true,
      },
      where: {
        id: uid,
      },
    })

    const contact: ContactData = {
      email: record.relationContact.email,
      fonction: record.relationContact.fonction,
      nom: record.relationContact.nom,
      prenom: record.relationContact.prenom,
    }

    let contactTechnique: ContactData | undefined
    if (record.relationContactTechnique) {
      contactTechnique = {
        email: record.relationContactTechnique.email,
        fonction: record.relationContactTechnique.fonction,
        nom: record.relationContactTechnique.nom,
        prenom: record.relationContactTechnique.prenom,
      }
    }

    return {
      contact,
      contactTechnique,
    }
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
