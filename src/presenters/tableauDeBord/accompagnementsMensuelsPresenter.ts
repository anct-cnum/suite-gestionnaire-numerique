import { formaterEnNombreFrancais } from '@/presenters/shared/number'

const MOIS = [
  ['janv.', 'janvier'],
  ['févr.', 'février'],
  ['mars', 'mars'],
  ['avr.', 'avril'],
  ['mai', 'mai'],
  ['juin', 'juin'],
  ['juil.', 'juillet'],
  ['août', 'août'],
  ['sept.', 'septembre'],
  ['oct.', 'octobre'],
  ['nov.', 'novembre'],
  ['déc.', 'décembre'],
] as const

// Le dernier mois de la série est le mois en cours, donc incomplet.
export function accompagnementsMensuelsPresenter(
  repartition: ReadonlyArray<Readonly<{ mois: string; nombre: number }>>
): ReadonlyArray<MoisAccompagnementsViewModel> {
  return repartition.map(({ mois, nombre }, index) => {
    const enCours = index === repartition.length - 1
    const { abrege, complet } = libellesDuMois(mois)
    return {
      enCours,
      libelleAxe: enCours ? [abrege, '(en cours)'] : [abrege],
      libelleComplet: enCours ? `${complet} (mois en cours, incomplet)` : complet,
      nombre,
      nombreAffiche: formaterEnNombreFrancais(nombre),
    }
  })
}

export type MoisAccompagnementsViewModel = Readonly<{
  enCours: boolean
  libelleAxe: ReadonlyArray<string>
  libelleComplet: string
  nombre: number
  nombreAffiche: string
}>

function libellesDuMois(mois: string): Readonly<{ abrege: string; complet: string }> {
  const correspondance = /^(\d{2})\/(\d{2})$/.exec(mois)
  if (correspondance === null) {
    return { abrege: mois, complet: mois }
  }
  const [abrege, complet] = MOIS[Number(correspondance[1]) - 1]
  return { abrege, complet: `${complet} 20${correspondance[2]}` }
}
