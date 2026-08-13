import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import {
  StatistiquesCoopLoader,
  StatistiquesCoopReadModel,
  StatistiquesFilters,
} from '@/use-cases/queries/RecupererStatistiquesCoop'

// Remplace l'appel HTTP à l'API Coop GET /api/v1/statistiques par les mêmes agrégations SQL,
// exécutées sur le schéma coop répliqué en base (ingestion dataspace).
// La sémantique reproduit celle de l'API (bornes de dates, valeurs, labels, arrondis), y compris :
// - totaux.*.demarches vaut toujours 0 (l'API ne renvoie pas ces clés) ;
// - le type « Demarche » n'est pas filtrable (l'API ne le supporte pas).
// Écarts assumés avec l'API v1 :
// - #1286 : accompagnementsParMois suit la période du/au (repli : 12 derniers mois), comme la page
//   « mes statistiques » de la Coop — l'API renvoyait toujours les 12 derniers mois ;
// - #1796 : totaux.accompagnements.collectifs.total = participants aux ateliers (l'API y mettait le
//   nombre d'ateliers, incohérent avec la proportion adjacente calculée sur les participants).
export class PrismaStatistiquesCoopLoader implements StatistiquesCoopLoader {
  async recupererStatistiques(filtres?: StatistiquesFilters): Promise<StatistiquesCoopReadModel> {
    const requete = construireRequete(filtres ?? {})

    const [parJour, parMois, beneficiaires, activites, nouveaux] = await Promise.all([
      recupererAccompagnementsParJour(requete),
      recupererAccompagnementsParMois(requete),
      recupererStatistiquesBeneficiaires(requete),
      recupererStatistiquesActivites(requete),
      recupererNouveauxAccompagnements(requete),
    ])

    const [proportionActivitesIndividuelles, proportionActivitesCollectives] = allouerPourcentages([
      activites.nombreIndividuels,
      activites.nombreCollectifs,
    ])
    const [proportionAccompagnementsIndividuels, proportionAccompagnementsCollectifs] = allouerPourcentages([
      activites.nombreIndividuels,
      activites.participantsCollectifs,
    ])

    return {
      accompagnementsParJour: parJour,
      accompagnementsParMois: parMois,
      activites: activites.repartitions,
      beneficiaires: beneficiaires.repartitions,
      totaux: {
        accompagnements: {
          collectifs: {
            proportion: proportionAccompagnementsCollectifs,
            total: activites.participantsCollectifs,
          },
          demarches: {
            proportion: 0,
            total: 0,
          },
          individuels: {
            proportion: proportionAccompagnementsIndividuels,
            total: activites.nombreIndividuels,
          },
          total: activites.totalAccompagnements,
        },
        activites: {
          collectifs: {
            participants: activites.participantsCollectifs,
            proportion: proportionActivitesCollectives,
            total: activites.nombreCollectifs,
          },
          demarches: {
            proportion: 0,
            total: 0,
          },
          individuels: {
            proportion: proportionActivitesIndividuelles,
            total: activites.nombreIndividuels,
          },
          total: activites.nombreActivites,
        },
        beneficiaires: {
          anonymes: beneficiaires.total - beneficiaires.suivis,
          nouveaux,
          suivis: beneficiaires.suivis,
          total: beneficiaires.total,
        },
      },
    }
  }
}

type Requete = Readonly<{
  au?: string
  du?: string
  jointures: Prisma.Sql
  where: Prisma.Sql
}>

function construireRequete(filtres: StatistiquesFilters): Requete {
  const conditions: Array<Prisma.Sql> = [
    Prisma.sql`act.suppression IS NULL`,
    ...conditionsPeriode(filtres),
    ...conditionsActivite(filtres),
    ...conditionsLocalisation(filtres),
    ...conditionsPersonnes(filtres),
  ]

  const jointureStructure =
    (filtres.communes !== undefined && filtres.communes.length > 0) ||
    (filtres.departements !== undefined && filtres.departements.length > 0)
      ? Prisma.sql`LEFT JOIN coop.lieu_inclusion str ON str.id = act.structure_id`
      : Prisma.empty
  const jointureConseillerNumerique =
    filtres.conseillerNumerique === undefined
      ? Prisma.empty
      : Prisma.sql`LEFT JOIN coop.mediateurs med ON act.mediateur_id = med.id
        LEFT JOIN coop.users u ON med.user_id = u.id`

  return {
    au: filtres.au === '' ? undefined : filtres.au,
    du: filtres.du === '' ? undefined : filtres.du,
    jointures: Prisma.sql`${jointureStructure} ${jointureConseillerNumerique}`,
    where: Prisma.join(conditions, ' AND '),
  }
}

