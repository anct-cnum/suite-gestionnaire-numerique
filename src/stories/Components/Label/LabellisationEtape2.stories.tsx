import { createDefaultLabellisationEtape2ViewModel } from './LabellisationTestData'
import LabellisationEtape2 from '@/components/Label/LabellisationEtape2'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LabellisationEtape2> = {
  component: LabellisationEtape2,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/label/attestation',
      },
    },
  },
  tags: ['autodocs'],
  title: 'Components/Label/LabellisationEtape2',
}

export default meta
type Story = StoryObj

export const Default: Story = {
  args: {
    viewModel: createDefaultLabellisationEtape2ViewModel(),
  },
}
