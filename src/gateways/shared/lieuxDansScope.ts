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
    // scopeFiltre.id refere a une structure_administrative.id : seul le statut
    // du lieu distingue actifs et archives.
    return Prisma.sql`lieux_dans_scope AS (
      SELECT l.id
      FROM main.lieu_inclusion l
      WHERE ${conditionLieuDeLaStructure(scopeFiltre.id)}
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

// Lieu d'une structure administrative (alias `l` = main.lieu_inclusion). Depuis le retrait
// de l'asso lieu ↔ SA (#1711), le rattachement passe par les personnes :
// - un médiateur employé par la SA y est affecté aujourd'hui, toutes sources d'emploi
//   (plus min.personne_enrichie pour les médiateurs Coop sans paf_emploi) ;
// - ou un médiateur Coop y a été présent pendant son emploi dans la SA (chevauchement des
//   périodes Coop) : un lieu quitté reste à la structure, sans rattacher les lieux qu'il
//   a fréquentés pour un autre employeur.
// Source unique pour la liste des lieux, le filtre lieux des statistiques et le compteur
// du tableau de bord structure.
export function conditionLieuDeLaStructure(structureId: number): Prisma.Sql {
  return Prisma.sql`(
    EXISTS (
      SELECT 1 FROM main.personne_affectations_lieu pal
      WHERE pal.lieu_id = l.id AND pal.est_active = true
        AND pal.personne_id IN (
          SELECT pae.personne_id FROM main.personne_affectations_emploi pae
          WHERE pae.structure_administrative_id = ${structureId} AND pae.est_active = true
          UNION
          SELECT pe.id FROM min.personne_enrichie pe
          WHERE pe.structure_employeuse_id = ${structureId}
        )
    )
    OR EXISTS (
      SELECT 1
      FROM coop.mediateurs_en_activite mea
        INNER JOIN coop.mediateurs m ON m.id = mea.mediateur_id
        INNER JOIN coop.employes_structures es ON es.user_id = m.user_id
      WHERE mea.structure_id = l.structure_coop_id
        AND es.structure_main_id = ${structureId}
        AND mea.suppression IS NULL
        AND es.suppression IS NULL
        AND COALESCE(mea.debut_activite, '-infinity'::timestamp) <= COALESCE(es.fin_emploi, 'infinity'::timestamp)
        AND COALESCE(es.debut_emploi, '-infinity'::timestamp) <= COALESCE(mea.fin_activite, 'infinity'::timestamp)
    )
  )`
}

// Archivé = date de suppression renseignée (soft delete #1497) ; actif = non supprimé.
function buildFiltreStatut(statut: StatutLieux): Prisma.Sql {
  if (statut === 'archive') {
    return Prisma.sql`AND l.deleted_at IS NOT NULL`
  }
  return Prisma.sql`AND l.deleted_at IS NULL`
}
