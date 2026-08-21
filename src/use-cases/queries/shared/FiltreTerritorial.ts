export type FiltreTerritorial =
  | Readonly<{ code: string; type: 'departement' }>
  | Readonly<{ codes: ReadonlyArray<string>; type: 'departements' }>
  | Readonly<{ codesInsee: ReadonlyArray<string>; type: 'communes' }>
  | Readonly<{ type: 'national' }>

export function libelleFiltreTerritorial(filtre: FiltreTerritorial): string {
  switch (filtre.type) {
    case 'communes':
      return filtre.codesInsee.join(',')
    case 'departement':
      return filtre.code
    case 'departements':
      return filtre.codes.join(',')
    case 'national':
      return 'France'
  }
}
