import { THEMATIQUE_ADMIN_OPTIONS, THEMATIQUE_NON_ADMIN_OPTIONS, TYPES_OPTIONS } from './filtresOptions'
import { DATE_DEBUT_DISPOSITIF } from '@/shared/dispositif'

export function construireLibellesFiltres(
  args: Readonly<{
    aujourdhui: string
    communesSelectionnees: ReadonlyArray<Option>
    dateDebut: string
    dateFin: string
    departementsSelectionnes: ReadonlyArray<Option>
    lieuxSelectionnes: ReadonlyArray<Option>
    structuresEmployeusesSelectionnees: ReadonlyArray<Option>
    thematiqueAdministratives: ReadonlyArray<string>
    thematiqueNonAdministratives: ReadonlyArray<string>
    types: ReadonlyArray<string>
  }>
): ReadonlyArray<LibelleFiltre> {
  const periodeParDefaut = args.dateDebut === DATE_DEBUT_DISPOSITIF && args.dateFin === args.aujourdhui

  return [
    ...(periodeParDefaut
      ? []
      : [
          {
            categorie: 'periode' as const,
            cle: 'periode',
            libelle: `${formaterDateCourte(args.dateDebut)} - ${formaterDateCourte(args.dateFin)}`,
          },
        ]),
    ...depuisOptions('departements', args.departementsSelectionnes),
    ...depuisOptions('communes', args.communesSelectionnees),
    ...depuisOptions('structuresEmployeuses', args.structuresEmployeusesSelectionnees),
    ...depuisOptions('lieux', args.lieuxSelectionnes),
    ...depuisValeurs('types', args.types, TYPES_OPTIONS),
    ...depuisValeurs('thematiqueNonAdministratives', args.thematiqueNonAdministratives, THEMATIQUE_NON_ADMIN_OPTIONS),
    ...depuisValeurs('thematiqueAdministratives', args.thematiqueAdministratives, THEMATIQUE_ADMIN_OPTIONS),
  ]
}

export type LibelleFiltre = Readonly<{
  categorie: Categorie
  cle: string
  libelle: string
}>

type Categorie =
  | 'communes'
  | 'departements'
  | 'lieux'
  | 'periode'
  | 'structuresEmployeuses'
  | 'thematiqueAdministratives'
  | 'thematiqueNonAdministratives'
  | 'types'

type Option = Readonly<{ label: string; value: string }>

function depuisOptions(categorie: Categorie, options: ReadonlyArray<Option>): ReadonlyArray<LibelleFiltre> {
  return options.map((option) => ({
    categorie,
    cle: `${categorie}-${option.value}`,
    libelle: option.label,
  }))
}

function depuisValeurs(
  categorie: Categorie,
  valeurs: ReadonlyArray<string>,
  options: ReadonlyArray<Option>
): ReadonlyArray<LibelleFiltre> {
  return valeurs.map((valeur) => ({
    categorie,
    cle: `${categorie}-${valeur}`,
    libelle: options.find((option) => option.value === valeur)?.label ?? valeur,
  }))
}

function formaterDateCourte(dateIso: string): string {
  const [annee, mois, jour] = dateIso.split('-')
  return `${jour}.${mois}.${annee.slice(2)}`
}
