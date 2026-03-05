import prisma from '../../prisma/prismaClient'
import { RoleType, UneStructureLoader, UneStructureReadModel } from '@/use-cases/queries/RecupererUneStructure'

export class PrismaUneStructureLoader implements UneStructureLoader {
  readonly #dataResource = prisma.main_structure

  async get(structureId: number): Promise<UneStructureReadModel> {
    const structureRecord = await this.#dataResource.findUniqueOrThrow({
      include: {
        adresse: true,
        contrat: {
          include: {
            personne: true,
          },
        },
        membres: {
          include: {
            BeneficiaireSubventionRecord: {
              include: {
                demandeDeSubvention: {
                  include: {
                    enveloppe: true,
                  },
                },
              },
              where: {
                demandeDeSubvention: {
                  statut: 'acceptee',
                },
              },
            },
            CoFinancementRecord: true,
            FeuilleDeRouteRecord: {
              select: {
                id: true,
                nom: true,
              },
            },
            PorteurActionRecord: true,
            relationGouvernance: {
              select: {
                departementCode: true,
                relationDepartement: {
                  select: {
                    nom: true,
                  },
                },
              },
            },
          },
          where: {
            statut: 'confirme',
          },
        },
        personne_affectations: {
          include: {
            personne: true,
          },
          where: {
            est_active: true,
          },
        },
      },
      where: {
        id: structureId,
      },
    })

    // Récupérer les informations de département et région via SQL
    const departementRegionResult = await prisma.$queryRaw<Array<{
      departement_nom: null | string
      region_nom: null | string
    }>>`
      SELECT
        admin.departement.nom as departement_nom,
        admin.region.nom as region_nom
      FROM main.structure
      LEFT JOIN main.adresse ON main.adresse.id = main.structure.adresse_id
      LEFT JOIN admin.departement ON admin.departement.code = main.adresse.departement
      LEFT JOIN admin.region ON admin.region.id = admin.departement.region_id
      WHERE main.structure.id = ${structureId}
    `

    const departementNom = departementRegionResult[0]?.departement_nom ?? ''
    const regionNom = departementRegionResult[0]?.region_nom ?? ''

    const aidantsEtMediateurs = buildAidantsEtMediateurs(structureRecord.personne_affectations)
    const contratsRattaches = buildContratsRattaches(structureRecord.contrat)
    const gouvernances = extractGouvernances(structureRecord.membres)
    const conventionsEtFinancements = await buildConventionsEtFinancements(structureId, structureRecord.membres)
    const feuillesDeRoute = extractFeuillesDeRoute(structureRecord.membres)
    const contacts = await buildContacts(structureId)

    return {
      aidantsEtMediateurs,
      contacts,
      contratsRattaches,
      conventionsEtFinancements,
      identite: {
        adresse: formatAdresse(structureRecord.adresse),
        codePostal: structureRecord.adresse?.code_postal ?? '',
        commune: structureRecord.adresse?.nom_commune ?? '',
        departement: departementNom,
        editeur: structureRecord.edited_by ?? '',
        edition: structureRecord.updated_at ?? structureRecord.created_at ?? undefined,
        nom: structureRecord.nom,
        region: regionNom,
        siret: structureRecord.siret ?? undefined,
        typologie: structureRecord.typologies.join(', '),
      },
      role: {
        feuillesDeRoute,
        gouvernances,
        membreDepuisLe: structureRecord.created_at ?? undefined,
      },
      structureId,
    }
  }
}

interface PersonneAffectation {
  personne: {
    conseiller_numerique_id: null | string
    id: number
    is_coordinateur: boolean | null
    is_mediateur: boolean | null
    nom: null | string
    prenom: null | string
  }
  source: string
}

