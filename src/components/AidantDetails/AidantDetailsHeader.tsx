import { ReactElement } from 'react'

import { AidantDetailsHeaderData } from './AidantDetails'
import Menu from '@/components/shared/Menu/Menu'
import Tag from '@/components/shared/Tag/Tag'

export default function AidantDetailsHeader(props: Props): ReactElement {
  const { data } = props
  const { modificationAuther, modificationDate, nom, prenom, tags } = data

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
            {prenom}
            {' '}
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
          <p className="fr-text--sm fr-mb-0">
            Modifiée le
            {' '}
            {modificationDate}
            {modificationAuther && modificationAuther.trim() !== '' ? (
              <>
                {' '}
                par
                {' '}
                {modificationAuther}
              </>
            ) : null}
          </p>
        </div>
      </div>
    </section>
  )
}

type Props = Readonly<{
  data: AidantDetailsHeaderData
}>
