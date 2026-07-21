import { randomUUID } from 'node:crypto'

import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { contexteJournalisationMin } from '@/gateways/shared/contexteJournalisationMin'

// Enveloppe une server action mutante : toutes les écritures effectuées pendant
// son exécution sont journalisées dans source.min__evenements avec un runId commun.
// La session n'est résolue qu'à la première mutation réellement journalisée.
export async function avecJournalisationMin<Retour>(fn: () => Promise<Retour>): Promise<Retour> {
  return contexteJournalisationMin.run(
    {
      actorId: undefined,
      bufferTransaction: null,
      async resoudreSub() {
        return (await getSession())?.user.sub
      },
      runId: randomUUID(),
    },
    fn
  )
}
