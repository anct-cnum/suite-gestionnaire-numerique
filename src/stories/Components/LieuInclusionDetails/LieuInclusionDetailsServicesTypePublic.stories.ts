import LieuInclusionDetailsServicesTypePublic from '@/components/LieuInclusionDetails/LieuInclusionDetailsServicesTypePublic'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LieuInclusionDetailsServicesTypePublic> = {
  component: LieuInclusionDetailsServicesTypePublic,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/LieuInclusionDetails/Services/TypePublic',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
