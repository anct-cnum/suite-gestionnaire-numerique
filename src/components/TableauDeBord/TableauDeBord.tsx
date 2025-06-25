'use client'

import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from 'chart.js'
import Image from 'next/image'
import Link from 'next/link'
import { ReactElement, useContext } from 'react'

import EtatDesLieux from './EtatDesLieux'
import styles from './TableauDeBord.module.css'
import { clientContext } from '../shared/ClientContext'
import PageTitle from '../shared/PageTitle/PageTitle'
import { AccompagnementsRealisesViewModel } from '@/presenters/accompagnementsRealisesPresenter'
import { CommuneFragilite } from '@/presenters/indiceFragilitePresenter'
import { LieuxInclusionNumeriqueViewModel } from '@/presenters/lieuxInclusionNumeriquePresenter'
import { MediateursEtAidantsViewModel } from '@/presenters/mediateursEtAidantsPresenter'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export default function TableauDeBord({ 
  accompagnementsRealisesViewModel,
  departement,
  indicesFragilite: communesFragilite,
  lieuxInclusionViewModel,
  mediateursEtAidantsViewModel,
}: Props): ReactElement {
  const { sessionUtilisateurViewModel } = useContext(clientContext)

  ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip
  )

  return (
    <>
      <PageTitle>
        <span>
          👋 Bonjour
          {' '}
          {sessionUtilisateurViewModel.prenom}
        </span>
        <br />
        <span className="fr-text--lead color-blue-france">
          Bienvenue sur l&apos;outil de pilotage de l&apos;Inclusion Numérique ·
          {' '}
          {departement}
        </span>
      </PageTitle>
      <EtatDesLieux
        accompagnementsRealisesViewModel={accompagnementsRealisesViewModel}
        communesFragilite={communesFragilite}
        departement={departement}
        lieuxInclusionViewModel={lieuxInclusionViewModel}
        mediateursEtAidantsViewModel={mediateursEtAidantsViewModel}
      />
      <section
        aria-labelledby="sources"
        className={`background-blue-france fr-mb-4w fr-py-4w fr-px-16w ${styles.hidden}`}
      >
        <h2
          className="fr-grid-row fr-grid-row--center fr-h4 color-blue-france fr-mb-2w"
          id="sources"
        >
          Sources et données utilisées
        </h2>
        <div className="fr-grid-row fr-grid-row--center fr-mb-2w">
          <Image
            alt=""
            className="fr-mr-2w"
            height={50}
            src={`${process.env.NEXT_PUBLIC_HOST}/coop.svg`}
            width={50}
          />
          <Image
            alt=""
            className="fr-mr-2w"
            height={50}
            src={`${process.env.NEXT_PUBLIC_HOST}/carto-nationale.svg`}
            width={50}
          />
          <Image
            alt=""
            className="fr-mr-2w"
            height={50}
            src={`${process.env.NEXT_PUBLIC_HOST}/aidants-connect.svg`}
            width={50}
          />
          <Image
            alt=""
            className="fr-mr-2w"
            height={50}
            src={`${process.env.NEXT_PUBLIC_HOST}/conum.svg`}
            width={50}
          />
          <Image
            alt=""
            className="fr-mr-2w"
            height={50}
            src={`${process.env.NEXT_PUBLIC_HOST}/mednum.svg`}
            width={50}
          />
          <Image
            alt=""
            className="fr-mr-2w"
            height={50}
            src={`${process.env.NEXT_PUBLIC_HOST}/data-inclusion.svg`}
            width={50}
          />
        </div>
        <p className="fr-grid-row fr-mb-2w">
          Gravida malesuada tellus cras eu risus euismod pellentesque viverra.
          Enim facilisi vitae sem mauris quis massa vulputate nunc.
          Blandit sed aenean ullamcorper diam. In donec et in duis magna.
        </p>
        <div className="fr-grid-row fr-grid-row--center">
          <Link
            className="color-blue-france"
            href="https://inclusion-numerique.anct.gouv.fr/en-savoir-plus-sur-les-donnees"
            title="Sources et données utilisées"
          >
            En savoir plus
          </Link>
        </div>
      </section>
    </>
  )
}

type Props = Readonly<{
  accompagnementsRealisesViewModel: AccompagnementsRealisesViewModel | ErrorReadModel
  departement: string
  indicesFragilite: Array<CommuneFragilite>
  lieuxInclusionViewModel: ErrorReadModel | LieuxInclusionNumeriqueViewModel
  mediateursEtAidantsViewModel: ErrorReadModel | MediateursEtAidantsViewModel
}>
