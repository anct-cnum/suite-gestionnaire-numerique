import { ReactElement } from 'react'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

function DsfrLayoutExamples(): ReactElement {
  return (
    <div className="fr-container">
      <h2>
        Exemples de structures DSFR
      </h2>
    </div>
  )
}

const meta: Meta<typeof DsfrLayoutExamples> = {
  component: DsfrLayoutExamples,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  title: 'Components/DSFR/LayoutExamples',
}

export default meta
type Story = StoryObj<typeof meta>

export const Container: Story = {
  render: () => (
    <div className="fr-container">
      <div style={{ backgroundColor: '#f0f0f0', border: '2px solid #333', padding: '1rem' }}>
        <h3>
          fr-container
        </h3>
        <p>
          Conteneur principal avec largeur maximale et centrage automatique
        </p>
      </div>
    </div>
  ),
}

export const GridSystem: Story = {
  render: () => (
    <div className="fr-container">
      <h3 className="fr-mb-4v">
        Système de grille DSFR
      </h3>
      
      <div className="fr-grid-row fr-grid-row--gutters fr-mb-4v">
        <div className="fr-col-12">
          <div style={{ backgroundColor: '#e3e3fd', padding: '1rem', textAlign: 'center' }}>
            fr-col-12 (100%)
          </div>
        </div>
      </div>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-4v">
        <div className="fr-col-6">
          <div style={{ backgroundColor: '#e3e3fd', padding: '1rem', textAlign: 'center' }}>
            fr-col-6 (50%)
          </div>
        </div>
        <div className="fr-col-6">
          <div style={{ backgroundColor: '#fef7e0', padding: '1rem', textAlign: 'center' }}>
            fr-col-6 (50%)
          </div>
        </div>
      </div>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-4v">
        <div className="fr-col-4">
          <div style={{ backgroundColor: '#e3e3fd', padding: '1rem', textAlign: 'center' }}>
            fr-col-4
          </div>
        </div>
        <div className="fr-col-4">
          <div style={{ backgroundColor: '#fef7e0', padding: '1rem', textAlign: 'center' }}>
            fr-col-4
          </div>
        </div>
        <div className="fr-col-4">
          <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', textAlign: 'center' }}>
            fr-col-4
          </div>
        </div>
      </div>

      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-md-8 fr-col-12">
          <div style={{ backgroundColor: '#e3e3fd', padding: '1rem', textAlign: 'center' }}>
            fr-col-md-8 fr-col-12 (responsive)
          </div>
        </div>
        <div className="fr-col-md-4 fr-col-12">
          <div style={{ backgroundColor: '#fef7e0', padding: '1rem', textAlign: 'center' }}>
            fr-col-md-4 fr-col-12 (responsive)
          </div>
        </div>
      </div>
    </div>
  ),
}

export const SpacingAndAlignment: Story = {
  render: () => (
    <div className="fr-container">
      <h3 className="fr-mb-4v">
        Espacement et alignement
      </h3>
      
      <div className="fr-mb-6v">
        <h4>
          Marges et paddings
        </h4>
        <div style={{ backgroundColor: '#f6f6f6', padding: '1rem' }}>
          <div
            className="fr-p-4v"
            style={{ backgroundColor: '#e3e3fd' }}
          >
            fr-p-4v (padding 4 unités)
          </div>
          <div
            className="fr-mt-4v fr-mb-2v fr-px-2v"
            style={{ backgroundColor: '#fef7e0' }}
          >
            fr-mt-4v fr-mb-2v fr-px-2v
          </div>
        </div>
      </div>

      <div className="fr-mb-6v">
        <h4>
          Alignement du texte
        </h4>
        <div
          className="fr-text--left fr-mb-2v"
          style={{ backgroundColor: '#f0fdf4', padding: '1rem' }}
        >
          fr-text--left
        </div>
        <div
          className="fr-text--center fr-mb-2v"
          style={{ backgroundColor: '#fef7e0', padding: '1rem' }}
        >
          fr-text--center
        </div>
        <div
          className="fr-text--right"
          style={{ backgroundColor: '#fee2e2', padding: '1rem' }}
        >
          fr-text--right
        </div>
      </div>

      <div>
        <h4>
          Positionnement flex
        </h4>
        <div
          className="fr-flex fr-flex--space-between fr-flex--middle"
          style={{ backgroundColor: '#f6f6f6', minHeight: '100px', padding: '1rem' }}
        >
          <div style={{ backgroundColor: '#e3e3fd', padding: '1rem' }}>
            Gauche
          </div>
          <div style={{ backgroundColor: '#fef7e0', padding: '1rem' }}>
            Centre
          </div>
          <div style={{ backgroundColor: '#f0fdf4', padding: '1rem' }}>
            Droite
          </div>
        </div>
      </div>
    </div>
  ),
}

export const TypicalPageLayout: Story = {
  render: () => (
    <div>
      <div className="fr-container fr-py-4v">
        <nav
          aria-label="vous êtes ici :"
          className="fr-breadcrumb"
        >
          <ol className="fr-breadcrumb__list">
            <li>
              <a
                className="fr-breadcrumb__link"
                href="/example-link"
              >
                Accueil
              </a>
            </li>
            <li>
              <a
                className="fr-breadcrumb__link"
                href="/example-link"
              >
                Section
              </a>
            </li>
            <li>
              <a
                aria-current="page"
                className="fr-breadcrumb__link"
                href="/current-page"
              >
                Page actuelle
              </a>
            </li>
          </ol>
        </nav>
      </div>

      <div className="fr-container">
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-md-8 fr-col-12">
            <header className="fr-mb-4v">
              <h1 className="fr-h1">
                Titre principal de la page
              </h1>
              <p className="fr-text--lead">
                Sous-titre ou description de la page
              </p>
            </header>

            <main>
              <section className="fr-mb-6v">
                <h2 className="fr-h2">
                  Section principale
                </h2>
                <div className="fr-grid-row fr-grid-row--gutters">
                  <div className="fr-col-6">
                    <div className="fr-card fr-card--no-arrow">
                      <div className="fr-card__body">
                        <div className="fr-card__content">
                          <h3 className="fr-card__title">
                            Élément 1
                          </h3>
                          <p>
                            Contenu de l&apos;élément
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="fr-col-6">
                    <div className="fr-card fr-card--no-arrow">
                      <div className="fr-card__body">
                        <div className="fr-card__content">
                          <h3 className="fr-card__title">
                            Élément 2
                          </h3>
                          <p>
                            Contenu de l&apos;élément
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </main>
          </div>

          <aside className="fr-col-md-4 fr-col-12">
            <div className="fr-card fr-card--grey">
              <div className="fr-card__body">
                <div className="fr-card__content">
                  <h3 className="fr-card__title">
                    Sidebar
                  </h3>
                  <ul className="fr-raw-list">
                    <li className="fr-py-1v">
                      Élément de navigation 1
                    </li>
                    <li className="fr-py-1v">
                      Élément de navigation 2
                    </li>
                    <li className="fr-py-1v">
                      Élément de navigation 3
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  ),
}