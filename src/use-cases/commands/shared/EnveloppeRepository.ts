import { Enveloppe } from '@/domain/Enveloppe'

export interface EnveloppeRepository {
  get(uidGouvernance: string): Promise<ReadonlyArray<Enveloppe>>
}