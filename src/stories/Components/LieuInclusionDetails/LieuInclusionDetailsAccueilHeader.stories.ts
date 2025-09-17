import LieuInclusionDetailsAccueilHeader from '@/components/LieuInclusionDetails/LieuInclusionDetailsAccueilHeader'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LieuInclusionDetailsAccueilHeader> = {
  component: LieuInclusionDetailsAccueilHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/LieuInclusionDetails/Accueil/Header',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
