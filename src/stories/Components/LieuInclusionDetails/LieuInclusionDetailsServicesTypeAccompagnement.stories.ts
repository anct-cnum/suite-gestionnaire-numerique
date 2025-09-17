import { createDefaultServicesInclusionNumeriqueData } from './LieuInclusionDetailsTestData'
import LieuInclusionDetailsServicesTypeAccompagnement from '@/components/LieuInclusionDetails/LieuInclusionDetailsServicesTypeAccompagnement'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LieuInclusionDetailsServicesTypeAccompagnement> = {
  argTypes: {
    data: {
      description: 'Données des services d\'inclusion numérique',
    },
  },
  component: LieuInclusionDetailsServicesTypeAccompagnement,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/LieuInclusionDetails/Services/TypeAccompagnement',
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
