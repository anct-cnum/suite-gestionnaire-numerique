'use client'

import { ChangeEvent, ReactElement } from 'react'

import { modifierLieuInclusionVisibiliteCartographieAction } from '@/app/api/actions/modifierLieuInclusionVisibiliteCartographieAction'
import EncartCartographie from '@/components/shared/EncartCartographie/EncartCartographie'
import { Notification } from '@/components/shared/Notification/Notification'

// Sur la fiche, la bascule de visibilité n'a pas de formulaire pour la porter : elle
// s'enregistre dès le clic. Si le serveur refuse, l'interrupteur revient à son état
// précédent, comme dans le tableau de la liste des lieux.
export default function LieuInclusionDetailsVisibiliteCartographie({
  lieuId,
  peutModifier,
  visiblePourCartographie,
}: Props): ReactElement {
  async function basculer(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const interrupteur = event.target
    const nouvelleValeur = interrupteur.checked

    const messages = await modifierLieuInclusionVisibiliteCartographieAction({
      lieuId,
      path: `/lieu/${lieuId}`,
      visiblePourCartographie: nouvelleValeur,
    })

    if (messages.includes('OK')) {
      Notification('success', { description: 'modifiée', title: 'Visibilité cartographique ' })
      return
    }

    Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    interrupteur.checked = !nouvelleValeur
  }

  return (
    <EncartCartographie
      defaultChecked={visiblePourCartographie}
      disabled={!peutModifier}
      name="visiblePourCartographie"
      onChange={(event) => {
        void basculer(event)
      }}
    />
  )
}

type Props = Readonly<{
  lieuId: string
  peutModifier: boolean
  visiblePourCartographie: boolean
}>
