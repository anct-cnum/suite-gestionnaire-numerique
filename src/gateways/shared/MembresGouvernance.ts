import { Prisma } from '@prisma/client'

export function toMembres(membres: ReadonlyArray<MembreRecord>): ReadonlyArray<Membre> {
  return Object.values(
    membres
      .values()
      .flatMap(associationsMembreEtRoleUnique)
      .reduce(groupMembresById, {})
  )
}

export function sortMembres(leftMembre: Membre, rightMembre: Membre): number {
  return leftMembre.nom.localeCompare(rightMembre.nom)
}

export type Membre = Readonly<{
  nom: string
  roles: ReadonlyArray<string>
  type: string | null
}>

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
  ].flat().map(({ nom, role }) => ({ id: membre.id, nom, role, type: membre.type }))
}

function groupMembresById(membresById: MembresById, membreUniqueRole: AssociationMembreEtRoleUnique): MembresById {
  const membre = membresById[membreUniqueRole.id] ?? { roles: [] }
  return {
    ...membresById,
    [membreUniqueRole.id]: {
      ...membre,
      nom: membreUniqueRole.nom,
      roles: membre.roles
        .concat(membreUniqueRole.role)
        .toSorted((lRole, rRole) => lRole.localeCompare(rRole)),
      type: membreUniqueRole.type,
    },
  }
}
type MembreRecord = Prisma.MembreRecordGetPayload<{
  include: {
    membresGouvernanceCommune: true
    membresGouvernanceDepartement: {
      include: {
        relationDepartement: true
      }
    }
    membresGouvernanceEpci: true
    membresGouvernanceSgar: {
      include: {
        relationSgar: true
      }
    }
    membresGouvernanceStructure: true
  }
}>

type AssociationMembreEtRoleUnique = Readonly<{
  nom: string
  role: string
  type: string | null
  id: string
}>

type MembresById = Readonly<Record<string, Membre>>
