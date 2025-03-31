import { Prisma } from '@prisma/client'

import { alphaAsc } from '@/shared/lang'

export function toMembres(membres: ReadonlyArray<MembreRecord>): ReadonlyArray<Membre> {
  return Object.values(
    membres
      .values()
      .flatMap(associationsMembreEtRoleUnique)
      .reduce(groupMembresById, {})
  )
}

export function toMembre(membre: MembreRecord): Membre {
  return associationsMembreEtRoleUnique(membre).reduce(groupMembresById, {})[membre.id]
}

export function isPrefectureDepartementale(membre: Membre): boolean {
  return membre.type === 'Préfecture départementale'
}

export function isCoporteur(membre: Membre): boolean {
  return membre.roles.includes('coporteur')
}

export const membreInclude = {
  membresGouvernanceCommune: true,
  membresGouvernanceDepartement: {
    include: {
      relationDepartement: true,
    },
  },
  membresGouvernanceEpci: true,
  membresGouvernanceSgar: {
    include: {
      relationSgar: true,
    },
  },
  membresGouvernanceStructure: true,
  relationContact: true,
}

export type Membre = MembreSansRole & Readonly<{ roles: ReadonlyArray<string> }>

function associationsMembreEtRoleUnique(membre: MembreRecord): ReadonlyArray<AssociationMembreEtRoleUnique> {
  return [
    membre.membresGouvernanceCommune.map(({ commune, role }) => ({ nom: commune, role })),
    membre.membresGouvernanceDepartement.map(({ relationDepartement, role }) => ({
      nom: relationDepartement.nom,
      role,
    })),
    membre.membresGouvernanceEpci.map(({ epci, role }) => ({ nom: epci, role })),
    membre.membresGouvernanceSgar.map(({ relationSgar, role }) => ({ nom: relationSgar.nom, role })),
    membre.membresGouvernanceStructure.map(({ role, structure }) => ({ nom: structure, role })),
  ]
    .flat()
    .map(({ nom, role }) => ({
      contactReferent: membre.relationContact,
      contactTechnique: membre.contactTechnique,
      id: membre.id,
      nom,
      role,
      statut: membre.statut,
      type: membre.type,
    }))
}

function groupMembresById(membresById: MembresById, membreUniqueRole: AssociationMembreEtRoleUnique): MembresById {
  const membre = membresById[membreUniqueRole.id] ?? { roles: [] }
  return {
    ...membresById,
    [membreUniqueRole.id]: {
      ...membre,
      contactReferent: membreUniqueRole.contactReferent,
      id: membreUniqueRole.id,
      nom: membreUniqueRole.nom,
      roles: membre.roles
        .concat(membreUniqueRole.role)
        .toSorted(alphaAsc()),
      statut: membreUniqueRole.statut,
      type: membreUniqueRole.type,
    },
  }
}

type MembreRecord = Prisma.MembreRecordGetPayload<{
  include: typeof membreInclude
}>

type AssociationMembreEtRoleUnique = MembreSansRole & Readonly<{ role: string }>

type MembreSansRole = Readonly<{
  contactReferent: {
    email: string
    fonction: string
    nom: string
    prenom: string
  }
  contactTechnique: null | string
  id: string
  nom: string
  statut: string
  type: null | string
}>

type MembresById = Readonly<Record<string, Membre>>
