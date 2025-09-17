import { ReactElement } from 'react'

import { LieuInclusionDetailsHeaderData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import Menu from '@/components/shared/Menu/Menu'
import Tag from '@/components/shared/Tag/Tag'

export default function LieuInclusionDetailsHeader(props: Props): ReactElement {
  const { data } = props
  const { modificationAuteur, modificationDate, nom, tags } = data

  return (
    <section
      aria-labelledby="entete"
      className="fr-pb-3w"
    >
      <div className="fr-grid-row fr-grid-row--middle fr-mb-2w">
        <div className="fr-col">
          <h1
            className="fr-h1 fr-text-label--blue-france fr-mb-0"
            id="entete"
          >
            {nom}
          </h1>
        </div>
        <div
          className="fr-col-auto"
          style={{ display: 'none' }}
        >
          <Menu items={[]} />
        </div>
      </div>

      <div className="fr-grid-row fr-grid-row--middle">
        <div className="fr-col">
          <div className="fr-tags-group">
            { tags.map((tag) => {
              return (
                <Tag
                  href="#"
                  key={tag}
                >
                  {tag}
                </Tag>
              )
            })}
          </div>
        </div>
        <div className="fr-col-auto">
          <p
            className="fr-text--sm fr-mb-0"
            style={{ display: 'none' }}
          >
            Modifiée le
            {' '}
            {modificationDate}
            {' '}
            -
            {' '}
            {modificationAuteur}
          </p>
        </div>
      </div>
    </section>
  )
}

type Props = Readonly<{
  data: LieuInclusionDetailsHeaderData
}>
