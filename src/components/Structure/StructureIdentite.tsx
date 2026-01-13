import { ReactElement } from 'react'

import ExternalLink from '@/components/shared/ExternalLink/ExternalLink'
import { StructureViewModel } from '@/presenters/structurePresenter'

export default function StructureIdentite({ identite }: Props): ReactElement {
  return (
    <section
      aria-labelledby="identite"
      className="grey-border border-radius fr-mb-2w fr-p-4w"
    >
      <header className="separator fr-mb-6w">
        <h2
          className="fr-h6"
          id="identite"
        >
          Identité
        </h2>
      </header>
      <article
        aria-label="Identité"
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <div
          aria-label="Identité"
          role="list"
          style={{ margin: 0 }}
        >
          <div className="color-grey">
            Raison sociale
          </div>
          <div className="font-weight-500">
            {identite.nom}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <div
            role="list"
            style={{ flex: '1 0 0', margin: 0 }}
          >
            <div className="color-grey">
              Numéro de SIRET
            </div>
            <div className="font-weight-500">
              <ExternalLink
                className="color-blue-france"
                href={`https://annuaire-entreprises.data.gouv.fr/etablissement/${identite.siret}`}
                title={`Fiche ${identite.nom}`}
              >
                {identite.siret}
              </ExternalLink>
            </div>
          </div>
          <div
            role="list"
            style={{ flex: '1 0 0', margin: 0 }}
          >
            <div className="color-grey">
              Adresse de l&apos;établissement
            </div>
            <div className="font-weight-500">
              {identite.adresse}
            </div>
          </div>
          <div
            role="list"
            style={{ flex: '1 0 0', margin: 0 }}
          >
            <div className="color-grey">
              Typologie
            </div>
            <div className="font-weight-500">
              {identite.typologie}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <div
            role="list"
            style={{ flex: '1 0 0', margin: 0 }}
          >
            <div className="color-grey">
              Région
            </div>
            <div className="font-weight-500">
              {identite.region}
            </div>
          </div>
          <div
            role="list"
            style={{ flex: '1 0 0', margin: 0 }}
          >
            <div className="color-grey">
              Département
            </div>
            <div className="font-weight-500">
              {identite.departement}
            </div>
          </div>
        </div>
      </article>
    </section>
  )
}

type Props = Readonly<{
  identite: StructureViewModel['identite']
}>
