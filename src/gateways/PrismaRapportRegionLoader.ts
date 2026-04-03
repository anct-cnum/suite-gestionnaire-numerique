import { reportLoaderError } from './shared/sentryErrorReporter'
import prisma from '../../prisma/prismaClient'

export type AidantsDepartement = Readonly<{
  code: string
  dontConseillers: number
  nbHabilites: number
  nom: string
}>

export type ConseillersDepartement = Readonly<{
  code: string
  nbBeneficiaires: number
  nbConseillers: number
  nom: string
}>

export type RapportRegionReadModel = Readonly<{
  aidantsConnect: Readonly<{
    departements: ReadonlyArray<AidantsDepartement>
    totalDontConseillers: number
    totalHabilites: number
  }>
  conseillersNumeriques: Readonly<{
    departements: ReadonlyArray<ConseillersDepartement>
    total: number
  }>
  franceNumerique: Readonly<{
    departements: ReadonlyArray<FneDepartement>
  }>
  region: Readonly<{ code: string; nom: string }>
}>

export class PrismaRapportRegionLoader {
  async get(codeRegion: string): Promise<null | RapportRegionReadModel> {
    try {
      const regionRows = await prisma.$queryRaw<Array<RegionRow>>`
        SELECT r.nom
        FROM min.region r
        WHERE r.code = ${codeRegion}
      `

      if (regionRows.length === 0) {
        return null
      }

      const [conseillers, beneficiaires, aidants, fneRows, membresRows] = await Promise.all([
        this.#queryConseillers(codeRegion),
        this.#queryBeneficiaires(codeRegion),
        this.#queryAidants(codeRegion),
        this.#queryFne(codeRegion),
        this.#queryMembresGouvernance(codeRegion),
      ])

      const conseillersNumeriques = this.#buildConseillers(conseillers, beneficiaires)
      const aidantsConnect = this.#buildAidants(aidants)
      const franceNumerique = this.#buildFne(fneRows, membresRows)

      return {
        aidantsConnect,
        conseillersNumeriques,
        franceNumerique,
        region: { code: codeRegion, nom: regionRows[0].nom },
      }
    } catch (error) {
      console.error('[PrismaRapportRegionLoader]', error)
      reportLoaderError(error, 'PrismaRapportRegionLoader', {
        codeRegion,
        operation: 'get',
      })
      return null
    }
  }

  #accumulerFneRow(departementsMap: Map<string, DepartementAccumulator>, row: FneRow): void {
    let dep = departementsMap.get(row.departement_code)
    if (!dep) {
      dep = {
        code: row.departement_code,
        feuillesDeRouteMap: new Map(),
        nom: row.departement_nom,
      }
      departementsMap.set(row.departement_code, dep)
    }

    let fdr = dep.feuillesDeRouteMap.get(row.fdr_id)
    if (!fdr) {
      fdr = {
        enveloppesMap: new Map(),
        nom: row.fdr_nom,
        porteur: {
          nom: row.porteur_nom ?? 'Non renseigné',
          type: row.porteur_type ?? 'Non renseigné',
        },
      }
      dep.feuillesDeRouteMap.set(row.fdr_id, fdr)
    }

    let env = fdr.enveloppesMap.get(row.enveloppe_libelle)
    if (!env) {
      env = {
        beneficiaires: new Set(),
        besoins: new Set(),
        montant: 0,
        type: row.enveloppe_libelle,
      }
      fdr.enveloppesMap.set(row.enveloppe_libelle, env)
    }

    env.montant += row.subvention_demandee

    if (row.beneficiaires !== null) {
      for (const nom of row.beneficiaires) {
        env.beneficiaires.add(nom)
      }
    }

