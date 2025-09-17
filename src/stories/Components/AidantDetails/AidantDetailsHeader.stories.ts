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
  title: 'Components/AidantDetails/Header',
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
      modificationAutheur: 'Jean Dupont',
      modificationDate: '20/04/2024',
      nom: 'Durand',
      tags: ['Médiateur numérique', 'Aidant Connect', 'Animateur'],
    },
  },
}

export const SansTag: Story = {
  args: {
    data: {
      modificationAutheur: 'Admin Système',
      modificationDate: '10/05/2024',
      nom: 'Leroy',
      tags: [],
    },
  },
}

export const TagUnique: Story = {
  args: {
    data: {
      modificationAutheur: 'Responsable RH',
      modificationDate: '28/02/2024',
      nom: 'Bernard',
      tags: ['Conseiller numérique'],
    },
  },
}
