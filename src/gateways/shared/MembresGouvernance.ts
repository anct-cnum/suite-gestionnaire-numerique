import { Prisma } from '@prisma/client'

export type Membre = Readonly<{
  contacts: ReadonlyArray<ContactMembre>
  id: string
  nom: string
  nombreContacts: number
  roles: ReadonlyArray<Role>
  statut: string
  structureId: number
  type: string
}>

type ContactMembre = Readonly<{
  email: string
  estReferentFNE: boolean
  fonction: string
  nom: string
  prenom: string
  telephone: string
}>

type Role = 'beneficiaire' | 'cofinanceur' | 'coporteur' | 'recipiendaire'

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
  relationStructure: {
    include: {
      contact_structures: {
        include: {
          contact: true,
        },
      },
    },
  },
}

function deduireRoles(membre: MembreRecord): ReadonlyArray<Role> {
  const roles: Array<Role> = []

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
    const aEnveloppeFormation = beneficiaireSubvention.some((beneficiaire) =>
      beneficiaire.demandeDeSubvention.enveloppe.libelle.toLowerCase().includes('formation')
    )

    // Vérifier si le membre a des demandes de subvention avec des enveloppes non-formation
    const aEnveloppeNonFormation = beneficiaireSubvention.some(
      (beneficiaire) =>
        !beneficiaire.demandeDeSubvention.enveloppe.libelle.toLowerCase().includes('formation')
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
  return membre.relationStructure.nom
}

function toMembre(membre: MembreRecord): Membre {
  const roles = deduireRoles(membre)
  const nomMembre = determinerNomMembre(membre)

  const contacts = membre.relationStructure.contact_structures.map((cs) => ({
    email: cs.contact.email,
    estReferentFNE: cs.contact.est_referent_fne,
    fonction: cs.contact.fonction,
    nom: cs.contact.nom,
    prenom: cs.contact.prenom,
    telephone: cs.contact.telephone,
  }))

  const result = {
    contacts,
    id: membre.id,
    nom: nomMembre,
    nombreContacts: contacts.length,
    roles,
    statut: membre.statut,
    structureId: membre.structureId,
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

export { isCoporteur, isPrefectureDepartementale, toMembre, toMembres }
