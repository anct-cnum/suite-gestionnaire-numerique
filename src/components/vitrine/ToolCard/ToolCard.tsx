import { ReactElement } from 'react'

import styles from './ToolCard.module.css'
import Badge from '@/components/shared/Badge/Badge'

export default function ToolCard({
  badge,
  badgeColor,
  badgeIcon,
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
            className={`fr-col-12 fr-col-md-5 ${styles.content}`}
            style={{
              order: reverse === true ? 2 : 1,
            }}
          >
            {icon !== undefined && icon !== '' && (
              <div>
                <img
                  alt={`Icône ${title}`}
                  src={icon}
                  style={{ height: '90px', width: 'auto' }}
                />
              </div>
            )}
            <h2
              className="fr-h2 fr-mb-0"
              style={{ marginBottom: 0 }}
            >
              {title}
            </h2>
            {badge !== undefined && badge !== '' && badgeColor !== undefined && (
              <Badge
                color={badgeColor}
                icon={badgeIcon ?? false}
                small={true}
              >
                {badge}
              </Badge>
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
            className={`fr-col-12 fr-col-md-6 ${styles.image}`}
            style={{
              backgroundColor: imageBackground ?? '#F5F5FE',
              order: reverse === true ? 1 : 2,
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
  readonly badgeColor?: string
  // eslint-disable-next-line react/require-default-props
  readonly badgeIcon?: boolean
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
