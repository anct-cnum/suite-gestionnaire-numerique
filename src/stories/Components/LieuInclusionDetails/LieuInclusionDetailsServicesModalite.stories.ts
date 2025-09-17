import { createDefaultServicesInclusionNumeriqueData } from './LieuInclusionDetailsTestData'
import LieuInclusionDetailsServicesModalite from '@/components/LieuInclusionDetails/LieuInclusionDetailsServicesModalite'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LieuInclusionDetailsServicesModalite> = {
  argTypes: {
    data: {
      description: 'Données des services d\'inclusion numérique pour les modalités',
    },
  },
  component: LieuInclusionDetailsServicesModalite,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/LieuInclusionDetails/Services/Modalite',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: createDefaultServicesInclusionNumeriqueData(),
  },
}

export const UniquementPresentiel: Story = {
  args: {
    data: [
      {
        description: 'Service uniquement en présentiel',
        modalites: ['Se présenter sur place'],
        nom: 'Service présentiel',
        thematiques: ['Formation'],
      },
    ],
  },
}

export const UniquementADistance: Story = {
  args: {
    data: [
      {
        description: 'Service uniquement à distance',
        modalites: ['Téléphone', 'Contacter par mail'],
        nom: 'Service à distance',
        thematiques: ['Support'],
      },
    ],
  },
}
