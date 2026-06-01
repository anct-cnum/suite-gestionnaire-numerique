import {
  ComparaisonDoublonsReadModel,
  RattachementsReadModel,
  StructureDetailReadModel,
} from '@/use-cases/queries/ComparerStructuresAFusionner'

const LIBELLES_RATTACHEMENTS: ReadonlyArray<Readonly<{ cle: keyof RattachementsReadModel; label: string }>> = [
  { cle: 'utilisateursMin', label: 'Utilisateurs MIN' },
  { cle: 'membresMin', label: 'Membres MIN' },
  { cle: 'postes', label: 'Postes' },
  { cle: 'contrats', label: 'Contrats' },
  { cle: 'affectationsEmploi', label: 'Affectations emploi' },
  { cle: 'contacts', label: 'Contacts' },
  { cle: 'associationsLieux', label: "Associations à des lieux d'inclusion" },
]

export function comparaisonDoublonsPresenter(readModel: ComparaisonDoublonsReadModel): ComparaisonViewModel {
  return readModel.map(versStructureComparaison)
}

export type ComparaisonViewModel = ReadonlyArray<StructureComparaisonViewModel>

export type StructureComparaisonViewModel = Readonly<{
  adresse: string
  champs: ReadonlyArray<ChampViewModel>
  denomination: string
  denominationSirene: string
  id: number
  rattachements: ReadonlyArray<RattachementViewModel>
  rattachementsTotal: number
}>

export type ChampViewModel = Readonly<{
  label: string
  valeur: string
}>

export type RattachementViewModel = Readonly<{
  label: string
  nombre: number
}>

function versStructureComparaison(structure: StructureDetailReadModel): StructureComparaisonViewModel {
  return {
    adresse: structure.adresse ?? '—',
    champs: [
      { label: 'SIRET', valeur: structure.siret ?? '—' },
      { label: 'RIDET', valeur: structure.ridet ?? '—' },
      { label: 'RNA', valeur: structure.rna ?? '—' },
      { label: 'Dénomination SIRENE', valeur: structure.denominationSirene ?? '—' },
      { label: 'Antenne', valeur: structure.denominationAntenne ?? '—' },
      { label: 'État administratif', valeur: structure.etatAdministratif ?? '—' },
      { label: 'Code activité (APE)', valeur: structure.codeActivitePrincipale ?? '—' },
      { label: 'Commune', valeur: structure.commune ?? '—' },
    ],
    denomination: structure.denominationAntenne ?? structure.denominationSirene ?? `Structure #${structure.id}`,
    denominationSirene: structure.denominationSirene ?? '',
    id: structure.id,
    rattachements: LIBELLES_RATTACHEMENTS.map(({ cle, label }) => ({
      label,
      nombre: structure.rattachements[cle],
    })),
    rattachementsTotal: structure.rattachements.total,
  }
}
