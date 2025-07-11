import { membreInclude, toMembre } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import { Membre, MembreState } from '@/domain/Membre'
import { membreFactory, StatutFactory } from '@/domain/MembreFactory'
import { ContactData, EntrepriseData, MembreRepository } from '@/use-cases/commands/shared/MembreRepository'

export class PrismaMembreRepository implements MembreRepository {
  readonly #membreDataResource = prisma.membreRecord

  async create(
    membre: Membre, 
    contactData?: ContactData, 
    contactTechniqueData?: ContactData, 
    entrepriseData?: EntrepriseData
  ): Promise<void> {
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
    
    await this.#membreDataResource.create({
      data: {
        categorieMembre : entrepriseData?.categorieJuridiqueCode,
        contact: email,
        contactTechnique: contactTechniqueEmail,
        gouvernanceDepartementCode: membre.state.uidGouvernance.value,
        id: membre.state.uid.value,
        isCoporteur: membre.state.roles.includes('coporteur'),
        nom: membre.state.nom,
        oldUUID: crypto.randomUUID(),
        siretRidet: entrepriseData?.siret,
        statut: membre.state.statut,
        type : entrepriseData?.categorieJuridiqueUniteLegale,
      },
    })
  }

  async get(uid: MembreState['uid']['value']): Promise<Membre> {
    const record = await this.#membreDataResource.findUniqueOrThrow({
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
    }) as Membre
  }

  async update(membre: Membre): Promise<void> {
    await this.#membreDataResource.update({
      data: {
        isCoporteur: membre.state.roles.includes('coporteur'),
        statut: membre.state.statut,
      },
      where: {
        id: membre.state.uid.value,
      },
    })
  }
}
