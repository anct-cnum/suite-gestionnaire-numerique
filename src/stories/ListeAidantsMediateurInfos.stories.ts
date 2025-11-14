
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
  title: 'Components/ListeAidantsMediateur/Infos',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    hasActiveFilters: false,
    totalAccompagnementsPromise: Promise.resolve(1250),
    totalBeneficiairesPromise: Promise.resolve(980),
    viewModel: {
      totalActeursNumerique: 145,
      totalConseillersNumerique: 87,
    },
  },
}

export const ValeursZero: Story = {
  args: {
    hasActiveFilters: false,
    totalAccompagnementsPromise: Promise.resolve(0),
    totalBeneficiairesPromise: Promise.resolve(0),
    viewModel: {
      totalActeursNumerique: 0,
      totalConseillersNumerique: 0,
    },
  },
}
