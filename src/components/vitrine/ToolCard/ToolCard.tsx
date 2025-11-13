import { ReactElement } from 'react'

import styles from './ToolCard.module.css'

export default function ToolCard({
  badge,
  buttonText,
  description,
  icon,
  imageAlt,
  imageBackground,
  imageSrc,
  link,
  reverse,
  title,
}: ToolCardProps): ReactElement {
  return (
    <section className="fr-py-8w">
      <div className="fr-container">
        <div
          className="fr-grid-row"
          style={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div
            className="fr-col-12 fr-col-md-5"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              order: reverse === true ? 2 : 1,
            }}
          >
            {icon !== undefined && icon !== '' && (
              <div>
                <img
                  alt={`Icône ${title}`}
                  src={icon}
                  style={{ height: '56px', width: 'auto' }}
                />
              </div>
            )}
            <h2
              className="fr-h2"
              style={{ marginBottom: 0 }}
            >
              {title}
            </h2>
            {badge !== undefined && badge !== '' && (
              <div>
                <span className={`fr-badge fr-badge--sm ${styles.badge}`}>
                  <span
                    aria-hidden="true"
                    className="fr-icon-flashlight-fill fr-icon--xs"
                  />
                  {' '}
                  {badge}
                </span>
              </div>
            )}
            <p className="fr-text--md">
              {description}
            </p>
            {link !== undefined && link !== '' && (
              <div>
                <a
                  className="fr-btn"
                  href={link}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {buttonText ?? 'En savoir plus'}
                </a>
              </div>
            )}
          </div>
          <div
            className="fr-col-12 fr-col-md-6"
            style={{
              backgroundColor: imageBackground ?? '#F5F5FE',
              borderRadius: '8px',
              order: reverse === true ? 1 : 2,
              padding: '40px',
            }}
          >
            <img
              alt={imageAlt}
              src={imageSrc}
              style={{
                border: 'none',
                display: 'block',
                height: 'auto',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

type ToolCardProps = {
  // eslint-disable-next-line react/require-default-props
  readonly badge?: string
  // eslint-disable-next-line react/require-default-props
  readonly buttonText?: string
  readonly description: string
  // eslint-disable-next-line react/require-default-props
  readonly icon?: string
  readonly imageAlt: string
  // eslint-disable-next-line react/require-default-props
  readonly imageBackground?: string
  readonly imageSrc: string
  // eslint-disable-next-line react/require-default-props
  readonly link?: string
  // eslint-disable-next-line react/require-default-props
  readonly reverse?: boolean
  readonly title: string
}
