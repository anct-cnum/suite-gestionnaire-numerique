import AidantDetailsStructureReferente from '@/components/AidantDetails/AidantDetailsStructureReferente'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof AidantDetailsStructureReferente> = {
  argTypes: {
    email: {
      description: 'Email du référent de la structure',
    },
    nom: {
      description: 'Nom du référent',
    },
    post: {
      description: 'Poste/fonction du référent',
    },
    prenom: {
      description: 'Prénom du référent',
    },
    telephone: {
      description: 'Numéro de téléphone du référent',
    },
  },
  component: AidantDetailsStructureReferente,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/AidantDetails/structureReferente',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    email: 'marie.dubois@ville-paris.fr',
    nom: 'Dubois',
    post: 'Responsable des services numériques',
    prenom: 'Marie',
    telephone: '01 42 76 40 40',
  },
}

export const ReferentDirecteur: Story = {
  args: {
    email: 'jean.martin@prefecture.gouv.fr',
    nom: 'Martin',
    post: 'Directeur adjoint',
    prenom: 'Jean',
    telephone: '01 53 72 80 00',
  },
}
