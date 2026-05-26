import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { Structure, StructureAdresse } from '@/domain/Structure'
import { ContactReferentRepository } from '@/use-cases/commands/ModifierContactReferentStructure'
import { StructureData, StructureRepository } from '@/use-cases/commands/shared/StructureRepository'

// Refonte 2026 : MIN écrit désormais dans main.structure_administrative (et
// non plus dans main.structure legacy). Les notions "lieu" (nom, typologies,
// horaires…) sont sur main.lieu_inclusion — MIN ne les crée pas ici.
// Le champ Structure.nom du domain est désormais alimenté depuis
// SA.denomination_sirene (compatibilité ascendante avec le contrat actuel).

export class PrismaStructureRepository implements ContactReferentRepository, StructureRepository {
  async ajouterContact(structureId: number, data: ContactStructureData): Promise<void> {
    const contact = await prisma.main_contact.create({
      data: {
        email: data.email,
        est_referent_fne: data.estReferentFNE,
        fonction: data.fonction,
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
      },
    })

    await prisma.contact_structure_administrative.create({
      data: {
        contact_id: contact.id,
        structure_administrative_id: structureId,
      },
    })
  }

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
    const structure = await client.main_structure_administrative.findFirst({
      where: {
        siret,
      },
    })

    if (!structure) {
      return null
    }

    return Structure.create({
      departementCode: '', // structure_administrative n'a pas de departementCode direct
      identifiantEtablissement: structure.siret ?? '',
      nom: structure.denomination_antenne ?? structure.denomination_sirene ?? '',
      uid: { value: structure.id },
    })
  }

  async getBySiretEmployeuse(siret: string, tx?: Prisma.TransactionClient): Promise<null | Structure> {
    const client = tx ?? prisma

    // Refonte 2026 : une SA est "employeuse" si elle a au moins une
    // personne_affectations_emploi (la table dédiée — type implicite).
    const structure = await client.main_structure_administrative.findFirst({
      where: {
        personne_affectations_emploi: {
          some: {},
        },
        siret,
      },
    })

    if (!structure) {
      return null
    }

    return Structure.create({
      departementCode: '',
      identifiantEtablissement: structure.siret ?? '',
      nom: structure.denomination_antenne ?? structure.denomination_sirene ?? '',
      uid: { value: structure.id },
    })
  }

  async modifierContact(contactId: number, data: ContactStructureData): Promise<void> {
    await prisma.main_contact.update({
      data: {
        email: data.email,
        est_referent_fne: data.estReferentFNE,
        fonction: data.fonction,
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
      },
      where: {
        id: contactId,
      },
    })
  }

  async supprimerContact(structureId: number, contactId: number): Promise<void> {
    await prisma.contact_structure_administrative.deleteMany({
      where: {
        contact_id: contactId,
        structure_administrative_id: structureId,
      },
    })

    await prisma.main_contact.delete({
      where: {
        id: contactId,
      },
    })
  }

  async updateContactReferent(
    structureId: number,
    contactReferent: {
      email: string
      fonction: string
      nom: string
      prenom: string
      telephone: string
    }
  ): Promise<void> {
    await prisma.main_structure_administrative.update({
      data: {
        contact: {
          courriels: contactReferent.email,
          fonction: contactReferent.fonction,
          nom: contactReferent.nom,
          prenom: contactReferent.prenom,
          telephone: contactReferent.telephone,
        },
      },
      where: {
        id: structureId,
      },
    })
  }

  private async createWithTransaction(data: StructureData, client: Prisma.TransactionClient): Promise<Structure> {
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

    // MIN crée une structure_administrative (entité légale).
    // Les notions "lieu" (nom métier, typologies, horaires…) ne sont pas
    // créées ici — elles sont sur main.lieu_inclusion et hors scope MIN.
    const structure = await client.main_structure_administrative.create({
      data: {
        adresse_id: adresse.state.uid.value,
        categorie_juridique: data.categorieJuridique,
        denomination_sirene: data.nom,
        edited_by: 'min',
        siret: data.identifiantEtablissement,
      },
    })

    return Structure.create({
      departementCode: data.departementCode,
      identifiantEtablissement: structure.siret ?? '',
      nom: structure.denomination_antenne ?? structure.denomination_sirene ?? '',
      uid: { value: structure.id },
    })
  }

  private async getOrCreateAdresse(
    data: {
      adresseEnrichie?: {
        banClefInterop: string
        banCodeBan: null | string
        banCodeInsee: string
        banCodePostal: string
        banLatitude: number
        banLongitude: number
        banNomCommune: string
        banNomVoie: string
        banNumeroVoie: null | number
        banRepetition: null | string
      } | null
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
        throw new Error("Erreur lors de la création de l'adresse géocodée")
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

type ContactStructureData = Readonly<{
  email: string
  estReferentFNE: boolean
  fonction: string
  nom: string
  prenom: string
  telephone: string
}>
