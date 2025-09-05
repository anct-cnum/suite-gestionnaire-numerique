import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<unknown> = {
  component: () => null,
  parameters: {
    docs: {
      description: {
        component: 'Composant de pagination pour naviguer entre les pages de résultats. Note: Ce composant nécessite un contexte complexe avec Next.js et next-auth, il n\'est pas compatible avec Storybook dans l\'environnement actuel.',
      },
    },
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/Pagination',
}

export default meta
type Story = StoryObj<typeof meta>

export const PaginationSimulee: Story = {
  render: () => {
    return (
      <nav
        aria-label="Pagination"
        className="fr-pagination"
        style={{ 
          backgroundColor: '#f9f9f9', 
          border: '1px dashed #ccc', 
          borderRadius: '4px',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <div style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
          ⚠️ Composant Pagination non disponible dans Storybook
        </div>
        <div style={{ color: '#999', fontSize: '12px' }}>
          Ce composant nécessite un contexte Next.js complexe avec next-auth
        </div>
        
        {/* Simulation visuelle de la pagination */}
        <ol
          className="fr-pagination__list"
          style={{ display: 'flex', gap: '8px', justifyContent: 'center', listStyle: 'none', marginTop: '20px', padding: 0 }}
        >
          <li>
            <a
              className="fr-pagination__link fr-pagination__link--first"
              href="#"
              onClick={(event) => { event.preventDefault() }}
            >
              Première page
            </a>
          </li>
          <li>
            <a
              className="fr-pagination__link fr-pagination__link--prev fr-pagination__link--lg-label"
              href="#"
              onClick={(event) => { event.preventDefault() }}
            >
              Page précédente
            </a>
          </li>
          <li>
            <a
              aria-current="page"
              className="fr-pagination__link"
              href="#"
              onClick={(event) => { event.preventDefault() }}
            >
              1
            </a>
          </li>
          <li>
            <a
              className="fr-pagination__link"
              href="#"
              onClick={(event) => { event.preventDefault() }}
            >
              2
            </a>
          </li>
          <li>
            <a
              className="fr-pagination__link"
              href="#"
              onClick={(event) => { event.preventDefault() }}
            >
              3
            </a>
          </li>
          <li>
            <a
              className="fr-pagination__link fr-pagination__link--next fr-pagination__link--lg-label"
              href="#"
              onClick={(event) => { event.preventDefault() }}
            >
              Page suivante
            </a>
          </li>
          <li>
            <a
              className="fr-pagination__link fr-pagination__link--last"
              href="#"
              onClick={(event) => { event.preventDefault() }}
            >
              Dernière page
            </a>
          </li>
        </ol>
      </nav>
    )
  },
}

export const PaginationInfo: Story = {
  render: () => {
    return (
      <div style={{ 
        backgroundColor: '#f0f8ff',
        border: '1px solid #b3d9ff',
        borderRadius: '8px',
        padding: '20px',
      }}
      >
        <h3 style={{ color: '#0066cc', marginTop: 0 }}>
          🔧 Composant Pagination
        </h3>
        <div style={{ marginBottom: '16px' }}>
          <strong>
            Raison de l&apos;indisponibilité:
          </strong>
          <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
            <li>
              Dépendance à next-auth qui utilise des APIs Node.js
            </li>
            <li>
              Context complexe avec de nombreuses actions serveur
            </li>
            <li>
              Variables d&apos;environnement Next.js requises
            </li>
            <li>
              Hooks Next.js (useRouter, useSearchParams) non compatibles
            </li>
          </ul>
        </div>
        <div>
          <strong>
            Utilisation recommandée:
          </strong>
          <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
            <li>
              Tester le composant dans l&apos;application Next.js directement
            </li>
            <li>
              Utiliser les tests unitaires avec @testing-library
            </li>
            <li>
              Voir l&apos;exemple visuel ci-dessus pour le rendu DSFR
            </li>
          </ul>
        </div>
      </div>
    )
  },
}