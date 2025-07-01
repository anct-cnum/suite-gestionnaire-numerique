import { Prisma } from '@prisma/client'

export type Role = 'beneficiaire' | 'coporteur' | 'observateur' | 'recipiendaire'

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
  type: string
}>

export type AssociationMembreEtRoleUnique = Readonly<{
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
  role: Role
  statut: string
  type: string
}>

export const membreInclude = {
  relationContact: true,
  relationContactTechnique: true,
}

function deduireRoles(membre: MembreRecord): ReadonlyArray<Role> {
  const roles: Array<Role> = []
  
  // Observateur : si statut = 'confirme'
  if (membre.statut === 'confirme') {
    roles.push('observateur')
  }
  
  // Coporteur : si isCoporteur = true
  if (membre.isCoporteur) {
    roles.push('coporteur')
  }
  
  // TODO: Ajouter la logique pour recipiendaire/beneficiaire basée sur les subventions
  // quand les types Prisma seront correctement générés
  
  return roles
}

function associationsMembreEtRoleUnique(membre: MembreRecord): ReadonlyArray<AssociationMembreEtRoleUnique> {
  const roles = deduireRoles(membre)
  
  // Déterminer le nom du membre selon sa catégorie
  const nomMembre = determinerNomMembre(membre)
  
  return roles.map((role) => {
    if (!isRole(role)) {
      throw new Error(`Rôle invalide: ${role}`)
    }
    return {
      contactReferent: membre.relationContact,
      contactTechnique: membre.relationContactTechnique,
      id: membre.id,
      nom: nomMembre,
      role,
      statut: membre.statut,
      type: membre.type ?? '',
    }
  })
}

function determinerNomMembre(membre: MembreRecord): string {
  // Utiliser le nom stocké en base de données s'il existe
  if (membre.nom) {
    return membre.nom
  }
  
  // Fallback : nom générique basé sur la catégorie
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

function isRole(role: string): role is Role {
  return ['beneficiaire', 'coporteur', 'observateur', 'recipiendaire'].includes(role)
}

type MembreRecord = Prisma.MembreRecordGetPayload<{
  include: typeof membreInclude
}>

export {
  associationsMembreEtRoleUnique,
  isCoporteur,
  isPrefectureDepartementale,
  isRole,
  toMembre,
  toMembres
}
