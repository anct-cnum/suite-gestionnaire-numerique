import { ReactElement } from 'react'

import ExternalLink from '@/components/shared/ExternalLink/ExternalLink'
import Tag from '@/components/shared/Tag/Tag'

export default function StructureInfo({ data, sectionId, showSiretLink, titre }: Props): ReactElement {
  return (
    <section
      aria-labelledby={sectionId}
      className="grey-border border-radius fr-mb-2w fr-p-4w"
      id={sectionId}
    >
      <header className="separator fr-mb-6w">
        <h2
          className="fr-h6"
          id={sectionId}
        >
          {titre}
        </h2>
      </header>
      <article
        aria-label={titre}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <div>
          <div className="color-grey">
            Raison sociale
          </div>
          <div>
            {data.structureId === undefined ? (
              <span className="fr-tag">
                {data.nom}
              </span>
            ) : (
              <Tag href={`/structure/${data.structureId}`}>
                {data.nom}
              </Tag>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: '1 0 0' }}>
            <div className="color-grey">
              Numéro de SIRET
            </div>
            <div className="font-weight-500">
              {showSiretLink === true ? (
                <ExternalLink
                  className="color-blue-france"
                  href={`https://annuaire-entreprises.data.gouv.fr/etablissement/${data.siret}`}
                  title={`Fiche ${data.nom}`}
                >
                  {data.siret}
                </ExternalLink>
              ) : data.siret}
            </div>
          </div>
          <div style={{ flex: '1 0 0' }}>
            <div className="color-grey">
              Typologie
            </div>
            <div className="font-weight-500">
              {data.typologie}
            </div>
          </div>
        </div>

        <div>
          <div className="color-grey">
            Adresse de l&apos;établissement
          </div>
          <div className="font-weight-500">
            {data.adresse}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: '1 0 0' }}>
            <div className="color-grey">
              Région
            </div>
            <div className="font-weight-500">
              {data.region}
            </div>
          </div>
          <div style={{ flex: '1 0 0' }}>
            <div className="color-grey">
              Département
            </div>
            <div className="font-weight-500">
              {data.departement}
            </div>
          </div>
        </div>

        {data.referent === undefined ? null : (
          <StructureReferent referent={data.referent} />
        )}
      </article>
    </section>
  )
}

export type StructureInfoData = Readonly<{
  adresse: string
  departement: string
  nom: string
  referent?: ReferentData
  region: string
  siret: string
  structureId?: number
  typologie: string
}>

type ReferentData = Readonly<{
  email: string
  fonction: string
  nom: string
  telephone: string
}>

type Props = Readonly<{
  data: StructureInfoData
  sectionId: string
  showSiretLink?: boolean
  titre: string
}>

function StructureReferent({ referent }: Readonly<{ referent: ReferentData }>): ReactElement {
  return (
    <div
      className="border-radius fr-p-3w"
      style={{ backgroundColor: 'var(--background-alt-blue-france)' }}
    >
      <div
        className="fr-text--xs font-weight-700 color-blue-france"
        style={{ letterSpacing: '0', textTransform: 'uppercase' }}
      >
        Référent de la structure
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div className="font-weight-700">
          {referent.nom}
          {referent.fonction === '' ? null : (
            <>
              ,
              {' '}
              {referent.fonction}
            </>
          )}
        </div>
        <div
          className="fr-text--sm"
          style={{ alignItems: 'center', display: 'flex', gap: '8px' }}
        >
          {referent.email === '' ? null : (
            <>
              <span
                aria-hidden="true"
                className="fr-icon-mail-line fr-icon--sm"
              />
              <span>
                {referent.email}
              </span>
            </>
          )}
          {referent.email === '' || referent.telephone === '' ? null : (
            <span>
              ·
            </span>
          )}
          {referent.telephone === '' ? null : (
            <>
              <span
                aria-hidden="true"
                className="fr-icon-phone-line fr-icon--sm"
              />
              <span>
                {referent.telephone}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
