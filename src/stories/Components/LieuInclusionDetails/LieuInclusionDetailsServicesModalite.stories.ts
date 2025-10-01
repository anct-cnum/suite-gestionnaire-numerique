import LieuInclusionDetailsServicesModalite from '@/components/LieuInclusionDetails/LieuInclusionDetailsServicesModalite'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LieuInclusionDetailsServicesModalite> = {
  argTypes: {
    modalitesAcces: {
      description: 'Modalités d\'accès depuis la base de données',
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
    modalitesAcces: ['Se présenter sur place', 'Téléphone', 'Contacter par mail'],
  },
}

export const UniquementPresentiel: Story = {
  args: {
    modalitesAcces: ['Se présenter sur place'],
  },
}

export const UniquementADistance: Story = {
  args: {
    modalitesAcces: ['Téléphone', 'Contacter par mail'],
  },
}

export const AucuneModalite: Story = {
  args: {
    modalitesAcces: [],
  },
}
