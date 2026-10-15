import prisma from '../../prisma/prismaClient'
import {
  CriteresLieuxSimilaires,
  LieuInclusionSimilaireReadModel,
  LieuxInclusionSimilairesLoader,
} from '@/use-cases/queries/RechercherLieuxInclusionSimilaires'

// Lecture seule. Un seul signal depuis les maquettes V6 : la même adresse BAN
// (clef_interop). Les colonnes enum[] sont castées en text[], sans quoi $queryRaw
// les renvoie en chaîne brute. Le décompte des personnes suit la règle de la fiche
// lieu : affectations actives, distinctes par personne.
export class PrismaLieuxInclusionSimilairesLoader implements LieuxInclusionSimilairesLoader {
  async rechercher(criteres: CriteresLieuxSimilaires): Promise<ReadonlyArray<LieuInclusionSimilaireReadModel>> {
    const lignes = await prisma.$queryRaw<ReadonlyArray<Ligne>>`
      SELECT l.id::text AS id,
             l.nom,
             l.siret_a_l_enrichissement AS siret,
             l.typologies::text[] AS typologies,
             COALESCE(personnes.nombre, 0)::int AS nombre_personnes_rattachees,
             btrim(concat_ws(' ', a.numero_voie::text || COALESCE(a.repetition, ''), a.nom_voie, a.code_postal, a.nom_commune)) AS adresse
      FROM main.lieu_inclusion l
      INNER JOIN main.adresse a ON a.id = l.adresse_id
      LEFT JOIN LATERAL (
        SELECT COUNT(DISTINCT pal.personne_id) AS nombre
        FROM main.personne_affectations_lieu pal
        WHERE pal.lieu_id = l.id
          AND pal.est_active = true
      ) personnes ON true
      WHERE l.deleted_at IS NULL
        AND a.clef_interop = ${criteres.clefInterop}
      ORDER BY l.nom
      LIMIT 10
    `

    return lignes.map((ligne) => ({
      adresse: ligne.adresse,
      id: ligne.id,
      nom: ligne.nom,
      nombrePersonnesRattachees: ligne.nombre_personnes_rattachees,
      siret: ligne.siret,
      typologies: ligne.typologies ?? [],
    }))
  }
}

type Ligne = Readonly<{
  adresse: string
  id: string
  nom: string
  nombre_personnes_rattachees: number
  siret: null | string
  typologies: null | ReadonlyArray<string>
}>
