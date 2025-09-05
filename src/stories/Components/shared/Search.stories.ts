import Search from '../../../components/shared/Search/Search'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Search> = {
  component: Search,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/Search',
}

export default meta
type Story = StoryObj<typeof meta>

function mockRechercher(): void {
  // Mock callback pour recherche
}

function mockSoumettre(event: React.FormEvent<HTMLFormElement>): void {
  event.preventDefault()
  // Mock callback pour soumission
}

function mockReinitialiser(): void {
  // Mock callback pour réinitialisation
}

export const Default: Story = {
  args: {
    labelBouton: 'Rechercher',
    placeholder: 'Rechercher...',
    rechercher: mockRechercher,
    reinitialiserBouton: 'Effacer',
    reinitialiserLesTermesDeRechercheNomOuEmail: mockReinitialiser,
    soumettreLaRecherche: mockSoumettre,
    termesDeRechercheNomOuEmail: '',
  },
}

export const AvecTexte: Story = {
  args: {
    labelBouton: 'Rechercher',
    placeholder: 'Nom ou email',
    rechercher: mockRechercher,
    reinitialiserBouton: 'Vider le champ',
    reinitialiserLesTermesDeRechercheNomOuEmail: mockReinitialiser,
    soumettreLaRecherche: mockSoumettre,
    termesDeRechercheNomOuEmail: 'Jean Dupont',
  },
}

export const RechercheUtilisateur: Story = {
  args: {
    labelBouton: 'Chercher',
    placeholder: 'Rechercher un utilisateur',
    rechercher: mockRechercher,
    reinitialiserBouton: 'Réinitialiser la recherche',
    reinitialiserLesTermesDeRechercheNomOuEmail: mockReinitialiser,
    soumettreLaRecherche: mockSoumettre,
    termesDeRechercheNomOuEmail: '',
  },
}