function buildAidantsEtMediateurs(personnesAffectations: ReadonlyArray<PersonneAffectation>): {
  liste: ReadonlyArray<{
    fonction: string
    id: number
    lienFiche: string
    logos: ReadonlyArray<string>
    nom: string
    prenom: string
  }>
  totalAidant: number
  totalCoordinateur: number
  totalMediateur: number
} {
  const totalMediateur = personnesAffectations.filter(
    affectation => affectation.personne.is_mediateur === true
  ).length
  const totalCoordinateur = personnesAffectations.filter(
    affectation => affectation.personne.is_coordinateur === true
  ).length
  const totalAidant = personnesAffectations.filter(affectation =>
    affectation.source === 'aidant-connect' ||
    affectation.personne.is_coordinateur === true ||
    affectation.personne.is_mediateur === true).length

  // Dédupliquer les personnes par ID et collecter les sources par personne
  const personnesUniques = new Map<number, PersonneAffectation>()
  const sourcesParPersonne = new Map<number, Set<string>>()
  for (const affectation of personnesAffectations) {
    if (!personnesUniques.has(affectation.personne.id)) {
      personnesUniques.set(affectation.personne.id, affectation)
    }
    const sources = sourcesParPersonne.get(affectation.personne.id) ?? new Set<string>()
    sources.add(affectation.source)
    sourcesParPersonne.set(affectation.personne.id, sources)
  }

  const liste = Array.from(personnesUniques.values()).map(affectation => {
    const personne = affectation.personne
    const sources = sourcesParPersonne.get(personne.id) ?? new Set<string>()
    const fonctions: Array<string> = []
    if (personne.is_coordinateur === true) {
      fonctions.push('Coordinateur')
    }
    if (personne.is_mediateur === true) {
      fonctions.push('Médiateur numérique')
    }
    if (sources.has('aidant-connect')) {
      fonctions.push('Aidant numérique')
    }

    const logos: Array<string> = []
    if (personne.conseiller_numerique_id !== null && personne.conseiller_numerique_id !== '') {
      logos.push(`${process.env.NEXT_PUBLIC_HOST}/conum.svg`)
    }
    if (sources.has('aidant-connect')) {
      logos.push(`${process.env.NEXT_PUBLIC_HOST}/aidant-numerique.svg`)
    }
    // if (personne.is_mediateur === true) {
    //   logos.push(`${process.env.NEXT_PUBLIC_HOST}/mednum.svg`)
    // }

    return {
      fonction: fonctions.join(', '),
      id: personne.id,
      lienFiche: `/aidant/${personne.id}`,
      logos,
      nom: personne.nom ?? '',
      prenom: personne.prenom ?? '',
    }
  })

  return {
    liste,
    totalAidant,
    totalCoordinateur,
    totalMediateur,
  }
}

interface ContratRecord {
  date_debut: Date | null
  date_fin: Date | null
  date_rupture: Date | null
  personne: {
    is_coordinateur: boolean | null
    is_mediateur: boolean | null
    nom: null | string
    prenom: null | string
  }
  type: null | string
}

function buildContratsRattaches(contrats: ReadonlyArray<ContratRecord>): ReadonlyArray<{
  contrat: string
  dateDebut: Date | undefined
  dateFin: Date | undefined
  dateRupture: Date | undefined
  mediateur: string
  role: string
}> {
  return contrats.map(contrat => ({
    contrat: contrat.type ?? 'CDD',
    dateDebut: contrat.date_debut ?? undefined,
    dateFin: contrat.date_fin ?? undefined,
    dateRupture: contrat.date_rupture ?? undefined,
    mediateur: `${contrat.personne.prenom ?? ''} ${contrat.personne.nom ?? ''}`.trim(),
    role: determinerRoleContrat(contrat.personne),
  }))
}

async function buildContacts(structureId: number): Promise<ReadonlyArray<{
  email: string
  estReferentFNE: boolean
  fonction: string
  id: number
  nom: string
  prenom: string
  telephone: string
}>> {
  const contactStructures = await prisma.contact_structure.findMany({
    include: {
      contact: true,
    },
    orderBy: [
      { contact: { est_referent_fne: 'desc' } },
      { contact: { nom: 'asc' } },
      { contact: { prenom: 'asc' } },
    ],
    where: {
      structure_id: structureId,
    },
  })

  return contactStructures.map((cs) => ({
    email: cs.contact.email,
    estReferentFNE: cs.contact.est_referent_fne,
    fonction: cs.contact.fonction,
    id: cs.contact.id,
    nom: cs.contact.nom,
    prenom: cs.contact.prenom,
    telephone: cs.contact.telephone,
  }))
}

