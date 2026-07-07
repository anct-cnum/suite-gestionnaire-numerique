import { ReactElement } from 'react'

import { LieuInclusionDetailsHeaderData } from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import Menu from '@/components/shared/Menu/Menu'
import Tag from '@/components/shared/Tag/Tag'
import { CouleurFraicheur } from '@/presenters/shared/fraicheur'

export default function LieuInclusionDetailsHeader(props: Props): ReactElement {
  const { data } = props
  const { fraicheur, nom, tags } = data

  return (
    <section aria-labelledby="entete" className="fr-pb-3w">
      <div className="fr-grid-row fr-grid-row--middle fr-mb-2w">
        <div className="fr-col">
          <h1 className="fr-h1 fr-text-label--blue-france fr-mb-0" id="entete">
            {nom}
          </h1>
        </div>
        <div className="fr-col-auto" style={{ display: 'none' }}>
          <Menu items={[]} />
        </div>
      </div>

      <div className="fr-grid-row fr-grid-row--middle">
        <div className="fr-col">
          <div className="fr-tags-group">
            {tags.map((tag) => {
              return (
                <Tag href="#" key={tag}>
                  {tag}
                </Tag>
              )
            })}
          </div>
        </div>
        {fraicheur ? (
          <div className="fr-col-auto">
            <p className="fr-text--sm fr-mb-0" style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
              <span
                style={{
                  alignItems: 'center',
                  backgroundColor: stylesFraicheur[fraicheur.couleur].fond,
                  borderRadius: '4px',
                  color: stylesFraicheur[fraicheur.couleur].texte,
                  display: 'inline-flex',
                  fontWeight: 700,
                  gap: '4px',
                  padding: '4px 8px',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    backgroundColor: stylesFraicheur[fraicheur.couleur].pastille,
                    borderRadius: '50%',
                    display: 'inline-block',
                    flexShrink: 0,
                    height: '10px',
                    width: '10px',
                  }}
                />
                {fraicheur.libelle}
              </span>
              <span className="fr-text-mention--grey">
                Mise à jour le {fraicheur.date} · Via {fraicheur.source}
              </span>
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}

const stylesFraicheur: Readonly<Record<CouleurFraicheur, Readonly<{ fond: string; pastille: string; texte: string }>>> =
  {
    blue: { fond: '#e8edff', pastille: '#0078F3', texte: '#0063cb' },
    orange: { fond: '#ffe9e6', pastille: '#D64D00', texte: '#b34000' },
    red: { fond: '#fddede', pastille: '#C9191E', texte: '#ce0500' },
    yellow: { fond: '#fceeac', pastille: '#E2CF58', texte: '#66673d' },
  }

type Props = Readonly<{
  data: LieuInclusionDetailsHeaderData
}>
