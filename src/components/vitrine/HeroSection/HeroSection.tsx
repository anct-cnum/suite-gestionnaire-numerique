import { ReactElement } from 'react'

export default function HeroSection({ backgroundColor = '#f5f5fe', backgroundImage, subtitle, title }: HeroSectionProps): ReactElement {
  return (
    <section
      className="fr-py-12w"
      style={{
        backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="fr-container">
        <div className="fr-grid-row fr-grid-row--center">
          <div className="fr-col-12  fr-text--center">
            <h1
              className="fr-display--lg fr-mb-2w"
              style={{ color: '#000091', textAlign: 'center' }}
            >
              {title}
            </h1>
            <p
              className="fr-text--lead"
              style={{ textAlign: 'center' }}
            >
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

type HeroSectionProps = {
  // eslint-disable-next-line react/require-default-props
  readonly backgroundColor?: string
  // eslint-disable-next-line react/require-default-props
  readonly backgroundImage?: string
  readonly subtitle: string
  readonly title: string
}
