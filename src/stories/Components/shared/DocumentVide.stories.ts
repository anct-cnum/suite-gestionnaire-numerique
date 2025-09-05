import DocumentVide from '../../../components/shared/DocumentVide/DocumentVide'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof DocumentVide> = {
  component: DocumentVide,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/DocumentVide',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}