function conditionsPeriode(filtres: StatistiquesFilters): Array<Prisma.Sql> {
  const conditions: Array<Prisma.Sql> = []
  if (filtres.du !== undefined && filtres.du !== '') {
    conditions.push(Prisma.sql`act.date::date >= ${filtres.du}::date`)
  }
  if (filtres.au !== undefined && filtres.au !== '') {
    conditions.push(Prisma.sql`act.date::date <= ${filtres.au}::date`)
  }
  return conditions
}

function conditionsActivite(filtres: StatistiquesFilters): Array<Prisma.Sql> {
  const conditions: Array<Prisma.Sql> = []
  const types = (filtres.types ?? [])
    .map((type) => TYPES_ACTIVITE.find((entree) => entree.cle === type)?.valeurBdd)
    .filter((valeur): valeur is string => valeur !== undefined)
  if (types.length > 0) {
    conditions.push(Prisma.raw(`act.type IN (${enListeSql(types)})`))
  }
  const thematiques = [...(filtres.thematiqueNonAdministratives ?? []), ...(filtres.thematiqueAdministratives ?? [])]
    .map((cle) => THEMATIQUES.find((entree) => entree.cle === cle)?.valeurBdd)
    .filter((valeur): valeur is string => valeur !== undefined)
  if (thematiques.length > 0) {
    conditions.push(Prisma.raw(`act.thematiques && ARRAY[${enListeSql(thematiques)}]::coop.thematique[]`))
  }
  return conditions
}

function conditionsLocalisation(filtres: StatistiquesFilters): Array<Prisma.Sql> {
  const conditions: Array<Prisma.Sql> = []
  if (filtres.lieux !== undefined && filtres.lieux.length > 0) {
    conditions.push(Prisma.sql`act.structure_id = ANY(ARRAY[${Prisma.join([...filtres.lieux])}]::uuid[])`)
  }
  if (filtres.communes !== undefined && filtres.communes.length > 0) {
    conditions.push(
      Prisma.sql`COALESCE(str.code_insee, act.lieu_code_insee) = ANY(ARRAY[${Prisma.join([...filtres.communes])}]::text[])`
    )
  }
  if (filtres.departements !== undefined && filtres.departements.length > 0) {
    const motifs = filtres.departements.map((departement) => `${departement}%`)
    conditions.push(
      Prisma.sql`COALESCE(str.code_insee, act.lieu_code_insee) LIKE ANY (ARRAY[${Prisma.join(motifs)}]::text[])`
    )
  }
  return conditions
}

function conditionsPersonnes(filtres: StatistiquesFilters): Array<Prisma.Sql> {
  const conditions: Array<Prisma.Sql> = []
  if (filtres.beneficiaires !== undefined && filtres.beneficiaires.length > 0) {
    conditions.push(Prisma.sql`EXISTS (
      SELECT 1
      FROM coop.accompagnements acc_beneficiaire
      WHERE acc_beneficiaire.beneficiaire_id = ANY(ARRAY[${Prisma.join([...filtres.beneficiaires])}]::uuid[])
        AND acc_beneficiaire.activite_id = act.id
    )`)
  }
  if (filtres.mediateurs !== undefined && filtres.mediateurs.length > 0) {
    conditions.push(Prisma.sql`act.mediateur_id = ANY(ARRAY[${Prisma.join([...filtres.mediateurs])}]::uuid[])`)
  }
  if (filtres.structuresEmployeuses !== undefined && filtres.structuresEmployeuses.length > 0) {
    const idsStructures = filtres.structuresEmployeuses.map(Number).filter((id) => Number.isInteger(id))
    if (idsStructures.length > 0) {
      conditions.push(Prisma.sql`act.structure_employeuse_main_id = ANY(ARRAY[${Prisma.join(idsStructures)}]::int[])`)
    }
  }
  if (filtres.conseillerNumerique !== undefined) {
    conditions.push(
      filtres.conseillerNumerique
        ? Prisma.sql`u.is_conseiller_numerique = TRUE`
        : Prisma.sql`u.is_conseiller_numerique = FALSE`
    )
  }
  return conditions
}

