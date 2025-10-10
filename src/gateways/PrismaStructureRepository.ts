import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { Structure } from '@/domain/Structure'
import { StructureData, StructureRepository } from '@/use-cases/commands/shared/StructureRepository'

export class PrismaStructureRepository implements StructureRepository {
  async create(data: StructureData, tx?: Prisma.TransactionClient): Promise<Structure> {
    // Si pas de transaction fournie, en créer une pour garantir l'atomicité
    if (!tx) {
      return prisma.$transaction(async (transaction) => {
        return this.createWithTransaction(data, transaction)
      })
    }

    return this.createWithTransaction(data, tx)
  }

  private async createWithTransaction(
    data: StructureData,
    client: Prisma.TransactionClient,
  ): Promise<Structure> {
    // Créer ou récupérer l'adresse
    const adresse = await this.getOrCreateAdresse(
      {
        codePostal: data.codePostal,
        commune: data.commune,
        nomVoie: data.adresse,
      },
      client,
    )

    const structure = await client.main_structure.create({
      data: {
        adresse_id: adresse.id,
        categorie_juridique: data.categorieJuridique,
        nom: data.nom,
        siret: data.identifiantEtablissement,
        source: 'min',
        typologies: [data.categorieJuridiqueLibelle],
      },
    })

    return Structure.create({
      departementCode: data.departementCode,
      identifiantEtablissement: structure.siret ?? '',
      nom: structure.nom,
      uid: { value: structure.id },
    })
  }

  private async getOrCreateAdresse(
    data: { codePostal: string; commune: string; nomVoie: string },
    client: Prisma.TransactionClient,
  ) {
    // Chercher une adresse existante
    const existingAdresse = await client.adresse.findFirst({
      where: {
        code_postal: data.codePostal,
        nom_commune: data.commune,
        nom_voie: data.nomVoie,
      },
    })

    if (existingAdresse) {
      return existingAdresse
    }

    // Créer une nouvelle adresse si elle n'existe pas
    return client.adresse.create({
      data: {
        code_postal: data.codePostal,
        nom_commune: data.commune,
        nom_voie: data.nomVoie,
      },
    })
  }

  async getBySiret(siret: string, tx?: Prisma.TransactionClient): Promise<null | Structure> {
    const client = tx ?? prisma
    const structure = await client.main_structure.findFirst({
      where: {
        siret,
      },
    })

    if (!structure) {
      return null
    }

    return Structure.create({
      departementCode: '', // main.structure n'a pas de departementCode direct
      identifiantEtablissement: structure.siret ?? '',
      nom: structure.nom,
      uid: { value: structure.id },
    })
  }
}