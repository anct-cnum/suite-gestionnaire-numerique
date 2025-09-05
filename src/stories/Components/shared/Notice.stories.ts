import Notice from '../../../components/shared/Notice/Notice'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Notice> = {
  component: Notice,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/Notice',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}