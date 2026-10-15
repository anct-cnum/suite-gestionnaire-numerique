import CreerLieuInclusion from '@/components/CreerLieuInclusion/CreerLieuInclusion'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof CreerLieuInclusion> = {
  component: CreerLieuInclusion,
  parameters: {
    layout: 'padded',
  },
  title: 'Components/CreerLieuInclusion/CreerLieuInclusion',
}

export default meta
type Story = StoryObj<typeof CreerLieuInclusion>

export const Default: Story = {}
