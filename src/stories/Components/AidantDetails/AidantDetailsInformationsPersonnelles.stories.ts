import { createDefaultInformationsPersonnellesData } from './AidantDetailsTestData'
import InformationsPersonnellesCard from '@/components/AidantDetails/AidantDetailsInformationsPersonnelles'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof InformationsPersonnellesCard> = {
  argTypes: {
    data: {
      description: "Données des informations personnelles de l'aidant",
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
type Story = StoryObj

export const Default: Story = {
  args: {
    data: {
      aidantId: 1,
      emails: ['sophie.martin@example.com'],
      nom: 'Martin',
      peutModifier: true,
      prenom: 'Sophie',
      telephone: '01 23 45 67 89',
    },
  },
}

export const AvecPlusieursEmails: Story = {
  args: {
    data: createDefaultInformationsPersonnellesData(),
  },
}

export const SansDroitDeModification: Story = {
  args: {
    data: {
      aidantId: 2,
      emails: ['sophie.martin@example.com'],
      nom: 'Martin',
      peutModifier: false,
      prenom: 'Sophie',
      telephone: '01 23 45 67 89',
    },
  },
}

export const SansEmailNiTelephone: Story = {
  args: {
    data: {
      aidantId: 3,
      emails: [],
      nom: 'Dupont',
      peutModifier: true,
      prenom: 'Jean',
    },
  },
}

export const AvecEmailSeul: Story = {
  args: {
    data: {
      aidantId: 4,
      emails: ['marie.durand@example.com'],
      nom: 'Durand',
      peutModifier: true,
      prenom: 'Marie',
    },
  },
}

export const AvecTelephoneSeul: Story = {
  args: {
    data: {
      aidantId: 5,
      emails: [],
      nom: 'Leroy',
      peutModifier: true,
      prenom: 'Pierre',
      telephone: '06 12 34 56 78',
    },
  },
}