    if (row.besoins !== null) {
      for (const besoin of row.besoins) {
        env.besoins.add(besoin)
      }
    }
  }

  #buildAidants(rows: Array<AidantsDepartementRow>): RapportRegionReadModel['aidantsConnect'] {
    const departements = rows.map((row) => ({
      code: row.code_departement,
      dontConseillers: Number(row.dont_conseillers),
      nbHabilites: Number(row.nb_habilites),
      nom: row.nom_departement,
    }))
    const totalDontConseillers = departements.reduce((sum, dep) => sum + dep.dontConseillers, 0)
    const totalHabilites = departements.reduce((sum, dep) => sum + dep.nbHabilites, 0)

    return { departements, totalDontConseillers, totalHabilites }
  }

  #buildConseillers(
    conseillerRows: Array<ConseillersDepartementRow>,
    beneficiaireRows: Array<BeneficiairesDepartementRow>
  ): RapportRegionReadModel['conseillersNumeriques'] {
    const beneficiairesParDep = new Map(
      beneficiaireRows.map((row) => [row.code_departement, Number(row.nb_beneficiaires)])
    )
    const departements = conseillerRows.map((row) => ({
      code: row.code_departement,
      nbBeneficiaires: beneficiairesParDep.get(row.code_departement) ?? 0,
      nbConseillers: Number(row.nb_conseillers),
      nom: row.nom_departement,
    }))
    const total = departements.reduce((sum, dep) => sum + dep.nbConseillers, 0)

    return { departements, total }
  }

  #buildFne(rows: Array<FneRow>, membresRows: Array<MembreGouvernanceRow>): RapportRegionReadModel['franceNumerique'] {
    const membresParDep = this.#buildGouvernanceMembres(membresRows)
    const departementsMap = new Map<string, DepartementAccumulator>()

    for (const row of rows) {
      this.#accumulerFneRow(departementsMap, row)
    }

    const departements: Array<FneDepartement> = [...departementsMap.values()]
      .sort((depA, depB) => depA.code.localeCompare(depB.code))
      .map((dep) => {
        const membresEntry = membresParDep.get(dep.code)
        return {
          code: dep.code,
          feuillesDeRoute: [...dep.feuillesDeRouteMap.values()].map((fdr) => ({
            enveloppes: [...fdr.enveloppesMap.values()].map((env) => ({
              beneficiaires: [...env.beneficiaires].sort((strA, strB) => strA.localeCompare(strB)),
              besoins: [...env.besoins].sort((strA, strB) => strA.localeCompare(strB)),
              montant: env.montant,
              type: env.type,
            })),
            nom: fdr.nom,
            porteur: fdr.porteur,
          })),
          gouvernance: {
            coporteurs: membresEntry ? [...membresEntry.coporteurs].sort((strA, strB) => strA.localeCompare(strB)) : [],
            membres: membresEntry ? [...membresEntry.membres].sort((strA, strB) => strA.localeCompare(strB)) : [],
          },
          nom: dep.nom,
        }
      })

    return { departements }
  }

  #buildGouvernanceMembres(
    membresRows: Array<MembreGouvernanceRow>
  ): Map<string, Readonly<{ coporteurs: Set<string>; membres: Set<string> }>> {
    const membresParDep = new Map<string, Readonly<{ coporteurs: Set<string>; membres: Set<string> }>>()
    for (const row of membresRows) {
      let entry = membresParDep.get(row.departement_code)
      if (!entry) {
        entry = { coporteurs: new Set(), membres: new Set() }
        membresParDep.set(row.departement_code, entry)
      }
      const nom = this.#capitaliserNom(row.structure_nom)
      if (row.is_coporteur) {
        entry.coporteurs.add(nom)
      } else {
        entry.membres.add(nom)
      }
    }
    return membresParDep
  }

  #capitaliserNom(nom: string): string {
    if (nom.length === 0) {
      return nom
    }
    return nom.charAt(0).toUpperCase() + nom.slice(1).toLowerCase()
  }

  async #queryAidants(codeRegion: string): Promise<Array<AidantsDepartementRow>> {
    return prisma.$queryRaw<Array<AidantsDepartementRow>>`
      SELECT
        d.code AS code_departement,
        d.nom AS nom_departement,
        COUNT(DISTINCT pe.id) AS nb_habilites,
        COUNT(DISTINCT pe.id) FILTER (WHERE pe.conseiller_numerique_id IS NOT NULL) AS dont_conseillers
      FROM min.personne_enrichie pe
      JOIN main.personne_affectations pa ON pa.personne_id = pe.id AND pa.est_active = true
      JOIN main.structure st ON st.id = pa.structure_id
      JOIN main.adresse a ON a.id = st.adresse_id
      JOIN min.departement d ON d.code = a.departement
      WHERE d.region_code = ${codeRegion}
        AND pe.labellisation_aidant_connect = true
      GROUP BY d.code, d.nom
      ORDER BY d.code
    `
  }

  async #queryBeneficiaires(codeRegion: string): Promise<Array<BeneficiairesDepartementRow>> {
    return prisma.$queryRaw<Array<BeneficiairesDepartementRow>>`
      SELECT
        d.code AS code_departement,
        SUM(ac.accompagnements) AS nb_beneficiaires
      FROM main.activites_coop ac
      JOIN main.structure st ON st.id = ac.structure_id
      JOIN main.adresse a ON a.id = st.adresse_id
      JOIN min.departement d ON d.code = a.departement
      WHERE d.region_code = ${codeRegion}
      GROUP BY d.code
    `
  }

  async #queryConseillers(codeRegion: string): Promise<Array<ConseillersDepartementRow>> {
    return prisma.$queryRaw<Array<ConseillersDepartementRow>>`
      SELECT
        d.code AS code_departement,
        d.nom AS nom_departement,
        COUNT(DISTINCT v.poste_conum_id) AS nb_conseillers
      FROM min.postes_conseiller_numerique_synthese v
      JOIN main.structure st ON st.id = v.structure_id
      JOIN main.adresse a ON a.id = st.adresse_id
      JOIN min.departement d ON d.code = a.departement
      WHERE d.region_code = ${codeRegion}
        AND v.etat = 'occupe'
      GROUP BY d.code, d.nom
      ORDER BY d.code
    `
  }

  async #queryFne(codeRegion: string): Promise<Array<FneRow>> {
    return prisma.$queryRaw<Array<FneRow>>`
      SELECT
        d.code AS departement_code,
        d.nom AS departement_nom,
        fdr.id AS fdr_id,
        fdr.nom AS fdr_nom,
        porteur_st.nom AS porteur_nom,
        porteur_mb.type AS porteur_type,
        ef.libelle AS enveloppe_libelle,
        CASE WHEN ds.statut = 'acceptee' THEN ds.subvention_demandee ELSE 0 END AS subvention_demandee,
        array_to_json(array_agg(DISTINCT benef_st.nom) FILTER (WHERE benef_st.nom IS NOT NULL)) AS beneficiaires,
        array_to_json(act.besoins) AS besoins
      FROM min.feuille_de_route fdr
      JOIN min.departement d ON d.code = fdr.gouvernance_departement_code
      JOIN min.action act ON act.feuille_de_route_id = fdr.id
      JOIN min.demande_de_subvention ds ON ds.action_id = act.id
      JOIN min.enveloppe_financement ef ON ef.id = ds.enveloppe_financement_id
      LEFT JOIN min.membre porteur_mb ON porteur_mb.id = fdr.porteur_id
      LEFT JOIN main.structure porteur_st ON porteur_st.id = porteur_mb.structure_id
      LEFT JOIN min.beneficiaire_subvention bs ON bs.demande_de_subvention_id = ds.id
      LEFT JOIN min.membre benef_mb ON benef_mb.id = bs.membre_id
      LEFT JOIN main.structure benef_st ON benef_st.id = benef_mb.structure_id
      WHERE d.region_code = ${codeRegion}
      GROUP BY d.code, d.nom, fdr.id, fdr.nom, porteur_st.nom, porteur_mb.type,
        ef.libelle, ds.subvention_demandee, ds.statut, act.besoins
      ORDER BY d.code, fdr.id, ef.libelle
    `
  }

  async #queryMembresGouvernance(codeRegion: string): Promise<Array<MembreGouvernanceRow>> {
    return prisma.$queryRaw<Array<MembreGouvernanceRow>>`
      SELECT
        m.gouvernance_departement_code AS departement_code,
        m.is_coporteur,
        st.nom AS structure_nom
      FROM min.membre m
      JOIN min.departement d ON d.code = m.gouvernance_departement_code
      JOIN main.structure st ON st.id = m.structure_id
      WHERE d.region_code = ${codeRegion}
        AND m.statut = 'confirme'
      ORDER BY d.code, st.nom
    `
  }
}

