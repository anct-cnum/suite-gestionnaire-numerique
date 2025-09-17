import { createDefaultInformationsPersonnellesData } from './AidantDetailsTestData'
import InformationsPersonnellesCard from '@/components/AidantDetails/AidantDetailsInformationsPersonnelles'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof InformationsPersonnellesCard> = {
  argTypes: {
    data: {
      description: 'Données des informations personnelles de l\'aidant',
    },
    onEdit: {
      description: 'Callback pour éditer les informations personnelles',
    },
  },
  component: InformationsPersonnellesCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/AidantDetails/InformationsPersonnelles',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: {
      email: 'sophie.martin@example.com',
      nom: 'Martin',
      prenom: 'Sophie',
      telephone: '01 23 45 67 89',
    },
  },
}

export const AvecCallbackEdit: Story = {
  args: {
    data: createDefaultInformationsPersonnellesData(),
    onEdit(): void {
      // Mock callback pour édition
    },
  },
}

export const SansEmailNiTelephone: Story = {
  args: {
    data: {
      nom: 'Dupont',
      prenom: 'Jean',
    },
  },
}

export const AvecEmailSeul: Story = {
  args: {
    data: {
      email: 'marie.durand@example.com',
      nom: 'Durand',
      prenom: 'Marie',
    },
  },
}

export const AvecTelephoneSeul: Story = {
  args: {
    data: {
      nom: 'Leroy',
      prenom: 'Pierre',
      telephone: '06 12 34 56 78',
    },
  },
}
