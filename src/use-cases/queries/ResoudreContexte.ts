import { RoleUtilisateur, UnUtilisateurReadModel } from './shared/UnUtilisateurReadModel'

export interface ScopeLoader {
  getDepartementCodeByStructureId(structureId: number): Promise<null | string>
  getToutesAppartenancesParStructureId(structureId: number): Promise<
    ReadonlyArray<
      Readonly<{
        codeDepartement: string
        estCoporteur: boolean
      }>
    >
  >
}

export type ScopeFiltre =
  | Readonly<{ codes: ReadonlyArray<string>; type: 'departemental' }>
  | Readonly<{ id: number; type: 'structure' }>
  | Readonly<{ type: 'national' }>

export class Contexte {
  readonly isSuperAdmin: boolean
  readonly role: RoleUtilisateur
  readonly scopes: ReadonlyArray<Scope>

  constructor(role: RoleUtilisateur, scopes: ReadonlyArray<Scope>, isSuperAdmin: boolean = false) {
    this.role = role
    this.scopes = scopes
    this.isSuperAdmin = isSuperAdmin
  }

  aCesRoles(...roles: ReadonlyArray<RoleUtilisateur>): boolean {
    return roles.includes(this.role)
  }

  codeRegion(): null | string {
    const scopeRegion = this.scopes.find((scope) => scope.type === 'region')
    return scopeRegion !== undefined && 'code' in scopeRegion ? scopeRegion.code : null
  }

  codesDepartements(): ReadonlyArray<string> {
    const codes: Array<string> = []
    for (const scope of this.scopes) {
      if ((scope.type === 'coporteur' || scope.type === 'departement' || scope.type === 'membre') && 'code' in scope) {
        codes.push(scope.code)
      }
    }
    return codes
  }

  codeTerritoire(): string {
    if (this.estNational()) {
      return 'France'
    }

    const scope = this.scopes.find(
      (scope) => scope.type === 'departement' || scope.type === 'coporteur' || scope.type === 'membre'
    )

    if (scope && 'code' in scope) {
      return scope.code
    }

    return ''
  }

  estCoporteur(): boolean {
    return this.scopes.some((scope) => scope.type === 'coporteur')
  }

  estDansGouvernance(): boolean {
    return this.scopes.some((scope) => scope.type === 'coporteur' || scope.type === 'membre')
  }

  estGestionnaireStructureSansGouvernance(): boolean {
    return this.role === 'gestionnaire_structure' && !this.estDansGouvernance()
  }

  estNational(): boolean {
    return this.scopes.some((scope) => scope.type === 'france')
  }

  estSuperAdmin(): boolean {
    return this.isSuperAdmin
  }

  getScopes(niveau?: 'departemental' | 'national' | 'structure'): ReadonlyArray<Scope> {
    if (niveau === undefined) {
      return this.scopes
    }

    const typesByNiveau = {
      departemental: ['coporteur', 'departement', 'membre'],
      national: ['france'],
      structure: ['structure'],
    } as const

    return this.scopes.filter((scope) => (typesByNiveau[niveau] as ReadonlyArray<string>).includes(scope.type))
  }

  idStructure(): number {
    const scope = this.scopes.find((scope) => scope.type === 'structure')
    if (scope && 'code' in scope) {
      return parseInt(scope.code, 10)
    }
    return 0
  }

  nbGouvernances(): number {
    return this.scopes.filter(
      (scope) => scope.type === 'coporteur' || scope.type === 'departement' || scope.type === 'membre'
    ).length
  }

  peutGererGouvernance(codeDepartement: string): boolean {
    return this.scopes.some(
      (scope) =>
        scope.type === 'france' ||
        ((scope.type === 'coporteur' || scope.type === 'departement') &&
          'code' in scope &&
          scope.code === codeDepartement)
    )
  }

  peutGererStructure(structureId: number, codesDepartements: ReadonlyArray<string>): boolean {
    return this.scopes.some(
      (scope) =>
        scope.type === 'france' ||
        (scope.type === 'structure' && 'code' in scope && scope.code === String(structureId)) ||
        ((scope.type === 'coporteur' || scope.type === 'departement') &&
          'code' in scope &&
          codesDepartements.includes(scope.code))
    )
  }

  scopeFiltre(): ScopeFiltre {
    if (this.estNational()) {
      return { type: 'national' }
    }
    if (this.estGestionnaireStructureSansGouvernance()) {
      return { id: this.idStructure(), type: 'structure' }
    }
    return { codes: this.codesDepartements(), type: 'departemental' }
  }
}

export async function resoudreContexte(
  utilisateur: UnUtilisateurReadModel,
  scopeLoader: ScopeLoader
): Promise<Contexte> {
  const scopes = await construireScopes(utilisateur, scopeLoader)
  return new Contexte(utilisateur.role.type, scopes, utilisateur.isSuperAdmin)
}

export type Scope =
  | Readonly<{ code: string; type: 'coporteur' | 'departement' | 'membre' | 'region' | 'structure' }>
  | Readonly<{ type: 'france' }>

async function construireScopes(
  utilisateur: UnUtilisateurReadModel,
  scopeLoader: ScopeLoader
): Promise<ReadonlyArray<Scope>> {
  const scopes: Array<Scope> = []

  if (utilisateur.role.type === 'administrateur_dispositif') {
    scopes.push({ type: 'france' })
  }

  if (utilisateur.role.type === 'gestionnaire_region' && utilisateur.regionCode !== null) {
    scopes.push({ code: utilisateur.regionCode, type: 'region' })
  }

  if (utilisateur.role.type === 'gestionnaire_departement' && utilisateur.departementCode !== null) {
    scopes.push({ code: utilisateur.departementCode, type: 'departement' })
  }

  if (utilisateur.structureId !== null && utilisateur.role.type === 'gestionnaire_structure') {
    scopes.push({ code: String(utilisateur.structureId), type: 'structure' })
    scopes.push(...(await scopesAppartenancesGouvernance(utilisateur.structureId, scopeLoader)))
  }

  return scopes
}

async function scopesAppartenancesGouvernance(
  structureId: number,
  scopeLoader: ScopeLoader
): Promise<ReadonlyArray<Scope>> {
  const appartenances = await scopeLoader.getToutesAppartenancesParStructureId(structureId)

  return appartenances.map((appartenance) => ({
    code: appartenance.codeDepartement,
    type: appartenance.estCoporteur ? ('coporteur' as const) : ('membre' as const),
  }))
}
