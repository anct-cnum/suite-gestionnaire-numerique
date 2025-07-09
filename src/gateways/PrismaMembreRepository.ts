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

    // Traitement de la catégorie juridique
    let categorieMembre = 'structure'
    let typeMembre = 'Structure privée'

    if (entrepriseData?.categorieJuridiqueUniteLegale !== null &&
        entrepriseData?.categorieJuridiqueUniteLegale !== undefined &&
        entrepriseData.categorieJuridiqueUniteLegale !== '' &&
        entrepriseData.categorieJuridiqueUniteLegale.trim() !== '') {
      // Extraire le code de la catégorie juridique (ex: "7389" de "7389 - Description")
      const regex = /^(\d{4})/
      const codeMatch = regex.exec(entrepriseData.categorieJuridiqueUniteLegale)
      
      if (codeMatch) {
        const codeCategorie = codeMatch[1]
        
        // Récupérer le nom de la catégorie juridique depuis la table reference
        const categorieJuridique = await prisma.categories_juridiques.findUnique({
          where: { code: codeCategorie },
        })

        if (categorieJuridique) {
          typeMembre = categorieJuridique.nom
        }
      }

      // Stocker la forme juridique complète dans categorieMembre
      categorieMembre = entrepriseData.categorieJuridiqueUniteLegale
    }
    
    await this.#membreDataResource.create({
      data: {
        categorieMembre,
        contact: email,
        contactTechnique: contactTechniqueEmail,
        gouvernanceDepartementCode: membre.state.uidGouvernance.value,
        id: membre.state.uid.value,
        isCoporteur: membre.state.roles.includes('coporteur'),
        nom: membre.state.nom,
        oldUUID: crypto.randomUUID(),
        statut: membre.state.statut,
        type: typeMembre,
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
