import { Prisma } from '../../prisma/generated/client'
import prisma from '../../prisma/prismaClient'
import { ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

// Tags proposés dans le filtre des statistiques : ceux posés sur au moins une activité du périmètre
// de l'utilisateur (même périmètre que les statistiques). Chargés une fois, indépendamment des autres
// filtres. Non supprimés, jamais personnels (#1811, même règle que la section « Tags spécifiques »).
// La sous-requête part des activités : la jointure sur activite_tags utilise sa clé (activite_id, tag_id).
export class PrismaTagsCoopLoader {
  async recupererVisibles(scopeFiltre: ScopeFiltre): Promise<ReadonlyArray<TagCoopOption>> {
    // Sans département, aucun périmètre ne serait appliqué : on ne veut pas basculer en vue France.
    if (scopeFiltre.type === 'departemental' && scopeFiltre.codes.length === 0) {
      return []
    }

    return prisma.$queryRaw<ReadonlyArray<TagCoopOption>>`
      SELECT t.id::text AS value,
             t.nom AS label,
             t.departement,
             CASE
               WHEN t.departement IS NOT NULL THEN 'departemental'
               WHEN t.equipe = true THEN 'equipe'
               ELSE 'national'
             END AS portee
      FROM coop.tags t
      WHERE t.suppression IS NULL
        AND (t.equipe = true OR (t.mediateur_id IS NULL AND t.coordinateur_id IS NULL))
        AND t.id IN (
          SELECT activite_tag.tag_id
          FROM coop.activites act
            INNER JOIN coop.activite_tags activite_tag ON activite_tag.activite_id = act.id
            ${jointurePerimetre(scopeFiltre)}
          WHERE act.suppression IS NULL
            AND ${conditionPerimetre(scopeFiltre)}
        )
      ORDER BY t.nom
    `
  }
}

// Périmètre seul (scope de l'utilisateur), sans les autres filtres : la liste ne dépend pas de la période, du lieu…
// Mêmes conditions que PrismaStatistiquesCoopLoader (localisation de l'activité, structure employeuse).
function jointurePerimetre(scopeFiltre: ScopeFiltre): Prisma.Sql {
  return scopeFiltre.type === 'departemental'
    ? Prisma.sql`LEFT JOIN coop.lieu_inclusion str ON str.id = act.structure_id`
    : Prisma.empty
}

function conditionPerimetre(scopeFiltre: ScopeFiltre): Prisma.Sql {
  if (scopeFiltre.type === 'departemental') {
    const motifs = scopeFiltre.codes.map((departement) => `${departement}%`)
    return Prisma.sql`COALESCE(str.code_insee, act.lieu_code_insee) LIKE ANY (ARRAY[${Prisma.join(motifs)}]::text[])`
  }
  if (scopeFiltre.type === 'structure') {
    return Prisma.sql`act.structure_employeuse_main_id = ${scopeFiltre.id}`
  }
  return Prisma.sql`TRUE`
}

type TagCoopOption = Readonly<{
  departement: null | string
  label: string
  portee: 'departemental' | 'equipe' | 'national'
  value: string
}>
