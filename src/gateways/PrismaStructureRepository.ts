import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { Structure, StructureAdresse } from '@/domain/Structure'
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

  async getBySiretEmployeuse(siret: string, tx?: Prisma.TransactionClient): Promise<null | Structure> {
    const client = tx ?? prisma

    // Chercher une structure avec le SIRET donné ET qui est une structure employeuse
    const structure = await client.main_structure.findFirst({
      where: {
        personne_affectations: {
          some: {
            type: 'structure_emploi',
          },
        },
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

  private async createWithTransaction(
    data: StructureData,
    client: Prisma.TransactionClient
  ): Promise<Structure> {
    // Créer ou récupérer l'adresse
    const adresse = await this.getOrCreateAdresse(
      {
        adresseEnrichie: data.adresseEnrichie,
        codeInsee: data.codeInsee,
        codePostal: data.codePostal,
        commune: data.commune,
        nomVoie: data.nomVoie,
        numeroVoie: data.numeroVoie,
      },
      client
    )

    const structure = await client.main_structure.create({
      data: {
        adresse_id: adresse.state.uid.value,
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
    data:  {
      adresseEnrichie?: 
      { banClefInterop: string
        banCodeBan: null | string
        banCodeInsee: string
        banCodePostal: string
        banLatitude: number
        banLongitude: number
        banNomCommune: string
        banNomVoie: string
        banNumeroVoie: null | number
        banRepetition: null | string } 
      | null
      codeInsee: string
      codePostal: string
      commune: string
      nomVoie: string
      numeroVoie: string
    },
    client: Prisma.TransactionClient
  ): Promise<StructureAdresse> {
    // Si on a des données enrichies, chercher par clef_interop BAN
    if (data.adresseEnrichie) {
      const existingAdresse = await client.adresse.findFirst({
        where: {
          clef_interop: data.adresseEnrichie.banClefInterop,
        },
      })

      if (existingAdresse) {
        return StructureAdresse.create({
          clefInterop: existingAdresse.clef_interop,
          codeBan: existingAdresse.code_ban,
          codeInsee: existingAdresse.code_insee,
          codePostal: existingAdresse.code_postal,
          departement: existingAdresse.departement,
          nomCommune: existingAdresse.nom_commune,
          nomVoie: existingAdresse.nom_voie,
          numeroVoie: existingAdresse.numero_voie,
          repetition: existingAdresse.repetition,
          uid: { value: existingAdresse.id },
        })
      }

      // Créer l'adresse enrichie avec géométrie PostGIS
      // Cast explicite : code_ban en uuid, coordonnées en double precision
      const result = await client.$queryRaw<Array<{ id: number }>>`
        INSERT INTO main.adresse (
          clef_interop, code_ban, code_insee, code_postal,
          nom_commune, nom_voie, numero_voie, repetition, geom
        ) VALUES (
          ${data.adresseEnrichie.banClefInterop},
          ${data.adresseEnrichie.banCodeBan}::uuid,
          ${data.adresseEnrichie.banCodeInsee},
          ${data.adresseEnrichie.banCodePostal},
          ${data.adresseEnrichie.banNomCommune},
          ${data.adresseEnrichie.banNomVoie},
          ${data.adresseEnrichie.banNumeroVoie},
          ${data.adresseEnrichie.banRepetition},
          public.ST_Point(${data.adresseEnrichie.banLongitude}::double precision, ${data.adresseEnrichie.banLatitude}::double precision, 4326)
        )
        RETURNING id
      `

      const adresseId = result[0].id

      const adresseCreee = await client.adresse.findUnique({
        where: { id: adresseId },
      })

      if (!adresseCreee) {
        throw new Error('Erreur lors de la création de l\'adresse géocodée')
      }

      return StructureAdresse.create({
        clefInterop: adresseCreee.clef_interop,
        codeBan: adresseCreee.code_ban,
        codeInsee: adresseCreee.code_insee,
        codePostal: adresseCreee.code_postal,
        departement: adresseCreee.departement,
        nomCommune: adresseCreee.nom_commune,
        nomVoie: adresseCreee.nom_voie,
        numeroVoie: adresseCreee.numero_voie,
        repetition: adresseCreee.repetition,
        uid: { value: adresseCreee.id },
      })
    }

    // Pas de données enrichies BAN : utiliser les données SIRENE de base
    // Chercher une adresse existante avec les mêmes critères
    const existingAdresse = await client.adresse.findFirst({
      where: {
        code_insee: data.codeInsee,
        code_postal: data.codePostal,
        nom_commune: data.commune,
        nom_voie: data.nomVoie,
        numero_voie: data.numeroVoie ? Number.parseInt(data.numeroVoie, 10) : null,
      },
    })

    if (existingAdresse) {
      return StructureAdresse.create({
        clefInterop: existingAdresse.clef_interop,
        codeBan: existingAdresse.code_ban,
        codeInsee: existingAdresse.code_insee,
        codePostal: existingAdresse.code_postal,
        departement: existingAdresse.departement,
        nomCommune: existingAdresse.nom_commune,
        nomVoie: existingAdresse.nom_voie,
        numeroVoie: existingAdresse.numero_voie,
        repetition: existingAdresse.repetition,
        uid: { value: existingAdresse.id },
      })
    }

    // Créer une adresse simple avec uniquement les données SIRENE
    // ⚠️ IMPORTANT : Les champs BAN restent NULL (clef_interop, code_ban, geom, repetition)
    const adresseCreee = await client.adresse.create({
      data: {
        // Données SIRENE uniquement
        code_insee: data.codeInsee,
        code_postal: data.codePostal,
        nom_commune: data.commune,
        nom_voie: data.nomVoie,
        numero_voie: data.numeroVoie ? Number.parseInt(data.numeroVoie, 10) : null,
        // Champs BAN NON remplis : clef_interop, code_ban, geom, repetition → NULL
      },
    })

    return StructureAdresse.create({
      clefInterop: adresseCreee.clef_interop,
      codeBan: adresseCreee.code_ban,
      codeInsee: adresseCreee.code_insee,
      codePostal: adresseCreee.code_postal,
      departement: adresseCreee.departement,
      nomCommune: adresseCreee.nom_commune,
      nomVoie: adresseCreee.nom_voie,
      numeroVoie: adresseCreee.numero_voie,
      repetition: adresseCreee.repetition,
      uid: { value: adresseCreee.id },
    })
  }
}