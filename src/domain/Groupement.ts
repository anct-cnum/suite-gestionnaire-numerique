import { Uid } from './shared/Model'

export class GroupementUid extends Uid<GroupementUidState> {}

export type GroupementState = Readonly<{
  uid: GroupementUidState
  nom: string
}>

type GroupementUidState = Readonly<{ value: number }>
