import Image from 'next/image'
import Link from 'next/link'
import { ReactElement } from 'react'

import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'
import { StructureViewModel } from '@/presenters/structurePresenter'

export default function StructureAidantsMediateurs({ aidantsEtMediateurs }: Props): ReactElement {
  return (
    <section
      aria-labelledby="aidants"
      className="grey-border border-radius fr-mb-2w fr-p-4w"
      id="aidants"
    >
      <header className="separator fr-mb-3w">
        <div className="fr-grid-row space-between">
          <div>
            <h2
              className="fr-h6 fr-m-0"
              id="aidantsEtMediateurs"
            >
              Aidants et médiateurs
            </h2>
            <p className="fr-text--sm color-grey">
              Ressources humaines dédiées à l&apos;inclusion numérique portées par la structure.
            </p>
          </div>
          <div>
            <Link
              className="fr-btn fr-btn--secondary fr-btn--icon-right fr-icon-arrow-right-line"
              href="/aidants-mediateurs"
            >
              Gérer les aidants et médiateurs
            </Link>
          </div>
        </div>
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-4 fr-col-sm-6">
            <div className="fr-grid-row background-blue-france fr-p-3w fr-mb-4w">
              <div className="fr-h1 fr-m-0">
                <TitleIcon
                  background="white"
                  icon="user-star-line"
                />
              </div>
              <div>
                <p className="fr-m-0">
                  <span className="fr-h6 font-weight-700 fr-m-0 color-blue-france">
                    {aidantsEtMediateurs.totalCoordinateur}
                    {' '}
                  </span>
                  <br />
                  <span className="font-weight-500 color-blue-france">
                    Coordinateur
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="fr-col-12 fr-col-md-4 fr-col-sm-6">
            <div className="fr-grid-row background-blue-france fr-p-3w fr-mb-4w">
              <div className="fr-h1 fr-m-0">
                <TitleIcon
                  background="white"
                  icon="account-pin-circle-line"
                />
              </div>
              <div>
                <p className="fr-m-0">
                  <span className="fr-h6 font-weight-700 fr-m-0 color-blue-france">
                    {aidantsEtMediateurs.totalMediateur}
                    {' '}
                  </span>
                  <br />
                  <span className="font-weight-500 color-blue-france">
                    Médiateurs numériques
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="fr-col-12 fr-col-md-4 fr-col-sm-6">
            <div className="fr-grid-row background-blue-france fr-p-3w fr-mb-4w">
              <div className="fr-h1 fr-m-0">
                <TitleIcon
                  background="white"
                  icon="team-line"
                />
              </div>
              <div>
                <p className="fr-m-0">
                  <span className="fr-h6 font-weight-700 fr-m-0 color-blue-france">
                    {aidantsEtMediateurs.totalAidant}
                    {' '}
                  </span>
                  <br />
                  <span className="font-weight-500 color-blue-france">
                    Aidants numériques
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <article aria-label="Aidants et médiateurs">
        <ul>
          {
            aidantsEtMediateurs.liste.map((aidant) => (
              <li
                className="separator fr-mb-3w fr-pb-2w"
                key={aidant.id}
              >
                <Link href={aidant.lienFiche}>
                  <div className="font-weight-700">
                    <span
                      aria-hidden="true"
                      className="fr-icon-user-line color-blue-france fr-mr-1w"
                    />
                    {aidant.nom}
                    {
                      aidant.logos.map((logo) => (
                        <Image
                          alt=""
                          className="fr-ml-1w"
                          height={24}
                          key={logo}
                          src={logo}
                          width={24}
                        />
                      ))
                    }
                  </div>
                  <div className="fr-text--sm color-grey fr-m-0">
                    {aidant.fonction}
                  </div>
                </Link>
              </li>
            ))
          }
        </ul>
      </article>
    </section>
  )
}

type Props = Readonly<{
  aidantsEtMediateurs: StructureViewModel['aidantsEtMediateurs']
}>
