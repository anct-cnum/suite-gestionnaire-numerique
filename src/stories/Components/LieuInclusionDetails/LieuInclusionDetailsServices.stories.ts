import { createDefaultServicesInclusionNumeriqueData } from './LieuInclusionDetailsTestData'
import LieuInclusionDetailsServices from '@/components/LieuInclusionDetails/LieuInclusionDetailsServices'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LieuInclusionDetailsServices> = {
  argTypes: {
    data: {
      description: 'Données des services d\'inclusion numérique',
    },
  },
  component: LieuInclusionDetailsServices,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/LieuInclusionDetails/Services',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: createDefaultServicesInclusionNumeriqueData(),
  },
}

export const ServiceUnique: Story = {
  args: {
    data: [createDefaultServicesInclusionNumeriqueData()[0]],
  },
}

export const SansServices: Story = {
  args: {
    data: [],
  },
}

export const PlusieursServices: Story = {
  args: {
    data: [
      ...createDefaultServicesInclusionNumeriqueData(),
      {
        description: 'Service supplémentaire pour les seniors',
        modalites: ['Se présenter sur place', 'Téléphone'],
        nom: 'Accompagnement seniors',
        thematiques: ['Inclusion numérique', 'Seniors'],
      },
    ],
  },
}