// Les valeurs proviennent exclusivement des référentiels internes (jamais de l'utilisateur).
function enListeSql(valeurs: ReadonlyArray<string>): string {
  return valeurs.map((valeur) => `'${valeur}'`).join(', ')
}

type LigneLabelCount = Readonly<{
  count: number
  label: string
}>

async function recupererAccompagnementsParJour(requete: Requete): Promise<ReadonlyArray<LigneLabelCount>> {
  const fin = requete.au === undefined ? Prisma.sql`CURRENT_DATE` : Prisma.sql`${requete.au}::date`
  const debut =
    requete.du === undefined
      ? Prisma.sql`DATE_TRUNC('day', ${fin} - INTERVAL '29 days')`
      : Prisma.sql`${requete.du}::date`

  return prisma.$queryRaw<Array<LigneLabelCount>>`
    WITH accompagnements_filtres AS (
      SELECT act.date
      FROM coop.activites act
        INNER JOIN coop.accompagnements acc ON acc.activite_id = act.id
        ${requete.jointures}
      WHERE ${requete.where}
        AND act.date <= ${fin}
        AND act.date >= ${debut}
    ),
    jours AS (SELECT generate_series(${debut}, ${fin}, '1 day'::interval) AS jour)
    SELECT TO_CHAR(jours.jour, 'DD/MM') AS label,
           COUNT(accompagnements_filtres.date)::int AS count
    FROM jours
      LEFT JOIN accompagnements_filtres ON accompagnements_filtres.date = jours.jour
    GROUP BY jours.jour
    ORDER BY jours.jour`
}

async function recupererAccompagnementsParMois(requete: Requete): Promise<ReadonlyArray<LigneLabelCount>> {
  // #1286 : la fenêtre suit la période sélectionnée (comme la page « mes statistiques » de la Coop),
  // contrairement à l'API v1 qui renvoyait toujours les 12 derniers mois glissants.
  const fin = requete.au === undefined ? Prisma.sql`CURRENT_DATE` : Prisma.sql`${requete.au}::date`
  const debut =
    requete.du === undefined
      ? Prisma.sql`DATE_TRUNC('month', ${fin} - INTERVAL '11 months')`
      : Prisma.sql`${requete.du}::date`

  const lignes = await prisma.$queryRaw<Array<Readonly<{ annee: number; count: number; mois: number }>>>`
    WITH accompagnements_filtres AS (
      SELECT act.date
      FROM coop.activites act
        INNER JOIN coop.accompagnements acc ON acc.activite_id = act.id
        ${requete.jointures}
      WHERE ${requete.where}
        AND act.date <= ${fin}
        AND act.date >= ${debut}
    ),
    mois AS (
      SELECT DATE_TRUNC(
        'month',
        generate_series(${debut}, ${fin}, '1 month'::interval)
      ) AS mois
    )
    SELECT EXTRACT(MONTH FROM mois.mois)::int AS mois,
           EXTRACT(YEAR FROM mois.mois)::int AS annee,
           COUNT(accompagnements_filtres.date)::int AS count
    FROM mois
      LEFT JOIN accompagnements_filtres ON DATE_TRUNC('month', accompagnements_filtres.date) = mois.mois
    GROUP BY mois.mois
    ORDER BY mois.mois`

  return lignes.map(({ annee, count, mois }) => ({
    count,
    label: `${String(mois).padStart(2, '0')}/${String(annee).slice(-2)}`,
  }))
}

type LigneComptages = Readonly<Record<string, number>>

async function recupererStatistiquesBeneficiaires(requete: Requete): Promise<
  Readonly<{
    repartitions: StatistiquesCoopReadModel['beneficiaires']
    suivis: number
    total: number
  }>
