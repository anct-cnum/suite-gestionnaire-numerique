import { createDefaultHeaderData } from './AidantDetailsTestData'
import AidantDetailsHeader from '@/components/AidantDetails/AidantDetailsHeader'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof AidantDetailsHeader> = {
  argTypes: {
    data: {
      description: 'Données d\'en-tête de l\'aidant',
    },
  },
  component: AidantDetailsHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/AidantDetails/AidantDetailsHeader',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: createDefaultHeaderData(),
  },
}

export const AvecPlusieursStatuts: Story = {
  args: {
    data: {
      modificationAuther: 'Jean Dupont',
      modificationDate: '20/04/2024',
      nom: 'Durand',
      prenom: 'Pierre',
      tags: ['Médiateur numérique', 'Aidant Connect', 'Animateur'],
    },
  },
}

export const SansTag: Story = {
  args: {
    data: {
      modificationAuther: 'Admin Système',
      modificationDate: '10/05/2024',
      nom: 'Leroy',
      prenom: 'Marie',
      tags: [],
    },
  },
}

export const TagUnique: Story = {
  args: {
    data: {
      modificationAuther: 'Responsable RH',
      modificationDate: '28/02/2024',
      nom: 'Bernard',
      prenom: 'Luc',
      tags: ['Conseiller numérique'],
    },
  },
}