import prisma from '../../prisma/prismaClient'
import {
  GroupeDoublonReadModel,
  SignalDoublon,
  StructureCandidateReadModel,
  StructuresDoublonsLoader,
  StructuresDoublonsReadModel,
} from '@/use-cases/queries/RechercherStructuresDoublons'

export class PrismaStructuresDoublonsLoader implements StructuresDoublonsLoader {
  async doublons(signaux: ReadonlyArray<SignalDoublon>, zone?: ZoneDoublons): Promise<StructuresDoublonsReadModel> {
    const lignes = await this.#detecter()

    const lignesFiltrees = lignes
      .filter((ligne) => signaux.includes(ligne.signal))
      .filter((ligne) => estDansLaZone(ligne, zone))

    return construireGroupes(lignesFiltrees)
  }

  // Détection des candidats sur les 3 signaux (cf RechercherStructuresDoublons).
  // GARDE ANTENNES : les groupes où un même SIRET ne porte QUE des
  // `denomination_antenne` distincts (aucune ligne NULL) ne ressortent jamais —
  // ce sont des antennes légitimes (décision tranchée 2026-05-25). Le signal
  // `siret_antenne_ambigu` ne cible que les SIRET mélangeant NULL + antenne nommée.
  async #detecter(): Promise<ReadonlyArray<LigneCandidate>> {
    return prisma.$queryRaw<Array<LigneCandidate>>`
      WITH sa AS (
        SELECT id, siret, ridet, denomination_sirene, denomination_antenne, rna, adresse_id, edited_by,
               LEFT(siret, 9) AS siren
        FROM main.structure_administrative
        WHERE deleted_at IS NULL
      ),
      ambig AS (
        SELECT siret
        FROM sa
        WHERE siret IS NOT NULL
        GROUP BY siret
        HAVING COUNT(*) FILTER (WHERE denomination_antenne IS NULL) >= 1
           AND COUNT(*) FILTER (WHERE denomination_antenne IS NOT NULL) >= 1
      ),
      cand_a AS (
        SELECT 'siret_antenne_ambigu'::text AS signal, 'siret:' || sa.siret AS cle, sa.id
        FROM sa
        JOIN ambig USING (siret)
      ),
      rna_g AS (
        SELECT rna
        FROM sa
        WHERE rna IS NOT NULL AND rna <> ''
        GROUP BY rna
        HAVING COUNT(DISTINCT COALESCE(siret, '')) > 1
      ),
      cand_b AS (
        SELECT 'identifiant_externe_partage'::text AS signal, 'rna:' || sa.rna AS cle, sa.id
        FROM sa
        JOIN rna_g USING (rna)
      ),
      dc AS (
        -- ≥ 2 SIREN distincts : on ne propose JAMAIS la fusion d'établissements
        -- d'un même SIREN (établissements primaire/secondaires INSEE, légitimement
        -- distincts). Seules les entités légales différentes au même nom + commune
        -- (erreur de saisie probable) sont des candidats.
        SELECT LOWER(unaccent(sa.denomination_sirene)) AS d, a.code_insee
        FROM sa
        JOIN main.adresse a ON a.id = sa.adresse_id
        WHERE sa.denomination_sirene IS NOT NULL AND a.code_insee IS NOT NULL
        GROUP BY 1, 2
        HAVING COUNT(DISTINCT LEFT(sa.siret, 9)) > 1
      ),
      cand_c AS (
        SELECT 'nom_commune_proche'::text AS signal,
               'denom:' || dc.d || '|' || dc.code_insee AS cle,
               sa.id
        FROM sa
        JOIN main.adresse a ON a.id = sa.adresse_id
        JOIN dc ON dc.d = LOWER(unaccent(sa.denomination_sirene)) AND dc.code_insee = a.code_insee
      ),
      cand AS (
        SELECT * FROM cand_a
        UNION SELECT * FROM cand_b
        UNION SELECT * FROM cand_c
      )
      SELECT
        c.signal,
        c.cle,
        c.id,
        s.siret,
        s.ridet,
        s.denomination_sirene,
        s.denomination_antenne,
        s.siren,
        s.edited_by AS source,
        EXISTS (
          SELECT 1 FROM audit.structure_merge_log ml
          WHERE ml.winner_id = c.id AND ml.status = 'SUCCESS' AND ml.dag_id = 'min-ui'
        ) AS deja_fusionnee,
        a.nom_commune,
        a.departement AS departement_code,
        r.code AS region_code,
        (
            (SELECT COUNT(*) FROM min.utilisateur u WHERE u.structure_id = c.id)
          + (SELECT COUNT(*) FROM min.membre m WHERE m.structure_id = c.id)
          + (SELECT COUNT(*) FROM main.poste p WHERE p.structure_id = c.id)
          + (SELECT COUNT(*) FROM main.contrat ct WHERE ct.structure_id = c.id)
          + (SELECT COUNT(*) FROM main.personne_affectations_emploi pae WHERE pae.structure_administrative_id = c.id)
          + (SELECT COUNT(*) FROM main.contact_structure_administrative cs WHERE cs.structure_administrative_id = c.id)
          + (SELECT COUNT(*) FROM main.lieu_inclusion_structure_administrative li
             WHERE li.structure_administrative_id = c.id)
        )::int AS nb_rattachements
      FROM cand c
      JOIN sa s ON s.id = c.id
      LEFT JOIN main.adresse a ON a.id = s.adresse_id
      LEFT JOIN admin.departement d ON d.code = a.departement
      LEFT JOIN admin.region r ON r.id = d.region_id
      ORDER BY c.signal, c.cle, nb_rattachements DESC, c.id
    `
  }
}

