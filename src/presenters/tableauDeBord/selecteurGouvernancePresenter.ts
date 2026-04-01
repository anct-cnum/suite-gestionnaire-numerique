import departements from '../../../ressources/departements.json'

export type OptionGouvernance = Readonly<{
  label: string
  value: string
}>

export function gouvernancesOptions(
  codesDepartements: ReadonlyArray<string>
): ReadonlyArray<OptionGouvernance> {
  return codesDepartements.map((code) => {
    const departement = departements.find((dep) => dep.code === code)
    return {
      label: departement ? `(${code}) ${departement.nom}` : `(${code})`,
      value: code,
    }
  })
}