type AidantsDepartementRow = Readonly<{
  code_departement: string
  dont_conseillers: bigint
  nb_habilites: bigint
  nom_departement: string
}>

type BeneficiairesDepartementRow = Readonly<{
  code_departement: string
  nb_beneficiaires: bigint
}>

type ConseillersDepartementRow = Readonly<{
  code_departement: string
  nb_conseillers: bigint
  nom_departement: string
}>

type Enveloppe = Readonly<{
  beneficiaires: ReadonlyArray<string>
  besoins: ReadonlyArray<string>
  montant: number
  type: string
}>

type FeuilleDeRoute = Readonly<{
  enveloppes: ReadonlyArray<Enveloppe>
  nom: string
  porteur: Readonly<{ nom: string; type: string }>
}>

type FneDepartement = Readonly<{
  code: string
  feuillesDeRoute: ReadonlyArray<FeuilleDeRoute>
  gouvernance: Readonly<{
    coporteurs: ReadonlyArray<string>
    membres: ReadonlyArray<string>
  }>
  nom: string
}>

type FneRow = Readonly<{
  beneficiaires: null | ReadonlyArray<string>
  besoins: null | ReadonlyArray<string>
  departement_code: string
  departement_nom: string
  enveloppe_libelle: string
  fdr_id: number
  fdr_nom: string
  porteur_nom: null | string
  porteur_type: null | string
  subvention_demandee: number
}>

type MembreGouvernanceRow = Readonly<{
  departement_code: string
  is_coporteur: boolean
  structure_nom: string
}>

type RegionRow = Readonly<{
  nom: string
}>

interface DepartementAccumulator {
  code: string
  feuillesDeRouteMap: Map<number, FeuilleDeRouteAccumulator>
  nom: string
}

interface EnveloppeAccumulator {
  beneficiaires: Set<string>
  besoins: Set<string>
  montant: number
  type: string
}

interface FeuilleDeRouteAccumulator {
  enveloppesMap: Map<string, EnveloppeAccumulator>
  nom: string
  porteur: { nom: string; type: string }
}
