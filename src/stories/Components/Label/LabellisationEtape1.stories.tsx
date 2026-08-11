import { createDefaultLabellisationEtape1ViewModel } from './LabellisationTestData'
import LabellisationEtape1 from '@/components/Label/LabellisationEtape1'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LabellisationEtape1> = {
  component: LabellisationEtape1,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/label',
      },
    },
  },
  tags: ['autodocs'],
  title: 'Components/Label/LabellisationEtape1',
}

export default meta
type Story = StoryObj

export const Default: Story = {
  args: {
    viewModel: createDefaultLabellisationEtape1ViewModel(),
  },
}

export const SansContact: Story = {
  args: {
    viewModel: {
      ...createDefaultLabellisationEtape1ViewModel(),
      contacts: [],
    },
  },
}