interface MembreRecord {
  BeneficiaireSubventionRecord: ReadonlyArray<{
    demandeDeSubvention: {
      enveloppe: {
        libelle: string
      }
      subventionDemandee: number
      subventionEtp: null | number
      subventionPrestation: null | number
    }
  }>
  categorieMembre: null | string
  CoFinancementRecord: ReadonlyArray<unknown>
  isCoporteur: boolean
  PorteurActionRecord: ReadonlyArray<unknown>
  relationGouvernance: {
    departementCode: string
    relationDepartement: {
      nom: null | string
    }
  }
  statut: string
}

function isValidRoleType(role: string): role is RoleType {
  const validRoles: ReadonlyArray<RoleType> = [
    'beneficiaire',
    'cofinanceur',
    'coporteur',
    'recipiendaire',
  ]
  return validRoles.includes(role as RoleType)
}

function extractGouvernances(membres: ReadonlyArray<MembreRecord>): ReadonlyArray<{
  code: string
  nom: string
  roles: Array<RoleType>
}> {
  const gouvernancesMap = new Map<string, {
    code: string
    nom: string
    roles: Set<RoleType>
  }>()

  membres.forEach(membre => {
    const code = membre.relationGouvernance.departementCode
    const nom = membre.relationGouvernance.relationDepartement.nom ?? code

    if (!gouvernancesMap.has(code)) {
      gouvernancesMap.set(code, {
        code,
        nom,
        roles: new Set(),
      })
    }

    const gouvernance = gouvernancesMap.get(code)
    if (gouvernance) {
      ajouterRolesMembre(membre, gouvernance.roles)
    }
  })

  return Array.from(gouvernancesMap.values()).map(gouvernance => ({
    code: gouvernance.code,
    nom: gouvernance.nom,
    roles: Array.from(gouvernance.roles),
  }))
}

function ajouterRolesMembre(membre: MembreRecord, roles: Set<RoleType>): void {
  // Co-porteur basé sur le flag isCoporteur
  if (membre.isCoporteur) {
    roles.add('coporteur')
  }

  // Co-financeur si présent dans CoFinancementRecord
  if (membre.CoFinancementRecord.length > 0) {
    roles.add('cofinanceur')
  }

  // Vérifier les enveloppes de subvention pour déterminer bénéficiaire/récipendaire
  ajouterRolesSubvention(membre.BeneficiaireSubventionRecord, roles)

  // Autres rôles basés sur categorieMembre (si applicable)
  if (membre.categorieMembre !== null && membre.categorieMembre !== '') {
    const roleType = membre.categorieMembre.toLowerCase()
    if (isValidRoleType(roleType)) {
      roles.add(roleType)
    }
  }
}

function ajouterRolesSubvention(
  beneficiaires: MembreRecord['BeneficiaireSubventionRecord'],
  roles: Set<RoleType>
): void {
  if (beneficiaires.length === 0) {
    return
  }

  const aEnveloppeFormation = beneficiaires.some(
    beneficiaire => beneficiaire.demandeDeSubvention.enveloppe.libelle.toLowerCase().includes('formation')
  )

  const aEnveloppeNonFormation = beneficiaires.some(
    beneficiaire => !beneficiaire.demandeDeSubvention.enveloppe.libelle.toLowerCase().includes('formation')
  )

  if (aEnveloppeFormation) {
    roles.add('recipiendaire')
  }
  if (aEnveloppeNonFormation) {
    roles.add('beneficiaire')
  }
}

function determinerRoleContrat(personne: { is_coordinateur: boolean | null; is_mediateur: boolean | null }): string {
  if (personne.is_coordinateur === true) {
    return 'Coordinateur'
  }
  if (personne.is_mediateur === true) {
    return 'Médiateur'
  }
  return 'Aidant'
}

function formatAdresse(adresse: {
  code_postal: string
  nom_commune: string
  nom_voie: null | string
  numero_voie: null | number
  repetition: null | string
} | null): string {
  if (adresse === null) {
    return ''
  }

  const parts: Array<string> = []
  if (adresse.numero_voie !== null && adresse.numero_voie !== 0) {
    parts.push(String(adresse.numero_voie))
  }
  if (adresse.repetition !== null && adresse.repetition !== '') {
    parts.push(adresse.repetition)
  }
  if (adresse.nom_voie !== null && adresse.nom_voie !== '') {
    parts.push(adresse.nom_voie)
  }

  const rue = parts.join(' ')
  return `${rue}, ${adresse.code_postal} ${adresse.nom_commune}`.trim()
}