> {
  const [comptages] = await prisma.$queryRaw<Array<LigneComptages>>`
    SELECT COUNT(DISTINCT ben.id)::int AS total_beneficiaires,
      COUNT(DISTINCT CASE WHEN ben.anonyme = false THEN ben.id END)::int AS total_beneficiaires_suivis,
      ${selectionComptagesDistincts('ben.genre', 'genre', GENRES)},
      ${selectionComptagesDistincts('ben.statut_social', 'statut_social', STATUTS_SOCIAUX)},
      ${selectionComptagesDistincts(TRANCHE_AGE_DERIVEE, 'tranche_age', TRANCHES_AGE)}
    FROM coop.activites act
      INNER JOIN coop.accompagnements acc ON acc.activite_id = act.id
      INNER JOIN coop.beneficiaires ben ON ben.id = acc.beneficiaire_id
      ${requete.jointures}
    WHERE ${requete.where}`

  return {
    repartitions: {
      genres: repartir(GENRES, comptages, 'genre'),
      statutsSocial: repartir(STATUTS_SOCIAUX, comptages, 'statut_social'),
      total: comptages.total_beneficiaires,
      trancheAges: repartir(TRANCHES_AGE, comptages, 'tranche_age'),
    },
    suivis: comptages.total_beneficiaires_suivis,
    total: comptages.total_beneficiaires,
  }
}

async function recupererStatistiquesActivites(requete: Requete): Promise<
  Readonly<{
    nombreActivites: number
    nombreCollectifs: number
    nombreIndividuels: number
    participantsCollectifs: number
    repartitions: StatistiquesCoopReadModel['activites']
    totalAccompagnements: number
  }>
> {
  const [comptages] = await prisma.$queryRaw<Array<LigneComptages>>`
    SELECT COUNT(*)::int AS nombre_activites,
      COALESCE(SUM(CASE WHEN act.type = 'individuel' THEN 1 ELSE 0 END), 0)::int AS nombre_individuels,
      COALESCE(SUM(CASE WHEN act.type = 'collectif' THEN 1 ELSE 0 END), 0)::int AS nombre_collectifs,
      COALESCE(SUM(act.accompagnements_count), 0)::int AS total_accompagnements,
      COALESCE(SUM(CASE WHEN act.type = 'collectif' THEN act.accompagnements_count ELSE 0 END), 0)::int
        AS participants_collectifs,
      ${selectionSommesPonderees([
        ...TYPES_ACTIVITE.map((entree) => ({
          alias: `type_${entree.valeurBdd}_count`,
          predicat: `act.type = '${entree.valeurBdd}'`,
        })),
        ...DUREES.map((entree) => ({
          alias: `duree_${entree.cle}_count`,
          predicat: `act.duree >= ${entree.min} AND act.duree < ${entree.max}`,
        })),
        ...TYPES_LIEU.map((entree) => ({
          alias: `type_lieu_${entree.valeurBdd}_count`,
          predicat: `act.type_lieu = '${entree.valeurBdd}'`,
        })),
        ...THEMATIQUES.map((entree) => ({
          alias: `thematiques_${entree.valeurBdd}_count`,
          predicat: `'${entree.valeurBdd}' = ANY(act.thematiques)`,
        })),
        ...MATERIELS.map((entree) => ({
          alias: `materiel_${entree.valeurBdd}_count`,
          predicat: `'${entree.valeurBdd}' = ANY(act.materiel)`,
        })),
      ])}
    FROM coop.activites act
      ${requete.jointures}
    WHERE ${requete.where}`

  return {
    nombreActivites: comptages.nombre_activites,
    nombreCollectifs: comptages.nombre_collectifs,
    nombreIndividuels: comptages.nombre_individuels,
    participantsCollectifs: comptages.participants_collectifs,
    repartitions: {
      durees: repartir(
        DUREES.map(({ cle, label }) => ({ cle, label, valeurBdd: cle })),
        comptages,
        'duree'
      ),
      materiels: repartir(MATERIELS, comptages, 'materiel'),
      thematiques: repartir(THEMATIQUES_NON_ADMINISTRATIVES, comptages, 'thematiques'),
      thematiquesDemarches: repartir(THEMATIQUES_ADMINISTRATIVES, comptages, 'thematiques'),
      totalAccompagnements: comptages.total_accompagnements,
      typeActivites: repartir(TYPES_ACTIVITE, comptages, 'type'),
      typeLieu: repartir(TYPES_LIEU, comptages, 'type_lieu'),
    },
    totalAccompagnements: comptages.total_accompagnements,
  }
}

