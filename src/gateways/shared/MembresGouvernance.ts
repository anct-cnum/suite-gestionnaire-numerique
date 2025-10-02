import { Prisma } from '@prisma/client'

export type Membre = Readonly<{
  contactReferent: Readonly<{
    email: string
    fonction: string
    nom: string
    prenom: string
  }>
  contactTechnique: null | Readonly<{
    email: string
    fonction: string
    nom: string
    prenom: string
  }>
  id: string
  nom: string
  roles: ReadonlyArray<Role>
  statut: string
  structureId?: number
  type: string
}>

type Role = 'beneficiaire' | 'cofinanceur' | 'coporteur' | 'observateur' | 'recipiendaire'

export const membreInclude = {
  BeneficiaireSubventionRecord: {
    include: {
      demandeDeSubvention: {
        include: {
          enveloppe: true,
        },
      },
    },
  },
  CoFinancementRecord: true,
  relationContact: true,
  relationContactTechnique: true,
}

function deduireRoles(membre: MembreRecord): ReadonlyArray<Role> {
  const roles: Array<Role> = []

  // Observateur : si statut = 'confirme'
  if (membre.statut === 'confirme') {
    roles.push('observateur')
  }

  if (membre.isCoporteur) {
    roles.push('coporteur')
  }

  // Cofinanceur : si le membre a des cofinancements
  const coFinancements = membre.CoFinancementRecord
  if (coFinancements.length > 0) {
    roles.push('cofinanceur')
  }

  const beneficiaireSubvention = membre.BeneficiaireSubventionRecord
  if (beneficiaireSubvention.length > 0) {
    // Vérifier si le membre a des demandes de subvention avec des enveloppes de formation
    const aEnveloppeFormation = beneficiaireSubvention.some(
      (beneficiaire) => beneficiaire.demandeDeSubvention.enveloppe.libelle.toLowerCase().includes('formation')
    )

    // Vérifier si le membre a des demandes de subvention avec des enveloppes non-formation
    const aEnveloppeNonFormation = beneficiaireSubvention.some(
      (beneficiaire) => !beneficiaire.demandeDeSubvention.enveloppe.libelle.toLowerCase().includes('formation')
    )

    if (aEnveloppeFormation) {
      roles.push('recipiendaire')
    }
    if (aEnveloppeNonFormation) {
      roles.push('beneficiaire')
    }
  }

  return roles
}

function determinerNomMembre(membre: MembreRecord): string {
  // Utiliser le nom stocké en base de données s'il existe
  if (membre.nom !== null) {
    return membre.nom
  }

  // Fallback : nom générique basé sur la catégorie
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const nomFallback = (() => {
    switch (membre.categorieMembre) {
      case 'commune':
        return 'Commune'
      case 'departement':
        return 'Département'
      case 'epci':
        return 'EPCI'
      case 'sgar':
        return 'SGAR'
      case 'structure':
        return 'Structure'
      default:
        return 'Membre'
    }
  })()

  return nomFallback
}

function toMembre(membre: MembreRecord): Membre {
  const roles = deduireRoles(membre)
  const nomMembre = determinerNomMembre(membre)

  const result = {
    contactReferent: membre.relationContact,
    contactTechnique: membre.relationContactTechnique,
    id: membre.id,
    nom: nomMembre,
    roles,
    statut: membre.statut,
    structureId: membre.structureId ?? undefined,
    type: membre.type ?? '',
  }

  return result
}

function toMembres(membres: ReadonlyArray<MembreRecord>): ReadonlyArray<Membre> {
  return membres.map(toMembre)
}

function isCoporteur(membre: Membre): boolean {
  return membre.roles.includes('coporteur')
}

function isPrefectureDepartementale(membre: Membre): boolean {
  return membre.type === 'Préfecture départementale'
}

type MembreRecord = Prisma.MembreRecordGetPayload<{
  include: typeof membreInclude
}>

export {
  isCoporteur,
  isPrefectureDepartementale,
  toMembre,
  toMembres
}