function determinerEnveloppeEtLibelle(sourceFinancement: null | string): {
  enveloppeLibelle: null | string
  sourceLibelle: string
} {
  if (sourceFinancement === 'DGCL') {
    return {
      enveloppeLibelle: 'Conseiller Numérique - Plan France Relance - État',
      sourceLibelle: 'DGCL',
    }
  }
  if (sourceFinancement === 'DITP' || sourceFinancement === 'DGE') {
    return {
      enveloppeLibelle: 'Conseiller Numérique - Renouvellement - État',
      sourceLibelle: sourceFinancement,
    }
  }
  if (sourceFinancement === 'ETAT') {
    return {
      enveloppeLibelle: null,
      sourceLibelle: 'Conseiller Numérique - État',
    }
  }
  return {
    enveloppeLibelle: null,
    sourceLibelle: sourceFinancement ?? 'Convention',
  }
}

function accumulerMontantEnveloppe(
  enveloppesMap: Map<string, number>,
  enveloppeLibelle: null | string,
  montant: number
): void {
  if (enveloppeLibelle !== null) {
    const currentMontant = enveloppesMap.get(enveloppeLibelle) ?? 0
    enveloppesMap.set(enveloppeLibelle, currentMontant + montant)
  }
}

async function buildConventionsEtFinancements(
  structureId: number,
  membres: ReadonlyArray<MembreRecord>
): Promise<{
    conventions: ReadonlyArray<{
      dateDebut: Date
      dateFin: Date
      id: string
      libelle: string
      montantBonification: number
      montantSubvention: number
      montantTotal: number
    }>
    creditsEngagesParLEtat: number
    enveloppes: ReadonlyArray<{
      libelle: string
      montant: number
    }>
    lienConventions: string
  }> {
  const enveloppesMap = new Map<string, number>()
  let totalCredits = 0

  // Récupérer les conventions Conseiller Numérique via la vue
  const conventionsCoNum = await buildConventionsConseillerNumerique(structureId, enveloppesMap)
  totalCredits += conventionsCoNum.reduce((sum, conv) => sum + conv.montantTotal, 0)

  // Traiter les demandes de subvention (min.demande_de_subvention)
  for (const membre of membres) {
    for (const beneficiaire of membre.BeneficiaireSubventionRecord) {
      const demande = beneficiaire.demandeDeSubvention
      const enveloppeLibelle = demande.enveloppe.libelle
      const montantSubvention = demande.subventionDemandee

      totalCredits += montantSubvention
      accumulerMontantEnveloppe(enveloppesMap, enveloppeLibelle, montantSubvention)
    }
  }

  const enveloppes = Array.from(enveloppesMap.entries()).map(([libelle, montant]) => ({
    libelle,
    montant,
  }))

  return {
    conventions: conventionsCoNum,
    creditsEngagesParLEtat: totalCredits,
    enveloppes,
    lienConventions: '#',
  }
}

async function buildConventionsConseillerNumerique(
  structureId: number,
  enveloppesMap: Map<string, number>
): Promise<Array<{
    dateDebut: Date
    dateFin: Date
    id: string
    libelle: string
    montantBonification: number
    montantSubvention: number
    montantTotal: number
  }>> {
  // Utiliser la vue postes_conseiller_numerique_synthese pour récupérer les données
  const postesConumResult = await prisma.$queryRaw<Array<PosteConumVueResult>>`
    SELECT
      v.poste_conum_id,
      v.enveloppes,
      v.date_fin_convention,
      v.subvention_v1,
      v.bonification_v1,
      v.subvention_v2,
      v.bonification_v2
    FROM min.postes_conseiller_numerique_synthese v
    WHERE v.structure_id = ${structureId}
  `

  // Récupérer toutes les dates en une seule fois pour éviter les await dans la boucle
  const postesIds = postesConumResult.map(poste => poste.poste_conum_id)
  const datesSubventions = await recupererDatesSubventions(postesIds)

  // Cumuler par enveloppe au niveau de la structure
  const { cumulV1, cumulV2 } = cumulerSubventionsParEnveloppe(postesConumResult, datesSubventions)

  // Créer les conventions cumulées
  return creerConventionsCumulees(structureId, cumulV1, cumulV2, enveloppesMap)
}