async function recupererNouveauxAccompagnements(requete: Requete): Promise<number> {
  // Comme l'API Coop : les « nouveaux » ne sont comptés que si la période du/au est complète.
  if (requete.du === undefined || requete.au === undefined) {
    return 0
  }

  const [ligne] = await prisma.$queryRaw<Array<Readonly<{ nouveaux: number }>>>`
    SELECT COUNT(*)::int AS nouveaux
    FROM coop.accompagnements acc
      INNER JOIN coop.activites act ON acc.activite_id = act.id
      ${requete.jointures}
    WHERE acc.premier_accompagnement = true
      AND ${requete.where}`

  return ligne.nouveaux
}

type EntreeReferentiel = Readonly<{
  cle: string
  label: string
  parDefaut?: boolean
  valeurBdd: string
}>

function selectionComptagesDistincts(
  expression: string,
  prefixe: string,
  referentiel: ReadonlyArray<EntreeReferentiel>
): Prisma.Sql {
  return Prisma.raw(
    referentiel
      .map(({ parDefaut, valeurBdd }) => {
        const casNul = parDefaut === true ? ` OR ${expression} IS NULL` : ''
        return (
          `COUNT(DISTINCT CASE WHEN ${expression} = '${valeurBdd}'${casNul} THEN ben.id END)::int` +
          ` AS ${prefixe}_${valeurBdd}_count`
        )
      })
      .join(',\n')
  )
}

function selectionSommesPonderees(entrees: ReadonlyArray<Readonly<{ alias: string; predicat: string }>>): Prisma.Sql {
  return Prisma.raw(
    entrees
      .map(
        ({ alias, predicat }) =>
          `COALESCE(SUM(CASE WHEN ${predicat} THEN act.accompagnements_count ELSE 0 END), 0)::int AS ${alias}`
      )
      .join(',\n')
  )
}

function repartir(
  referentiel: ReadonlyArray<EntreeReferentiel>,
  comptages: LigneComptages,
  prefixe: string
): ReadonlyArray<Readonly<{ count: number; label: string; proportion: number; value: string }>> {
  const items = referentiel.map(({ cle, label, valeurBdd }) => ({
    count: comptages[`${prefixe}_${valeurBdd}_count`] ?? 0,
    label,
    value: cle,
  }))
  const proportions = allouerPourcentages(items.map(({ count }) => count))

  return items.map((item, index) => ({ ...item, proportion: proportions[index] }))
}

// Arrondi à 3 décimales, identique à l'API Coop (allocatePercentages).
function allouerPourcentages(valeurs: ReadonlyArray<number>): ReadonlyArray<number> {
  const total = valeurs.reduce((somme, valeur) => somme + valeur, 0)

  return valeurs.map((valeur) => (total === 0 ? 0 : Math.round(100_000 * (valeur / total)) / 1000))
}

// Dérivation de la tranche d'âge depuis l'année de naissance, identique à l'API Coop (derivedTrancheAgeSql) :
// l'année fait foi quand elle est plausible (1900..année courante), sinon la tranche stockée.
const TRANCHE_AGE_DERIVEE = `COALESCE(
  CASE
    WHEN ben.annee_naissance IS NULL
      OR ben.annee_naissance < 1900
      OR ben.annee_naissance > EXTRACT(YEAR FROM CURRENT_DATE) THEN NULL
    WHEN EXTRACT(YEAR FROM CURRENT_DATE) - ben.annee_naissance < 12 THEN 'moins_de_douze'
    WHEN EXTRACT(YEAR FROM CURRENT_DATE) - ben.annee_naissance < 18 THEN 'douze_dix_huit'
    WHEN EXTRACT(YEAR FROM CURRENT_DATE) - ben.annee_naissance < 25 THEN 'dix_huit_vingt_quatre'
    WHEN EXTRACT(YEAR FROM CURRENT_DATE) - ben.annee_naissance < 40 THEN 'vingt_cinq_trente_neuf'
    WHEN EXTRACT(YEAR FROM CURRENT_DATE) - ben.annee_naissance < 60 THEN 'quarante_cinquante_neuf'
    WHEN EXTRACT(YEAR FROM CURRENT_DATE) - ben.annee_naissance < 70 THEN 'soixante_soixante_neuf'
    ELSE 'soixante_dix_plus'
  END,
  ben.tranche_age::text)`

