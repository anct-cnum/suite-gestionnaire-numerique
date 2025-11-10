import { ReactElement } from 'react'

export default function HeroSection({ subtitle, title }: HeroSectionProps): ReactElement {
  return (
    <section
      className="fr-py-12w"
      style={{
        background: '#f5f5fe',
      }}
    >
      <div className="fr-container">
        <div className="fr-grid-row fr-grid-row--center">
          <div className="fr-col-12 fr-col-md-8 fr-text--center">
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
  readonly subtitle: string
  readonly title: string
}
