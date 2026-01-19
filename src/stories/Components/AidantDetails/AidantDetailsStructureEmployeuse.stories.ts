import AidantDetailsStructureEmployeuse from '@/components/AidantDetails/AidantDetailsStructureEmployeuse'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof AidantDetailsStructureEmployeuse> = {
  argTypes: {
    data: {
      description: 'Données de la structure employeuse',
    },
  },
  component: AidantDetailsStructureEmployeuse,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/AidantDetails/StructureEmployeuse',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: {
      adresse: '12 rue de la République, 75001 Paris',
      departement: 'Paris (75)',
      nom: 'Mairie de Paris',
      referent: {
        email: 'marie.dubois@ville-paris.fr',
        nom: 'Dubois',
        post: 'Responsable des services numériques',
        prenom: 'Marie',
        telephone: '01 42 76 40 40',
      },
      region: 'Île-de-France',
      siret: '21750001600019',
      type: 'Collectivité territoriale',
    },
  },
}

export const AssociationRurale: Story = {
  args: {
    data: {
      adresse: '15 place du Marché, 12345 Villeneuve-sur-Loire',
      departement: 'Loire (42)',
      nom: 'Association Les Amis du Numérique',
      referent: {
        email: 'contact@amis-numerique.org',
        nom: 'Moreau',
        post: 'Président',
        prenom: 'Pierre',
        telephone: '04 77 12 34 56',
      },
      region: 'Auvergne-Rhône-Alpes',
      siret: '38412345678901',
      type: 'Association',
    },
  },
}

export const SansReferent: Story = {
  args: {
    data: {
      adresse: '10 avenue de la Liberté, 69000 Lyon',
      departement: 'Rhône (69)',
      nom: 'Centre Social du Quartier',
      region: 'Auvergne-Rhône-Alpes',
      siret: '12345678901234',
      type: 'Association',
    },
  },
}
