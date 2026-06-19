import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { ETAT_ADMINISTRATIF_CANONIQUE } from '@/shared/etatAdministratif'
import { ResultAsync } from '@/use-cases/CommandHandler'
import {
  Canonisation,
  CanoniserFailure,
  CanoniserStructureRepository,
  StructureACanoniser,
} from '@/use-cases/commands/CanoniserStructure'

// Canonisation = aligner la structure sur son image INSEE puis vider denomination_antenne. On écrase
// les champs descriptifs (dénomination SIRENE, adresse, état administratif, APE, catégorie juridique),
// on trace l'enrichissement (last_sirene_enrich_at, edited_by) et on journalise un snapshot avant/après
// dans audit.structure_merge_log (dag_id dédié, loser_id = winner_id par convention).
export class PrismaStructureCanonisationRepository implements CanoniserStructureRepository {
  readonly #dataResource = prisma.main_structure_administrative

  async canoniser(canonisation: Canonisation): ResultAsync<CanoniserFailure> {
    try {
      return await prisma.$transaction(async (tx) => this.#canoniserDansTransaction(tx, canonisation))
    } catch (erreur) {
      // Conflit sur la contrainte UNIQUE (siret, denomination_antenne) gagné par une course concurrente.
      // L'UPDATE est en SQL brut : Prisma remonte P2010 portant le code PostgreSQL 23505 (unique_violation),
      // et non le P2002 des mutations typées.
      if (estViolationUnicite(erreur)) {
        return 'canoniqueExistante'
      }
      await this.#journaliserEchec(canonisation, erreur)

      return 'canonisationEchouee'
    }
  }

  async existeCanoniquePourSiret(siret: string, exceptId: number): Promise<boolean> {
    const nombre = await this.#dataResource.count({
      where: {
        deleted_at: null,
        denomination_antenne: null,
        id: { not: exceptId },
        siret,
      },
    })

