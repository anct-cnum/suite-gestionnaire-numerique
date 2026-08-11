'use client'

import { useRouter } from 'next/navigation'
import { ReactElement, useState } from 'react'

import { supprimerUnLieuInclusionAction } from '@/app/api/actions/supprimerUnLieuInclusionAction'
import ModaleSuppressionLieu from '@/components/shared/ModaleSuppressionLieu/ModaleSuppressionLieu'
import { Notification } from '@/components/shared/Notification/Notification'

export default function SupprimerLieuBouton({ adresse, lieuId, nom }: Props): ReactElement {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  async function handleConfirm(): Promise<void> {
    const messages = await supprimerUnLieuInclusionAction({
      lieuId,
      path: '/liste-lieux-inclusion',
    })
    setIsOpen(false)

    if (messages.includes('OK')) {
      Notification('success', { description: 'supprimé', title: 'Lieu ' })
      router.push('/liste-lieux-inclusion')
    } else {
      Notification('error', {
        description: (messages as ReadonlyArray<string>).join(', '),
        title: 'Erreur : ',
      })
    }
  }

  return (
    <>
      <button
        className="fr-btn fr-btn--tertiary"
        onClick={() => {
          setIsOpen(true)
        }}
        type="button"
      >
        Supprimer ce lieu
      </button>
      <ModaleSuppressionLieu
        adresse={adresse}
        id="modaleSuppressionLieuDetails"
        isOpen={isOpen}
        nom={nom}
        onCancel={() => {
          setIsOpen(false)
        }}
        onConfirm={handleConfirm}
      />
    </>
  )
}

type Props = Readonly<{
  adresse: string
  lieuId: string
  nom: string
}>
