import { Uid } from './shared/Model'

export type StructureState = Readonly<{
  nom: string
  uid: StructureUidState
}>

export class StructureUid extends Uid<StructureUidState> {}

type StructureUidState = Readonly<{ value: number }>

/*
 * A décommenter quand ça sera utile
 * const Types = [
 * 'COLLECTIVITE',
 * 'COMMUNE',
 * 'DEPARTEMENT',
 * 'EPCI',
 * 'GIP',
 * 'PRIVATE',
 * 'REGION',
 * ] as const
 *
 * export type TypologieType = (typeof Types)[number]
 *
 * const Statuts = [
 * 'ABANDON',
 * 'ANNULEE',
 * 'CREEE',
 * 'DOUBLON',
 * 'EXAMEN_COMPLEMENTAIRE_COSELEC',
 * 'REFUS_COORDINATEUR',
 * 'REFUS_COSELEC',
 * 'VALIDATION_COSELEC',
 * ] as const
 *
 * export type TypologieStatut = (typeof Statuts)[number]
 */
