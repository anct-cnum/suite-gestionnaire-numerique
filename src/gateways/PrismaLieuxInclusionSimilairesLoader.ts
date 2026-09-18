import prisma from '../../prisma/prismaClient'
import {
  CriteresLieuxSimilaires,
  LieuInclusionSimilaireReadModel,
  LieuxInclusionSimilairesLoader,
} from '@/use-cases/queries/RechercherLieuxInclusionSimilaires'

// Lecture seule. Trois signaux, du plus sûr au plus flou : même SIRET, même adresse BAN
// (clef_interop), nom proche dans la même commune (word_similarity, sans accents ni casse).
// Les fonctions d'extension sont qualifiées `public.` (search_path Prisma sans public).
export class PrismaLieuxInclusionSimilairesLoader implements LieuxInclusionSimilairesLoader {
  async rechercher(criteres: CriteresLieuxSimilaires): Promise<ReadonlyArray<LieuInclusionSimilaireReadModel>> {
    const lignes = await prisma.$queryRaw<ReadonlyArray<Ligne>>`
      WITH cible AS (
        SELECT ${criteres.siret}::text AS siret,
               ${criteres.clefInterop}::text AS clef_interop,
               ${criteres.codeInsee}::text AS code_insee,
               lower(public.unaccent(btrim(${criteres.nom}::text))) AS nom_n
      )
      SELECT l.id::text AS id,
             l.nom,
             l.siret_a_l_enrichissement AS siret,
             (l.structure_coop_id IS NOT NULL) AS est_lieu_coop,
             btrim(concat_ws(' ', a.numero_voie::text || COALESCE(a.repetition, ''), a.nom_voie, a.code_postal, a.nom_commune)) AS adresse,
             CASE
               WHEN c.siret IS NOT NULL AND l.siret_a_l_enrichissement = c.siret THEN 'siret'
               WHEN c.clef_interop IS NOT NULL AND a.clef_interop = c.clef_interop THEN 'adresse'
               ELSE 'nom'
             END AS motif
      FROM main.lieu_inclusion l
      LEFT JOIN main.adresse a ON a.id = l.adresse_id
      CROSS JOIN cible c
      WHERE l.deleted_at IS NULL
        AND (
          (c.siret IS NOT NULL AND l.siret_a_l_enrichissement = c.siret)
          OR (c.clef_interop IS NOT NULL AND a.clef_interop = c.clef_interop)
          OR (c.code_insee IS NOT NULL AND c.nom_n <> '' AND a.code_insee = c.code_insee
              AND public.word_similarity(c.nom_n, lower(public.unaccent(l.nom))) > 0.6)
        )
      ORDER BY motif, l.nom
      LIMIT 10
    `

    return lignes.map((ligne) => ({
      adresse: ligne.adresse,
      estLieuCoop: ligne.est_lieu_coop,
      id: ligne.id,
      motif: ligne.motif,
      nom: ligne.nom,
      siret: ligne.siret,
    }))
  }
}

type Ligne = Readonly<{
  adresse: string
  est_lieu_coop: boolean
  id: string
  motif: 'adresse' | 'nom' | 'siret'
  nom: string
  siret: null | string
}>
