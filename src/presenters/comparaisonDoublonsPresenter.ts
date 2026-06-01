import { libelleSource } from '@/presenters/shared/libelleSource'
import {
  ComparaisonDoublonsReadModel,
  RattachementsReadModel,
  StructureDetailReadModel,
} from '@/use-cases/queries/ComparerStructuresAFusionner'

const LIBELLES_RATTACHEMENTS: ReadonlyArray<Readonly<{ cle: keyof RattachementsReadModel; label: string }>> = [
  { cle: 'utilisateursMin', label: 'Utilisateurs MIN' },
  { cle: 'membresMin', label: 'Membres MIN' },
  { cle: 'gouvernances', label: 'Gouvernances' },
  { cle: 'feuillesDeRoute', label: 'Feuilles de route portées' },
  { cle: 'contactsMembre', label: 'Contacts membres' },
  { cle: 'postes', label: 'Postes' },
  { cle: 'contrats', label: 'Contrats' },
  { cle: 'affectationsEmploi', label: 'Affectations emploi' },
  { cle: 'contacts', label: 'Contacts référents' },
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
      {
        label: 'Antenne',
        valeur: structure.denominationAntenne === null ? 'Non' : `Oui — ${structure.denominationAntenne}`,
      },
      { label: 'Source', valeur: libelleSource(structure.source) },
      { label: 'État administratif', valeur: structure.etatAdministratif ?? '—' },
      { label: 'Code activité (APE)', valeur: structure.codeActivitePrincipale ?? '—' },
      { label: 'Commune', valeur: structure.commune ?? '—' },
      { label: 'Bénéficiaire de subvention', valeur: structure.estBeneficiaire ? 'Oui' : 'Non' },
      { label: 'Issue d’une fusion précédente', valeur: structure.dejaFusionnee ? 'Oui' : 'Non' },
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