type ZoneDoublons = Readonly<{
  code: string
  type: 'departement' | 'region'
}>

// Une ligne candidate brute renvoyée par le SQL de détection : une structure
// administrative active rattachée à un groupe de doublon par un signal donné.
interface LigneCandidate {
  cle: string
  deja_fusionnee: boolean
  denomination_antenne: null | string
  denomination_sirene: null | string
  departement_code: null | string
  id: number
  nb_rattachements: number
  nom_commune: null | string
  region_code: null | string
  ridet: null | string
  signal: SignalDoublon
  siren: null | string
  siret: null | string
  source: null | string
}

function estDansLaZone(ligne: LigneCandidate, zone?: ZoneDoublons): boolean {
  if (zone === undefined) {
    return true
  }
  if (zone.type === 'departement') {
    return ligne.departement_code === zone.code
  }
  return ligne.region_code === zone.code
}

function construireGroupes(lignes: ReadonlyArray<LigneCandidate>): StructuresDoublonsReadModel {
  const parCle = new Map<string, Array<LigneCandidate>>()
  for (const ligne of lignes) {
    const groupe = parCle.get(ligne.cle) ?? []
    groupe.push(ligne)
    parCle.set(ligne.cle, groupe)
  }

  const groupes: Array<GroupeDoublonReadModel> = []
  for (const [cle, lignesDuGroupe] of parCle) {
    const signal = lignesDuGroupe[0].signal
    // nom_commune_proche : on regroupe par SIREN — les établissements d'un même
    // SIREN comptent pour un seul candidat (ils ne sont jamais des doublons entre
    // eux). Les autres signaux restent au niveau ligne.
    const structures =
      signal === 'nom_commune_proche' ? collapserParSiren(lignesDuGroupe) : lignesDuGroupe.map(versCandidate)

    if (structures.length < 2) {
      continue
    }

    groupes.push({ cle, signal, structures })
  }

  return groupes
}

function collapserParSiren(lignes: ReadonlyArray<LigneCandidate>): ReadonlyArray<StructureCandidateReadModel> {
  const parSiren = new Map<string, Array<LigneCandidate>>()
  for (const ligne of lignes) {
    const cleSiren = ligne.siren ?? `id:${ligne.id}`
    const groupe = parSiren.get(cleSiren) ?? []
    groupe.push(ligne)
    parSiren.set(cleSiren, groupe)
  }

  return Array.from(parSiren.values()).map((lignesDuSiren) => {
    // Représentant du SIREN : l'établissement le plus rattaché ; nbRattachements
    // = total cumulé des établissements de ce SIREN dans le groupe.
    const representant = [...lignesDuSiren].sort(
      (gauche, droite) => droite.nb_rattachements - gauche.nb_rattachements
    )[0]
    const nbRattachements = lignesDuSiren.reduce((total, ligne) => total + ligne.nb_rattachements, 0)

    return { ...versCandidate(representant), nbRattachements }
  })
}

function versCandidate(ligne: LigneCandidate): StructureCandidateReadModel {
  return {
    commune: ligne.nom_commune,
    dejaFusionnee: ligne.deja_fusionnee,
    denomination: ligne.denomination_sirene,
    denominationAntenne: ligne.denomination_antenne,
    id: ligne.id,
    nbRattachements: ligne.nb_rattachements,
    ridet: ligne.ridet,
    siret: ligne.siret,
    source: ligne.source,
  }
}