function cumulerSubventionsParEnveloppe(
  postesConumResult: ReadonlyArray<PosteConumVueResult>,
  datesSubventions: Map<number, { v1: DatesConvention | null; v2: DatesConvention | null }>
): {
    cumulV1: CumulEnveloppe
    cumulV2: { source: null | string } & CumulEnveloppe
  } {
  const cumulV1: CumulEnveloppe = {
    dateDebut: null,
    dateFin: null,
    montantBonification: 0,
    montantSubvention: 0,
  }

  const cumulV2: { source: null | string } & CumulEnveloppe = {
    dateDebut: null,
    dateFin: null,
    montantBonification: 0,
    montantSubvention: 0,
    source: null,
  }

  for (const posteVue of postesConumResult) {
    const enveloppesPresentes = (posteVue.enveloppes ?? '').split(', ').filter(Boolean)
    const datesPoste = datesSubventions.get(posteVue.poste_conum_id)

    if (datesPoste !== undefined) {
      if (enveloppesPresentes.includes('V1')) {
        cumulerEnveloppe(
          cumulV1,
          posteVue.subvention_v1,
          posteVue.bonification_v1,
          datesPoste.v1,
          posteVue.date_fin_convention
        )
      }

      if (enveloppesPresentes.includes('V2')) {
        cumulerEnveloppe(
          cumulV2,
          posteVue.subvention_v2,
          posteVue.bonification_v2,
          datesPoste.v2,
          posteVue.date_fin_convention
        )
        if (cumulV2.source === null && datesPoste.v2?.source !== undefined) {
          cumulV2.source = datesPoste.v2.source
        }
      }
    }
  }

  return { cumulV1, cumulV2 }
}

function cumulerEnveloppe(
  cumul: CumulEnveloppe,
  subvention: bigint,
  bonification: bigint,
  dates: DatesConvention | null,
  dateFallback: Date | null
): void {
  cumul.montantSubvention += Number(subvention)
  cumul.montantBonification += Number(bonification)

  const dateDebut = dates?.dateDebut
  const dateFin = dates?.dateFin ?? dateFallback

  if (dateDebut !== null && dateDebut !== undefined) {
    if (cumul.dateDebut === null || dateDebut < cumul.dateDebut) {
      cumul.dateDebut = dateDebut
    }
  }

  if (dateFin !== null) {
    if (cumul.dateFin === null || dateFin > cumul.dateFin) {
      cumul.dateFin = dateFin
    }
  }
}

function creerConventionsCumulees(
  structureId: number,
  cumulV1: CumulEnveloppe,
  cumulV2: { source: null | string } & CumulEnveloppe,
  enveloppesMap: Map<string, number>
): Array<{
    dateDebut: Date
    dateFin: Date
    id: string
    libelle: string
    montantBonification: number
    montantSubvention: number
    montantTotal: number
  }> {
  const conventions: Array<{
    dateDebut: Date
    dateFin: Date
    id: string
    libelle: string
    montantBonification: number
    montantSubvention: number
    montantTotal: number
  }> = []

  // Convention V1 (Initial)
  const conventionV1 = creerConventionSiValide(
    structureId,
    'V1',
    'DGCL',
    cumulV1,
    enveloppesMap
  )
  if (conventionV1 !== null) {
    conventions.push(conventionV1)
  }

  // Convention V2 (Renouvellement)
  const sourceV2 = cumulV2.source ?? 'DGE'
  const conventionV2 = creerConventionSiValide(
    structureId,
    'V2',
    sourceV2,
    cumulV2,
    enveloppesMap
  )
  if (conventionV2 !== null) {
    conventions.push(conventionV2)
  }

  return conventions
}

