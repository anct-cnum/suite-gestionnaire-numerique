import Link from 'next/link'
import { ReactElement } from 'react'

import styles from './ToolCard.module.css'
import Badge from '@/components/shared/Badge/Badge'
import ExternalLink from '@/components/shared/ExternalLink/ExternalLink'

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
        <div className="fr-grid-row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            className={`fr-col-12 fr-col-md-5 ${styles.content}`}
            style={{
              order: reverse === true ? 2 : 1,
            }}
          >
            {icon !== undefined && icon !== '' && (
              <div>
                <img alt="" aria-hidden="true" src={icon} style={{ height: '90px', width: 'auto' }} />
              </div>
            )}
            <h2 className="fr-h2 fr-mb-0">{title}</h2>
            {badge !== undefined && badge !== '' && badgeColor !== undefined && (
              <Badge color={badgeColor} icon={badgeIcon ?? false} small={true}>
                {badge}
              </Badge>
            )}
            <p className="fr-text--md fr-mb-0">{description}</p>
            {link !== undefined && (
              <div>
                {link.startsWith('/') ? (
                  <Link className="fr-btn" href={link}>
                    {buttonText}
                  </Link>
                ) : (
                  <ExternalLink className="fr-btn" href={link} title={buttonText}>
                    {buttonText}
                  </ExternalLink>
                )}
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

type ToolCardProps = (
  | Readonly<{
      buttonText: string
      link: string
    }>
  | Readonly<{
      buttonText?: never
      link?: never
    }>
) &
  Readonly<{
    badge?: string
    badgeColor?: string
    badgeIcon?: boolean
    description: string
    icon?: string
    imageAlt: string
    imageBackground?: string
    imageSrc: string
    reverse?: boolean
    title: string
  }>
