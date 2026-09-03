import { Prisma } from '../../../prisma/generated/client'
import departements from '../../../ressources/departements.json'
import { FiltreGeographiqueLieux, StatutLieux } from '@/use-cases/queries/RecupererLieuxInclusion'
import { ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

// Filtre élargi côté loader : ScopeFiltre encode les droits (Contexte.scopeFiltre()),
// la maille communes (EPCI du tableau de bord) est une vue territoriale sans équivalent en droits.
export type FiltreLieuxDansScope = Readonly<{ codesInsee: ReadonlyArray<string>; type: 'communes' }> | ScopeFiltre

// Périmètre d'accès : "quels lieux ai-je le droit de voir ?"
// Source unique pour la liste des lieux et les compteurs du tableau de bord (#1488) afin
// que les volumes affichés soient strictement identiques.
// Le filtre géographique explicite (UI) prend le pas sur le scope, mais reste intersecté
// avec le scope departemental (défense en profondeur — décision PO #1279).
export function buildLieuxDansScopeCte(
  scopeFiltre: FiltreLieuxDansScope,
  statut: StatutLieux,
  geographique?: FiltreGeographiqueLieux
): Prisma.Sql {
  const filtreStatut = buildFiltreStatut(statut)

  if (geographique) {
    const intersectionScope =
      scopeFiltre.type === 'departemental'
        ? Prisma.sql`AND a.departement = ANY(${[...scopeFiltre.codes]})`
        : Prisma.empty
    if (geographique.type === 'epci') {
      return Prisma.sql`lieux_dans_scope AS (
        SELECT l.id
        FROM main.lieu_inclusion l
        LEFT JOIN main.adresse a ON a.id = l.adresse_id
        WHERE a.code_insee IN (
            SELECT c.code_insee
            FROM admin.commune c
            JOIN admin.commune_epci ce ON ce.commune_id = c.id
            JOIN admin.epci e ON e.id = ce.epci_id
            WHERE e.code = ${geographique.code}
          )
          ${intersectionScope}
          ${filtreStatut}
      )`
    }
    const codesDepartements =
      geographique.type === 'region'
        ? departements.filter((dept) => dept.regionCode === geographique.code).map((dept) => dept.code)
        : [geographique.code]
    return Prisma.sql`lieux_dans_scope AS (
      SELECT l.id
      FROM main.lieu_inclusion l
      LEFT JOIN main.adresse a ON a.id = l.adresse_id
      WHERE a.departement = ANY(${codesDepartements})
        ${intersectionScope}
        ${filtreStatut}
    )`
  }

  if (scopeFiltre.type === 'communes') {
    const codesInsee = [...scopeFiltre.codesInsee]
    return Prisma.sql`lieux_dans_scope AS (
      SELECT l.id
      FROM main.lieu_inclusion l
      LEFT JOIN main.adresse a ON a.id = l.adresse_id
      WHERE a.code_insee = ANY(${codesInsee})
        ${filtreStatut}
    )`
  }

  if (scopeFiltre.type === 'departemental') {
    const codesDepartements = [...scopeFiltre.codes]
    return Prisma.sql`lieux_dans_scope AS (
      SELECT l.id
      FROM main.lieu_inclusion l
      LEFT JOIN main.adresse a ON a.id = l.adresse_id
      WHERE a.departement = ANY(${codesDepartements})
        ${filtreStatut}
    )`
  }

  if (scopeFiltre.type === 'structure') {
    // scopeFiltre.id refere a une structure_administrative.id. Depuis le
    // retrait de l'asso lieu ↔ SA (#1711), un gestionnaire de SA voit les
    // lieux ou travaillent des personnes employees par sa SA (paf_lieu ×
    // paf_emploi croises, plus min.personne_enrichie pour les mediateurs Coop
    // sans paf_emploi). Pour les lieux archivés, le périmètre est calculé sans
    // exiger d'affectations actives, puis le statut est appliqué.
    const filtreEmploiActif = statut === 'archive' ? Prisma.empty : Prisma.sql`AND pae.est_active = true`
    const filtreLieuActif = statut === 'archive' ? Prisma.empty : Prisma.sql`AND pal.est_active = true`
    return Prisma.sql`lieux_dans_scope AS (
      SELECT l.id
      FROM main.lieu_inclusion l
      WHERE EXISTS (
          SELECT 1 FROM main.personne_affectations_lieu pal
          WHERE pal.lieu_id = l.id ${filtreLieuActif}
            AND pal.personne_id IN (
              SELECT pae.personne_id FROM main.personne_affectations_emploi pae
              WHERE pae.structure_administrative_id = ${scopeFiltre.id} ${filtreEmploiActif}
              UNION
              SELECT pe.id FROM min.personne_enrichie pe
              WHERE pe.structure_employeuse_id = ${scopeFiltre.id}
            )
        )
        ${filtreStatut}
    )`
  }

  // Scope national : aucune restriction d'accès
  return Prisma.sql`lieux_dans_scope AS (
    SELECT l.id FROM main.lieu_inclusion l
    WHERE true
      ${filtreStatut}
  )`
}

// Archivé = date de suppression renseignée (soft delete #1497) ; actif = non supprimé.
function buildFiltreStatut(statut: StatutLieux): Prisma.Sql {
  if (statut === 'archive') {
    return Prisma.sql`AND l.deleted_at IS NOT NULL`
  }
  return Prisma.sql`AND l.deleted_at IS NULL`
}