function creerConventionSiValide(
  structureId: number,
  enveloppe: 'V1' | 'V2',
  libelle: string,
  cumul: CumulEnveloppe,
  enveloppesMap: Map<string, number>
): {
  dateDebut: Date
  dateFin: Date
  id: string
  libelle: string
  montantBonification: number
  montantSubvention: number
  montantTotal: number
} | null {
  const montantTotal = cumul.montantSubvention + cumul.montantBonification

  if (montantTotal === 0 || cumul.dateDebut === null || cumul.dateFin === null) {
    return null
  }

  const { enveloppeLibelle } = determinerEnveloppeEtLibelle(libelle)
  accumulerMontantEnveloppe(enveloppesMap, enveloppeLibelle, montantTotal)

  return {
    dateDebut: cumul.dateDebut,
    dateFin: cumul.dateFin,
    id: `${structureId}-${enveloppe}`,
    libelle,
    montantBonification: cumul.montantBonification,
    montantSubvention: cumul.montantSubvention,
    montantTotal,
  }
}

interface CumulEnveloppe {
  dateDebut: Date | null
  dateFin: Date | null
  montantBonification: number
  montantSubvention: number
}

async function recupererDatesSubventions(postesIds: ReadonlyArray<number>): Promise<Map<number, {
  v1: DatesConvention | null
  v2: DatesConvention | null
}>> {
  if (postesIds.length === 0) {
    return new Map()
  }

  const datesResult = await prisma.$queryRaw<Array<{
    date_debut_dgcl: Date | null
    date_debut_dge: Date | null
    date_debut_ditp: Date | null
    date_fin_dgcl: Date | null
    date_fin_dge: Date | null
    date_fin_ditp: Date | null
    poste_id: number
  }>>`
    SELECT
      s.poste_id,
      s.date_debut_convention_dgcl as date_debut_dgcl,
      s.date_fin_convention_dgcl as date_fin_dgcl,
      s.date_debut_convention_ditp as date_debut_ditp,
      s.date_fin_convention_ditp as date_fin_ditp,
      s.date_debut_convention_dge as date_debut_dge,
      s.date_fin_convention_dge as date_fin_dge
    FROM main.subvention s
    WHERE s.poste_id = ANY(${postesIds})
  `

  const datesMap = new Map<number, {
    v1: DatesConvention | null
    v2: DatesConvention | null
  }>()

  // Initialiser tous les postes
  for (const posteId of postesIds) {
    datesMap.set(posteId, { v1: null, v2: null })
  }

  // Remplir avec les données récupérées
  for (const date of datesResult) {
    const posteDates = datesMap.get(date.poste_id)
    if (posteDates !== undefined) {
      // V1 : DGCL
      if (date.date_debut_dgcl !== null || date.date_fin_dgcl !== null) {
        posteDates.v1 = {
          dateDebut: date.date_debut_dgcl,
          dateFin: date.date_fin_dgcl,
          source: 'DGCL',
        }
      }
      // V2 : DITP ou DGE (prendre DITP en priorité, sinon DGE)
      if (date.date_debut_ditp !== null || date.date_fin_ditp !== null) {
        posteDates.v2 = {
          dateDebut: date.date_debut_ditp,
          dateFin: date.date_fin_ditp,
          source: 'DITP',
        }
      } else if (date.date_debut_dge !== null || date.date_fin_dge !== null) {
        posteDates.v2 = {
          dateDebut: date.date_debut_dge,
          dateFin: date.date_fin_dge,
          source: 'DGE',
        }
      }
    }
  }

  return datesMap
}

interface DatesConvention {
  dateDebut: Date | null
  dateFin: Date | null
  source: string
}

interface PosteConumVueResult {
  bonification_v1: bigint
  bonification_v2: bigint
  date_fin_convention: Date | null
  enveloppes: null | string
  poste_conum_id: number
  subvention_v1: bigint
  subvention_v2: bigint
}

interface MembreRecordWithFeuilles {
  FeuilleDeRouteRecord: ReadonlyArray<{
    id: number
    nom: string
  }>
}

function extractFeuillesDeRoute(
  membres: ReadonlyArray<MembreRecordWithFeuilles>
): ReadonlyArray<{
    libelle: string
    lien: string
  }> {
  const feuillesDeRoute: Array<{
    libelle: string
    lien: string
  }> = []

  const feuillesVues = new Set<number>()

  for (const membre of membres) {
    for (const feuille of membre.FeuilleDeRouteRecord) {
      if (!feuillesVues.has(feuille.id)) {
        feuillesVues.add(feuille.id)
        feuillesDeRoute.push({
          libelle: feuille.nom,
          lien: `/feuille-de-route/${feuille.id}`,
        })
      }
    }
  }

  return feuillesDeRoute
}