// Référentiels transcrits depuis le code de la Coop (valeurs, ordre et labels identiques à l'API).

const GENRES: ReadonlyArray<EntreeReferentiel> = [
  { cle: 'Masculin', label: 'Masculin', valeurBdd: 'masculin' },
  { cle: 'Feminin', label: 'Féminin', valeurBdd: 'feminin' },
  { cle: 'NonCommunique', label: 'Non communiqué', parDefaut: true, valeurBdd: 'non_communique' },
]

const STATUTS_SOCIAUX: ReadonlyArray<EntreeReferentiel> = [
  { cle: 'Retraite', label: 'Retraité', valeurBdd: 'retraite' },
  { cle: 'SansEmploi', label: 'Sans emploi', valeurBdd: 'sans_emploi' },
  { cle: 'EnEmploi', label: 'En emploi', valeurBdd: 'en_emploi' },
  { cle: 'Scolarise', label: 'Scolarisé', valeurBdd: 'scolarise' },
  { cle: 'NonCommunique', label: 'Non communiqué ou hétérogène', parDefaut: true, valeurBdd: 'non_communique' },
]

const TRANCHES_AGE: ReadonlyArray<EntreeReferentiel> = [
  { cle: 'SoixanteDixPlus', label: '70 ans et plus', valeurBdd: 'soixante_dix_plus' },
  { cle: 'SoixanteSoixanteNeuf', label: '60 - 69 ans', valeurBdd: 'soixante_soixante_neuf' },
  { cle: 'QuaranteCinquanteNeuf', label: '40 - 59 ans', valeurBdd: 'quarante_cinquante_neuf' },
  { cle: 'VingtCinqTrenteNeuf', label: '25 - 39 ans', valeurBdd: 'vingt_cinq_trente_neuf' },
  { cle: 'DixHuitVingtQuatre', label: '18 - 24 ans', valeurBdd: 'dix_huit_vingt_quatre' },
  { cle: 'DouzeDixHuit', label: '12 - 17 ans', valeurBdd: 'douze_dix_huit' },
  { cle: 'MoinsDeDouze', label: 'Moins de 12 ans', valeurBdd: 'moins_de_douze' },
  { cle: 'NonCommunique', label: 'Non communiqué', parDefaut: true, valeurBdd: 'non_communique' },
]

const TYPES_ACTIVITE: ReadonlyArray<EntreeReferentiel> = [
  { cle: 'Individuel', label: 'Accompagnement individuel', valeurBdd: 'individuel' },
  { cle: 'Collectif', label: 'Atelier collectif', valeurBdd: 'collectif' },
]

const DUREES: ReadonlyArray<Readonly<{ cle: string; label: string; max: number; min: number }>> = [
  { cle: '30', label: 'Moins de 30 min', max: 30, min: 0 },
  { cle: '60', label: '30min à 1 h', max: 60, min: 30 },
  { cle: '120', label: '1 h à 2 h', max: 120, min: 60 },
  { cle: 'more', label: '2 h et plus', max: 2_147_483_647, min: 120 },
]

const TYPES_LIEU: ReadonlyArray<EntreeReferentiel> = [
  { cle: 'LieuActivite', label: 'Lieu d’activité', valeurBdd: 'lieu_activite' },
  { cle: 'Autre', label: 'Autre lieu', valeurBdd: 'autre' },
  { cle: 'Domicile', label: 'À domicile', valeurBdd: 'domicile' },
  { cle: 'ADistance', label: 'À distance', valeurBdd: 'a_distance' },
]

