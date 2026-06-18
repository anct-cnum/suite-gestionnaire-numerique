import { ReactElement } from 'react'

import EditionNomStructure from './EditionNomStructure'
import ExternalLink from '@/components/shared/ExternalLink/ExternalLink'
import { RattachementsStructureViewModel } from '@/presenters/rattachementsStructurePresenter'
import { StructureViewModel } from '@/presenters/structurePresenter'

export default function StructureIdentite({
  editionActive,
  identite,
  rattachements,
  structureId,
}: Props): ReactElement {
  return (
    <section aria-labelledby="identite" className="grey-border border-radius fr-mb-2w fr-p-4w">
      <header className="separator fr-mb-6w">
        <h2 className="fr-h6" id="identite" style={{ scrollMarginTop: '56px' }}>
          Identité
        </h2>
      </header>
      <article aria-label="Identité" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div aria-label="Identité" role="list" style={{ margin: 0 }}>
          <div className="color-grey">Raison sociale</div>
          {editionActive ? (
            <EditionNomStructure
              adresse={identite.adresse}
              denominationAntenne={identite.denominationAntenne}
              nom={identite.nom}
              rattachements={rattachements}
              structureId={structureId}
            />
          ) : (
            <div className="font-weight-500">{identite.nom}</div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <div role="list" style={{ flex: '1 0 0', margin: 0 }}>
            <div className="color-grey">Numéro de SIRET</div>
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
          <div role="list" style={{ flex: '1 0 0', margin: 0 }}>
            <div className="color-grey">Adresse de l&apos;établissement</div>
            <div className="font-weight-500">{identite.adresse}</div>
          </div>
          <div role="list" style={{ flex: '1 0 0', margin: 0 }}>
            <div className="color-grey">Typologie</div>
            <div className="font-weight-500">{identite.typologie}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <div role="list" style={{ flex: '1 0 0', margin: 0 }}>
            <div className="color-grey">Région</div>
            <div className="font-weight-500">{identite.region}</div>
          </div>
          <div role="list" style={{ flex: '1 0 0', margin: 0 }}>
            <div className="color-grey">Département</div>
            <div className="font-weight-500">{identite.departement}</div>
          </div>
          <div style={{ flex: '1 0 0' }} />
        </div>
      </article>
      <div className="fr-notice fr-notice--info border-radius fr-mt-3w">
        <div className="fr-notice__body fr-px-3w">
          <p className="fr-notice__title fr-text--sm fr-text--regular">
            <span className="fr-text-default--grey">
              Les informations d’identité de la structure sont récupérées via l’Annuaire des entreprises et ne sont pas
              éditables
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}

type Props = Readonly<{
  editionActive: boolean
  identite: StructureViewModel['identite']
  rattachements: RattachementsStructureViewModel
  structureId: number
}>