    return nombre > 0
  }

  async lireStructure(structureId: number): Promise<null | StructureACanoniser> {
    const structure = await this.#dataResource.findUnique({
      select: { deleted_at: true, denomination_antenne: true, siret: true },
      where: { id: structureId },
    })
    if (structure === null) {
      return null
    }

    return {
      deletedAt: structure.deleted_at,
      denominationAntenne: structure.denomination_antenne,
      siret: structure.siret,
    }
  }

  async #canoniserDansTransaction(
    tx: Prisma.TransactionClient,
    canonisation: Canonisation
  ): ResultAsync<CanoniserFailure> {
    const { entreprise, geocode, structureId } = canonisation

    const avant = await this.#snapshot(tx, structureId)
    if (avant === null) {
      return 'structureIntrouvable'
    }

    const adresseId = geocode === null ? null : await this.#trouverOuCreerAdresse(tx, geocode)

    // Image INSEE : la canonique reflète la source faisant autorité. Timestamps posés en SQL
    // (CURRENT_DATE / now()) — new Date() est interdit hors src/app. Adresse best-effort : conservée
    // telle quelle (COALESCE) si le géocodage BAN n'a rien rendu. L'API INSEE ne renvoie que les
    // établissements actifs, d'où le libellé d'état canonique (convention dataspace).
    await tx.$executeRaw`
      UPDATE main.structure_administrative SET
        denomination_antenne = NULL,
        denomination_sirene = ${entreprise.denomination},
        etat_administratif = ${ETAT_ADMINISTRATIF_CANONIQUE},
        code_activite_principale = ${entreprise.activitePrincipale},
        categorie_juridique = ${entreprise.categorieJuridiqueCode},
        adresse_id = COALESCE(${adresseId}::int, adresse_id),
        last_sirene_enrich_at = CURRENT_DATE,
        edited_by = 'min',
        updated_at = now()
      WHERE id = ${structureId}
    `

    const apres = await this.#snapshot(tx, structureId)
    await this.#journaliserSucces(tx, canonisation, avant, apres)

    return 'OK'
  }

  async #journaliserEchec(canonisation: Canonisation, erreur: unknown): Promise<void> {
    const message = erreur instanceof Error ? erreur.message : String(erreur)
    // Hors transaction (celle d'origine a rollback) : trace best-effort de l'échec.
    await prisma.$executeRaw`
      INSERT INTO audit.structure_merge_log
        (status, dag_id, task_id, winner_id, loser_id, error_message)
      VALUES ('FAILURE', 'min-ui-canonisation', ${canonisation.parUtilisateur},
        ${canonisation.structureId}, ${canonisation.structureId}, ${message})
    `
  }

  async #journaliserSucces(
    tx: Prisma.TransactionClient,
    canonisation: Canonisation,
    avant: Prisma.JsonValue,
    apres: Prisma.JsonValue
  ): Promise<void> {
    // Canonisation = pas de structure « perdante » : loser_id = winner_id par convention (le dag_id
    // dédié permet de distinguer ces lignes des vraies fusions).
    await tx.$executeRaw`
      INSERT INTO audit.structure_merge_log
        (status, dag_id, task_id, winner_id, loser_id, winner_before, winner_after, moved_identifiers)
      VALUES (
        'SUCCESS', 'min-ui-canonisation', ${canonisation.parUtilisateur},
        ${canonisation.structureId}, ${canonisation.structureId},
        ${JSON.stringify(avant)}::jsonb,
        ${JSON.stringify(apres)}::jsonb,
        ${JSON.stringify(imageInsee(canonisation))}::jsonb
      )
    `
  }

  async #snapshot(tx: Prisma.TransactionClient, structureId: number): Promise<null | Prisma.JsonValue> {
    const lignes = await tx.$queryRaw<Array<{ snapshot: Prisma.JsonValue }>>`
      SELECT to_jsonb(sa.*) AS snapshot FROM main.structure_administrative sa WHERE id = ${structureId}
    `

    return lignes.at(0)?.snapshot ?? null
  }

  // Re-pointage d'adresse : on réutilise une adresse BAN existante — identifiée d'abord par son
  // code_ban (colonne UNIQUE), à défaut par sa clef_interop — sinon on crée une nouvelle ligne (avec
  // géométrie PostGIS). On ne modifie JAMAIS une ligne adresse existante. Matcher sur code_ban évite
  // aussi de heurter la contrainte unique adresse_code_ban_ukey à l'INSERT.
  async #trouverOuCreerAdresse(
    tx: Prisma.TransactionClient,
    geocode: NonNullable<Canonisation['geocode']>
  ): Promise<number> {
    const existante = await tx.adresse.findFirst({
      where:
        geocode.banCodeBan === null
          ? { clef_interop: geocode.banClefInterop }
          : { OR: [{ code_ban: geocode.banCodeBan }, { clef_interop: geocode.banClefInterop }] },
    })
    if (existante) {
      return existante.id
    }

    const resultat = await tx.$queryRaw<Array<{ id: number }>>`
      INSERT INTO main.adresse (
        clef_interop, code_ban, code_insee, code_postal,
        nom_commune, nom_voie, numero_voie, repetition, geom
      ) VALUES (
        ${geocode.banClefInterop},
        ${geocode.banCodeBan}::uuid,
        ${geocode.banCodeInsee},
        ${geocode.banCodePostal},
        ${geocode.banNomCommune},
        ${geocode.banNomVoie},
        ${geocode.banNumeroVoie},
        ${geocode.banRepetition},
        public.ST_Point(${geocode.banLongitude}::double precision, ${geocode.banLatitude}::double precision, 4326)
      )
      RETURNING id
    `

    return resultat[0].id
  }
}

// Violation d'une contrainte d'unicité : P2002 (mutation typée) ou P2010 portant le code PostgreSQL
// 23505 (unique_violation) pour une requête SQL brute.
function estViolationUnicite(erreur: unknown): boolean {
  if (!(erreur instanceof Prisma.PrismaClientKnownRequestError)) {
    return false
  }
  if (erreur.code === 'P2002') {
    return true
  }

  return erreur.code === 'P2010' && (erreur.meta as { code?: string } | undefined)?.code === '23505'
}

// Résumé de l'image INSEE appliquée, tracé dans moved_identifiers du journal d'audit.
function imageInsee(canonisation: Canonisation): Record<string, null | string> {
  return {
    adresse: canonisation.geocode === null ? null : canonisation.entreprise.adresse,
    denominationSirene: canonisation.entreprise.denomination,
    siret: canonisation.entreprise.identifiant,
    source: 'insee',
  }
}
