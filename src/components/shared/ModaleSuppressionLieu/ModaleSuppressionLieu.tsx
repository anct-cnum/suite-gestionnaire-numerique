'use client'

import { ReactElement } from 'react'

import ConfirmationModal from '../Modal/ConfirmationModal'

export default function ModaleSuppressionLieu({
  adresse,
  estLieuCoop,
  id,
  isOpen,
  nom,
  onCancel,
  onConfirm,
}: Props): ReactElement {
  return (
    <ConfirmationModal
      confirmLabel="Supprimer ce lieu"
      confirmVariant="error"
      id={id}
      isOpen={isOpen}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title="Êtes-vous sûr de vouloir supprimer ce lieu ?"
    >
      <p className="fr-text--bold fr-mb-2w">
        {nom}
        <br />
        {adresse}
      </p>
      <p className="fr-text--bold fr-mb-1w">Cette suppression entraîne&nbsp;:</p>
      <ul>
        <li>
          {/* Depuis #2027 (27/10/2026) la copie du site est invalidée dès qu'un lieu change,
              avec un tick de 10 min : le délai n'est plus de 24 heures (#2226). */}
          Le retrait du lieu de la cartographie nationale, sous une dizaine de minutes&nbsp;: les usagers ne pourront
          plus le trouver.
        </li>
        {estLieuCoop ? (
          <>
            {/* Une suppression MIN est sans effet dans la Coop, qui la relève si un médiateur
                met à jour le lieu : comportement jugé légitime par la Coop (#2105). */}
            <li>Le lieu reste dans la Coop numérique, où ses médiateurs continuent de saisir leurs activités</li>
            <li>Si un médiateur met à jour ce lieu dans la Coop numérique, il réapparaîtra</li>
          </>
        ) : (
          <li>Le lieu ne sera plus disponible dans la COOP pour saisir des activités</li>
        )}
        <li>Il n&rsquo;apparaîtra plus dans la liste de mes lieux</li>
      </ul>
    </ConfirmationModal>
  )
}

type Props = Readonly<{
  adresse: string
  estLieuCoop: boolean
  id: string
  isOpen: boolean
  nom: string
  onCancel(): void
  onConfirm(): void
}>
