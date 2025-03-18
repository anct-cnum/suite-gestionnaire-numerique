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

export type Membre = Readonly<{ roles: ReadonlyArray<string> }> & MembreSansRole

function associationsMembreEtRoleUnique(membre: MembreRecord): ReadonlyArray<AssociationMembreEtRoleUnique> {
  return [
    membre.membresGouvernanceCommune.map(({ commune, role }) => ({ nom: commune, role })),
    membre.membresGouvernanceDepartement.map(({ relationDepartement, role }) => ({
      nom: relationDepartement.nom,
      role,
    })),
    membre.membresGouvernanceEpci.map(({ epci, role }) => ({ nom: epci, role })),
    membre.membresGouvernanceSgar.map(({ relationSgar, role }) => ({ nom: relationSgar.nom, role })),
    membre.membresGouvernanceStructure.map(({ structure, role }) => ({ nom: structure, role })),
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

type AssociationMembreEtRoleUnique = Readonly<{ role: string }> & MembreSansRole

type MembreSansRole = Readonly<{
  contactReferent: {
    email: string
    prenom: string
    nom: string
    fonction: string
  }
  contactTechnique: string | null
  nom: string
  type: string | null
  id: string
  statut: string
}>

type MembresById = Readonly<Record<string, Membre>>
