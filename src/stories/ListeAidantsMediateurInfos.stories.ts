
import ListeAidantsMediateurInfos from '@/components/ListeAidantsMediateurs/ListeAidantsMediateurInfos'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof ListeAidantsMediateurInfos> = {
  argTypes: {
    viewModel: {
      description: 'Données pour afficher les statistiques des aidants et médiateurs',
    },
  },
  component: ListeAidantsMediateurInfos,
  parameters: {
    layout: 'padded',
  },
  title: 'Components/ListeAidantsMediateurInfos',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    viewModel: {
      totalAccompagnements: 1250,
      totalActeursNumerique: 145,
      totalBeneficiaires: 980,
      totalConseillersNumerique: 87,
    },
  },
}

export const ValeursZero: Story = {
  args: {
    viewModel: {
      totalAccompagnements: 0,
      totalActeursNumerique: 0,
      totalBeneficiaires: 0,
      totalConseillersNumerique: 0,
    },
  },
}