const THEMATIQUES_NON_ADMINISTRATIVES: ReadonlyArray<EntreeReferentiel> = [
  { cle: 'DiagnosticNumerique', label: 'Diagnostic numérique', valeurBdd: 'diagnostic_numerique' },
  { cle: 'PrendreEnMainDuMateriel', label: 'Prendre en main du matériel', valeurBdd: 'prendre_en_main_du_materiel' },
  { cle: 'MaintenanceDeMateriel', label: 'Maintenance de matériel', valeurBdd: 'maintenance_de_materiel' },
  {
    cle: 'GereSesContenusNumeriques',
    label: 'Gérer ses contenus numériques',
    valeurBdd: 'gere_ses_contenus_numeriques',
  },
  { cle: 'NavigationSurInternet', label: 'Navigation sur internet', valeurBdd: 'navigation_sur_internet' },
  { cle: 'Email', label: 'E-mail', valeurBdd: 'email' },
  { cle: 'Bureautique', label: 'Bureautique', valeurBdd: 'bureautique' },
  { cle: 'ReseauxSociaux', label: 'Réseaux sociaux communication', valeurBdd: 'reseaux_sociaux' },
  { cle: 'Sante', label: 'Santé', valeurBdd: 'sante' },
  { cle: 'BanqueEtAchatsEnLigne', label: 'Banque et achats en ligne', valeurBdd: 'banque_et_achats_en_ligne' },
  { cle: 'Entrepreneuriat', label: 'Accompagner un professionnel', valeurBdd: 'entrepreneuriat' },
  { cle: 'InsertionProfessionnelle', label: 'Insertion professionnelle', valeurBdd: 'insertion_professionnelle' },
  { cle: 'SecuriteNumerique', label: 'Prévention en sécurité numérique', valeurBdd: 'securite_numerique' },
  { cle: 'Parentalite', label: 'Parentalité', valeurBdd: 'parentalite' },
  { cle: 'ScolariteEtNumerique', label: 'Scolarité et numérique', valeurBdd: 'scolarite_et_numerique' },
  { cle: 'CreerAvecLeNumerique', label: 'Créer avec le numérique', valeurBdd: 'creer_avec_le_numerique' },
  { cle: 'CultureNumerique', label: 'Culture numérique', valeurBdd: 'culture_numerique' },
  { cle: 'IntelligenceArtificielle', label: 'Intelligence artificielle (IA)', valeurBdd: 'intelligence_artificielle' },
  {
    cle: 'AideAuxDemarchesAdministratives',
    label: 'Aide aux démarches administratives',
    valeurBdd: 'aide_aux_demarches_administratives',
  },
]

const THEMATIQUES_ADMINISTRATIVES: ReadonlyArray<EntreeReferentiel> = [
  {
    cle: 'PapiersElectionsCitoyennete',
    label: 'Papiers - Élections - Citoyenneté',
    valeurBdd: 'papiers_elections_citoyennete',
  },
  { cle: 'FamilleScolarite', label: 'Famille - Scolarité', valeurBdd: 'famille_scolarite' },
  { cle: 'SocialSante', label: 'Social - Santé', valeurBdd: 'social_sante' },
  { cle: 'TravailFormation', label: 'Travail - Formation - Entreprise', valeurBdd: 'travail_formation' },
  { cle: 'Logement', label: 'Logement', valeurBdd: 'logement' },
  { cle: 'TransportsMobilite', label: 'Transports - Mobilité', valeurBdd: 'transports_mobilite' },
  { cle: 'ArgentImpots', label: 'Argent - Impôts', valeurBdd: 'argent_impots' },
  { cle: 'Justice', label: 'Justice', valeurBdd: 'justice' },
  { cle: 'EtrangersEurope', label: 'Étrangers - Europe', valeurBdd: 'etrangers_europe' },
  { cle: 'LoisirsSportsCulture', label: 'Loisirs - Sports - Culture', valeurBdd: 'loisirs_sports_culture' },
  { cle: 'Associations', label: 'Associations', valeurBdd: 'associations' },
]

const THEMATIQUES: ReadonlyArray<EntreeReferentiel> = [
  ...THEMATIQUES_NON_ADMINISTRATIVES,
  ...THEMATIQUES_ADMINISTRATIVES,
]

const MATERIELS: ReadonlyArray<EntreeReferentiel> = [
  { cle: 'Ordinateur', label: 'Ordinateur', valeurBdd: 'ordinateur' },
  { cle: 'Telephone', label: 'Téléphone', valeurBdd: 'telephone' },
  { cle: 'Tablette', label: 'Tablette', valeurBdd: 'tablette' },
  { cle: 'Autre', label: 'Autre', valeurBdd: 'autre' },
  { cle: 'Aucun', label: 'Pas de matériel', valeurBdd: 'aucun' },
]
