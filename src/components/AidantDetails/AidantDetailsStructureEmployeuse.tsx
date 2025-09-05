import { ReactElement } from 'react'

import { StructureEmployeuseData } from './AidantDetails'
import AidantDetailsStructureReferente from './AidantDetailsStructureReferente'

export default function AidantDetailsStructureEmployeuse(props: Props): ReactElement {
  const { data, onEdit } = props
  const {
    adresse,
    departement,
    nom: nomStructure,
    referent,
    region,
    siret,
    type: typeStructure,
  } = data

  return (
    <section className="fr-mb-4w grey-border border-radius fr-p-4w">
      <div className="fr-grid-row fr-grid-row--middle fr-mb-1w">
        <div className="fr-col">
          <h2 className="fr-h3 fr-m-0">
            Structure employeuse
          </h2>
          <p className="fr-text--sm fr-text-mention--grey fr-mt-1v">
            Structure qui porte le contrat de travail du médiateur
          </p>
        </div>
        <div
          className="fr-col-auto"
          style={{ display: 'none' }}
        >
          <button
            className="fr-btn fr-btn--tertiary-no-outline fr-icon-pencil-line fr-btn--icon-left"
            onClick={onEdit}
            type="button"
          >
            Modifier
          </button>
        </div>
      </div>
      <hr className="fr-hr " />

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
        <div className="fr-col-12 fr-col-md-6">
          <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
            Raison sociale
          </p>
          <div className="fr-tags-group">
            <button
              className="fr-tag"
              style={{ cursor: 'default' }}
              type="button"
            >
              {nomStructure}
            </button>
          </div>
        </div>
        <div className="fr-col-12 fr-col-md-6">
          <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
            Typologie
          </p>
          <p className="fr-mb-0">
            {typeStructure}
          </p>
        </div>
      </div>

      <div className="fr-mb-3w">
        <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
          Numéro de SIRET
        </p>
        <p className="fr-mb-0">
          {siret}
        </p>
      </div>

      <div className="fr-mb-3w">
        <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
          Adresse de l&apos;établissement
        </p>
        <p className="fr-mb-0">
          {adresse}
        </p>
      </div>

      <div className="fr-grid-row fr-grid-row--gutters  fr-mb-2w">
        <div className="fr-col-12 fr-col-md-6">
          <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
            Région
          </p>
          <p className="fr-mb-0">
            {region}
          </p>
        </div>
        <div className="fr-col-12 fr-col-md-6">
          <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
            Département
          </p>
          <p>
            {departement}
          </p>
        </div>
      </div>

      <AidantDetailsStructureReferente
        email={referent.email}
        nom={referent.nom}
        post={referent.post}
        prenom={referent.prenom}
        telephone={referent.telephone}
      />
    </section>
  )
}

type Props = Readonly<{
  data: StructureEmployeuseData
  onEdit?(): void
}>

