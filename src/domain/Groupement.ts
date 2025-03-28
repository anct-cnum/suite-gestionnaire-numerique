import { Uid } from './shared/Model'

export class GroupementUid extends Uid<GroupementUidState> {}

export type GroupementState = Readonly<{
  nom: string
  uid: GroupementUidState
}>

type GroupementUidState = Readonly<{ value: number }>
