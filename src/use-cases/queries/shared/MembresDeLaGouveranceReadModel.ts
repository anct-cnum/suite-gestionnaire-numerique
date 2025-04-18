export type MembreAvecRoleDansLaGouvernance = Membre & Readonly<{ roles: ReadonlyArray<string> }>

export type Membre = Readonly<{
  nom: string
  uid: string
}>
