'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChangeEvent, ReactElement } from 'react'

import styles from './EncartCartographie.module.css'
import Toggle from '@/components/shared/Toggle/Toggle'

// Encart partagé par la création d'un lieu (#1495) et par sa fiche, à l'identique dans
// les maquettes V6. Seule la bascule change de nature : champ du formulaire à la
// création, enregistrement immédiat sur la fiche — d'où `name` et `onChange` au choix.
export default function EncartCartographie({
  defaultChecked = false,
  disabled = false,
  name,
  onChange,
}: Props): ReactElement {
  return (
    <div className="fr-mb-4w grey-border border-radius">
      <div className={`fr-p-4w ${styles.bandeau}`}>
        <div className="fr-grid-row fr-grid-row--middle fr-mb-3w">
          <Image alt="" className="fr-mr-2w" height={40} src="/carto-nationale.svg" width={40} />
          <h3 className="fr-h6 fr-mb-0 fr-col fr-text-label--blue-france">
            Vous souhaitez rendre visible ce lieu sur la cartographie nationale des lieux d’inclusion numérique ?
          </h3>
        </div>
        <p className="fr-text--sm fr-mb-1w">
          <span aria-hidden="true" className="fr-icon-pencil-line fr-icon--sm fr-mr-1w fr-text-label--blue-france" />
          Renseignez des informations sur le lieu et les services d’inclusion numérique qui y sont proposés
        </p>
        <p className="fr-text--sm fr-mb-3w">
          <span aria-hidden="true" className="fr-icon-compass-3-line fr-icon--sm fr-mr-1w fr-text-label--blue-france" />
          Gagnez en visibilité et orientez les bénéficiaires grâce à la cartographie
        </p>
        <Link
          className="fr-link fr-icon-external-link-line fr-link--icon-right fr-text--sm"
          href="https://cartographie.societenumerique.gouv.fr/cartographie"
          target="_blank"
        >
          En savoir plus sur la cartographie
        </Link>
      </div>
      <div className="fr-px-4w fr-py-3w">
        <Toggle
          defaultChecked={defaultChecked}
          disabled={disabled}
          labelAGauche
          libelleEtat
          name={name}
          onChange={onChange}
        >
          Rendre mon lieu d’activité visible sur la cartographie
        </Toggle>
      </div>
    </div>
  )
}

type Props = Readonly<{
  defaultChecked?: boolean
  disabled?: boolean
  name: string
  onChange?(event: ChangeEvent<HTMLInputElement>): void
}>
