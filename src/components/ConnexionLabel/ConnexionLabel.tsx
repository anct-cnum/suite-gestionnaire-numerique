'use client'

import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { ReactElement, ReactNode } from 'react'

import styles from './ConnexionLabel.module.css'
import ProConnect from '../Connexion/ProConnect'
import ExternalLink from '../shared/ExternalLink/ExternalLink'
import PageTitle from '../shared/PageTitle/PageTitle'

export default function ConnexionLabel({ idProvider }: Props): ReactElement {
  return (
    <div className={`fr-grid-row ${styles['plein-ecran']}`}>
      <section
        aria-label="Comment demander le label conseiller numérique"
        className={`fr-col-12 fr-col-md-6 ${styles.gauche}`}
      >
        <div className={styles.contenu}>
          <Image alt="" height={179} src={`${process.env.NEXT_PUBLIC_HOST}/label-conum-illustration.svg`} width={362} />
          <h2 className="fr-h3 color-blue-france fr-mt-4w fr-mb-1w">
            Comment demander le label conseiller numérique&nbsp;?
          </h2>
          <p className="fr-text--lg color-blue-france fr-mb-4w">
            Le label s’ouvre d’abord aux structures qui{' '}
            <span className="font-weight-700">emploient ou ont employé au moins un conseiller numérique</span>.
          </p>
          <ol className={styles.etapes}>
            {etapes.map((etape, index) => (
              <li className={styles.etape} key={etape.titre}>
                <span aria-hidden="true" className={styles.puce}>
                  <svg fill="none" height="32" viewBox="0 0 28 32" width="28" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M28 24.0485V7.95152L13.9021 0L0 7.95152V24.0485L13.9021 32L28 24.0485Z"
                      fill="var(--brown-opera-925-125)"
                    />
                  </svg>
                  <span className={styles.numero}>{index + 1}</span>
                </span>
                <span>
                  <p className="fr-text--md font-weight-700 color-blue-france fr-mb-1v">{etape.titre}</p>
                  <p className="fr-text--xs fr-mb-0">{etape.description}</p>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section aria-label="Se connecter" className={`fr-col-12 fr-col-md-6 ${styles.droite}`}>
        <div className={styles['contenu-droite']}>
          <PageTitle margin="fr-mt-0">Se connecter</PageTitle>
          <p>
            Accédez à ce service grâce à ProConnect, votre identifiant unique pour accéder à plusieurs services de
            l’État.
          </p>
          <div className="fr-mb-6v">
            <button
              className={`fr-btn fr-mb-2w fr-text--lg ${styles.bouton}`}
              onClick={() => {
                void signIn(idProvider, { callbackUrl: '/' })
              }}
              title="S’identifier avec ProConnect"
              type="button"
            >
              <ProConnect />
              &nbsp;S’identifier avec&nbsp;
              <span className="font-weight-700">ProConnect</span>
            </button>
            <p className="color-blue-france">
              <ExternalLink href="https://www.proconnect.gouv.fr/" title="ProConnect">
                En savoir plus sur ProConnect
              </ExternalLink>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

type Props = Readonly<{
  idProvider: string
}>

const etapes: ReadonlyArray<Readonly<{ description: ReactNode; titre: string }>> = [
  {
    description: (
      <>
        Connexion à <span className="font-weight-700">Mon Inclusion Numérique</span>, ou création de compte avec le
        SIRET de ma structure.
      </>
    ),
    titre: 'Je me connecte',
  },
  {
    description:
      'Le formulaire est pré-rempli à partir des données déjà connues sur ma structure et mes conseillers numériques.',
    titre: 'Je vérifie les informations',
  },
  {
    description:
      'Attestation sur l’honneur couvrant les trois conditions du label : qualification, activité, gratuité.',
    titre: 'Je signe l’attestation',
  },
  {
    description:
      'Je retrouve mon statut dans mon tableau de bord. Je confirme mon activité tous les 6 mois par un simple clic dans un mail.',
    titre: 'Mon label est actif',
  },
]
