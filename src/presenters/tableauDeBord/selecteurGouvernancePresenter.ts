import departements from '../../../ressources/departements.json'
import { Contexte } from '@/use-cases/queries/ResoudreContexte'

export type OptionGouvernance = Readonly<{
  label: string
  value: string
}>

export function gouvernancesSelecteurPresenteur(contexte: Contexte): ReadonlyArray<OptionGouvernance> {
  const options: Array<OptionGouvernance> = []
  if (contexte.estNational()) {
    options.push({ label: 'National', value: 'France' })
  }
  const codes = contexte.estNational() ? departements.map((dep) => dep.code) : contexte.codesDepartements()
  return [
    ...options,
    ...departements
      .filter((dep) => codes.includes(dep.code))
      .map((dep) => ({ label: `${dep.nom} - ${dep.code}`, value: dep.code })),
  ]
}
