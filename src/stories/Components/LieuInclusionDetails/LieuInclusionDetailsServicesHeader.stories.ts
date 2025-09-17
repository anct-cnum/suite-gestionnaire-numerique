import LieuInclusionDetailsServicesHeader from '@/components/LieuInclusionDetails/LieuInclusionDetailsServicesHeader'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LieuInclusionDetailsServicesHeader> = {
  component: LieuInclusionDetailsServicesHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/LieuInclusionDetails/Services/Header',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
